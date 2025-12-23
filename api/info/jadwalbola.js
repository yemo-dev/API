import axios from "axios";
import * as cheerio from "cheerio";

async function fetchSchedule(dayOffset = 0) {
    const tanggal = new Date();
    tanggal.setDate(tanggal.getDate() + dayOffset);
    const format = tanggal.toISOString().split("T")[0].replace(/-/g, "");
    const { data } = await axios.get(`https://www.espn.com/soccer/schedule/_/date/${format}`);
    const $ = cheerio.load(data);
    const hasil = [];
    let liga = "";

    $(".Table__Title, .Table__TBODY .Table__TR").each((_, el) => {
        if ($(el).hasClass("Table__Title")) {
            liga = $(el).text().trim();
        } else {
            const td = $(el).find(".Table__TD");
            const tim1 = td.eq(0).text().trim();
            const tim2 = td.eq(1).find("span").last().text().trim();
            if (tim1 && tim2) {
                hasil.push({
                    liga,
                    time: td.eq(2).text().trim() || "-",
                    team1: tim1,
                    team2: tim2,
                    location: td.eq(3).text().trim() || "-",
                    detail: td.eq(1).find("a").attr("href") 
                        ? "https://www.espn.com" + td.eq(1).find("a").attr("href") 
                        : "Tidak ada"
                });
            }
        }
    });

    return {
        date: tanggal.toISOString().split("T")[0],
        total: hasil.length,
        matches: hasil
    };
}

export default {
    name: "Soccer Schedule",
    description: "Fetches the soccer match schedule from ESPN for today. If no matches are found, it fetches tomorrow's schedule.",
    category: "Info",
    methods: ["GET"],
    params: [],
    paramsSchema: {},
    async run(req, res) {
        try {
            let result = await fetchSchedule(0);
            if (result.total === 0) {
                result = await fetchSchedule(1);
            }
            
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: err.message || "Failed to fetch soccer schedule."
            });
        }
    },
};

