import GptService from "../../src/services/ai/gptService.js";

export default {
  name: "GPT Chat",
  description: "Endpoint for chat with GPT",
  category: "AI",
  methods: ["GET", "POST"],
  params: ["question", "prompt"],
  paramsSchema: {
    question: { type: "string", required: true, minLength: 1 },
    prompt: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    try {
      const { question, prompt } = req.method === "GET" ? req.query : req.body;

      if (!question || !prompt) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'question' and 'prompt' are required.",
        });
      }

      const results = await GptService.process(question, { prompt: prompt });

      // Respon ini tidak mengandung 'attribution'
      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        results,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: error.message || "Internal server error",
      });
    }
  },
};

