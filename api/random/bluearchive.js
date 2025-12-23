import axios from "axios";

export default {
  name: "Blue Archive",
  description: "Random image from Blue Archive game",
  category: "Random",
  methods: ["GET"],
  params: [],
  paramsSchema: {},
  async run(req, res) {
    try {
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/synshin9/blue-archive-r-img/refs/heads/main/links.json"
      );

      const randomUrl = data[Math.floor(data.length * Math.random())];
      const response = await axios.get(randomUrl, { responseType: "arraybuffer" });

      const buffer = Buffer.from(response.data);
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": buffer.length,
      });
      res.end(buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
