import { z } from '@hono/zod-openapi'

export const appConfig = {
    port: process.env.PORT || 4000,
    title: 'MiuuAPI Portal',
    description: 'A simple and easy to use API. ⭐️ Star to support our work!',
    version: '1.0.0',
    contact: {
        name: 'Miuu Support',
        url: 'https://github.com/miuubyte',
        email: 'miuudev@gmail.com'
    },
    license: {
        name: 'Website License',
        url: 'https://opensource.org/license/mit'
    }
}

export const scalarConfig = {
    authentication: {
        preferredSecurityScheme: 'ApiKeyAuth'
    },
    theme: 'none',
    branding: {
        name: 'MiuuPS',
        url: 'https://github.com/miuubyte'
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
    servers: [],
    tags: [
        { name: 'anime', description: 'Anime & Donghua information retrieval' },
        { name: 'server', description: 'Server health and statistics' },
        { name: 'auth', description: 'API Key management and authentication' }
    ]
}

export const ErrorSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string()
})

export const UnauthorizedSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string()
})

export const ForbiddenSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string()
})

export const RateLimitSchema = z.object({
    success: z.boolean(),
    status: z.number(),
    error: z.string(),
    message: z.string(),
    retryAfter: z.number(),
    limit_info: z.object({
        type: z.string(),
        max: z.number()
    })
})
