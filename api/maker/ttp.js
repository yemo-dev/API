import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";

export default {
  name: "Text to Image (White BG, Black Stroke)",
  description: "Create white background image with text using LemonMilk font",
  category: "Maker",
  methods: ["GET"],
  params: ["text"],
  paramsSchema: {
    text: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    try {
      const text = req.method === "GET" ? req.query.text : req.body.text;
      if (!text) {
        return res.status(400).json({
          statusCode: 400,
          creator: "GIMI❤️",
          error: 'Parameter "text" is required'
        });
      }

      const fontPath = path.join(process.cwd(), "src", "services", "canvas", "font", "LEMONMILK-Bold.otf");
      if (!fs.existsSync(fontPath)) {
        return res.status(500).json({
          statusCode: 500,
          creator: "GIMI❤️",
          error: "Font file not found on server"
        });
      }
      GlobalFonts.registerFromPath(fontPath, "LEMONMILK");

      const size = 400;
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      ctx.font = "bold 42px LEMONMILK";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      const x = size / 2;
      const y = size / 2;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);

      const buffer = canvas.toBuffer("image/png");
      
      res.setHeader('Content-Type', 'image/png');
      res.send(buffer);

    } catch (err) {
      console.error("Text image error:", err);
      res.status(500).json({
        statusCode: 500,
        creator: "GIMI❤️",
        error: err.message
      });
    }
  }
};

