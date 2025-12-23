import axios from "axios";

export default {
  name: "Writecream AI",
  description: "AI logic-response endpoint using Writecream backend",
  category: "AI",
  methods: ["GET", "POST"],
  params: ["question", "logic"],
  paramsSchema: {
    question: { type: "string", required: true, minLength: 1 },
    logic: { type: "string", required: true, minLength: 1 },
  },
  async run(req, res) {
    try {
      const question = req.method === "GET" ? req.query.question : req.body.question;
      const logic = req.method === "GET" ? req.query.logic : req.body.logic;

      if (!question || !logic) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'question' and 'logic' are required",
        });
      }

      const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat";
      const query = [
        { role: "system", content: logic },
        { role: "user", content: question },
      ];
      const params = new URLSearchParams({
        query: JSON.stringify(query),
        link: "writecream.com",
      });

      const response = await axios.get(`${url}?${params.toString()}`);
      let raw = response.data.response_content || response.data.reply || response.data.result || response.data.question || "";
      let cleaned = raw
        .replace(/\\n/g, "\n")
        .replace(/\n{2,}/g, "\n\n")
        .replace(/\*\*(.*?)\*\*/g, "*$1*")
        .trim();

      return res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        results: cleaned,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: `Failed to get response: ${error.message}`,
      });
    }
  },
};

