import { createRoute, z } from '@hono/zod-openapi'
import os from 'node:os'
import { ErrorSchema, RateLimitSchema, UnauthorizedSchema, ForbiddenSchema } from '../../configs/app.js'

const NetworkInterfaceSchema = z.array(z.object({
    address: z.string().openapi({ example: '192.168.1.100' }),
    netmask: z.string().openapi({ example: '255.255.255.0' }),
    family: z.string().openapi({ example: 'IPv4' }),
    mac: z.string().openapi({ example: 'aa:bb:cc:dd:ee:ff' }),
    internal: z.boolean().openapi({ example: false })
}))

const StatsResponseSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    status: z.string().openapi({ example: 'online' }),
    system: z.object({
        platform: z.string().openapi({ example: 'linux' }),
        release: z.string().openapi({ example: '5.15.0-91-generic' }),
        type: z.string().openapi({ example: 'Linux' }),
        arch: z.string().openapi({ example: 'x64' }),
        hostname: z.string().openapi({ example: 'vps-miuu' }),
        uptime: z.string().openapi({ example: '3d 14h 22m 10s' })
    }),
    cpu: z.object({
        model: z.string().openapi({ example: 'Intel(R) Core(TM) i7-9750H' }),
        speed: z.string().openapi({ example: '2600 MHz' }),
        cores: z.number().openapi({ example: 8 }),
        load_avg: z.array(z.number()).openapi({ example: [0.12, 0.08, 0.05] })
    }),
    memory: z.object({
        total: z.string().openapi({ example: '7812.00 MB' }),
        free: z.string().openapi({ example: '3200.50 MB' }),
        used: z.string().openapi({ example: '4611.50 MB' }),
        usage_percent: z.string().openapi({ example: '59.02%' }),
        active_process_rss: z.string().openapi({ example: '92.30 MB' }),
        heap_total: z.string().openapi({ example: '65.12 MB' }),
        heap_used: z.string().openapi({ example: '48.77 MB' })
    }),
    network: z.record(NetworkInterfaceSchema).openapi({
        example: {
            eth0: [{ address: '192.168.1.100', netmask: '255.255.255.0', family: 'IPv4', mac: 'aa:bb:cc:dd:ee:ff', internal: false }]
        }
    }),
    process: z.object({
        pid: z.number().openapi({ example: 1234 }),
        node_version: z.string().openapi({ example: 'v22.0.0' }),
        uptime: z.string().openapi({ example: '0d 2h 15m 30s' }),
        title: z.string().openapi({ example: 'node' })
    }),
    time: z.string().openapi({ example: '08:30:00' }),
    date: z.string().openapi({ example: '26/04/2025' })
})

export const statsRoute = createRoute({
    method: 'get',
    path: '/api/stats',
    tags: ['server'],
    summary: 'Server Statistics',
    description: 'Returns complete server system information: CPU, RAM, OS, network, Node.js process, and current time.',
    security: [{ ApiKeyAuth: [] }],
    request: {
        headers: z.object({
            'x-api-key': z.string().optional().openapi({
                description: 'Optional API Key for higher rate limits',
                example: 'your_api_key_here'
            })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: StatsResponseSchema
                }
            },
            description: 'Successfully retrieved server statistics'
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

export const statsHandler = (c) => {
    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor(seconds % (3600 * 24) / 3600)
        const m = Math.floor(seconds % 3600 / 60)
        const s = Math.floor(seconds % 60)
        return `${d}d ${h}h ${m}m ${s}s`
    }

    const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

    const cpus = os.cpus()
    const cpuModel = cpus[0].model
    const cpuSpeed = `${cpus[0].speed} MHz`
    const cpuCores = cpus.length

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2)
    const processMem = process.memoryUsage()

    return c.json({
        success: true,
        status: 'online',
        system: {
            platform: os.platform(),
            release: os.release(),
            type: os.type(),
            arch: os.arch(),
            hostname: os.hostname(),
            uptime: formatUptime(os.uptime())
        },
        cpu: {
            model: cpuModel,
            speed: cpuSpeed,
            cores: cpuCores,
            load_avg: os.loadavg()
        },
        memory: {
            total: formatBytes(totalMem),
            free: formatBytes(freeMem),
            used: formatBytes(usedMem),
            usage_percent: `${memUsagePercent}%`,
            active_process_rss: formatBytes(processMem.rss),
            heap_total: formatBytes(processMem.heapTotal),
            heap_used: formatBytes(processMem.heapUsed)
        },
        network: os.networkInterfaces(),
        process: {
            pid: process.pid,
            node_version: process.version,
            uptime: formatUptime(process.uptime()),
            title: process.title
        },
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        date: new Date().toLocaleDateString('en-GB')
    }, 200)
}
