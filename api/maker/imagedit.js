import axios from "axios";

export default {
    name: "AI Image Editor",
    description: "Edits an image using AI based on a text prompt.",
    category: "Maker",
    methods: ["GET"],
    params: ["url", "prompt"],
    paramsSchema: {
        url: { type: "string", required: true },
        prompt: { type: "string", required: true }
    },
    async run(req, res) {
        try {
            const { url, prompt } = req.query;

            if (!url || !prompt) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameters 'url' and 'prompt' are required."
                });
            }

            // 1. Panggil backend service Anda
            const backendApiUrl = `https://zenzxz-backend.vercel.app/maker/imagedit?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}`;
            
            const backendResponse = await axios.get(backendApiUrl, { timeout: 60000 })
                .catch(err => {
                    // Tangani jika backend service error
                    throw new Error(err.response?.data?.error || "Backend API service is unavailable or failed.");
                });

            // 2. Pastikan backend mengembalikan hasil yang valid dan ambil URL gambarnya
            if (!backendResponse.data || !backendResponse.data.result) {
                throw new Error("Backend API did not return a valid image URL in the 'result' field.");
            }
            const imageUrl = backendResponse.data.result;

            // 3. Unduh gambar hasil akhir dari URL yang didapat
            const imageResponse = await axios.get(imageUrl, {
                responseType: "arraybuffer"
            }).catch(() => {
                throw new Error("Failed to download the final image from the result URL.");
            });

            // 4. Kirim gambar sebagai respons langsung
            res.setHeader("Content-Type", "image/png");
            res.send(imageResponse.data);

        } catch (error) {
            const isClientError = error.message.toLowerCase().includes("parameter") || error.message.toLowerCase().includes("backend api did not return");
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

