import fetch from "node-fetch";

class StoryGenerator {
  constructor() {
    this.apiKey = "1234Test";
    this.baseUrl = "https://responsedh.mycdnpro.com";
    this.endpoint = '/api/Text/Generate';
  }

  async generateText(params) {
    const {
      text,
      client,
      mode = 'Any genre',
      length = 'Short',
      creative = 'Medium',
      language = null,
      syllable = null
    } = params;

    if (!text) throw new Error('Text parameter is required');
    if (!client) throw new Error('Client parameter is required');

    const validModes = [
      'Any genre', 'Action', 'Sci-fi', 'Mystery', 'Biography',
      'Young Adult', 'Crime', 'Horror', 'Thriller', 'Children Books',
      'Non-fiction', 'Humor', 'Historical Fiction'
    ];
    const validLengths = ['Short', 'Novel'];
    const validCreative = ['Medium', 'High'];

    if (!validModes.includes(mode)) throw new Error(`Invalid mode. Must be one of: ${validModes.join(', ')}`);
    if (!validLengths.includes(length)) throw new Error(`Invalid length. Must be one of: ${validLengths.join(', ')}`);
    if (!validCreative.includes(creative)) throw new Error(`Invalid creative level. Must be one of: ${validCreative.join(', ')}`);

    const requestBody = { text, client, toolName: '_storygenerator', mode, length, language, syllable, creative };

    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'User-Agent': 'Dart/3.8 (dart:io)',
          'Content-Type': 'application/json',
          'dhp-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Upstream API error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.isSuccess) {
        throw new Error(`API error: ${data.errorMessages.join(', ')}`);
      }
      return data.response;
    } catch (error) {
      throw new Error(`Failed to generate story: ${error.message}`);
    }
  }
}

export default {
    name: "AI Story Generator",
    description: "Generates a story based on a prompt, with options for genre, length, and creativity.",
    category: "AI",
    methods: ["GET", "POST"],
    params: ["text", "client", "mode", "length", "creative", "language", "syllable"],
    paramsSchema: {
        text: { type: "string", required: true },
        client: { type: "string", required: true, description: "Any client name, e.g., 'Test'" },
        mode: {
            type: "string",
            default: "Any genre",
            enum: [
                'Any genre', 'Action', 'Sci-fi', 'Mystery', 'Biography',
                'Young Adult', 'Crime', 'Horror', 'Thriller', 'Children Books',
                'Non-fiction', 'Humor', 'Historical Fiction'
            ]
        },
        length: {
            type: "string",
            default: "Short",
            enum: ['Short', 'Novel']
        },
        creative: {
            type: "string",
            default: "Medium",
            enum: ['Medium', 'High']
        },
        language: { type: "string" },
        syllable: { type: "string" }
    },
    async run(req, res) {
        try {
            const params = req.method === "GET" ? req.query : req.body;
            const { text, client } = params;

            if (!text || !client) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameters 'text' and 'client' are required."
                });
            }

            const generator = new StoryGenerator();
            const storyText = await generator.generateText(params);
            
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: {
                    story: storyText
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            const isClientError = error.message.includes("Invalid mode") || error.message.includes("Invalid length") || error.message.includes("Invalid creative");
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

