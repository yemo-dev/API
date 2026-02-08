import { createRoute, z } from '@hono/zod-openapi'

export const statsRoute = createRoute({
    method: 'get',
    path: '/api/stats',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.string().openapi({ example: 'online' }),
                        time: z.string().openapi({ example: '12:00:00' }),
                        date: z.string().openapi({ example: '08/02/2026' }),
                        uptime: z.string().openapi({ example: '0h 5m 12s' }),
                        memory: z.object({
                            rss: z.string().openapi({ example: '50 MB' }),
                            heapTotal: z.string().openapi({ example: '30 MB' }),
                            heapUsed: z.string().openapi({ example: '20 MB' }),
                        }),
                        version: z.string().openapi({ example: '1.0.0' }),
                    }),
                },
            },
            description: 'Retrieve server statistics',
        },
    },
})

export const statsHandler = (c) => {
    const uptimeSeconds = process.uptime()
    const hours = Math.floor(uptimeSeconds / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = Math.floor(uptimeSeconds % 60)

    const data = {
        status: 'online',
        time: new Date().toLocaleTimeString('id-ID', { hour12: false }),
        date: new Date().toLocaleDateString('id-ID'),
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        version: '1.0.0'
    }

    return c.json(data, 200)
}
