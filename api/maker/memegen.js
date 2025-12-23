import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";
import axios from "axios";

const fontPath = path.join(process.cwd(), "src", "services", "canvas", "font", "LEMONMILK-Bold.otf");
if (fs.existsSync(fontPath)) {
  GlobalFonts.registerFromPath(fontPath, "LEMONMILK");
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = line === "" ? word : line + " " + word;
    const width = ctx.measureText(testLine).width;
    if (width < maxWidth) {
      line = testLine;
    } else {
      if (line !== "") lines.push(line);
      line = word;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

function drawTextWithOutline(ctx, text, x, y, fillStyle = "white", strokeStyle = "black", lineWidth = 4) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillStyle;
  ctx.fillText(text, x, y);
}

export default {
  name: "Meme Generator",
  description: "Generate meme with top and bottom text and return as image",
  category: "Maker",
  methods: ["GET"],
  params: ["imageUrl", "topText", "bottomText"],
  paramsSchema: {
    imageUrl: { type: "string", required: true },
    topText: { type: "string" },
    bottomText: { type: "string" }
  },

  async run(req, res) {
    try {
      const imageUrl = req.query.imageUrl || req.body.imageUrl;
      const topText = req.query.topText || req.body.topText;
      const bottomText = req.query.bottomText || req.body.bottomText;

      if (!imageUrl) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          error: 'Parameter "imageUrl" is required'
        });
      }

      try {
        new URL(imageUrl);
      } catch {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          error: 'Parameter "imageUrl" must be a valid URL'
        });
      }

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 20000
      });

      const img = await loadImage(Buffer.from(response.data));
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, img.width, img.height);

      const baseFontSize = Math.max(img.width * 0.08, 32);
      const fontFamily = GlobalFonts.families.some(f => f.family === "LEMONMILK") ? "LEMONMILK" : "Arial, sans-serif";
      
      ctx.font = `bold ${baseFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      
      const margin = img.width * 0.05;
      const maxWidth = img.width - margin * 2;
      const outlineWidth = baseFontSize * 0.08;

      if (topText && topText.trim()) {
        ctx.textBaseline = "top";
        const lines = wrapText(ctx, topText.toUpperCase(), maxWidth);
        const lineHeight = baseFontSize * 1.2;
        lines.forEach((line, i) => {
          const y = margin + (i * lineHeight);
          drawTextWithOutline(ctx, line, img.width / 2, y, "white", "black", outlineWidth);
        });
      }

      if (bottomText && bottomText.trim()) {
        ctx.textBaseline = "bottom";
        const lines = wrapText(ctx, bottomText.toUpperCase(), maxWidth);
        const lineHeight = baseFontSize * 1.2;
        const totalTextHeight = (lines.length - 1) * lineHeight;
        lines.forEach((line, i) => {
          const y = img.height - margin - totalTextHeight + (i * lineHeight);
          drawTextWithOutline(ctx, line, img.width / 2, y, "white", "black", outlineWidth);
        });
      }

      const buffer = canvas.toBuffer("image/png");

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "inline; filename=meme.png");
      res.end(buffer);

    } catch (err) {
      console.error("Meme generation error:", err);
      const errorMessage = err.response ? "Failed to fetch image from URL." : "Failed to generate meme image.";
      res.status(500).json({
        statusCode: 500,
        success: false,
        error: `${errorMessage} Details: ${err.message}`
      });
    }
  }
};

