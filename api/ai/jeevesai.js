class JeevesBot {
    constructor(options = {}) {
        this.domain = options.domain || "gmail.com";
        this.maxChatsPerAccount = options.maxChatsPerAccount || 10;
        this.cachedAccount = null;
        this.chatCounter = 0;
        this.apiKey = options.apiKey || "AIzaSyAk6elDmKNcUhK6aO-OhjHsyIbQc1FiAiU";
        this.firebaseVersion = options.firebaseVersion || "Chrome/JsCore/9.22.2/FirebaseCore-web";
    }

    generateRandomEmail() {
        const username = Math.random().toString(36).substring(2, 10);
        return `${username}@${this.domain}`;
    }

    generateRandomPassword(length = 12) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    async signUp() {
        const email = this.generateRandomEmail();
        const password = this.generateRandomPassword();
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
        const payload = {
            returnSecureToken: true,
            email: email,
            password: password,
            clientType: "CLIENT_TYPE_WEB"
        };
        const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://jeeves.ai',
            'x-client-version': this.firebaseVersion
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                this.cachedAccount = data;
                this.chatCounter = 0;
                return data;
            } else {
                throw new Error(data.error?.message || "Sign up to the upstream service failed.");
            }
        } catch (error) {
            throw error;
        }
    }

    async getAccount() {
        if (!this.cachedAccount || this.chatCounter >= this.maxChatsPerAccount) {
            return await this.signUp();
        } else {
            this.chatCounter++;
            return this.cachedAccount;
        }
    }

    async readStreamedResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let answer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim() !== "");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const jsonStr = line.slice(6);
                    if (jsonStr === "[DONE]") continue;
                    try {
                        const json = JSON.parse(jsonStr);
                        if (json.text) {
                            answer += json.text;
                        }
                    } catch (e) {}
                }
            }
        }
        return answer.trim();
    }

    async chat(promptText, useAuth = true) {
        let authHeader = "";
        if (useAuth) {
            const account = await this.getAccount();
            if (!account) {
                throw new Error("Failed to get a valid account for authentication.");
            }
            authHeader = "Bearer " + account.idToken;
        }
        const url = "https://api.jeeves.ai/generate/v4/chat";
        const payload = { prompt: promptText };
        const headers = {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Authorization": authHeader,
            "Origin": "https://jeeves.ai",
            "Referer": "https://jeeves.ai/"
        };
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Upstream API returned an error: ${response.status} ${response.statusText}`);
            }
            return await this.readStreamedResponse(response);
        } catch (error) {
            throw error;
        }
    }
}

const bot = new JeevesBot({
    domain: "gmail.com",
    maxChatsPerAccount: 10
});

export default {
    name: "Jeeves AI Chat",
    description: "Chat with Jeeves AI.",
    category: "AI",
    methods: ["GET"],
    params: ["prompt"],
    paramsSchema: {
        prompt: { type: "string", required: true }
    },
    async run(req, res) {
        try {
            const { prompt } = req.query;
            if (!prompt) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'prompt' is required."
                });
            }

            const responseText = await bot.chat(prompt, true);

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: {
                    response: responseText
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: error.message || "An internal server error occurred."
            });
        }
    }
};

