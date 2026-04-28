import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { renderApiReference } from '@scalar/client-side-rendering'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { serveStatic } from '@hono/node-server/serve-static'
import cluster from 'node:cluster'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'

import logger from './utils/logger.js'
import { appConfig, openApiConfig, scalarConfig } from './configs/app.js'
import { setupRoutes } from './routes/index.js'
import { logApiRequest } from './middlewares/accessLog.js'
import { rateLimiter } from './middlewares/rateLimit.js'
import { prettyPrint } from './middlewares/pretty.js'
import { buildBrandingScript } from './custom/index.js'

const port = appConfig.port

const minNodeVersion = 20
const currentVersion = parseInt(process.versions.node.split('.')[0])

if (currentVersion < minNodeVersion) {
    logger.error(`Node.js version ${process.versions.node} is not supported.`)
    logger.error(`MiuuAPI requires Node.js v${minNodeVersion} or higher to run.`)
    process.exit(1)
}

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

const numCPUs = os.cpus().length
const isCluster = process.argv.includes('--cluster')

if (cluster.isPrimary) {
    killPort()
}

if (isCluster && cluster.isPrimary) {
    logger.info(`Primary ${process.pid} is running`)
    logger.info(`Starting ${numCPUs} workers...`)

    const masterClients = new Map()
    const masterAutoBanList = []

    const syncAutoBanListToFile = () => {
        try {
            const filePath = path.resolve('src/configs/apiKeys.js')
            let content = fs.readFileSync(filePath, 'utf8')
            const listString = JSON.stringify(masterAutoBanList, null, 4)
            content = content.replace(/export const autoBanList = \[([\s\S]*?)\]/, `export const autoBanList = ${listString}`)
            fs.writeFileSync(filePath, content, 'utf8')
        } catch (e) {
            logger.error(`Failed to sync autoBanList to file: ${e.message}`)
        }
    }

    const broadcastBanList = () => {
        Object.values(cluster.workers).forEach(w => {
            if (w) w.send({ type: 'BAN_LIST_SYNC', data: masterAutoBanList })
        })
        syncAutoBanListToFile()
    }

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
            } else if (msg.type === 'BAN_IP') {
                const { ip, reason, expires } = msg.data
                if (!masterAutoBanList.find(b => b.ip === ip)) {
                    masterAutoBanList.push({ ip, reason, expires })
                    broadcastBanList()
                }
            }
        })
    }

    setInterval(() => {
        const now = Date.now()
        let changed = false

        for (const [id, data] of masterClients.entries()) {
            if (now > data.resetTime) masterClients.delete(id)
        }
        
        for (let i = masterAutoBanList.length - 1; i >= 0; i--) {
            if (now > masterAutoBanList[i].expires) {
                masterAutoBanList.splice(i, 1)
                changed = true
            }
        }

        if (changed) {
            broadcastBanList()
        }
    }, 30 * 1000)

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
    app.use('/assets/*', serveStatic({ root: './src/public' }))
    
    app.get('/favicon.ico', (c) => {
        try {
            const iconPath = path.resolve('src/public/favicon.ico')
            if (fs.existsSync(iconPath)) {
                const icon = fs.readFileSync(iconPath)
                c.header('Content-Type', 'image/x-icon')
                c.header('Cache-Control', 'public, max-age=3600')
                return c.body(icon)
            }
        } catch (e) {}
        return c.notFound()
    })

    setupRoutes(app)

    app.openAPIRegistry.registerComponent('securitySchemes', 'ApiKeyAuth', {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Enter your custom API Key to get higher rate limits.'
    })

    app.get('/docs', (c) => {
        const url = new URL(c.req.url)
        const proto = c.req.header('x-forwarded-proto') || (url.protocol.includes('https') || c.req.header('cf-visitor')?.includes('https') ? 'https' : 'http')
        const host = c.req.header('x-forwarded-host') || c.req.header('host') || url.host
        const origin = `${proto}://${host}`
        const fullSpec = app.getOpenAPIDocument(openApiConfig)
        return c.json({
            ...fullSpec,
            servers: [
                { url: origin, description: 'Current Server' },
                ...(fullSpec.servers || []).filter(s => s.url !== origin)
            ]
        })
    })

    app.get('/', (c) => {
        const { branding, ...config } = scalarConfig
        let html = renderApiReference({
            config: { ...config, spec: { url: '/docs' } },
            pageTitle: `${appConfig.title} - Documentation Portal`
        })

        let faviconDataUri = ''
        try {
            const iconPath = path.resolve('src/public/favicon.ico')
            if (fs.existsSync(iconPath)) {
                const base64 = fs.readFileSync(iconPath).toString('base64')
                faviconDataUri = `data:image/png;base64,${base64}`
            }
        } catch (e) {}

        html = html.replace(/(<html)([^>]*)>/, '$1 lang="en" translate="no"$2>')
        html = html.replace('<head>', '<head><meta name="google" content="notranslate"><meta http-equiv="Content-Language" content="en"><meta name="language" content="English">')
        
        const faviconTags = faviconDataUri 
            ? `<link rel="icon" type="image/png" href="${faviconDataUri}"><link rel="shortcut icon" type="image/png" href="${faviconDataUri}"><link rel="apple-touch-icon" href="${faviconDataUri}">`
            : '<link rel="icon" type="image/x-icon" href="/favicon.ico"><link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/favicon.ico">'
        
        html = html.replace('</head>', `${faviconTags}</head>`)
        html = html.replace('<body>', '<body class="notranslate">')
        html = html.replace('</body>', `${buildBrandingScript()}</body>`)
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        c.header('Pragma', 'no-cache')
        c.header('Expires', '0')
        c.header('Content-Language', 'en')
        return c.html(html)
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
