import multer from "multer";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";

const upload = multer({ storage: multer.memoryStorage() });

export default {
  name: "Tribun JMK48",
  description: "Create JMK 2025 twibbon with a circular photo frame",
  category: "Maker",
  methods: ["POST"],
  params: ["file"],
  paramsSchema: {
    file: { type: "file", required: true },
  },
  async run(req, res) {
    try {
      await new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      if (!req.file) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "No file uploaded. Please provide a file in the 'file' field.",
        });
      }

      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        });
      }

      const framePath = path.join(process.cwd(), "src", "services", "canvas", "tribunJMK.jpg");
      
      if (!fs.existsSync(framePath)) {
        return res.status(500).json({
          statusCode: 500,
          success: false,
          creator: "GIMI❤️",
          error: "Frame image not found on the server.",
        });
      }

      const frameBuffer = fs.readFileSync(framePath);
      
      const [frameImg, userImg] = await Promise.all([
        loadImage(frameBuffer),
        loadImage(req.file.buffer)
      ]);

      const canvas = createCanvas(frameImg.width, frameImg.height);
      const ctx = canvas.getContext("2d");

      const centerX = canvas.width / 2;
      const centerY = Math.round(canvas.height * 0.5);
      const radius = Math.round(canvas.width * 0.4);

      const aspect = userImg.width / userImg.height;
      let srcX, srcY, srcW, srcH;

      if (aspect > 1) {
        srcH = userImg.height;
        srcW = userImg.height;
        srcX = (userImg.width - srcW) / 2;
        srcY = 0;
      } else {
        srcW = userImg.width;
        srcH = userImg.width;
        srcX = 0;
        srcY = (userImg.height - srcH) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.drawImage(
        userImg, 
        srcX, srcY, srcW, srcH,
        centerX - radius, centerY - radius,
        radius * 2, radius * 2
      );
      ctx.restore();

      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

      const buffer = canvas.toBuffer("image/png");

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", 'inline; filename="twibbon-jmk-2025.png"');
      res.send(buffer);

    } catch (err) {
      console.error("JMK Twibbon processing error:", err);
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: err.message || "Twibbon processing failed due to an internal error.",
      });
    }
  },
};

