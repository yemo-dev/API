import axios from 'axios';
import crypto from 'crypto';

class Qwen {
    constructor({ email, password }) {
        if (!email) throw new Error('Email is required.');
        if (!password) throw new Error('Password is required.');
        
        this.api = axios.create({
            baseURL: 'https://chat.qwen.ai/api',
            headers: {
                'Bx-V': '2.5.31',
                'Connection': 'keep-alive',
                'Host': 'chat.qwen.ai',
                'Origin': 'https://chat.qwen.ai',
                'Referer': 'https://chat.qwen.ai/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'Version': '0.0.230',
                'X-Request-Id': crypto.randomUUID()
            }
        });
        this.types = {
            chat: 't2t',
            search: 'search',
            thinking: 'think'
        };
        this.token = '';
        this.expiresAt = 0;
        this.email = email;
        this.password = password;
        this.isInitialized = false;
    }
    
    isTokenExpired() {
        return !this.token || Date.now() / 1000 >= this.expiresAt - 300;
    }
    
    async refreshToken() {
        try {
            const { data } = await this.api.get('/v1/auths', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (data.token && data.expires_at) {
                this.token = data.token;
                this.expiresAt = data.expires_at;
                return data;
            }
        } catch (error) {
            await this.login();
        }
    }
    
    async ensureValidToken() {
        if (!this.isInitialized) {
            await this.login();
            this.isInitialized = true;
        } else if (this.isTokenExpired()) {
            await this.refreshToken();
        }
    }
    
    async login() {
        try {
            const { data } = await this.api.post('/v1/auths/signin', {
                email: this.email,
                password: crypto.createHash('sha256').update(this.password).digest('hex')
            });
            this.token = data.token;
            this.expiresAt = data.expires_at;
            return data;
        } catch (error) {
            throw new Error(`Failed to login: ${error.response?.data?.message || error.message}.`);
        }
    }
    
    async models() {
        await this.ensureValidToken();
        const { data } = await this.api.get('/models', { headers: { 'Authorization': `Bearer ${this.token}` } });
        return data.data.map(model => {
            const abilities = model.info.meta.abilities || {};
            const chatTypes = model.info.meta.chat_type || [];
            return {
                id: model.id,
                thinking: abilities.thinking === 1 || abilities.thinking === 4 || false,
                search: chatTypes.includes('search'),
                vision: abilities.vision === 1 || false
            };
        });
    }

    async newChat({ model = 'qwen3-max' } = {}) {
        await this.ensureValidToken();
        const { data } = await this.api.post('/v2/chats/new', {
            title: 'New Chat', models: [model], chat_mode: 'normal', chat_type: 't2t', timestamp: Date.now()
        }, { headers: { 'Authorization': `Bearer ${this.token}` } });
        return data.data.id;
    }
    
    async loadChat(chatId) {
        await this.ensureValidToken();
        if (!chatId) throw new Error('Chat id is required.');
        const { data } = await this.api.get(`/v2/chats/${chatId}`, { headers: { 'Authorization': `Bearer ${this.token}` } });
        return data.data;
    }
    
    async chat(question, { model = 'qwen3-max', type = 'chat', chatId = null } = {}) {
        await this.ensureValidToken();
        if (!question) throw new Error('Question is required.');

        const availableModels = await this.models();
        const selectedModel = availableModels.find(m => m.id === model);
        if (!selectedModel) throw new Error(`Model '${model}' not found or is unavailable.`);
        if (type === 'search' && !selectedModel.search) throw new Error('Search is not supported by this model.');
        if (type === 'thinking' && !selectedModel.thinking) throw new Error('Thinking is not supported by this model.');

        let parent = null;
        if (chatId) {
            try {
                const chatInfo = await this.loadChat(chatId);
                parent = chatInfo.currentId;
            } catch (e) {
                throw new Error(`Failed to load chatId '${chatId}'. It may have expired or is invalid.`);
            }
        } else {
            chatId = await this.newChat({ model });
        }
        
        const { data } = await this.api.post('/v2/chat/completions', {
            stream: true, incremental_output: true, chat_id: chatId, chat_mode: 'normal', model: model, parent_id: parent,
            messages: [{
                fid: crypto.randomUUID(), parentId: parent, childrenIds: [crypto.randomUUID()], role: 'user', content: question,
                user_action: 'chat', files: [], timestamp: Date.now(), models: [model], chat_type: this.types[type],
                feature_config: { thinking_enabled: type === 'thinking', output_schema: 'phase' },
                extra: { meta: { subChatType: this.types[type] } }, sub_chat_type: this.types[type], parent_id: parent
            }],
            timestamp: Date.now()
        }, { headers: { 'Authorization': `Bearer ${this.token}` }, params: { chat_id: chatId } });
        
        const lines = data.split('\n\n').filter(l => l.trim()).map(l => JSON.parse(l.substring(6)));
        const res = { chatId: chatId, response: { reasoning: '', content: '', web_search: [] } };
        
        lines.forEach(l => {
            const d = l?.choices?.[0]?.delta;
            if (d?.phase === 'think' && d.content) res.response.reasoning += d.content;
            if (d?.phase === 'answer' && d.content) res.response.content += d.content;
            if (d?.phase === 'web_search' && d.extra?.web_search_info) res.response.web_search = d.extra.web_search_info;
        });
        
        return res;
    }
}

export default {
    name: "Qwen AI Chat",
    description: "Chat with Alibaba's Qwen models. Requires owner's credentials to be hard-coded.",
    category: "AI",
    methods: ["GET", "POST"],
    params: ["question", "model", "type", "chatId"],
    paramsSchema: {
        question: { type: "string", required: true, description: "The question or prompt for the AI." },
        model: { type: "string", default: "qwen3-max", description: "The AI model to use (e.g., qwen3-max, qwen-long)." },
        type: { type: "string", default: "chat", enum: ["chat", "search", "thinking"], description: "The type of chat interaction." },
        chatId: { type: "string", description: "Optional chat ID to continue an existing conversation." }
    },
    async run(req, res) {
        try {
            const params = req.method === "GET" ? req.query : req.body;
            const { question, model, type, chatId } = params;

            const email = "aaku85019@gmail.com";
            const password = "reno2610";

            if (!question) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'question' is required."
                });
            }

            const qwenInstance = new Qwen({ email, password });
            
            const result = await qwenInstance.chat(question, {
                model: model || 'qwen3-max',
                type: type || 'chat',
                chatId: chatId || null
            });

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            const statusCode = error.message.toLowerCase().includes("not found") ? 404 : 500;
            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                creator: "GIMI❤️",
                error: error.message || "An internal server error occurred."
            });
        }
    }
};

