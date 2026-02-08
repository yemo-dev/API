const clients = new Map()

const config = {
    windowMs: 15 * 60 * 1000,
    max: 100
}

export const rateLimiter = () => {
    return async (c, next) => {
        const ip = c.req.header('x-forwarded-for') || '127.0.0.1'
        const now = Date.now()

        if (!clients.has(ip)) {
            clients.set(ip, { count: 1, resetTime: now + config.windowMs })
        } else {
            const client = clients.get(ip)
            if (now > client.resetTime) {
                clients.set(ip, { count: 1, resetTime: now + config.windowMs })
            } else {
                client.count++

                c.res.headers.set('X-RateLimit-Limit', config.max.toString())
                c.res.headers.set('X-RateLimit-Remaining', Math.max(0, config.max - client.count).toString())
                c.res.headers.set('X-RateLimit-Reset', Math.ceil(client.resetTime / 1000).toString())

                if (client.count > config.max) {
                    return c.json({ error: 'Too many requests, please try again later.' }, 429)
                }
            }
        }
        await next()
    }
}
