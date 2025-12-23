import axios from "axios";
import moment from "moment-timezone";

export default {
    name: "Prayer Schedule",
    description: "Fetches Islamic prayer times for a specific city in Indonesia.",
    category: "Info",
    methods: ["GET"],
    params: ["city"],
    paramsSchema: {
        city: { type: "string", required: true },
    },
    async run(req, res) {
        try {
            const { city } = req.query;

            if (!city) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'city' is required."
                });
            }

            const searchUrl = `https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(city)}`;
            const searchRes = await axios.get(searchUrl);

            if (!searchRes.data.status || !searchRes.data.data.length) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: `City '${city}' not found.`
                });
            }

            const cityId = searchRes.data.data[0].id;
            const cityName = searchRes.data.data[0].lokasi;

            const today = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
            const scheduleUrl = `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${today}`;
            const scheduleRes = await axios.get(scheduleUrl);

            if (!scheduleRes.data.status || !scheduleRes.data.data.jadwal) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: `Prayer schedule for '${cityName}' on ${today} is not available.`
                });
            }

            const schedule = scheduleRes.data.data.jadwal;

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: {
                    city: cityName,
                    date: today,
                    schedule: {
                        imsak: schedule.imsak,
                        subuh: schedule.subuh,
                        terbit: schedule.terbit,
                        dhuha: schedule.dhuha,
                        dzuhur: schedule.dzuhur,
                        ashar: schedule.ashar,
                        maghrib: schedule.maghrib,
                        isya: schedule.isya
                    }
                },
                timestamp: new Date().toISOString(),
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

