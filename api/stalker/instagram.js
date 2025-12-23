import axios from "axios";

async function stalkInstagram(username) {
  const formData = new URLSearchParams();
  formData.append("profile", username);

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "origin": "https://bitchipdigital.com",
    "referer": "https://bitchipdigital.com/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  };

  try {
    const profileRes = await axios.post(
      "https://tools.xrespond.com/api/instagram/profile-info",
      formData.toString(),
      { headers }
    );

    const raw = profileRes.data?.data?.data;
    if (!raw || profileRes.data.status !== "success") {
      throw new Error("User not found or profile is private.");
    }

    const followers = raw.follower_count ?? 0;

    const postsForm = new URLSearchParams();
    postsForm.append("profile", username);

    const postsRes = await axios.post(
      "https://tools.xrespond.com/api/instagram/media/posts",
      postsForm.toString(),
      { headers }
    );

    const items = postsRes.data?.data?.data?.items || [];
    let totalLike = 0;
    let totalComment = 0;

    for (const post of items) {
      totalLike += post.like_count || 0;
      totalComment += post.comment_count || 0;
    }

    const totalEngagement = totalLike + totalComment;
    const averageEngagementRate =
      followers > 0 && items.length > 0
        ? ((totalEngagement / items.length) / followers) * 100
        : 0;

    return {
      username: raw.username || "-",
      name: raw.full_name || "-",
      bio: raw.biography || "-",
      followers,
      following: raw.following_count ?? 0,
      posts: raw.media_count ?? 0,
      profile_pic: raw.hd_profile_pic_url_info?.url || raw.profile_pic_url_hd || "",
      verified: raw.is_verified || raw.show_blue_badge_on_main_profile || false,
      engagement_rate: parseFloat(averageEngagementRate.toFixed(2)),
    };
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Failed to fetch data from the upstream API.");
  }
}

export default {
  name: "Instagram Stalker",
  description: "Fetches public profile information and calculates the engagement rate for an Instagram user.",
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

      const result = await stalkInstagram(username);
      
      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI❤️",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const isNotFound = error.message.toLowerCase().includes("user not found");
      const statusCode = isNotFound ? 404 : 500;
      
      res.status(statusCode).json({
        statusCode: statusCode,
        success: false,
        creator: "GIMI❤️",
        error: error.message,
      });
    }
  },
};

