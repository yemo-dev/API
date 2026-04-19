import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import cluster from 'node:cluster'
import os from 'node:os'

import logger from './utils/logger.js'
import { appConfig, openApiConfig } from './configs/app.js'
import { setupRoutes } from './routes/index.js'
import { logApiRequest } from './middlewares/accessLog.js'
import { rateLimiter } from './middlewares/rateLimit.js'
import { prettyPrint } from './middlewares/pretty.js'

const port = appConfig.port

const killPort = () => {
    try {
        if (platform() === 'win32') {
            const cmd = `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"`
            execSync(cmd, { stdio: 'ignore' })
        } else {
            const commands = [`lsof -t -i:${port} | xargs kill -9`, `fuser -k ${port}/tcp`]
            for (const cmd of commands) {
                try { execSync(cmd, { stdio: 'ignore' }) } catch (e) { }
            }
        }
    } catch (e) { }
}

killPort()

const numCPUs = os.cpus().length
const isCluster = process.argv.includes('--cluster')

if (isCluster && cluster.isPrimary) {
    logger.info(`Primary ${process.pid} is running`)
    logger.info(`Starting ${numCPUs} workers...`)

    const masterClients = new Map()

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork()

        worker.on('message', (msg) => {
            if (msg.type === 'RATE_LIMIT_SYNC') {
                const { id, windowMs, method } = msg.data
                const now = Date.now()

                if (!masterClients.has(id)) {
                    masterClients.set(id, {
                        count: method === 'HEAD' ? 0 : 1,
                        resetTime: now + windowMs
                    })
                } else {
                    const client = masterClients.get(id)
                    if (now > client.resetTime) {
                        masterClients.set(id, {
                            count: method === 'HEAD' ? 0 : 1,
                            resetTime: now + windowMs
                        })
                    } else {
                        if (method !== 'HEAD') client.count++
                    }
                }

                const clientData = masterClients.get(id)
                worker.send({
                    type: 'RATE_LIMIT_SYNC_RES',
                    data: { id, ...clientData }
                })
            }
        })
    }

    setInterval(() => {
        const now = Date.now()
        for (const [id, data] of masterClients.entries()) {
            if (now > data.resetTime) masterClients.delete(id)
        }
    }, 10 * 60 * 1000)

    cluster.on('exit', (worker) => {
        logger.warn(`Worker ${worker.process.pid} died. Restarting...`)
        cluster.fork()
    })
} else {
    const app = new OpenAPIHono()

    app.use('*', secureHeaders())
    app.use('*', cors({
        origin: '*',
        allowHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'x-api-key', 'Authorization', 'Content-Type'],
        exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining']
    }))
    app.use('*', logApiRequest)
    app.use('*', prettyPrint)
    app.use('*', rateLimiter())

    setupRoutes(app)

    app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Enter your custom API Key to get higher rate limits.'
    })

    app.doc('/docs', openApiConfig)

    app.get('/', async (c) => {
        const host = c.req.header('host') || ''
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1')

        return apiReference({
            theme: 'purple',
            darkMode: true,
            pageTitle: `${appConfig.title} - Documentation Portal`,
            spec: { url: '/docs' },
            authentication: {
                preferredSecurityScheme: 'ApiKeyAuth'
            },
            customCss: `
                .powered-by-scalar, .scalar-client-lib-title, .scalar-footer > a {
                    display: none !important;
                }
                .scalar-footer::after {
                    content: 'Powered by MiuuAPI';
                    display: block;
                    text-align: center;
                    font-size: 12px;
                    color: var(--scalar-color-3);
                    padding: 20px 0;
                }
                ${!isLocal ? '.sidebar-search, .scalar-header { display: none !important; }' : ''}
            `
        })(c)
    })

    app.notFound((c) => {
        return c.json({
            success: false,
            status: 404,
            error: 'Not Found',
            message: `Route ${c.req.method} ${c.req.path} not found.`
        }, 404)
    })

    app.onError(async (err, c) => {
        logger.error(`[Error] ${err.message}`)
        return c.json({
            success: false,
            status: 500,
            error: 'Internal Server Error',
            message: err.message || 'An unexpected error occurred.'
        }, 500)
    })

    serve({ fetch: app.fetch, port: appConfig.port }, (info) => {
        logger.ready(`Worker ${process.pid} is running on port ${info.port}`)
    })
}
