import crypto from 'crypto';
import axios from 'axios';

function md5(string) {
  return crypto.createHash('md5').update(string, 'utf8').digest('hex').toUpperCase();
}

export const AILyrics = {
    base: {
        soft: "musica",
        api: "https://func-america.anyscanner.net/api/song/idea-v2",
        endpoints: {
            style: "/to-style",
            lyrics: "/to-lyric"
        }
    },
    
    secretKey: "LT17opvvp6fiJ1AeFewb1F2xga8HTcJM",
    
    getSign: () => {
        const currentTimeSeconds = Math.floor(Date.now() / 1000);
        const hash = md5(AILyrics.base.soft + currentTimeSeconds + AILyrics.secretKey);
        return { s: hash, t: currentTimeSeconds };
    },
    
    generateStyle: async (prompt) => {
        const { s, t } = AILyrics.getSign();
        
        const data = new URLSearchParams();
        data.append('lyric', '');
        data.append('idea', prompt);
        data.append('instrumental', '1');
        data.append('sign', s);
        data.append('time', t);
        data.append('soft', AILyrics.base.soft);

        const response = await axios.post(`${AILyrics.base.api}${AILyrics.base.endpoints.style}`, data, {
            headers: {
                'User-Agent': 'okhttp/3.10.0',
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (response.status !== 200) throw new Error(`Server returned with invalid status: ${response.status}`);
        
        const json = response.data;
        if (!json.data || !json.data.prompts) {
            throw new Error(json.msg || "Failed to generate styles, invalid response.");
        }
        
        return {
            total: json.data.prompts.length,
            styles: json.data.prompts
        };
    },
    
    generateLyrics: async (prompt) => {
        const { s, t } = AILyrics.getSign();

        const response = await axios.get(`${AILyrics.base.api}${AILyrics.base.endpoints.lyrics}`, {
            params: {
                soft: AILyrics.base.soft,
                idea: prompt,
                time: t,
                sign: s
            },
            headers: {
                'User-Agent': 'okhttp/3.10.0',
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip'
            },
            responseType: 'text'
        });
        
        if (response.status !== 200) throw new Error(`Server returned with invalid status: ${response.status}`);
        
        const data = response.data;
        const lyrics = data.trim().split("\n").map(l => JSON.parse(l).answer).pop();
        
        return {
            lyrics: lyrics.trim()
        };
    }
};

