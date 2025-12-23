import axios from 'axios';
import { URLSearchParams } from 'url';

const clientId = '5b7e083725ea4d5298e64e6efa50ecfe';
const clientSecret = 'c5445e7f2f31485cbfb715c63191acae';

async function getAccessToken() {
  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      }
    }
  );
  return res.data.access_token;
}

async function searchSpotify(query) {
  const token = await getAccessToken();
  const res = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: 'track',
      limit: 10
    }
  });

  return res.data.tracks.items.map(track => ({
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    url: track.external_urls.spotify,
    cover: track.album.images[0]?.url || null
  }));
}

export default {
    name: "Spotify Track Search",
    description: "Searches for tracks on Spotify using a query.",
    category: "Search",
    methods: ["GET"],
    params: ["query"],
    paramsSchema: {
        query: { type: "string", required: true, description: "The song title or artist to search." }
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

            const result = await searchSpotify(query);

            if (result.length === 0) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: "No tracks found for the given query."
                });
            }

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: err.message || 'Failed to fetch data from Spotify API.'
            });
        }
    }
};

