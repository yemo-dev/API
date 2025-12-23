import axios from "axios";
import { generateFakeStory } from "generator-fake";

async function scrape(username, caption, ppurl) {
  try {
    const resp = await axios.get(ppurl, { responseType: "arraybuffer" });
    const profilePicBuffer = Buffer.from(resp.data, "binary");
    return await generateFakeStory({
      username,
      caption,
      profilePicBuffer
    });
  } catch (error) {
    if (error.isAxiosError) {
      throw new Error("Failed to load image from ppurl. Make sure the URL is a direct image link.");
    }
    throw new Error(error.message || "Failed to generate the story image.");
  }
}

export default {
  name: "Fake Instagram Story Maker",
  description: "Generates an image of a fake Instagram story with a custom username, caption, and profile picture.",
  category: "Maker",
  methods: ["GET"],
  params: ["username", "caption", "ppurl"],
  paramsSchema: {
    username: { type: "string", required: true },
    caption: { type: "string", required: true },
    ppurl: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { username, caption, ppurl } = req.query;
      
      if (!username || !caption || !ppurl) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'username', 'caption', and 'ppurl' are required."
        });
      }

      const result = await scrape(username, caption, ppurl);
      res.setHeader("Content-Type", "image/png");
      res.send(result);
      
    } catch (e) {
      const statusCode = e.message.includes("load image") ? 400 : 500;
      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: e.message || "Internal Server Error"
      });
    }
  },
};

