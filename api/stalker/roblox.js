import axios from "axios";

const proxy = () => null;

class RobloxAPI {
  constructor() {
    this.baseUrl = "https://api.roblox.com";
  }

  async request(url, method = "GET", data = null, timeout = 10000) {
    try {
      const config = { method, url, timeout };
      if (data) config.data = data;
      
      const proxyUrl = proxy();
      if (proxyUrl && url.includes("https://")) {
          url = proxyUrl + encodeURIComponent(url);
          config.url = url;
      }
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getUserIdFromUsername(username) {
    const data = await this.request("https://users.roblox.com/v1/usernames/users", "POST", {
      usernames: [username],
      excludeBannedUsers: false,
    });
    return data?.data?.[0]?.id || null;
  }

  async getUserInfo(userId) {
    return await this.request(`https://users.roblox.com/v1/users/${userId}`);
  }

  async getUserStatus(userId) {
    return await this.request(`https://users.roblox.com/v1/users/${userId}/status`);
  }

  async getUserPresence(userIds) {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    return await this.request("https://presence.roblox.com/v1/presence/users", "POST", { userIds: ids });
  }

  async getUserFriendsCount(userId) {
    return await this.request(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
  }

  async getUserFollowersCount(userId) {
    return await this.request(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
  }

  async getUserFollowingCount(userId) {
    return await this.request(`https://friends.roblox.com/v1/users/${userId}/followings/count`);
  }

  async getUserGroups(userId) {
    return await this.request(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
  }

  async getUserPrimaryGroup(userId) {
    return await this.request(`https://groups.roblox.com/v1/users/${userId}/groups/primary/role`);
  }

  async getUserFavoriteGames(userId, limit = 50) {
    return await this.request(`https://games.roblox.com/v2/users/${userId}/favorite/games?limit=${limit}`);
  }

  async getUserRecentGames(userId, limit = 50) {
    return await this.request(`https://games.roblox.com/v2/users/${userId}/games?limit=${limit}`);
  }

  async getUserAvatarHeadshot(userIds, size = "420x420", format = "Png", circular = false) {
    const ids = Array.isArray(userIds) ? userIds.join(",") : userIds;
    return await this.request(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ids}&size=${size}&format=${format}&isCircular=${circular}`);
  }

  async getUserAvatarFullBody(userIds, size = "720x720", format = "Png", circular = false) {
    const ids = Array.isArray(userIds) ? userIds.join(",") : userIds;
    return await this.request(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${ids}&size=${size}&format=${format}&isCircular=${circular}`);
  }

  async getUserAvatarBust(userIds, size = "420x420", format = "Png", circular = false) {
    const ids = Array.isArray(userIds) ? userIds.join(",") : userIds;
    return await this.request(`https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${ids}&size=${size}&format=${format}&isCircular=${circular}`);
  }

  async getUserAvatar(userId) {
    return await this.request(`https://avatar.roblox.com/v1/users/${userId}/avatar`);
  }

  async getUserCurrentlyWearing(userId) {
    return await this.request(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`);
  }

  async getUserOutfits(userId, page = 1, itemsPerPage = 25) {
    return await this.request(`https://avatar.roblox.com/v1/users/${userId}/outfits?page=${page}&itemsPerPage=${itemsPerPage}`);
  }

  async getUserBadges(userId, limit = 100, cursor = "") {
    return await this.request(`https://badges.roblox.com/v1/users/${userId}/badges?limit=${limit}&cursor=${cursor}`);
  }

  async getUserCollectibles(userId, assetType = "", limit = 100, cursor = "") {
    return await this.request(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?assetType=${assetType}&limit=${limit}&cursor=${cursor}`);
  }

  async getUserRobloxBadges(userId) {
    return await this.request(`https://accountinformation.roblox.com/v1/users/${userId}/roblox-badges`);
  }

  async getUserBundles(userId, limit = 100, cursor = "") {
    return await this.request(`https://catalog.roblox.com/v1/users/${userId}/bundles?limit=${limit}&cursor=${cursor}`);
  }

  async getCompleteUserInfo(username) {
    const userId = await this.getUserIdFromUsername(username);
    if (!userId) return null;

    const [
      basic, status, presence, friends, followers, following,
      groups, primaryGroup, favoriteGames, recentGames,
      headshot, fullBody, bust, avatar, wearing,
      outfits, badges, collectibles, robloxBadges, bundles,
    ] = await Promise.all([
      this.getUserInfo(userId),
      this.getUserStatus(userId),
      this.getUserPresence([userId]),
      this.getUserFriendsCount(userId),
      this.getUserFollowersCount(userId),
      this.getUserFollowingCount(userId),
      this.getUserGroups(userId),
      this.getUserPrimaryGroup(userId),
      this.getUserFavoriteGames(userId, 5),
      this.getUserRecentGames(userId, 5),
      this.getUserAvatarHeadshot(userId),
      this.getUserAvatarFullBody(userId),
      this.getUserAvatarBust(userId),
      this.getUserAvatar(userId),
      this.getUserCurrentlyWearing(userId),
      this.getUserOutfits(userId, 1, 10),
      this.getUserBadges(userId, 5),
      this.getUserCollectibles(userId, "", 5),
      this.getUserRobloxBadges(userId),
      this.getUserBundles(userId, 5),
    ]);

    return {
      userId, basic, status, presence,
      social: { friends, followers, following },
      groups: { list: groups, primary: primaryGroup },
      games: { favorites: favoriteGames, recent: recentGames },
      avatar: { headshot, fullBody, bust, details: avatar, wearing, outfits },
      achievements: { badges, collectibles, robloxBadges },
      catalog: { bundles },
    };
  }
}

const Roblox = new RobloxAPI();

async function stalkRoblox(username) {
  try {
    const result = await Roblox.getCompleteUserInfo(username);
    return result;
  } catch (error) {
    throw new Error("Failed to get Roblox user info");
  }
}

export default {
    name: "Roblox Stalker",
    description: "Fetches comprehensive information about a Roblox user, including profile, stats, avatar, games, and more.",
    category: "Stalker",
    methods: ["GET", "POST"],
    params: ["user"],
    paramsSchema: {
        user: { 
            type: "string", 
            required: true, 
            description: "Roblox username (e.g., builderman)" 
        }
    },
    async run(req, res) {
        try {
            const { user } = req.method === "GET" ? req.query : req.body;

            if (!user) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'user' is required."
                });
            }

            const result = await stalkRoblox(user.trim());

            if (!result) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: "User not found or failed to retrieve info."
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

