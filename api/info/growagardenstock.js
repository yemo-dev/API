import axios from 'axios';
import tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const gardenStock = {
  api: {
    base: 'https://www.gamersberg.com',
    endpoints: {
      page: () => '/grow-a-garden/stock',
      stock: () => '/api/grow-a-garden/stock'
    }
  },

  headers: {
    'user-agent': 'Postify/1.0.0',
    'x-requested-with': 'idm.internet.download.manager.plus',
    'accept-language': 'id,en;q=0.9',
    referer: 'https://www.gamersberg.com/sw.js',
    'sec-check-site': 'same-origin',
    'sec-check-mode': 'cors',
    'sec-check-dest': 'empty'
  },

  image: (type, name) =>
    `${gardenStock.api.base}${gardenStock.api.endpoints.page()}/${type}/${name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '')}.webp`,

  check: async () => {
    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar }));

    try {
      await client.get(`${gardenStock.api.base}${gardenStock.api.endpoints.page()}`, {
        headers: {
          'user-agent': gardenStock.headers['user-agent'],
          referer: gardenStock.headers.referer
        }
      });

      const { data } = await client.get(`${gardenStock.api.base}${gardenStock.api.endpoints.stock()}`, {
        headers: gardenStock.headers,
        timeout: 15000
      });

      const payload = data?.data?.[0];
      if (!payload) {
        throw new Error('Grow a Garden stock data is empty or unavailable.');
      }

      const {
        playerName,
        userId,
        sessionId,
        updateNumber,
        timestamp,
        weather,
        seeds,
        gear,
        eggs,
        cosmetic,
        event,
        honeyevent,
        nightevent,
        traveling
      } = payload;

      const fmt = (obj, type) =>
        Object.entries(obj).map(([name, qty]) => ({
          name,
          quantity: Number(qty),
          image: gardenStock.image(type, name)
        }));

      const eggx = eggs.map(({ name, quantity }) => ({
        name,
        quantity: Number(quantity),
        image: gardenStock.image('eggs', name)
      }));

      return {
        source: `${gardenStock.api.base}${gardenStock.api.endpoints.stock()}`,
        updated: new Date().toISOString(),
        user: { playerName, userId, sessionId },
        garden: {
          updateNumber,
          timestamp,
          weather,
          seeds: fmt(seeds, 'seeds'),
          gear: fmt(gear, 'gear'),
          cosmetic: fmt(cosmetic, 'cosmetics'),
          eggs: eggx,
          event,
          honeyevent,
          nightevent,
          traveling
        },
        meta: data.meta
      };
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch Grow a Garden stock data');
    }
  }
};

export default {
    name: "Grow A Garden Stock",
    description: "Fetches the current stock data from the Grow A Garden game.",
    category: "Info",
    methods: ["GET"],
    params: [],
    paramsSchema: {},
    async run(req, res) {
        try {
            const result = await gardenStock.check();
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: result,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            res.status(500).json({
                statusCode: 500,
                success: false,
                creator: "GIMI❤️",
                error: error.message || "Internal Server Error",
            });
        }
    },
};

