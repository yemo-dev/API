import axios from "axios";
import * as cheerio from "cheerio";

async function wikipediaScraper(query) {
  try {
    const response = await axios.get(`https://id.m.wikipedia.org/wiki/${encodeURIComponent(query)}`, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0"
      }
    });

    const $ = cheerio.load(response.data);
    const title = $("title").text().replace(" - Wikipedia bahasa Indonesia, ensiklopedia bebas", "");
    const wiki = $("#mf-section-0").find("p").text().trim();
    const thumb = $('meta[property="og:image"]').attr("content");

    if (!wiki) {
      throw new Error("Artikel tidak ditemukan atau tidak memiliki paragraf ringkasan.");
    }

    return {
      title: title,
      wiki: wiki,
      thumb: thumb || null
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
        throw new Error(`Artikel "${query}" tidak ditemukan di Wikipedia.`);
    }
    throw new Error(error.message || "Gagal mengambil data dari Wikipedia.");
  }
}

export default {
    name: "Wikipedia Search",
    description: "Searches for an article on Indonesian Wikipedia.",
    category: "Search",
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

            const result = await wikipediaScraper(query.trim());

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            const isNotFound = error.message.toLowerCase().includes("tidak ditemukan");
            const statusCode = isNotFound ? 404 : 500;
            
            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                creator: "GIMI❤️",
                error: error.message
            });
        }
    }
};

