import { createCanvas, loadImage } from "canvas";

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default {
  name: "Fake Facebook Comment Maker",
  description: "Generates an image of a fake Facebook comment.",
  category: "Maker",
  methods: ["GET"],
  params: ["name", "comment", "ppurl"],
  paramsSchema: {
    name: { type: "string", required: true },
    comment: { type: "string", required: true },
    ppurl: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { name, comment, ppurl } = req.query;

      if (!name || !comment || !ppurl) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'name', 'comment', and 'ppurl' are required.",
        });
      }

      const pp = await loadImage(ppurl).catch(() => { throw new Error("Failed to load image from ppurl. Make sure the URL is a direct image link.") });
      const canvas = createCanvas(500, 120);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(30, 30, 20, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(pp, 10, 10, 40, 40);
      ctx.restore();

      ctx.font = "13px Arial";
      const nameWidth = ctx.measureText(name.trim()).width;

      ctx.font = "12px Arial";
      const commentWidth = ctx.measureText(comment.trim()).width;

      const maxWidth = Math.max(nameWidth, commentWidth) + 24;

      ctx.fillStyle = "#f0f2f5";
      roundedRect(ctx, 65, 15, maxWidth, 42, 10);
      ctx.fill();

      ctx.fillStyle = "#050505";
      ctx.font = "bold 13px Arial";
      ctx.fillText(name.trim(), 72, 30);

      ctx.fillStyle = "#050505";
      ctx.font = "12px Arial";
      ctx.fillText(comment.trim(), 72, 48);

      ctx.fillStyle = "#65676b";
      ctx.font = "10px Arial";
      ctx.fillText("2h · Like · Reply · Share", 72, 75);

      const buffer = canvas.toBuffer("image/jpeg");
      res.setHeader("Content-Type", "image/jpeg");
      res.send(buffer);

    } catch (e) {
      const statusCode = e.message.includes("load image") ? 400 : 500;
      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: e.message || "Internal Server Error",
      });
    }
  },
};

