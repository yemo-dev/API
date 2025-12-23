import { AILyrics } from './_aiLyricsHelper.js';

export default {
    name: "AI Music Style Generator",
    description: "Generates music style prompts (e.g., genre, mood) based on a text prompt.",
    category: "AI",
    methods: ["GET", "POST"],
    params: ["prompt"],
    paramsSchema: {
        prompt: { type: "string", required: true, description: "The idea or prompt for the song (e.g., 'a song about a guy heartbroken')." }
    },
    async run(req, res) {
        try {
            const { prompt } = req.method === "GET" ? req.query : req.body;

            if (!prompt) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'prompt' is required."
                });
            }
            
            const result = await AILyrics.generateStyle(prompt);
            
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: error.message || "Internal Server Error"
            });
        }
    }
};

