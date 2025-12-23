import axios from "axios";
import crypto from "crypto";

class AuthGenerator {
  static #PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDa2oPxMZe71V4dw2r8rHWt59gH
W5INRmlhepe6GUanrHykqKdlIB4kcJiu8dHC/FJeppOXVoKz82pvwZCmSUrF/1yr
rnmUDjqUefDu8myjhcbio6CnG5TtQfwN2pz3g6yHkLgp8cFfyPSWwyOCMMMsTU9s
snOjvdDb4wiZI8x3UwIDAQAB
-----END PUBLIC KEY-----`;
  static #S = "NHGNy5YFz7HeFb";

  constructor(appId) {
    this.appId = appId;
  }

  aesEncrypt(data, key, iv) {
    const keyBuffer = Buffer.from(key, "utf8");
    const ivBuffer = Buffer.from(iv, "utf8");
    const cipher = crypto.createCipheriv("aes-128-cbc", keyBuffer, ivBuffer);
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }

  generateRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomBytes[i] % chars.length);
    }
    return result;
  }

  generate() {
    const t = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    const tempAesKey = this.generateRandomString(16);

    const encryptedData = crypto.publicEncrypt(
      {
        key: AuthGenerator.#PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(tempAesKey)
    );

    const secret_key = encryptedData.toString("base64");
    const dataToSign = `${this.appId}:${AuthGenerator.#S}:${t}:${nonce}:${secret_key}`;
    const sign = this.aesEncrypt(dataToSign, tempAesKey, tempAesKey);

    return {
      app_id: this.appId,
      t,
      nonce,
      sign,
      secret_key,
    };
  }
}

async function convert(buffers, prompt) {
  try {
    const auth = new AuthGenerator("ai_df");
    const authData = auth.generate();
    const userId = auth.generateRandomString(64).toLowerCase();

    const headers = {
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0",
      Referer: "https://deepfakemaker.io/nano-banana-ai/",
    };

    const instance = axios.create({
      baseURL: "https://apiv1.deepfakemaker.io/api",
      params: authData,
      headers,
    });

    const fileUploads = await Promise.all(buffers.map(async (buffer) => {
        const file = await instance.post("/user/v2/upload-sign", {
            filename: auth.generateRandomString(32) + "_" + Date.now() + ".jpg",
            hash: crypto.createHash("sha256").update(buffer).digest("hex"),
            user_id: userId
        }).then(i => i.data);

        await axios.put(file.data.url, buffer, {
            headers: {
                "content-type": "image/jpeg",
                "content-length": buffer.length
            }
        });

        return "https://cdn.deepfakemaker.io/" + file.data.object_name;
    }));

    const taskData = await instance
      .post("/replicate/v1/free/nano/banana/task", {
        prompt,
        platform: "nano_banana",
        images: fileUploads,
        output_format: "png",
        user_id: userId,
      })
      .then((i) => i.data);

    const resultUrl = await new Promise((resolve, reject) => {
      let retries = 20;
      const interval = setInterval(async () => {
        try {
          const statusRes = await instance
            .get("/replicate/v1/free/nano/banana/task", {
              params: {
                user_id: userId,
                ...taskData.data,
              },
            })
            .then((i) => i.data);

          if (statusRes.msg === "success") {
            clearInterval(interval);
            resolve(statusRes.data.generate_url || statusRes.data.imageUrl);
          }

          if (--retries <= 0) {
            clearInterval(interval);
            reject(new Error("Image generation timed out after multiple attempts."));
          }
        } catch (e) {
          clearInterval(interval);
          reject(e);
        }
      }, 2500);
    });

    if (!resultUrl) {
      throw new Error("Failed to retrieve result image URL.");
    }

    return resultUrl;
  } catch (error) {
    throw new Error(error.response?.data?.msg || error.message || "An unknown error occurred during image conversion.");
  }
}

export default {
    name: "AI Polaroid Maker",
    description: "Generates a polaroid-style photobooth image from two input images using a specific AI prompt.",
    category: "Maker",
    methods: ["GET"],
    params: ["img1", "img2"],
    paramsSchema: {
        img1: { type: "string", required: true },
        img2: { type: "string", required: true }
    },
    async run(req, res) {
        try {
            const { img1, img2 } = req.query;
            if (!img1 || !img2) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameters 'img1' and 'img2' are required."
                });
            }

            const prompt = "Buatlah gambar yang diambil dengan kamera polaroid. Buatlah seperti photobooth 3 grid. Foto tersebut harus terlihat seperti foto biasa, tanpa subyek atau properti yang jelas. Foto tersebut harus memiliki sedikit efek blur dan sumber cahaya yang konsisten, seperti lampu kilat dari ruangan gelap, yang tersebar di seluruh foto. Jangan ubah wajah. Ganti latar belakang dibelakang tersebut dengan tirai putih dengan orang pertama itu memegang kepala si orang kedua, orang keduanya menunjuk orang pertama itu, dan pose imut lainnya";

            const buffers = await Promise.all([
                axios.get(img1, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data)).catch(() => { throw new Error("Failed to load image from img1 URL.") }),
                axios.get(img2, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data)).catch(() => { throw new Error("Failed to load image from img2 URL.") })
            ]);

            const resultUrl = await convert(buffers, prompt);
            
            const finalImageResponse = await axios.get(resultUrl, { responseType: "arraybuffer" });
            const resultBuffer = Buffer.from(finalImageResponse.data);

            res.setHeader("Content-Type", "image/png");
            res.send(resultBuffer);
        } catch (error) {
            const isClientError = error.message.toLowerCase().includes("load image");
            const statusCode = isClientError ? 400 : 500;
            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                creator: "GIMI❤️",
                error: error.message
            });
        }
    }
};

