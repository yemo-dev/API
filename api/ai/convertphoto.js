import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto-js";
import FormData from "form-data";
import { fileTypeFromBuffer } from "file-type";
import { Buffer } from "buffer";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

class PhotoToCartoonAPI {
  constructor() {
    this.BASE = "https://imgedit.ai/";
    this.UPLOAD = "https://uploads.imgedit.ai/api/v1/draw-cf/upload";
    this.GENERATE = "https://imgedit.ai/api/v1/draw-cf/generate";
    this.TASK = "https://imgedit.ai/api/v1/draw-cf/";
    this.KEY = this.randomChar(16);
    this.aesKey = null;
    this.iv = null;
    this.headers = {
      "authority": "uploads.imgedit.ai",
      "accept": "application/json, text/plain, */*",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "authorization": "null",
      "origin": "https://imgedit.ai",
      "referer": "https://imgedit.ai/",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
    };
    this.styleMaps = {
      'sketch_v2': { 'ink_painting': 16, 'bg_line': 15, 'color_rough': 14, 'gouache': 13, 'manga_sketch': 12, 'ink_sketch': 11, 'pencil_sketch': 10, 'sketch': 8, 'anime_sketch': 6, 'line_art': 3, 'simplex': 4, 'doodle': 5, 'intricate_line': 2 },
      'anime': { 'color_rough': 42, 'ink_painting': 41, '3d': 40, 'clay': 39, 'mini': 38, 'illustration': 37, 'wojak': 36, 'felted_doll': 35, 'comic_book': 33, 'vector': 32, 'gothic': 29, '90s_shoujomanga': 26, 'grumpy_3d': 25, 'tinies': 24, 'witty': 23, 'simple_drawing': 22, 'ink_stains': 21, 'crayon': 20 },
    };
  }

  randomChar(length) {
    const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }).map(_ => char.charAt(Math.floor(Math.random() * char.length))).join("");
  }

  delay(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  async fetchKeys() {
    const { data } = await axios.get(this.BASE, { headers: this.headers });
    const $ = cheerio.load(data);
    const scriptUrls = [];
    $('script[src]').each((i, el) => {
      const scriptSrc = $(el).attr('src');
      if (scriptSrc && scriptSrc.includes('/_nuxt/js/')) {
        scriptUrls.push(`https://imgedit.ai${scriptSrc}`);
      }
    });
    const latestScriptUrl = scriptUrls[scriptUrls.length - 1];
    const response = await axios.get(latestScriptUrl, { headers: this.headers });
    const scriptContent = response.data;
    const aesMatch = scriptContent.match(/var\s+aesKey\s*=\s*["'](\w{11,})['"]/i);
    const ivMatch = scriptContent.match(/var\s+iv\s*=\s*["'](\w{11,})['"]/i);
    this.aesKey = aesMatch[1];
    this.iv = ivMatch[1];
  }

  decrypt(enc) {
    if (!this.aesKey || !this.iv) {
      throw new Error("AES key or IV not set. Call fetchKeys() first.");
    }
    const key = crypto.enc.Utf8.parse(this.aesKey);
    const iv = crypto.enc.Utf8.parse(this.iv);
    const decipher = crypto.AES.decrypt(enc, key, { iv, mode: crypto.mode.CBC, padding: crypto.pad.Pkcs7 });
    return JSON.parse(decipher.toString(crypto.enc.Utf8));
  }

  async upload(buffer, fileName) {
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      throw new Error("File type is not a supported image.");
    }

    const form = new FormData();
    form.append('image', buffer, {
      filename: fileName || `image.${fileType.ext}`,
      contentType: fileType.mime,
    });

    const res = await axios.post(this.UPLOAD, form, {
      headers: { ...this.headers, ...form.getHeaders() },
      params: { ekey: this.KEY, soft_id: "imgedit_web" },
    });
    return this.decrypt(res.data.data);
  }

  async generate(template, styleName, data) {
    const styleId = this.styleMaps[template][styleName];
    const opt = {
      "template": template,
      "seed": Date.now().toString(),
      "style_id": styleId,
      "extra_image_key": data?.data?.image,
    };
    const res = await axios.post(this.GENERATE, opt, {
      headers: this.headers,
      params: { ekey: this.KEY, soft_id: "imgedit_web" },
    });
    return this.decrypt(res.data.data);
  }

  async process(data) {
    let attempts = 0;
    while (attempts < 20) {
      const res = await axios.get(this.TASK + data.data.task_id, {
        headers: this.headers,
        params: { ekey: this.KEY, soft_id: "imgedit_web" },
      });
      const dec = this.decrypt(res.data.data);
      if (dec.data.status === 2 && dec.data.images !== null) {
        const base64String = dec.data.images[0].split(',')[1];
        return Buffer.from(base64String, 'base64');
      }
      await this.delay(2000);
      attempts++;
    }
    throw new Error("Image processing timed out.");
  }

  async scrapeFromFile(fileBuffer, fileName, template, style) {
    await this.fetchKeys();
    const uploadData = await this.upload(fileBuffer, fileName);
    const taskData = await this.generate(template, style, uploadData);
    return await this.process(taskData);
  }
}

export default {
    name: "Convert photo",
    description: "Convert an uploaded photo to a cartoon style using various templates and styles.",
    category: "AI",
    methods: ["POST"],
    params: ["image", "template", "style"],
    paramsSchema: {
        image: { type: "file", required: true },
        template: {
            type: "string",
            required: true,
            enum: ["sketch_v2", "anime"]
        },
        style: {
            type: "string",
            required: true,
            description: "Style name (e.g., 'manga_sketch' for sketch_v2, '3d' for anime)"
        }
    },
    async run(req, res) {
        try {
            await new Promise((resolve, reject) => {
                upload.single("image")(req, res, (err) => {
                    if (err) return reject(new Error("Image upload failed: " + err.message));
                    resolve();
                });
            });

            const { template, style } = req.body;
            
            if (!req.file) {
                return res.status(400).json({ statusCode: 400, success: false, creator: "GIMI❤️", error: "Parameter 'image' (file) is required." });
            }
            if (!template || !style) {
                return res.status(400).json({ statusCode: 400, success: false, creator: "GIMI❤️", error: "Parameters 'template' and 'style' are required." });
            }

            const cartoonApi = new PhotoToCartoonAPI();
            const availableTemplates = Object.keys(cartoonApi.styleMaps);

            if (!availableTemplates.includes(template)) {
                return res.status(400).json({ statusCode: 400, success: false, creator: "GIMI❤️", error: `Invalid template. Available: ${availableTemplates.join(', ')}` });
            }
            if (!cartoonApi.styleMaps[template][style]) {
                return res.status(400).json({ statusCode: 400, success: false, creator: "GIMI❤️", error: `Invalid style for template '${template}'. Available: ${Object.keys(cartoonApi.styleMaps[template]).join(', ')}` });
            }
            
            const resultBuffer = await cartoonApi.scrapeFromFile(req.file.buffer, req.file.originalname, template, style);
            
            res.setHeader("Content-Type", "image/png");
            res.send(resultBuffer);

        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: error.message || "An error occurred while processing the image."
            });
        }
    }
};

