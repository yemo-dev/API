import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

class Twitter {
  constructor(username) {
    this.username = username;
  }

  flatten(tweet) {
    const { user, ...rest } = tweet;
    const flatUser = {};
    if (user && typeof user === "object") {
      for (const key in user) {
        flatUser[`user_${key}`] = user[key];
      }
    }
    return { ...rest, ...flatUser };
  }

  async stalkNow() {
    const jar = new CookieJar();
    const client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
        timeout: 7000
      })
    );

    await client.get("https://twitterviewer.net");

    const dataBody = { username: this.username };
    const headers = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    const { data } = await client.post(
      "https://twitterviewer.net/api/get-user",
      dataBody,
      headers
    );

    if (data.error) {
        throw new Error(data.error);
    }

    const { data: tweetsRes } = await client.post(
      "https://twitterviewer.net/api/get-user-tweets",
      dataBody,
      headers
    );

    return {
      ...data,
      tweets: tweetsRes.tweets.map(this.flatten)
    };
  }

  async fallbackAPI() {
    const res = await axios.get(`https://api.vxtwitter.com/${this.username}/status/1`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      },
      timeout: 5000
    });
    
    const data = res.data.user;
    if (!data || res.data.error) {
        throw new Error(res.data.error || "User not found on fallback API.");
    }
    
    return {
      id: data.id,
      name: data.name,
      username: data.screen_name,
      description: data.description,
      followers_count: data.followers,
      following_count: data.following,
      tweet_count: data.statuses_count,
      profile_image_url: data.profile_image_url,
      created_at: new Date(data.created_at * 1000).toISOString(),
      tweets: []
    };
  }
}

export default {
    name: "Twitter Stalker",
    description: "Fetches public profile information and recent tweets for a Twitter (X) user with a fallback mechanism.",
    category: "Stalker",
    methods: ["GET"],
    params: ["username"],
    paramsSchema: {
        username: { type: "string", required: true }
    },
    async run(req, res) {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                creator: "GIMI❤️",
                error: "Parameter 'username' is required."
            });
        }

        try {
            const twitter = new Twitter(username);
            let profileData;
            try {
                profileData = await twitter.stalkNow();
            } catch (scrapeErr) {
                console.warn("[SCRAPE FAIL] Fallback to API →", scrapeErr.message);
                profileData = await twitter.fallbackAPI();
            }

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: profileData,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            const isNotFound = err.message?.toLowerCase().includes("user not found");
            const statusCode = isNotFound ? 404 : 500;

            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                creator: "GIMI❤️",
                error: err.message || "Failed to fetch Twitter data."
            });
        }
    }
};

