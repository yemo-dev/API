import needle from "needle";
import * as cheerio from "cheerio";

async function youtubeStalk(username) {
  try {
    const options = {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "accept-encoding": "gzip, deflate, br"
      },
      follow_max: 5
    };
    const response = await needle("get", `https://youtube.com/@${username}`, options);
    const $ = cheerio.load(response.body);
    const ytInitialDataScript = $("script").filter((i, el) => $(el).html()?.includes("var ytInitialData =")).html();
    const jsonData = ytInitialDataScript?.match(/var ytInitialData = (.*?);/);
    if (!jsonData || !jsonData[1]) {
      throw new Error("Could not parse YouTube initial data. The user may not exist.");
    }
    const parsedData = JSON.parse(jsonData[1]);
    const channelMetadata = {
      username: null,
      name: null,
      subscriberCount: null,
      videoCount: null,
      avatarUrl: null,
      channelUrl: null,
      description: null
    };
    if (parsedData.header?.pageHeaderRenderer) {
      const header = parsedData.header.pageHeaderRenderer;
      channelMetadata.name = header.content?.pageHeaderViewModel?.title?.content;
      channelMetadata.username = header.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content;
      if (header.content?.pageHeaderViewModel?.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources?.length > 0) {
        channelMetadata.avatarUrl = header.content.pageHeaderViewModel.image.decoratedAvatarViewModel.avatar.avatarViewModel.image.sources.pop().url; // Get highest quality
      }
    }
    if (parsedData.metadata?.channelMetadataRenderer) {
      const channelMeta = parsedData.metadata.channelMetadataRenderer;
      channelMetadata.description = channelMeta.description;
      channelMetadata.channelUrl = channelMeta.channelUrl;
    }
    const tabs = parsedData.contents?.twoColumnBrowseResultsRenderer?.tabs;
    if (tabs) {
        const aboutTab = tabs.find(tab => tab.tabRenderer?.title === 'About');
        const stats = aboutTab?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.channelAboutFullMetadataRenderer;
        if (stats) {
            channelMetadata.subscriberCount = stats.subscriberCountText?.simpleText || '0 subscribers';
            channelMetadata.videoCount = stats.videoCountText?.simpleText || '0 videos';
        }
    }
    
    const videoDataList = [];
    if (tabs?.length > 0) {
      const videosTab = tabs.find(tab => tab.tabRenderer?.title === 'Videos')?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      let videoCount = 0;
      for (const item of videosTab) {
        if (videoCount >= 5) break;
        if (item.itemSectionRenderer) {
          for (const content of item.itemSectionRenderer.contents) {
            if (content.gridRenderer?.items) {
              const items = content.gridRenderer.items;
              for (const video of items) {
                if (videoCount >= 5) break;
                if (video.gridVideoRenderer) {
                  const videoId = video.gridVideoRenderer.videoId;
                  videoDataList.push({
                    videoId,
                    title: video.gridVideoRenderer.title?.runs?.[0]?.text || video.gridVideoRenderer.title?.simpleText || 'Untitled',
                    thumbnail: video.gridVideoRenderer.thumbnail.thumbnails.pop().url,
                    publishedTime: video.gridVideoRenderer.publishedTimeText?.simpleText,
                    viewCount: video.gridVideoRenderer.viewCountText?.simpleText,
                    duration: video.gridVideoRenderer.thumbnailOverlays?.find((overlay) => overlay.thumbnailOverlayTimeStatusRenderer)?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText || null,
                    videoUrl: `https://m.youtube.com/watch?v=${videoId}`
                  });
                  videoCount++;
                }
              }
            }
          }
        }
      }
    }
    return {
      channel: channelMetadata,
      latest_videos: videoDataList
    };
  } catch (error) {
    throw new Error(`Failed to fetch YouTube data: ${error.message}`);
  }
}

export default {
  name: "YouTube Stalker",
  description: "Fetches public channel information and the latest 5 videos for a YouTube user.",
  category: "Stalker",
  methods: ["GET"],
  params: ["username"],
  paramsSchema: {
    username: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameter 'username' is required."
        });
      }

      const result = await youtubeStalk(username.trim());
      
      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const isNotFound = error.message?.toLowerCase().includes("user may not exist");
      const statusCode = isNotFound ? 404 : 500;

      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: error.message || "Internal Server Error"
      });
    }
  },
};

