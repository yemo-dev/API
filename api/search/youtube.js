import yts from 'yt-search';

export default {
  name: "YouTube Video Search",
  description: "Searches for YouTube videos based on a query.",
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
          error: "Parameter 'query' is required.",
        });
      }

      const searchResult = await yts(query);
      if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
        return res.status(404).json({
          statusCode: 404,
          success: false,
          creator: "GIMI❤️",
          error: "No videos found for the given query.",
        });
      }

      const formattedVideos = searchResult.videos.map(video => ({
          title: video.title,
          videoId: video.videoId,
          url: video.url,
          timestamp: video.timestamp,
          views: video.views,
          author: {
              name: video.author.name,
              url: video.author.url
          },
          thumbnail: video.thumbnail,
          description: video.description
      }));

      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        data: formattedVideos,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: err.message || "An error occurred during YouTube search.",
      });
    }
  },
};

