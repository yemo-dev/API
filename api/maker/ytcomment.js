import axios from "axios";

export default {
  name: "YouTube Comment Maker",
  description: "Generates an image of a fake YouTube comment.",
  category: "Maker",
  methods: ["GET"],
  params: ["text", "avatar", "username"],
  paramsSchema: {
    text: { type: "string", required: true },
    avatar: { type: "string", required: true },
    username: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { text, avatar, username } = req.query;

      if (!text || !avatar || !username) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'text', 'avatar', and 'username' are required.",
        });
      }

      const apiUrl = `https://some-random-api.com/canvas/youtube-comment?comment=${encodeURIComponent(
        text
      )}&avatar=${encodeURIComponent(avatar)}&username=${encodeURIComponent(
        username
      )}`;

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

      res.setHeader("Content-Type", "image/png");
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: err?.message || "Failed to generate YouTube comment image.",
      });
    }
  },
};

