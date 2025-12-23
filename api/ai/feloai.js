import axios from "axios";

async function felo(query) {
  try {
    if (!query) throw new Error("Query is required");

    const headers = {
      Accept: "*/*",
      "User-Agent": "Postify/1.0.0",
      "Content-Encoding": "gzip, deflate, br, zstd",
      "Content-Type": "application/json"
    };

    const payload = {
      query,
      search_uuid: Date.now().toString(),
      search_options: { langcode: "id-MM" },
      search_video: true
    };

    const parseResponse = (body) => {
      const result = { answer: "", source: [] };
      body.split("\n").forEach((line) => {
        if (line.startsWith("data:")) {
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.data) {
              if (data.data.text) result.answer = data.data.text.replace(/\d+/g, "");
              if (data.data.sources) result.source = data.data.sources;
            }
          } catch {}
        }
      });
      return result;
    };

    const response = await axios.post("https://api.felo.ai/search/threads", payload, {
      headers,
      timeout: 30000,
      responseType: "text"
    });

    return parseResponse(response.data);
  } catch (error) {
    throw new Error(error.message || "Failed to fetch from Felo AI service.");
  }
}

export default {
    name: "Felo AI",
    description: "Searches for information using the Felo AI engine and provides an answer with sources.",
    category: "AI",
    methods: ["GET"],
    params: ["query"],
    paramsSchema: {
        query: { type: "string", required: true }
    },
    async run(req, res) {
        try {
            const { query } = req.query;
            if (!query) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'query' is required."
                });
            }

            const result = await felo(query);
            
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
                error: error.message
            });
        }
    }
};

