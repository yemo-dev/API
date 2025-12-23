import axios from "axios";
import FormData from "form-data";

async function scrape(query, model) {
  try {
    const headers = {
      'origin': 'https://deep-seek.chat',
      'user-agent': 'Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0'
    };
    
    const wp = await axios.get(headers.origin, { headers }).then(dt => dt.data);
    const jz = wp.match(/window\.DeepSeekConfig = ({[\s\S]*?});/);
    
    let config;
    if (jz && jz[1]) {
      config = JSON.parse(jz[1]);
    } else {
      throw new Error("Could not find configuration on the target website.");
    }
    
    const form = new FormData();
    form.append('action', 'deepseek_chat');
    form.append('nonce', config.nonce);
    form.append('message', query);
    form.append('model', model);
    form.append('save_conversation', '0');
    form.append('session_only', '1');

    const res = await axios.post(config.ajax_url, form, {
      headers: { ...headers, ...form.getHeaders() }
    });
    
    // Perbaikan: Membaca respons JSON dan mengambil teksnya
    if (res.data && res.data.success && res.data.data && typeof res.data.data.response === 'string') {
        return res.data.data.response;
    } else {
        throw new Error("The AI service returned a valid but unsuccessful or malformed response.");
    }

  } catch(e) {
    throw new Error(e.message || "An unknown error occurred while communicating with the AI service.");
  }
}

const supportedModels = [
  "deepseek-v3",
  "deepseek-r1",
  "gpt-oss-120b",
  "gpt-oss-20b",
  "kimi-k2-instruct",
  "llama4-maverick-instruct-basic",
  "llama-v3p1-405b-instruct",
  "llama-v3p1-8b-instruct",
  "gemma-3-27b-it",
  "codegemma-7b",
  "mistral-small-24b-instruct-2501",
  "mistral-nemo-instruct-2407",
  "mixtral-8x22b-instruct",
  "phi-3-vision-128k-instruct",
  "phi-3-mini-128k-instruct",
  "qwen3-235b-a22b-thinking-2507",
  "qwen3-coder-480b-a35b-instruct",
  "qwen3-235b-a22b-instruct-2507",
];

export default {
  name: "AI Chat Completion",
  description: "Chat with various powerful AI models. Select a model and provide a query to get a response.",
  category: "AI",
  methods: ["GET"],
  params: ["query", "model"],
  paramsSchema: {
    query: { type: "string", required: true },
    model: {
      type: "string",
      required: true,
      enum: supportedModels,
      default: "deepseek-v3"
    },
  },
  async run(req, res) {
    try {
      const { query, model } = req.query;

      if (!query || !model) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameters 'query' and 'model' are required.",
        });
      }

      if (!supportedModels.includes(model)) {
          return res.status(400).json({
              statusCode: 400,
              success: false,
              creator: "GIMI❤️",
              error: `Invalid model. Please choose one of the following: ${supportedModels.join(', ')}`
          });
      }

      const result = await scrape(query.trim(), model);
      
      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        data: {
          model: model,
          question: query,
          answer: result
        },
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: e.message,
      });
    }
  },
};

