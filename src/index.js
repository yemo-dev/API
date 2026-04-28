import { execSync } from 'node:child_process'
import { platform } from 'node:os'
import { serve } from '@hono/node-server'
import cluster from 'node:cluster'
import os from 'node:os'

import logger from './utils/logger.js'
import { appConfig } from './configs/app.js'
import { banManager } from './utils/banManager.js'
import { app } from './app.js'

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
    
    setInterval(() => {
        banManager.cleanup()
    }, 15 * 1000)
}

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
            } else if (msg.type === 'BAN_IP') {
                const { ip, reason, expires } = msg.data
                const duration = expires - Date.now()
                banManager.banIP(ip, reason, duration)
            }
        })
    }

    setInterval(() => {
        const now = Date.now()
        for (const [id, data] of masterClients.entries()) {
            if (now > data.resetTime) masterClients.delete(id)
        }
    }, 60 * 1000)

    cluster.on('exit', (worker) => {
        logger.warn(`Worker ${worker.process.pid} died. Restarting...`)
        cluster.fork()
    })
} else {
    serve({ fetch: app.fetch, port: appConfig.port }, (info) => {
        logger.ready(`Worker ${process.pid} is running on port ${info.port}`)
    })
}
