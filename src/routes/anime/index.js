import { createRoute, z } from '@hono/zod-openapi'
import axios from "axios"
import * as cheerio from "cheerio"
import { ErrorSchema, RateLimitSchema, UnauthorizedSchema, ForbiddenSchema } from '../../configs/app.js'

const BASE_URL = "https://anichin.moe"

const createInstance = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    timeout: 30000,
  })
}

const client = createInstance()

const extractSlug = (url) => {
  if (!url) return ""
  try {
    const pathname = new URL(url).pathname
    return pathname.replace(/^\/|\/$/g, "")
  } catch {
    return url.replace(/^\/|\/$/g, "")
  }
}

const parsePagination = ($) => {
  const data = { currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false }
  const currentPage = $(".pagination .current").text().trim()
  const totalPages = $(".pagination .pages").text().match(/(\d+)$/)?.[1]
  if (currentPage) data.currentPage = parseInt(currentPage, 10) || 1
  if (totalPages) data.totalPages = parseInt(totalPages, 10) || 1
  data.hasNext = $(".nextpage").length > 0
  data.hasPrev = $(".prevpage").length > 0
  return data
}

const parseAnimeItem = ($, el) => {
  const $el = $(el)
  const link = $el.find(".bsx a").attr("href") || ""
  const title = $el.find(".tt").text().trim() || $el.find("img").attr("title") || ""
  const episode = $el.find(".epx").text().trim() || null
  const type = $el.find(".typez").text().trim() || null
  const imgSrc = $el.find("img").attr("src") || $el.find("img").attr("data-src") || null
  const isHot = $el.find(".hotbadge").length > 0

  if (!title || !link) return null

  return {
    title,
    slug: extractSlug(link),
    url: link.startsWith("http") ? link : `${BASE_URL}${link}`,
    episode,
    type,
    thumbnail: imgSrc,
    isHot
  }
}

const getStreamUrlMetadata = async (streamUrl) => {
  try {
    const response = await client.get(streamUrl, {
      headers: { Referer: BASE_URL }
    })
    const $ = cheerio.load(response.data)
    const data = { url: streamUrl, metadata: {} }
    
    const videoModule = $('[data-module="OKVideo"]').attr("data-options")
    const movieId = $('[data-module="OKVideo"]').attr("data-movie-id")
    const movieOptions = $('[data-module="OKVideo"]').attr("data-movie-options")

    if (movieId) data.metadata.movieId = movieId
    if (movieOptions) {
      try { data.metadata.options = JSON.parse(movieOptions) } catch { data.metadata.optionsRaw = movieOptions }
    }
    if (videoModule) {
      try {
        let video = JSON.parse(videoModule)
        if (video?.flashvars?.metadata) video = JSON.parse(video.flashvars.metadata)
        data.metadata.video = video
      } catch { data.metadata.videoRaw = videoModule }
    }
    return data
  } catch (e) {
    return { url: streamUrl, error: e.message }
  }
}

const AnimeItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  url: z.string(),
  episode: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  isHot: z.boolean().optional(),
  backdrop: z.string().nullable().optional(),
  description: z.string().nullable().optional()
})

const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})

export const animeHomeRoute = createRoute({
  method: 'get',
  path: '/api/anime/home',
  tags: ['anime'],
  summary: 'Anime Home',
  description: 'Retrieve slider, popular, and latest anime data from the homepage.',
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.object({ slider: z.array(AnimeItemSchema), popular: z.array(AnimeItemSchema), latest: z.array(AnimeItemSchema) }) }) } },
      description: 'Successfully retrieved homepage data'
    },
    500: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Internal Server Error' }
  }
})

export const animeSliderRoute = createRoute({
  method: 'get',
  path: '/api/anime/slider',
  tags: ['anime'],
  summary: 'Anime Slider',
  description: 'Featured slider from the homepage.',
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(AnimeItemSchema) }) } },
      description: 'Successfully retrieved slider data'
    },
    500: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Internal Server Error' }
  }
})

export const animeSearchRoute = createRoute({
  method: 'get',
  path: '/api/anime/search',
  tags: ['anime'],
  summary: 'Search Anime',
  description: 'Search for anime by title.',
  request: {
    query: z.object({ q: z.string().min(1), page: z.string().optional() }),
    headers: z.object({
      'x-api-key': z.string().optional().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), query: z.string(), results: z.array(AnimeItemSchema), pagination: PaginationSchema }) } },
      description: 'Successfully searched anime'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeDetailRoute = createRoute({
  method: 'get',
  path: '/api/anime/detail/{slug}',
  tags: ['anime'],
  summary: 'Anime Detail',
  description: 'Get full information about an anime by its slug.',
  request: {
    params: z.object({ slug: z.string() }),
    headers: z.object({
      'x-api-key': z.string().optional().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } },
      description: 'Successfully retrieved anime detail'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeEpisodeRoute = createRoute({
  method: 'get',
  path: '/api/anime/episode/{slug}',
  tags: ['anime'],
  summary: 'Anime Episode',
  description: 'Retrieve episode data and stream URLs by episode slug.',
  request: {
    params: z.object({ slug: z.string() }),
    headers: z.object({
      'x-api-key': z.string().optional().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } },
      description: 'Successfully retrieved episode data'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeTerbaruRoute = createRoute({
  method: 'get',
  path: '/api/anime/latest',
  tags: ['anime'],
  summary: 'Latest Anime',
  description: 'Retrieve the latest anime releases.',
  request: {
    query: z.object({ page: z.string().optional() }),
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), results: z.array(AnimeItemSchema), pagination: PaginationSchema }) } },
      description: 'Successfully retrieved latest anime'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animePopulerRoute = createRoute({
  method: 'get',
  path: '/api/anime/popular',
  tags: ['anime'],
  summary: 'Popular Anime',
  description: 'Retrieve currently popular anime.',
  request: {
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(AnimeItemSchema) }) } },
      description: 'Successfully retrieved popular anime'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeOngoingRoute = createRoute({
  method: 'get',
  path: '/api/anime/ongoing',
  tags: ['anime'],
  summary: 'Ongoing Anime',
  description: 'Retrieve list of ongoing anime.',
  request: {
    query: z.object({ page: z.string().optional() }),
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), results: z.array(AnimeItemSchema), pagination: PaginationSchema }) } },
      description: 'Successfully retrieved ongoing anime'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeCompletedRoute = createRoute({
  method: 'get',
  path: '/api/anime/completed',
  tags: ['anime'],
  summary: 'Completed Anime',
  description: 'Retrieve list of completed anime.',
  request: {
    query: z.object({ page: z.string().optional() }),
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), results: z.array(AnimeItemSchema), pagination: PaginationSchema }) } },
      description: 'Successfully retrieved completed anime'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeMovieRoute = createRoute({
  method: 'get',
  path: '/api/anime/movie',
  tags: ['anime'],
  summary: 'Anime Movie',
  description: 'Retrieve list of anime movies.',
  request: {
    query: z.object({ page: z.string().optional() }),
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), results: z.array(AnimeItemSchema), pagination: PaginationSchema }) } },
      description: 'Successfully retrieved anime movies'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeGenresRoute = createRoute({
  method: 'get',
  path: '/api/anime/genres',
  tags: ['anime'],
  summary: 'Genre List',
  description: 'List all available anime genres.',
  request: {
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.any()) }) } },
      description: 'Successfully retrieved genres'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeGenreRoute = createRoute({
  method: 'get',
  path: '/api/anime/genre/{slug}',
  tags: ['anime'],
  summary: 'Filter by Genre',
  description: 'Get anime list filtered by a specific genre.',
  request: {
    params: z.object({ slug: z.string() }),
    query: z.object({ page: z.string().optional() }),
    headers: z.object({
      'x-api-key': z.string().openapi({
        description: 'API Key for authentication',
        example: 'your_api_key_here'
      })
    })
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean(), genre: z.string(), results: z.array(AnimeItemSchema), pagination: PaginationSchema }) } },
      description: 'Successfully retrieved anime by genre'
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedSchema } },
      description: 'Invalid API Key'
    },
    403: {
      content: { 'application/json': { schema: ForbiddenSchema } },
      description: 'Access denied'
    },
    429: {
      content: { 'application/json': { schema: RateLimitSchema } },
      description: 'Rate limit exceeded'
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Internal Server Error'
    }
  }
})

export const animeHomeHandler = async (c) => {
  const response = await client.get("/")
  const $ = cheerio.load(response.data)
  const data = { slider: [], popular: [], latest: [] }
  $("#slidertwo .swiper-slide.item").each((_, el) => {
    const title = $(el).find("h2 a").attr("data-jtitle") || $(el).find("h2 a").text().trim()
    const link = $(el).find("h2 a").attr("href") || ""
    const backdrop = $(el).find(".backdrop").attr("style")?.match(/url\(['"]?([^'\")]+)/)?.[1] || null
    const description = $(el).find("p").not(":empty").last().text().trim()
    if (title && link) data.slider.push({ title, slug: extractSlug(link), url: link.startsWith("http") ? link : `${BASE_URL}${link}`, backdrop, description })
  })
  $(".hothome + .listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) data.popular.push(item)
  })
  $(".latesthome + .listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) data.latest.push(item)
  })
  return c.json({ success: true, data })
}

export const animeSearchHandler = async (c) => {
  const query = c.req.query('q')
  const page = parseInt(c.req.query('page') || '1')
  const response = await client.get(`/page/${page}/?s=${encodeURIComponent(query)}`)
  const $ = cheerio.load(response.data)
  const results = []
  $(".listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) results.push(item)
  })
  return c.json({ success: true, query, results, pagination: parsePagination($) })
}

export const animeDetailHandler = async (c) => {
  const slug = c.req.param('slug')
  const response = await client.get(`/${slug}/`)
  const $ = cheerio.load(response.data)
  const data = { title: "", japaneseTitle: "", synopsis: "", type: "", status: "", genres: [], episodes: [], cover: null }
  
  const info = $(".infox")
  data.title = info.find(".entry-title").text().trim() || info.find("h1").first().text().trim()
  data.japaneseTitle = info.find(".jtitle").text().trim() || null
  
  const synopsisText = $(".entry-content").find("p").first().text().trim()
  data.synopsis = synopsisText || $(".desc").text().trim() || null

  info.find(".spe span").each((_, el) => {
    const label = $(el).find(".btl").text().trim().toLowerCase()
    const value = $(el).contents().not("span").text().trim()
    if (label.includes("type")) data.type = value || null
    else if (label.includes("status")) data.status = value || null
    else if (label.includes("genre")) $(el).find("a").each((_, a) => { const g = $(a).text().trim(); if (g) data.genres.push(g) })
  })

  data.cover = $(".thumb img").attr("src") || $(".thumb img").attr("data-src") || null
  
  $(".eplister ul li").each((_, el) => {
    const title = $(el).find(".epl-title").text().trim()
    const link = $(el).find("a").attr("href") || ""
    const date = $(el).find(".epl-date").text().trim() || null
    if (title && link) data.episodes.push({ title, slug: extractSlug(link), url: link.startsWith("http") ? link : `${BASE_URL}${link}`, date })
  })
  return c.json({ success: true, data })
}

export const animeEpisodeHandler = async (c) => {
  const slug = c.req.param('slug')
  const response = await client.get(`/${slug}/`)
  const $ = cheerio.load(response.data)
  const data = { title: "", episodeNumber: "", releasedDate: "", author: "", series: null, cover: null, prevEpisode: null, nextEpisode: null, streams: [] }
  data.title = $(".entry-title").text().trim() || $("h1").first().text().trim()
  data.episodeNumber = $('[itemprop="episodeNumber"]').attr("content") || null
  data.releasedDate = $(".updated").text().trim() || null
  data.author = $(".vcard a").text().trim() || null
  const seriesLink = $(".lm .year a").attr("href")
  if (seriesLink) data.series = { name: $(".lm .year a").text().trim(), slug: extractSlug(seriesLink), url: seriesLink.startsWith("http") ? seriesLink : `${BASE_URL}${seriesLink}` }
  data.cover = $('[itemprop="image"] img').attr("src") || $(".thumb img").attr("src") || null
  const prevLink = $(".naveps .nvs:first-child a:not(.nolink)").attr("href") || null
  const nextLink = $(".naveps .nvs:last-child a").attr("href") || null
  if (prevLink) data.prevEpisode = { slug: extractSlug(prevLink), url: prevLink.startsWith("http") ? prevLink : `${BASE_URL}${prevLink}` }
  if (nextLink) data.nextEpisode = { slug: extractSlug(nextLink), url: nextLink.startsWith("http") ? nextLink : `${BASE_URL}${nextLink}` }
  $(".mirror option").each((_, el) => {
    const name = $(el).text().trim()
    const value = $(el).attr("value") || ""
    if (value && name !== "Select Video Server") {
      const decoded = Buffer.from(value, "base64").toString("utf-8")
      const iframeMatch = decoded.match(/<iframe[^>]*src=["']([^"']+)["']/i)
      if (iframeMatch && iframeMatch[1]) data.streams.push({ server: name, url: iframeMatch[1] })
    }
  })
  return c.json({ success: true, data })
}

export const animeTerbaruHandler = async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const response = await client.get(`/anime/?status=&type=&order=update&page=${page}`)
  const $ = cheerio.load(response.data)
  const results = []
  $(".listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) results.push(item)
  })
  return c.json({ success: true, results, pagination: parsePagination($) })
}

export const animePopulerHandler = async (c) => {
  const response = await client.get("/")
  const $ = cheerio.load(response.data)
  const data = []
  $(".hothome + .listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) data.push(item)
  })
  return c.json({ success: true, data })
}

export const animeSliderHandler = async (c) => {
  const response = await client.get("/")
  const $ = cheerio.load(response.data)
  const data = []
  $("#slidertwo .swiper-slide.item").each((_, el) => {
    const title = $(el).find("h2 a").attr("data-jtitle") || $(el).find("h2 a").text().trim()
    const link = $(el).find("h2 a").attr("href") || ""
    const backdrop = $(el).find(".backdrop").attr("style")?.match(/url\(['"]?([^'\")]+)/)?.[1] || null
    const description = $(el).find("p").not(":empty").last().text().trim()
    if (title && link) data.push({ title, slug: extractSlug(link), url: link.startsWith("http") ? link : `${BASE_URL}${link}`, backdrop, description })
  })
  return c.json({ success: true, data })
}

export const animeOngoingHandler = async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const response = await client.get(`/anime/?status=ongoing&type=&order=update&page=${page}`)
  const $ = cheerio.load(response.data)
  const results = []
  $(".listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) results.push(item)
  })
  return c.json({ success: true, results, pagination: parsePagination($) })
}

export const animeCompletedHandler = async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const response = await client.get(`/anime/?status=completed&type=&order=update&page=${page}`)
  const $ = cheerio.load(response.data)
  const results = []
  $(".listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) results.push(item)
  })
  return c.json({ success: true, results, pagination: parsePagination($) })
}

export const animeMovieHandler = async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const response = await client.get(`/anime/?status=&type=movie&order=update&page=${page}`)
  const $ = cheerio.load(response.data)
  const results = []
  $(".listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) results.push(item)
  })
  return c.json({ success: true, results, pagination: parsePagination($) })
}

export const animeGenresHandler = async (c) => {
  const response = await client.get("/anime/?status=&type=&order=update")
  const $ = cheerio.load(response.data)
  const data = []
  $(".filter-ser .genx option").each((_, el) => {
    const value = $(el).attr("value")
    const label = $(el).text().trim()
    if (value && label) data.push({ name: label, slug: value, url: `${BASE_URL}/genre/${value}` })
  })
  return c.json({ success: true, data })
}

export const animeGenreHandler = async (c) => {
  const slug = c.req.param('slug')
  const page = parseInt(c.req.query('page') || '1')
  const response = await client.get(`/genre/${slug}?page=${page}`)
  const $ = cheerio.load(response.data)
  const results = []
  $(".listupd .bs").each((_, el) => {
    const item = parseAnimeItem($, el)
    if (item) results.push(item)
  })
  return c.json({ success: true, genre: slug, results, pagination: parsePagination($) })
}
