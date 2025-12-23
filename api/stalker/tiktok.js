import axios from "axios";

export default {
  name: "TikTok Stalker",
  description: "Fetches public profile information for a TikTok user.",
  category: "Stalker",
  methods: ["GET"],
  params: ["username"],
  paramsSchema: {
    username: { type: "string", required: true },
  },
  async run(req, res) {
    try {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          creator: "GIMI❤️",
          error: "Parameter 'username' is required.",
        });
      }

      const response = await axios.get(`https://ttdl.siputzx.my.id/api/user/${encodeURIComponent(username)}`);
      
      if (response.data.status !== "success" || !response.data.data) {
          throw new Error(response.data.message || "User not found or an error occurred with the upstream API.");
      }
      
      const rawProfile = response.data.data;

      const profile = {
        id: rawProfile.id || null,
        username: rawProfile.username || null,
        nickname: rawProfile.nickname || null,
        avatar: rawProfile.avatar || null,
        signature: rawProfile.signature || null,
        verified: rawProfile.verified || false,
        private_account: rawProfile.private_account || false,
        follower_count: rawProfile.follower_count || 0,
        following_count: rawProfile.following_count || 0,
        video_count: rawProfile.video_count || 0,
        heart_count: rawProfile.heart_count || 0,
        profile_url: rawProfile.profile_url || null,
      };

      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        data: profile,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const isNotFound = error.message?.toLowerCase().includes("user not found");
      const statusCode = error.response?.status === 404 || isNotFound ? 404 : 500;
      
      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: error.message || "Failed to fetch TikTok profile.",
      });
    }
  },
};

