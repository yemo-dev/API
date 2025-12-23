import axios from "axios";

export default {
  name: "Brat Animated Maker",
  description: "Generates an animated 'Brat' style GIF/video with custom text.",
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

      const primaryUrl = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`;
      const fallbackUrl = `https://api.fasturl.link/maker/brat/animated?text=${encodeURIComponent(text)}&mode=animated`;

      try {
        const response = await axios.get(primaryUrl, { responseType: "stream" });
        res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
        response.data.pipe(res);
      } catch (err1) {
        console.warn("Primary bratvid URL failed, trying fallback...");
        const fallbackResponse = await axios.get(fallbackUrl, { responseType: "stream" });
        res.setHeader("Content-Type", fallbackResponse.headers["content-type"] || "application/octet-stream");
        fallbackResponse.data.pipe(res);
      }
    } catch (err) {
      console.error("Both bratvid URLs failed:", err.message);
      res.status(502).json({
        statusCode: 502,
        success: false,
        creator: "GIMI❤️",
        error: "Both primary and fallback services are unavailable.",
      });
    }
  },
};

