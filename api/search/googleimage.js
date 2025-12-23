import axios from "axios";
import * as cheerio from "cheerio";
import * as queryString from "querystring";

const baseURL = "http://images.google.com/search?";
const imageFileExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"];

function addSiteExcludePrefix(s) {
  return "-site:" + s;
}

function containsAnyImageFileExtension(s) {
  const lowercase = s.toLowerCase();
  return imageFileExtensions.some((ext) => lowercase.includes(ext));
}

async function scrapeGoogleImages(
  searchTerm,
  queryStringAddition = null,
  filterOutDomains = ["gstatic.com"],
  userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
) {
  try {
    let url =
      baseURL +
      queryString.stringify({
        tbm: "isch",
        q: searchTerm,
      });

    if (filterOutDomains && filterOutDomains.length > 0) {
      url += encodeURIComponent(
        " " + filterOutDomains.map(addSiteExcludePrefix).join(" ")
      );
    }

    if (queryStringAddition) {
      url += queryStringAddition;
    }

    const reqOpts = {
      url,
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: 30000,
    };

    const { data: body } = await axios(reqOpts);
    const $ = cheerio.load(body);
    const scripts = $("script");
    const scriptContents = [];

    for (let i = 0; i < scripts.length; ++i) {
      if (scripts[i].children.length > 0) {
        const content = scripts[i].children[0].data;
        if (content && containsAnyImageFileExtension(content)) {
          scriptContents.push(content);
        }
      }
    }

    const allRefs = scriptContents.flatMap(collectImageRefs);
    const cleanedRefs = allRefs.map(cleanImageRef).filter(isValidRef);
    const uniqueRefs = removeDuplicates(cleanedRefs);

    return uniqueRefs;
  } catch (error) {
    throw new Error("Failed to get response from Google Images API");
  }

  function collectImageRefs(content) {
    const refs = [];
    const patterns = [
      /\["(https?:\/\/[^"]+?)",(\d+),(\d+)\]/g,
      /"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|gif|bmp|svg)[^"]*?)"/gi,
    ];

    patterns.forEach(function (pattern) {
      let result;
      while ((result = pattern.exec(content)) !== null) {
        if (result.length >= 4) {
          let ref = {
            url: result[1],
            width: +result[3] || 0,
            height: +result[2] || 0,
          };
          if (domainIsOK(ref.url) && isImageUrl(ref.url)) {
            refs.push(ref);
          }
        } else if (result.length >= 2) {
          let ref = {
            url: result[1],
            width: 0,
            height: 0,
          };
          if (domainIsOK(ref.url) && isImageUrl(ref.url)) {
            refs.push(ref);
          }
        }
      }
    });
    return refs;
  }

  function cleanImageRef(ref) {
    let cleanUrl = ref.url
      .replace(/\\u003d/g, "=")
      .replace(/\\u0026/g, "&")
      .replace(/\\u003c/g, "<")
      .replace(/\\u003e/g, ">")
      .replace(/\\u0022/g, '"')
      .replace(/\\u0027/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\//g, "/")
      .replace(/\\n/g, "")
      .replace(/\\t/g, "")
      .replace(/\\r/g, "")
      .replace(/\\/g, "");

    try {
      cleanUrl = decodeURIComponent(cleanUrl);
    } catch (e) {}

    return {
      url: cleanUrl,
      width: ref.width,
      height: ref.height,
    };
  }

  function isValidRef(ref) {
    return (
      ref.url &&
      ref.url.startsWith("http") &&
      ref.url.length > 10 &&
      !ref.url.includes("undefined") &&
      !ref.url.includes("null")
    );
  }

  function removeDuplicates(refs) {
    const seen = new Set();
    return refs.filter(function (ref) {
      if (seen.has(ref.url)) {
        return false;
      }
      seen.add(ref.url);
      return true;
    });
  }

  function isImageUrl(url) {
    const lowerUrl = url.toLowerCase();
    return imageFileExtensions.some(function (ext) {
      return lowerUrl.includes(ext);
    });
  }

  function domainIsOK(url) {
    if (!filterOutDomains) {
      return true;
    } else {
      return filterOutDomains.every(skipDomainIsNotInURL);
    }
    function skipDomainIsNotInURL(skipDomain) {
      return url.indexOf(skipDomain) === -1;
    }
  }
}

export default {
    name: "Google Image Search",
    description: "Searches for images on Google using a query.",
    category: "Search",
    methods: ["GET"],
    params: ["query"],
    paramsSchema: {
        query: { type: "string", required: true }
    },
    async run(req, res) {
        try {
            const { query } = req.method === "GET" ? req.query : req.body;

            if (!query) {
                return res.status(400).json({
                    statusCode: 400,
                    success: false,
                    creator: "GIMI❤️",
                    error: "Parameter 'query' is required."
                });
            }

            const results = await scrapeGoogleImages(query.trim());

            if (results.length === 0) {
                return res.status(404).json({
                    statusCode: 404,
                    success: false,
                    creator: "GIMI❤️",
                    error: "No images found for the given query."
                });
            }

            res.status(200).json({
                statusCode: 200,
                success: true,
                creator: "GIMI❤️",
                data: results,
                timestamp: new Date().toISOString(),
                attribution: "@Zenzxz"
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

