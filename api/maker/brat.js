import axios from "axios";

export default {
  name: "Brat Image Maker",
  description: "Generates a 'Brat' style image with custom text.",
  category: "Maker",
  methods: ["GET"],
  params: ["text"],
  paramsSchema: {
    text: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { text } = req.query;
      if (!text) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameter 'text' is required.",
        });
      }

      const response = await axios.get(
        `https://zenzzxz-brats.hf.space/?text=${encodeURIComponent(text)}`,
        {
          responseType: "arraybuffer",
          headers: {
            accept: "image/png",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/58.0.3029.110 Safari/537.36",
          },
        }
      );

      res.setHeader("Content-Type", "image/png");
      res.send(response.data);
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: "Failed to generate image from the upstream service.",
      });
    }
  },
};

