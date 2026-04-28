import cluster from 'node:cluster'
import { getConnInfo } from '@hono/node-server/conninfo'
import { apiKeys, guestConfig, banList, autoBanConfig } from '../configs/apiKeys.js'

const clients = new Map()
const ipMonitor = new Map()

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

export const rateLimiter = () => {
    return async (c, next) => {
        const headers = c.req.header()
        let ip = headers['cf-connecting-ip'] || 
                 headers['x-forwarded-for']?.split(',')[0] || 
                 headers['x-real-ip']
                 
        if (!ip) {
            try {
                const info = getConnInfo(c)
                ip = info.remote.address
            } catch (e) {
                ip = '127.0.0.1'
            }
        }

        if (ip === '::1') ip = '127.0.0.1'
        if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '')

        const now = Date.now()

        const existingBanIndex = banList.findIndex(b => b === ip || b.ip === ip)
        if (existingBanIndex !== -1) {
            const ban = banList[existingBanIndex]
            if (typeof ban === 'object' && ban.expires && now > ban.expires) {
                banList.splice(existingBanIndex, 1)
            } else {
                return c.json({
                    success: false,
                    status: 403,
                    error: 'Forbidden',
                    message: ban.reason || 'Akses ditolak.'
                }, 403)
            }
        }

        if (autoBanConfig.enabled && !c.req.path.includes('/docs')) {
            let monitor = ipMonitor.get(ip)
            if (!monitor || now > monitor.resetTime) {
                ipMonitor.set(ip, { count: 1, resetTime: now + autoBanConfig.windowMs })
            } else {
                monitor.count++
                if (monitor.count > autoBanConfig.threshold) {
                    banList.push({ 
                        ip, 
                        reason: 'Auto-ban: DDoS Protection', 
                        expires: now + autoBanConfig.banDuration 
                    })
                    return c.json({
                        success: false,
                        status: 403,
                        error: 'Forbidden',
                        message: 'IP anda diblokir otomatis selama 5 menit karena aktivitas mencurigakan.'
                    }, 403)
                }
            }
        }

        const apiKey = headers['x-api-key'] || c.req.query('apikey') || c.req.query('apiKey');
        const keyData = apiKeys.find(k => k.key === apiKey)

        let id = apiKey && keyData ? `key:${apiKey}` : `ip:${ip}`
        const config = keyData ? { max: keyData.limit, windowMs: keyData.windowMs } : { max: guestConfig.limit, windowMs: guestConfig.windowMs }

        if (c.req.path === '/' || c.req.path === '/docs') return await next()
        if (!c.req.path.startsWith('/api/')) return await next()

        if (config.max === 0) {
            c.header('X-RateLimit-Limit', 'UNLIMITED')
            c.header('X-RateLimit-Remaining', 'UNLIMITED')
            return await next()
        }

        let clientData

        if (cluster.isWorker) {
            clientData = await syncRateLimit({ id, method: c.req.method, windowMs: config.windowMs })
        } else {
            if (!clients.has(id)) {
                clients.set(id, { count: c.req.method === 'HEAD' ? 0 : 1, resetTime: now + config.windowMs })
            } else {
                const client = clients.get(id)
                if (now > client.resetTime) {
                    clients.set(id, { count: c.req.method === 'HEAD' ? 0 : 1, resetTime: now + config.windowMs })
                } else {
                    if (c.req.method !== 'HEAD') client.count++
                }
            }
            clientData = clients.get(id)
        }

        const remaining = Math.max(0, config.max - clientData.count)
        const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000)

        c.header('X-RateLimit-Limit', config.max.toString())
        c.header('X-RateLimit-Remaining', remaining.toString())
        c.header('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000).toString())

        if (clientData.count > config.max) {
            c.header('Retry-After', resetSeconds.toString())
            return c.json({
                success: false,
                status: 429,
                error: 'Too Many Requests',
                message: `Limit tercapai. Coba lagi dalam ${resetSeconds} detik.`,
                retryAfter: resetSeconds
            }, 429)
        }

        await next()
    }
}

export const getClientData = async (id, windowMs) => {
    if (cluster.isWorker) {
        return await syncRateLimit({ id, method: 'HEAD', windowMs })
    }
    return clients.get(id) || { count: 0, resetTime: Date.now() + windowMs }
}
