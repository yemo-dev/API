import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import fs from "fs";

const regularFontPath = path.join(process.cwd(), "fonts", "Roboto-Regular.ttf");
const boldFontPath = path.join(process.cwd(), "fonts", "Roboto-Bold.ttf");

if (fs.existsSync(regularFontPath)) {
  registerFont(regularFontPath, { family: "Roboto" });
} else {
  console.warn(`Font not found at: ${regularFontPath}. Fallback will be used.`);
}

if (fs.existsSync(boldFontPath)) {
  registerFont(boldFontPath, { family: "Roboto-Bold" });
} else {
  console.warn(`Font not found at: ${boldFontPath}. Fallback will be used.`);
}

export default {
  name: "Fake Call Image Maker",
  description: "Creates a fake incoming call screen image with a custom name, duration, and avatar.",
  category: "Maker",
  methods: ["GET"],
  params: ["nama", "durasi", "avatar"],
  paramsSchema: {
    nama: { type: "string", required: true },
    durasi: { type: "string", required: true },
    avatar: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { nama, durasi, avatar } = req.query;

      if (!nama || !durasi || !avatar) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'nama', 'durasi', and 'avatar' are required."
        });
      }

      const [avatarImg, bg] = await Promise.all([
        loadImage(avatar).catch(() => { throw new Error("Failed to load avatar image. Check the URL.") }),
        loadImage("https://files.catbox.moe/pmhptv.jpg").catch(() => { throw new Error("Failed to load background image.") })
      ]);

      const canvas = createCanvas(720, 1280);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, 720, 1280);

      ctx.font = '40px "Roboto-Bold"';
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(nama.trim(), 360, 150);

      ctx.font = '30px "Roboto"';
      ctx.fillStyle = "#d1d1d1";
      ctx.fillText(durasi.trim(), 360, 200);

      ctx.save();
      ctx.beginPath();
      ctx.arc(360, 635, 160, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 200, 475, 320, 320);
      ctx.restore();

      const buffer = canvas.toBuffer("image/png");
      res.setHeader("Content-Type", "image/png");
      res.send(buffer);

    } catch (e) {
      console.error("Error generating fakecall image:", e);
      const statusCode = e.message.includes("load") ? 400 : 500;
      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: e.message || "Internal server error"
      });
    }
  }
};

