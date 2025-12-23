import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";

async function scrape(prompt) {
  const generateClientId = () => {
    return crypto.randomBytes(32).toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "bytes");
  form.append("user_profile_id", "null");
  form.append("anonymous_user_id", crypto.randomUUID());
  form.append("request_timestamp", (Date.now() / 1000).toFixed(3));
  form.append("user_is_subscribed", "false");
  form.append("client_id", generateClientId());

  try {
    const response = await axios.post(
      "https://ai-api.magicstudio.com/api/ai-art-generator",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "accept": "application/json, text/plain, */*",
          "origin": "https://magicstudio.com",
          "referer": "https://magicstudio.com/ai-art-generator/",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        },
        responseType: "arraybuffer",
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.toString() || error.message || "Failed to generate image from upstream service.");
  }
}

export default {
  name: "Magic Studio AI Art",
  description: "Generates an image from a text prompt using Magic Studio's AI.",
  category: "Maker",
  methods: ["GET"],
  params: ["prompt"],
  paramsSchema: {
    prompt: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { prompt } = req.query;

      if (!prompt) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameter 'prompt' is required.",
        });
      }

      if (prompt.length > 1000) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameter 'prompt' must be less than 1000 characters.",
        });
      }

      const result = await scrape(prompt.trim());
      res.setHeader("Content-Type", "image/jpeg");
      res.send(result);
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: error.message || "Internal Server Error",
      });
    }
  },
};

