import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { URLSearchParams } from 'url';

const MODEL_ID = '25870'; // ID untuk meta-ai
const MODEL_NAME = 'meta-ai';

async function aichat(question) {
    try {
        if (!question) throw new Error('Question is required.');
        
        const { data } = await axios.post(`https://px.nekolabs.my.id/${encodeURIComponent('https://chatgptfree.ai/wp-admin/admin-ajax.php')}`, new URLSearchParams({
            action: 'aipkit_frontend_chat_message',
            _ajax_nonce: 'b7a8dd3be7',
            bot_id: MODEL_ID,
            session_id: uuidv4(),
            conversation_uuid: uuidv4(),
            post_id: '6',
            message: question
        }).toString(), {
            headers: {
                origin: 'https://chatgptfree.ai',
                referer: 'https://chatgptfree.ai/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        if (data && data.success && data.data?.content?.data?.reply) {
            return data.data.content.data.reply;
        } else {
             throw new Error(data.data?.content?.message || "Received an unexpected or unsuccessful response from the AI service.");
        }

    } catch (error) {
        throw new Error(error.response?.data?.error || error.message || "Failed to communicate with the AI service.");
    }
}

export default {
    name: `AI Chat (${MODEL_NAME})`,
    description: `Chat with the ${MODEL_NAME}.`,
    category: "AI",
    methods: ["GET", "POST"],
    params: ["question"],
    paramsSchema: {
        question: { type: "string", required: true }
    },
    async run(req, res) {
        try {
            const question = req.method === "GET" ? req.query.question : req.body.question;

            if (!question) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'question' is required."
                });
            }

            const result = await aichat(question);

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: {
                    model: MODEL_NAME,
                    question: question,
                    answer: result
                },
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

