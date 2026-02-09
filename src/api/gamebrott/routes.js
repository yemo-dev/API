import { createRoute, z } from '@hono/zod-openapi'
import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://gamebrott.com/berita/'

export const getGamebrottNewsRoute = createRoute({
    method: 'get',
    path: '/api/gamebrott/news',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        creator: z.string(),
                        data: z.array(z.object({
                            title: z.string(),
                            link: z.string(),
                            image: z.string().optional(),
                            date: z.string()
                        }))
                    })
                }
            },
            description: 'Get Gamebrott News'
        }
    }
})

export const getGamebrottNewsHandler = async (c) => {
    try {
        const { data } = await axios.get(BASE_URL)
        const $ = cheerio.load(data)
        const articles = []

        $('.jeg_post').each((index, element) => {
            const titleElement = $(element).find('.jeg_post_title a')
            const imageElement = $(element).find('.jeg_thumb img')
            const dateElement = $(element).find('.jeg_meta_date a')

            const title = titleElement.text().trim()
            const link = titleElement.attr('href')
            const image = imageElement.attr('data-src') || imageElement.attr('src')
            const date = dateElement.text().trim()

            if (title && link) {
                articles.push({
                    title,
                    link,
                    image,
                    date
                })
            }
        })

        return c.json({
            status: true,
            creator: "yemobyte",
            data: articles
        })
    } catch (error) {
        return c.json({
            status: false,
            message: 'Internal Server Error'
        }, 500)
    }
}

export const getGamebrottDetailRoute = createRoute({
    method: 'get',
    path: '/api/gamebrott/detail',
    request: {
        query: z.object({
            url: z.string().openapi({ example: 'https://gamebrott.com/...' })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        creator: z.string(),
                        data: z.object({
                            title: z.string(),
                            image: z.string().optional(),
                            author: z.string(),
                            date: z.string(),
                            content: z.string()
                        })
                    })
                }
            },
            description: 'Get Gamebrott News Detail'
        }
    }
})

export const getGamebrottDetailHandler = async (c) => {
    try {
        const { url } = c.req.valid('query')
        if (!url) {
            return c.json({
                status: false,
                message: 'URL parameter is required'
            }, 400)
        }

        const { data } = await axios.get(url)
        const $ = cheerio.load(data)

        const title = ($('.jeg_post_title').first().text() || $('h1').first().text()).replace(/\s+/g, ' ').trim()

        $('script').remove()
        $('style').remove()
        $('.jeg_ad').remove()

        const contentElement = $('.content-inner').length ? $('.content-inner') : $('.jeg_post_content')
        const content = contentElement.text().replace(/\s+/g, ' ').trim()

        const imageElement = $('.jeg_featured_img img').first()
        const image = imageElement.attr('data-src') || imageElement.attr('src') || $('.wp-post-image').attr('src')

        const author = $('.jeg_author_name a').first().text().replace(/\s+/g, ' ').trim()
        const date = $('.jeg_meta_date a').first().text().replace(/\s+/g, ' ').trim()

        return c.json({
            status: true,
            creator: "yemobyte",
            data: {
                title,
                image,
                author,
                date,
                content
            }
        })

    } catch (error) {
        return c.json({
            status: false,
            message: 'Internal Server Error or Invalid URL'
        }, 500)
    }
}
