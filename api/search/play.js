import axios from 'axios';
import crypto from 'crypto';
import yts from 'yt-search';
import fetch from "node-fetch";

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info",
    download: "/download"
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],

  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g);
      return Buffer.from(matches.join(''), 'hex');
    },

    decrypt: async (enc) => {
      try {
        const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
        const data = Buffer.from(enc, 'base64');
        const iv = data.slice(0, 16);
        const content = data.slice(16);
        const key = savetube.crypto.hexToBuffer(secretKey);

        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(content);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return JSON.parse(decrypted.toString());
      } catch (error) {
        throw new Error(`Failed to decrypt Savetube data: ${error.message}`);
      }
    }
  },

  isUrl: str => {
    try { new URL(str); return true; } catch (_) { return false; }
  },

  youtube: url => {
    if (!url) return null;
    const a = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let b of a) {
      if (b.test(url)) return url.match(b)[1];
    }
    return null;
  },

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, code: 200, data: response };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  },

  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, 'get');
    if (!response.status) throw new Error("Failed to get CDN from Savetube.");
    return response.data.cdn;
  },

  _ytmp3mobi: async (youtubeUrl) => {
    const videoId = savetube.youtube(youtubeUrl);
    if (!videoId) throw new Error("Invalid YouTube URL for ytmp3.mobi");

    const urlParam = { v: videoId, f: 'mp4', _: Math.random() };
    const headers = { "Referer": "https://id.ytmp3.mobi/" };

    const fetchJson = async (url) => {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Fetch failed from ytmp3.mobi | ${res.status} ${res.statusText}`);
        return res.json();
    };

    const { convertURL } = await fetchJson("https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random());
    const { downloadURL, progressURL } = await fetchJson(`${convertURL}&${new URLSearchParams(urlParam).toString()}`);

    let progress = 0;
    let attempts = 0;
    while (progress !== 3 && attempts < 10) {
        const json = await fetchJson(progressURL);
        progress = json.progress;
        if (json.error) throw new Error(`Error ytmp3.mobi: ${json.error}`);
        await new Promise(r => setTimeout(r, 1500));
        attempts++;
    }
    if (progress !== 3) throw new Error("Ytmp3.mobi conversion timed out or failed.");
    return { downloadURL };
  },

  download: async (link, format) => {
    const id = savetube.youtube(link);
    if (!id) throw new Error("Failed to extract YouTube ID from link.");
    
    const cdn = await savetube.getCDN();
    const result = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` });
    const decrypted = await savetube.crypto.decrypt(result.data.data);
    
    let downloadResult;

    if (format === 'mp3') {
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id,
        downloadType: 'audio',
        quality: '128',
        key: decrypted.key
      });
      if (!dl.data?.data?.downloadUrl) throw new Error(`Failed to get MP3 download link from Savetube.`);
      downloadResult = dl.data.data.downloadUrl;
    } else if (format === '480') {
      const ytmp3mobiRes = await savetube._ytmp3mobi(link);
      if (!ytmp3mobiRes.downloadURL) throw new Error("Failed to get MP4 download URL from ytmp3.mobi.");
      downloadResult = ytmp3mobiRes.downloadURL;
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    return {
      title: decrypted.title || "Unknown",
      thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      duration: decrypted.duration,
      download: downloadResult,
      id
    };
  }
};

export default {
  name: "Play & Download YouTube Video/Audio",
  description: "Searches for a YouTube video, then provides download links for its MP3 and 480p MP4 formats.",
  category: "Search",
  methods: ["GET"],
  params: ["query"],
  paramsSchema: {
    query: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameter 'query' is required."
        });
      }

      const searchResult = await yts(query);
      if (!searchResult?.videos?.length) {
        return res.status(404).json({
          statusCode: 404,
          success: false,
          creator: "GIMI❤️",
          error: "Video not found for the given query."
        });
      }

      const firstVideo = searchResult.videos[0];
      const videoUrl = firstVideo.url;

      const [mp3Result, mp4Result] = await Promise.all([
        savetube.download(videoUrl, 'mp3'),
        savetube.download(videoUrl, '480')
      ]);

      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        data: {
          dl_mp3: mp3Result.download,
          dl_mp4: mp4Result.download,
          metadata: {
            title: mp4Result.title,
            thumbnail: mp4Result.thumbnail,
            duration: mp4Result.duration,
            id: mp4Result.id,
          }
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const isNotFound = err.message.toLowerCase().includes("video not found");
      const statusCode = isNotFound ? 404 : 500;
      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: err.message || "An error occurred while processing your request."
      });
    }
  },
};

