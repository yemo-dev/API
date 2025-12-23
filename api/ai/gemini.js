import fetch from "node-fetch";
import { URLSearchParams } from "url";

const gemini = {
  getNewCookie: async function () {
    const r = await fetch("https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c", {
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        method: "POST"
    });
    const setCookie = r.headers.get("set-cookie");
    if (!setCookie) throw new Error("Failed to get a new cookie from the upstream service.");
    return setCookie.split(";")[0];
  },
  ask: async function (prompt, previousId = null) {
    if (typeof prompt !== "string" || !prompt.trim().length) throw new Error("Prompt is missing.");
    let resumeArray = null;
    let cookie = null;
    if (previousId) {
      try {
        const s = Buffer.from(previousId, "base64").toString("utf-8");
        const j = JSON.parse(s);
        resumeArray = j.newResumeArray;
        cookie = j.cookie;
      } catch {
        resumeArray = null;
        cookie = null;
      }
    }
    const headers = {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "x-goog-ext-525001261-jspb": "[1,null,null,null,\"9ec249fc9ad08861\",null,null,null,[4]]",
      cookie: cookie || await this.getNewCookie()
    };
    const b = [[prompt], ["en-US"], resumeArray];
    const a = [null, JSON.stringify(b)];
    const obj = { "f.req": JSON.stringify(a) };
    const body = new URLSearchParams(obj);
    const response = await fetch("https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c", {
      headers,
      body,
      method: "POST"
    });
    if (!response.ok) throw new Error(`Upstream service returned an error: ${response.status} ${response.statusText}`);
    const data = await response.text();
    const match = [...data.matchAll(/^\d+\n(.+?)\n/gm)];
    if (!match.length) throw new Error("No valid response data found from the upstream service.");
    const array = match.reverse();
    const selectedArray = array[3]?.[1] || array[0]?.[1];
    if (!selectedArray) throw new Error("Response format from upstream service was unexpected.");
    const realArray = JSON.parse(selectedArray);
    const parse1 = JSON.parse(realArray[0][2]);
    const textData = parse1?.[4]?.[0]?.[1]?.[0];
    if (!textData) throw new Error("Failed to parse the main response text from the upstream service.");
    const newResumeArray = [...(parse1[1] || []), parse1?.[4]?.[0]?.[0]];
    const text = textData.replace(/\*\*(.+?)\*\*/g, "*$1*");
    const id = Buffer.from(JSON.stringify({ newResumeArray, cookie: headers.cookie })).toString("base64");
    return { text, id };
  }
};

export default {
    name: "Gemini AI",
    description: "Chat with Google's Gemini AI. Supports conversation context via 'id'.",
    category: "AI",
    methods: ["GET"],
    params: ["text", "id"],
    paramsSchema: {
        text: { type: "string", required: true },
        id: { type: "string" }
    },
    async run(req, res) {
        try {
            const { text, id } = req.query;
            if (!text) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'text' is required."
                });
            }
            const result = await gemini.ask(text, id);
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: {
                    response: result.text,
                    id: result.id
                },
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: err.message
            });
        }
    }
};

