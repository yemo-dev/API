import axios from "axios";

const AppleMusicSearch = {
    buildSongUrl(trackName, trackId, countryCode = "sg") {
        const slug = trackName.toLowerCase().replace(/['"“]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return `https://music.apple.com/${countryCode}/song/${slug}/${trackId}`;
    },

    search: async (keyword, country = "sg") => {
        try {
            const response = await axios.get("https://itunes.apple.com/search", { params: { term: keyword, entity: "song", country } });
            const rawSongs = response.data.results || [];
            if (rawSongs.length === 0) {
                return [];
            }
            return rawSongs.map(song => ({
                title: song.trackName,
                artist: song.artistName,
                artistId: song.artistId,
                releaseDate: song.releaseDate,
                duration: song.trackTimeMillis,
                album: song.collectionName,
                artwork: song.artworkUrl100,
                preview: song.previewUrl,
                url: AppleMusicSearch.buildSongUrl(song.trackName, song.trackId, country)
            }));
        } catch (err) {
            throw new Error(err.message || "Failed to search Apple Music.");
        }
    }
};

export default {
    name: "Apple Music Search",
    description: "Searches for songs on Apple Music by keyword.",
    category: "Search",
    methods: ["GET"],
    params: ["keyword", "country"],
    paramsSchema: {
        keyword: { type: "string", required: true },
        country: { type: "string", default: "sg" }
    },
    async run(req, res) {
        try {
            const { keyword, country = "sg" } = req.query;
            if (!keyword) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'keyword' is required."
                });
            }
            const results = await AppleMusicSearch.search(keyword, country);
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: results,
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

