import { createRoute, z } from '@hono/zod-openapi'
import { apiKeys } from '../../configs/apiKeys.js'
import { ErrorSchema, RateLimitSchema, UnauthorizedSchema, ForbiddenSchema } from '../../configs/app.js'
import { getClientData } from '../../middlewares/rateLimit.js'
import { guestConfig } from '../../configs/apiKeys.js'

const KeyStatusResponseSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    key: z.string().openapi({ example: 'your_api_key_here' }),
    type: z.string().openapi({ example: 'Premium' }),
    limit: z.union([z.number(), z.string()]).openapi({ example: 'Unlimited' }),
    remaining: z.union([z.number(), z.string()]).openapi({ example: 95 }),
    description: z.string().openapi({ example: 'High performance API access' }),
    owner: z.string().openapi({ example: 'Miuu Support' })
})

export const keyStatusRoute = createRoute({
    method: 'get',
    path: '/api/auth/check',
    tags: ['auth'],
    summary: 'Check API Key Status',
    description: 'Verify your API Key and retrieve limit information.',
    security: [{ ApiKeyAuth: [] }],
    request: {
        headers: z.object({
            'x-api-key': z.string().optional().openapi({
                description: 'The API Key to check (can also be passed via query as apikey)',
                example: 'your_api_key_here'
            })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: KeyStatusResponseSchema
                }
            },
            description: 'Key is valid'
        },
        401: {
            content: {
                'application/json': {
                    schema: UnauthorizedSchema
                }
            },
            description: 'Invalid API Key'
        },
        403: {
            content: {
                'application/json': {
                    schema: ForbiddenSchema
                }
            },
            description: 'Access denied'
        },
        429: {
            content: {
                'application/json': {
                    schema: RateLimitSchema
                }
            },
            description: 'Rate limit exceeded'
        },
        500: {
            content: {
                'application/json': {
                    schema: ErrorSchema
                }
            },
            description: 'Internal Server Error'
        }
    }
})

export const keyStatusHandler = async (c) => {
    const apiKey = c.req.header('x-api-key') || c.req.query('apikey') || c.req.query('apiKey');
    
    const headers = c.req.header()
    let ip = headers['cf-connecting-ip'] || 
             headers['x-forwarded-for']?.split(',')[0] || 
             headers['x-real-ip']
    
    if (!ip) {
        try {
            const { getConnInfo } = await import('@hono/node-server/conninfo')
            const info = getConnInfo(c)
            ip = info.remote.address
        } catch (e) {
            ip = '127.0.0.1'
        }
    }
    if (ip === '::1') ip = '127.0.0.1'
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '')

    if (!apiKey) {
        const clientData = await getClientData(`ip:${ip}`, guestConfig.windowMs)
        const remaining = Math.max(0, guestConfig.limit - clientData.count)

        return c.json({
            success: true,
            key: 'GUEST_MODE',
            type: 'Free Tier',
            limit: guestConfig.limit,
            remaining: remaining,
            description: 'Standard access for guest users',
            owner: 'Public Guest'
        }, 200)
    }

    const keyInfo = apiKeys.find(k => k.key === apiKey)

    if (!keyInfo) {
        return c.json({
            success: false,
            status: 401,
            error: 'Unauthorized',
            message: 'Invalid API Key'
        }, 401)
    }

    const clientData = await getClientData(`key:${apiKey}`, keyInfo.windowMs)
    const remaining = keyInfo.limit === 0 ? 'Unlimited' : Math.max(0, keyInfo.limit - clientData.count)

    return c.json({
        success: true,
        key: apiKey,
        type: 'MiuuAPI Member',
        limit: keyInfo.limit === 0 ? 'Unlimited' : keyInfo.limit,
        remaining: remaining,
        description: 'Unlimited Premium Access',
        owner: keyInfo.name || 'API Partner'
    }, 200)
}
