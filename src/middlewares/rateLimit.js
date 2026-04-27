import cluster from 'node:cluster'
import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { apiKeys, guestConfig, autoBanConfig, banList } from '../configs/apiKeys.js'

const clients = new Map()
const autoBanCounters = new Map()

const LOG_DIR = join(process.cwd(), 'logs')

async function writeLog(entry) {
    try {
        await mkdir(LOG_DIR, { recursive: true })
        const date = new Date().toISOString().slice(0, 10)
        const file = join(LOG_DIR, `${date}.log`)
        const line = JSON.stringify(entry) + '\n'
        await appendFile(file, line, 'utf8')
    } catch (_) {}
}

const syncRateLimit = (data) => {
    return new Promise((resolve) => {
        const handler = (msg) => {
            if (msg.type === 'RATE_LIMIT_SYNC_RES' && msg.data.id === data.id) {
                process.off('message', handler)
                resolve(msg.data)
            }
        }
        process.on('message', handler)
        process.send({ type: 'RATE_LIMIT_SYNC', data })
    })
}

function getCounter(store, id, windowMs, isHead = false) {
    const now = Date.now()
    if (!store.has(id)) {
        store.set(id, { count: isHead ? 0 : 1, resetTime: now + windowMs })
    } else {
        const entry = store.get(id)
        if (now > entry.resetTime) {
            store.set(id, { count: isHead ? 0 : 1, resetTime: now + windowMs })
        } else if (!isHead) {
            entry.count++
        }
    }
    return store.get(id)
}

export const rateLimiter = () => {
    return async (c, next) => {
        const headers = c.req.header()
        const path    = c.req.path
        const method  = c.req.method

        if (path === '/' || path === '/docs') return await next()
        if (!path.startsWith('/api/')) return await next()

        let ip = headers['cf-connecting-ip'] ||
                 headers['x-forwarded-for']?.split(',')[0] ||
                 headers['x-real-ip'] ||
                 c.env?.incoming?.socket?.remoteAddress ||
                 '127.0.0.1'
        if (ip === '::1') ip = '127.0.0.1'
        if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '')

        const now = Date.now()

        if (autoBanConfig.enabled) {
            const banEntry = getCounter(autoBanCounters, ip, autoBanConfig.windowMs, method === 'HEAD')
            if (banEntry.count > autoBanConfig.threshold) {
                const alreadyBanned = banList.some(b => b === ip || b.ip === ip)
                if (!alreadyBanned) {
                    banList.push({ ip, reason: autoBanConfig.reason })
                }
            }
        }

        if (banList.some(b => b === ip || b.ip === ip)) {
            const banInfo = banList.find(b => (typeof b === 'object' ? b.ip === ip : b === ip))
            await writeLog({ ts: new Date().toISOString(), ip, path, method, status: 403, reason: 'banned' })
            return c.json({
                success: false,
                status: 403,
                error: 'Forbidden',
                message: banInfo?.reason
                    ? `Your IP has been banned. Reason: ${banInfo.reason}`
                    : 'Your IP has been banned from accessing this API.'
            }, 403)
        }

        const apiKey  = headers['x-api-key'] || c.req.query('apikey') || c.req.query('apiKey')
        const keyData = apiKeys.find(k => k.key === apiKey)

        if (keyData?.expiresAt) {
            if (new Date(keyData.expiresAt) < new Date()) {
                return c.json({
                    success: false,
                    status: 401,
                    error: 'Unauthorized',
                    message: 'Your API key has expired. Please contact support for renewal.'
                }, 401)
            }
        }

        if (keyData?.scopes && keyData.scopes.length > 0) {
            const allowed = keyData.scopes.some(scope => path.startsWith(scope))
            if (!allowed) {
                return c.json({
                    success: false,
                    status: 403,
                    error: 'Forbidden',
                    message: `Your API key does not have permission to access ${path}. Allowed scopes: ${keyData.scopes.join(', ')}`
                }, 403)
            }
        }

        let config
        if (keyData) {
            const endpointKey = Object.keys(keyData.endpointLimits || {})
                .find(prefix => path.startsWith(prefix))
            if (endpointKey) {
                config = keyData.endpointLimits[endpointKey]
            } else {
                config = { limit: keyData.limit, windowMs: keyData.windowMs }
            }
        } else {
            config = { limit: guestConfig.limit, windowMs: guestConfig.windowMs }
        }

        const id = keyData ? `key:${apiKey}:${path}` : `ip:${ip}:${path}`

        if (config.limit === 0) {
            c.header('X-RateLimit-Limit', 'UNLIMITED')
            c.header('X-RateLimit-Remaining', 'UNLIMITED')
            await next()
            await writeLog({ ts: new Date().toISOString(), ip, key: apiKey || null, path, method, status: c.res.status })
            return
        }

        let clientData
        if (cluster.isWorker) {
            clientData = await syncRateLimit({ id, method, windowMs: config.windowMs })
        } else {
            clientData = getCounter(clients, id, config.windowMs, method === 'HEAD')
        }

        const remaining    = Math.max(0, config.limit - clientData.count)
        const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000)

        c.header('X-RateLimit-Limit', config.limit.toString())
        c.header('X-RateLimit-Remaining', remaining.toString())
        c.header('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000).toString())

        if (clientData.count > config.limit) {
            c.header('Retry-After', resetSeconds.toString())
            await writeLog({ ts: new Date().toISOString(), ip, key: apiKey || null, path, method, status: 429 })
            return c.json({
                success: false,
                status: 429,
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
                retryAfter: resetSeconds
            }, 429)
        }

        await next()
        await writeLog({ ts: new Date().toISOString(), ip, key: apiKey || null, path, method, status: c.res.status })
    }
}

export const getClientData = async (id, windowMs) => {
    if (cluster.isWorker) {
        return await syncRateLimit({ id, method: 'HEAD', windowMs })
    }
    return clients.get(id) || { count: 0, resetTime: Date.now() + windowMs }
}
