import WebSocket from 'ws';
import axios from 'axios';

class Copilot {
    constructor() {
        this.conversationId = null;
        this.models = {
            default: 'chat',
            'think-deeper': 'reasoning',
            'gpt-5': 'smart'
        };
        this.headers = {
            origin: 'https://copilot.microsoft.com',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        };
    }
    
    async createConversation() {
        try {
            const { data } = await axios.post('https://copilot.microsoft.com/c/api/conversations', null, {
                headers: this.headers
            });
            this.conversationId = data.id;
            return this.conversationId;
        } catch (error) {
            throw new Error("Failed to create a new conversation with the upstream service.");
        }
    }
    
    async chat(message, { model = 'default' } = {}) {
        if (!this.conversationId) await this.createConversation();
        if (!this.models[model]) throw new Error(`Invalid model. Available models are: ${Object.keys(this.models).join(', ')}`);
        
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-,ncedge,edgepagecontext&setflight=-,ncedge,edgepagecontext&ncedge=1${this.accessToken ? `&accessToken=${this.accessToken}` : ''}`, {
                headers: this.headers
            });

            const response = { text: '', citations: [] };
            
            ws.on('open', () => {
                ws.send(JSON.stringify({
                    event: 'setOptions',
                    supportedFeatures: ['partial-generated-images'],
                    supportedCards: ['weather', 'local', 'image', 'sports', 'video', 'ads', 'safetyHelpline', 'quiz', 'finance', 'recipe'],
                    ads: { supportedTypes: ['text', 'product', 'multimedia', 'tourActivity', 'propertyPromotion'] }
                }));

                ws.send(JSON.stringify({
                    event: 'send',
                    mode: this.models[model],
                    conversationId: this.conversationId,
                    content: [{ type: 'text', text: message }],
                    context: {}
                }));
            });

            ws.on('message', (chunk) => {
                try {
                    const parsed = JSON.parse(chunk.toString());
                    
                    switch (parsed.event) {
                        case 'appendText':
                            response.text += parsed.text || '';
                            break;
                        case 'citation':
                            response.citations.push({
                                title: parsed.title,
                                icon: parsed.iconUrl,
                                url: parsed.url
                            });
                            break;
                        case 'done':
                            resolve(response);
                            ws.close();
                            break;
                        case 'error':
                            reject(new Error(parsed.message || "An unknown error occurred in the WebSocket stream."));
                            ws.close();
                            break;
                    }
                } catch (error) {
                    // Ignore non-JSON messages or parsing errors
                }
            });
            
            ws.on('error', (err) => reject(new Error(err.message || "WebSocket connection error.")));
        });
    }
}

export default {
    name: "Copilot AI Chat",
    description: "Chat with Microsoft Copilot. Supports different conversation modes.",
    category: "AI",
    methods: ["GET"],
    params: ["message", "model"],
    paramsSchema: {
        message: { type: "string", required: true },
        model: {
            type: "string",
            default: "default",
            enum: ["default", "think-deeper", "gpt-5"]
        }
    },
    async run(req, res) {
        try {
            const { message, model } = req.query;
            if (!message) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'message' is required."
                });
            }

            const copilot = new Copilot();
            const result = await copilot.chat(message, { model: model || 'default' });

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString(),
            });

        } catch (error) {
            const isClientError = error.message.toLowerCase().includes("invalid model");
            const statusCode = isClientError ? 400 : 500;
            
            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                creator: "GIMI❤️",
                error: error.message || "An internal server error occurred."
            });
        }
    }
};

