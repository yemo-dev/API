import axios from 'axios';
import FormData from 'form-data';

async function ttSearch(query) {
    try {
        let d = new FormData();
        d.append("keywords", query);
        d.append("count", 15);
        d.append("cursor", 0);
        d.append("web", 1);
        d.append("hd", 1);
 
        let h = {
            headers: {
                ...d.getHeaders()
            }
        };
 
        let { data } = await axios.post("https://tikwm.com/api/feed/search", d, h);
        
        if (data.code !== 0 || !data.data || !data.data.videos) {
            throw new Error(data.msg || "Failed to search TikTok or no videos found.");
        }

        const baseURL = "https://tikwm.com";
 
        const videos = data.data.videos.map(video => {
            return {
                ...video,
                play: baseURL + video.play,
                wmplay: baseURL + video.wmplay,
                music: baseURL + video.music,
                cover: baseURL + video.cover,
                avatar: baseURL + video.avatar
            };
        });
 
        return videos;
    } catch (e) {
        throw new Error(e.response?.data?.msg || e.message || "An error occurred while fetching from the TikTok API.");
    }
}

export default {
    name: "TikTok Search",
    description: "Searches for videos on TikTok based on a query.",
    category: "Search",
    methods: ["GET"],
    params: ["query"],
    paramsSchema: {
        query: { type: "string", required: true, description: "The keyword or query to search for." }
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
            
            const results = await ttSearch(query);

            if (results.length === 0) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: "No videos found for the given query."
                });
            }
            
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: results,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            const isNotFound = error.message.toLowerCase().includes("not found");
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

