import { generateFakeChatIphone } from "generator-fake";

export default {
  name: "Fake iPhone Chat Maker",
  description: "Generates an image of a fake iPhone chat bubble.",
  category: "Maker",
  methods: ["GET"],
  params: ["text", "chatime", "statusbartime"],
  paramsSchema: {
    text: { type: "string", required: true },
    chatime: { type: "string", required: true },
    statusbartime: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { text, chatime, statusbartime } = req.query;

      if (!text || !chatime || !statusbartime) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Missing required parameters: 'text', 'chatime', and 'statusbartime' are all required.",
        });
      }

      const quoteBuffer = await generateFakeChatIphone({
        text,
        chatTime: chatime,
        statusBarTime: statusbartime,
      });

      res.setHeader("Content-Type", "image/png");
      res.send(quoteBuffer);

    } catch (error) {
      console.error("Error generating fake chat image:", error);
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI❤️",
        error: error.message || "An error occurred while generating the image",
      });
    }
  },
};

