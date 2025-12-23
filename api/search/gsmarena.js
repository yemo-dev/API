import axios from 'axios';
import * as cheerio from 'cheerio';

async function searchPhone(phoneName) {
  try {
    const searchUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(phoneName)}`;
    const { data } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const phoneLink = $('.makers ul li a').first().attr('href');
    if (!phoneLink) {
        throw new Error(`HP "${phoneName}" tidak ditemukan.`);
    }
    return `https://www.gsmarena.com/${phoneLink}`;
  } catch (error) {
    throw new Error(error.message || 'Gagal mencari HP di GSMArena.');
  }
}

async function getExchangeRates() {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    return null;
  }
}

async function scrapeAllSpecs(url) {
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const specs = {};

    $('div#specs-list table').each((_, table) => {
      const category = $(table).find('th').text().trim();
      const specDetails = {};
      $(table).find('tr').each((_, row) => {
        const key = $(row).find('td.ttl').text().replace(/\n/g, ' ').trim();
        const value = $(row).find('td.nfo').text().replace(/\n/g, ' ').trim();
        if (key && value) specDetails[key] = value;
      });
      if (category && Object.keys(specDetails).length) specs[category] = specDetails;
    });

    const phoneName = $('h1.specs-phone-name-title').text().trim();
    const imageUrl = $('.specs-photo-main img').attr('src') || 'N/A';
    const priceEurText = specs['Misc']?.['Price'] || 'N/A';
    let prices = { EUR: priceEurText };

    if (priceEurText !== 'N/A' && priceEurText.includes('EUR')) {
      const match = priceEurText.match(/[\d.,]+/);
      if (match) {
        const eurValue = parseFloat(match[0].replace(',', '.'));
        const rates = await getExchangeRates();
        if (rates && rates.USD && rates.IDR) {
          prices = {
            EUR: `${eurValue.toFixed(2)} EUR`,
            USD: `${(eurValue * rates.USD).toFixed(2)} USD`,
            IDR: `Rp ${(eurValue * rates.IDR).toLocaleString('id-ID')}`
          };
        }
      }
    }

    return { phoneName, imageUrl, prices, specs };
  } catch (error) {
    throw new Error('Gagal scrape data dari GSMArena.');
  }
}

export default {
    name: "GSMArena Phone Specs",
    description: "Searches for a phone on GSMArena and returns its full specifications and estimated price.",
    category: "Search",
    methods: ["GET"],
    params: ["query"],
    paramsSchema: {
        query: { type: "string", required: true }
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

            const phoneUrl = await searchPhone(query);
            const resultData = await scrapeAllSpecs(phoneUrl);
            
            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: resultData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            const isNotFound = error.message.toLowerCase().includes("tidak ditemukan");
            const statusCode = isNotFound ? 404 : 500;
            
            res.status(statusCode).json({
                statusCode: statusCode,
                success: false,
                creator: "GIMI❤️",
                error: error.message || 'An internal server error occurred.'
            });
        }
    }
};

