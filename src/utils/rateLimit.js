import cluster from 'node:cluster'

const clients = new Map()

const config = {
    windowMs: 10 * 60 * 1000,
    max: 100,
    whitelist: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
    banList: ['']
}

const syncRateLimit = (data) => {
    return new Promise((resolve) => {
        const handler = (msg) => {
            if (msg.type === 'RATE_LIMIT_SYNC_RES' && msg.data.ip === data.ip) {
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
        let ip = c.req.header('x-forwarded-for')?.split(',')[0] ||
            c.req.header('x-real-ip') ||
            c.env?.incoming?.socket?.remoteAddress ||
            '127.0.0.1'

        /* Normalize localhost */
        if (ip === '::1') ip = '127.0.0.1'
        if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '')

        if (config.banList.includes(ip)) {
            if (c.req.path.startsWith('/api/') || c.req.header('accept')?.includes('json')) {
                return c.json({
                    success: false,
                    status: 403,
                    error: 'Forbidden',
                    message: 'Your IP has been banned from accessing this API.'
                }, 403)
            }

            try {
                const html = await readFile('./page/status/403.html', 'utf8')
                return c.html(html, 403)
            } catch (e) {
                return c.text('403 Forbidden', 403)
            }
        }

        if (config.whitelist.includes(ip)) {
            c.header('X-RateLimit-Limit', 'UNLIMITED')
            c.header('X-RateLimit-Remaining', 'UNLIMITED')
            await next()
            return
        }

        /* Skip counter for non-api routes */
        if (!c.req.path.startsWith('/api/')) {
            await next()
            return
        }

        const now = Date.now()
        let clientData

        if (cluster.isWorker) {
            clientData = await syncRateLimit({
                ip,
                method: c.req.method,
                windowMs: config.windowMs
            })
        } else {
            if (!clients.has(ip)) {
                /* status detection */
                clients.set(ip, { count: c.req.method === 'HEAD' ? 0 : 1, resetTime: now + config.windowMs })
            } else {
                const client = clients.get(ip)
                if (now > client.resetTime) {
                    clients.set(ip, { count: c.req.method === 'HEAD' ? 0 : 1, resetTime: now + config.windowMs })
                } else {
                    if (c.req.method !== 'HEAD') {
                        client.count++
                    }
                }
            }
            clientData = clients.get(ip)
        }

        if (clientData.count > config.max) {
            const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
            c.header('X-RateLimit-Limit', config.max.toString())
            c.header('X-RateLimit-Remaining', '0')
            c.header('Retry-After', retryAfter.toString());

            const formatTime = (s) => {
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const sec = s % 60;
                const parts = [];
                if (h > 0) parts.push(`${h} hours`);
                if (m > 0) parts.push(`${m} minutes`);
                if (sec > 0 || parts.length === 0) parts.push(`${sec} seconds`);
                return parts.join(', ');
            };

            const timeStr = formatTime(retryAfter);

            if (c.req.path.startsWith('/api/') || c.req.header('accept')?.includes('json')) {
                return c.json({
                    success: false,
                    status: 429,
                    error: 'Too Many Requests',
                    message: `Rate limit exceeded. Please try again in ${timeStr}.`,
                    retryAfter
                }, 429);
            }

            return c.text(`Too Many Requests. Retry after ${timeStr}.`, 429);
        }

        if (clientData) {
            c.header('X-RateLimit-Limit', config.max.toString())
            c.header('X-RateLimit-Remaining', Math.max(0, config.max - clientData.count).toString())
        }

        await next()
    }
}
