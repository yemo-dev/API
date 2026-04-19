import { createRoute, z } from '@hono/zod-openapi'
import { apiKeys } from '../../configs/apiKeys.js'
import { getClientData } from '../../middlewares/rateLimit.js'
import { ErrorSchema } from '../../configs/app.js'

export const keyStatusRoute = createRoute({
    method: 'get',
    path: '/api/auth/me',
    tags: ['auth'],
    description: 'Cek status dan sisa limit API Key abang',
    security: [{ ApiKeyAuth: [] }],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean(),
                        data: z.object({
                            name: z.string(),
                            key: z.string(),
                            limit: z.number(),
                            used: z.number(),
                            remaining: z.number(),
                            reset_in: z.string(),
                            reset_at: z.string()
                        })
                    })
                }
            },
            description: 'Berhasil mengambil status key'
        },
        401: {
            content: {
                'application/json': {
                    schema: ErrorSchema
                }
            },
            description: 'API Key tidak valid atau tidak ditemukan'
        }
    }
})

export const keyStatusHandler = async (c) => {
    const apiKey = c.req.header('x-api-key')
    const keyData = apiKeys.find(k => k.key === apiKey)

    if (!keyData) {
        return c.json({
            success: false,
            status: 401,
            error: 'Unauthorized',
            message: 'API Key tidak valid.'
        }, 401)
    }

    const id = `key:${apiKey}`
    const clientData = await getClientData(id, keyData.windowMs)
    const now = Date.now()
    const diff = Math.max(0, clientData.resetTime - now)
    const reset_in = `${Math.ceil(diff / 1000)} seconds`
    const reset_at = new Date(clientData.resetTime).toLocaleString('id-ID')

    return c.json({
        success: true,
        data: {
            name: keyData.name,
            key: apiKey,
            limit: keyData.limit === 0 ? 'Unlimited' : keyData.limit,
            used: clientData.count,
            remaining: keyData.limit === 0 ? 'Unlimited' : Math.max(0, keyData.limit - clientData.count),
            reset_in,
            reset_at
        }
    }, 200)
}
