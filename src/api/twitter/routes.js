import { createRoute, z } from '@hono/zod-openapi'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

export const getTwitterRoute = createRoute({
    method: 'get',
    path: '/api/twitter',
    request: {
        query: z.object({
            url: z.string().openapi({ example: 'https://twitter.com/...' })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        creator: z.string(),
                        result: z.object({
                            account_name: z.string().nullable(),
                            username: z.string().nullable(),
                            text: z.string().nullable(),
                            stats: z.object({
                                views: z.string(),
                                likes: z.string(),
                                replies: z.string(),
                                reposts: z.string()
                            }),
                            media_type: z.string(),
                            media: z.array(z.string())
                        })
                    })
                }
            },
            description: 'Get Twitter Media & Stats'
        }
    }
})

export const getTwitterHandler = async (c) => {
    const { url } = c.req.valid('query')
    if (!url) {
        return c.json({
            status: false,
            message: 'URL parameter is required'
        }, 400)
    }

    let browser
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })

        const page = await browser.newPage()

        await page.setDefaultNavigationTimeout(60000)
        await page.setViewport({ width: 1280, height: 800 })

        let videoUrl = null
        await page.setRequestInterception(true)
        page.on('request', (req) => req.continue())
        page.on('response', (res) => {
            const contentType = res.headers()['content-type']
            if (contentType && (contentType.includes('video/mp4') || contentType.includes('application/x-mpegURL') || contentType.includes('video/m2ts'))) {
                if (!videoUrl && res.url().includes('video.twimg.com')) {
                    videoUrl = res.url()
                }
            }
        })

        await page.goto(url, { waitUntil: 'networkidle2' })

        try {
            await page.waitForSelector('[data-testid="tweetText"]', { timeout: 30000 })
        } catch (e) {

        }

        await page.evaluate(() => window.scrollBy(0, 500))
        await new Promise(r => setTimeout(r, 2000))

        const data = await page.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector)
                return el ? el.innerText.trim() : null
            }

            const accountName = getText('[data-testid="User-Name"] span')
            const username = getText('[data-testid="User-Name"] div.r-1wbh5a2')
            const text = getText('[data-testid="tweetText"]')

            const getStat = (testId) => {
                const el = document.querySelector(`[data-testid="${testId}"]`)
                if (el) {
                    const label = el.getAttribute('aria-label')
                    if (label) return label.split(' ')[0]
                    return el.innerText.trim() || '0'
                }
                return '0'
            }

            const replies = getStat('reply')
            const reposts = getStat('retweet')
            const likes = getStat('like')

            let views = '0'
            const viewsElement = Array.from(document.querySelectorAll('span, div, a')).find(el => el.textContent.includes('Views') && el.getAttribute('href') && el.getAttribute('href').includes('/analytics'))
            if (viewsElement) {
                views = viewsElement.innerText.replace('Views', '').trim()
            } else {
                const viewsText = Array.from(document.querySelectorAll('span')).find(el => el.innerText.includes('Views'))
                if (viewsText) views = viewsText.innerText.replace('Views', '').trim()
            }

            const media = []
            let type = 'text'

            const images = document.querySelectorAll('[data-testid="tweetPhoto"] img')
            images.forEach(img => {
                const src = img.src
                if (src) {
                    media.push(src)
                    type = 'image'
                }
            })

            const video = document.querySelector('video')
            if (video) {
                type = 'video'
                if (video.src) media.push(video.src)
                if (video.poster) media.push(video.poster)
            }

            return {
                account_name: accountName,
                username: username,
                text: text,
                stats: {
                    views,
                    likes,
                    replies,
                    reposts
                },
                media_type: type,
                media: media
            }
        })

        if (data.media_type !== 'image' && videoUrl) {
            data.media_type = 'video'
            data.media.push(videoUrl)
        } else if (data.media_type !== 'image') {
            const videoSrc = await page.evaluate(() => {
                const v = document.querySelector('video')
                return v ? v.src : null
            })
            if (videoSrc) {
                data.media_type = 'video'
                data.media.push(videoSrc)
            }
        }

        return c.json({
            status: true,
            creator: "yemobyte",
            result: data
        })

    } catch (error) {
        return c.json({
            status: false,
            message: 'Failed to scrape Twitter URL',
            error: error.message
        }, 500)
    } finally {
        if (browser) await browser.close()
    }
}
