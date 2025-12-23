import axios from "axios";
import https from "https";
import qs from "qs";

async function pinterestScrape(query) {
  const agent = new https.Agent({ keepAlive: true });
  try {
    const home = await axios.get("https://www.pinterest.com/", {
      httpsAgent: agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const rawCookies = home.headers["set-cookie"] || [];
    const cookies = rawCookies.map((c) => c.split(";")[0]).join("; ");
    const csrf = (rawCookies.find((c) => c.startsWith("csrftoken=")) || "")
      .split("=")[1]?.split(";")[0] || "";

    if (!csrf || !cookies) {
        throw new Error("Failed to retrieve session cookies or CSRF token from Pinterest.");
    }

    const source_url = `/search/pins/?q=${encodeURIComponent(query)}`;
    const data = {
      options: { query, field_set_key: "react_grid_pin", is_prefetch: false, page_size: 25 },
      context: {},
    };
    const body = qs.stringify({ source_url, data: JSON.stringify(data) });

    const res = await axios.post(
      "https://www.pinterest.com/resource/BaseSearchResource/get/",
      body,
      {
        httpsAgent: agent,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-CSRFToken": csrf,
          "X-Requested-With": "XMLHttpRequest",
          Origin: "https://www.pinterest.com",
          Referer: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
          Cookie: cookies,
        },
      }
    );

    const pins = res.data.resource_response.data.results
      .filter((p) => p.images && p.images.orig?.url)
      .map((p) => ({
        link: `https://www.pinterest.com/pin/${p.id}/`,
        directLink: p.images?.orig?.url || p.images?.["236x"]?.url,
      }));

    return pins;
  } catch (e) {
    throw new Error(e.response?.data?.message || e.message || "Failed to scrape Pinterest.");
  }
}

export default {
    name: "Pinterest Search",
    description: "Searches for images on Pinterest and returns direct image links.",
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
            
            const result = await pinterestScrape(query.trim());

            if (result.length === 0) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: "No images found for the given query."
                });
            }
            
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
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

