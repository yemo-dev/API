import { z } from '@hono/zod-openapi'

export const appConfig = {
    port: process.env.PORT || 4000,
    title: 'MiuuAPI Portal',
    description: 'About Simple and easy to use API. ⭐️ Star to support our work!',
    version: '1.0.0',
    contact: {
        name: 'Miuu Support',
        url: 'https://github.com/miuubyte',
        email: 'miuudev@gmail.com'
    },
    license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
    }
}

export const openApiConfig = {
    openapi: '3.1.0',
    info: {
        version: appConfig.version,
        title: appConfig.title,
        description: appConfig.description,
        contact: appConfig.contact,
        license: appConfig.license
    },
    servers: [
        {
            url: `http://localhost:${appConfig.port}`,
            description: 'Local Development Server'
        }
    ],
    tags: [
        {
            name: 'server',
            description: 'Statistik dan informasi kesehatan server'
        },
        {
            name: 'auth',
            description: 'Manajemen dan informasi API Key'
        }
    ]
}

export const ErrorSchema = z.object({
    success: z.boolean().openapi({ example: false }),
    status: z.number().openapi({ example: 400 }),
    error: z.string().openapi({ example: 'Bad Request' }),
    message: z.string().openapi({ example: 'Deskripsi error di sini' })
})

export const RateLimitSchema = z.object({
    success: z.boolean().openapi({ example: false }),
    status: z.number().openapi({ example: 429 }),
    error: z.string().openapi({ example: 'Too Many Requests' }),
    message: z.string().openapi({ example: 'Rate limit exceeded. Try again later.' }),
    retryAfter: z.number().openapi({ example: 60 }),
    limit_info: z.object({
        type: z.string().openapi({ example: 'API Key' }),
        max: z.number().openapi({ example: 1000 })
    })
})
