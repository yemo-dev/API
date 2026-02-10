import { createRoute, z } from '@hono/zod-openapi'
import os from 'os'

export const jaStatsRoute = createRoute({
    method: 'get',
    path: '/api/jastats',
    description: 'Get detailed JASTATS system information',
    'x-status': 'ONLINE',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        system: z.object({
                            platform: z.string(),
                            release: z.string(),
                            arch: z.string(),
                            uptime: z.string(),
                            hostname: z.string()
                        }),
                        cpu: z.object({
                            model: z.string(),
                            cores: z.number(),
                            speed: z.string()
                        }),
                        memory: z.object({
                            total: z.string(),
                            free: z.string(),
                            used: z.string(),
                            percentage: z.string()
                        }),
                        network: z.record(z.array(z.object({
                            address: z.string(),
                            family: z.string(),
                            internal: z.boolean()
                        }))),
                        process: z.object({
                            pid: z.number(),
                            nodeVersion: z.string(),
                            memoryUsage: z.object({
                                rss: z.string(),
                                heapTotal: z.string(),
                                heapUsed: z.string()
                            })
                        })
                    })
                }
            },
            description: 'Successful response'
        }
    }
})

export const jaStatsHandler = (c) => {

    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor((seconds % (3600 * 24)) / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor(seconds % 60)
        return `${d}d ${h}h ${m}m ${s}s`
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const cpus = os.cpus()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memUsage = process.memoryUsage()

    return c.json({
        status: true,
        system: {
            platform: os.platform(),
            release: os.release(),
            arch: os.arch(),
            uptime: formatUptime(os.uptime()),
            hostname: os.hostname()
        },
        cpu: {
            model: cpus[0].model,
            cores: cpus.length,
            speed: `${cpus[0].speed} MHz`
        },
        memory: {
            total: formatBytes(totalMem),
            free: formatBytes(freeMem),
            used: formatBytes(usedMem),
            percentage: ((usedMem / totalMem) * 100).toFixed(2) + '%'
        },
        network: os.networkInterfaces(),
        process: {
            pid: process.pid,
            nodeVersion: process.version,
            memoryUsage: {
                rss: formatBytes(memUsage.rss),
                heapTotal: formatBytes(memUsage.heapTotal),
                heapUsed: formatBytes(memUsage.heapUsed)
            }
        }
    })
}
