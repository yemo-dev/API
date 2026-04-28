export const apiKeys = [
    {
        name: 'Administrator',
        key: 'a8d9f1c2b3e4a5c6',
        limit: 0,
        windowMs: 10 * 60 * 1000
    },
    {
        name: 'demo',
        key: 'raol',
        limit: 200,
        windowMs: 10 * 60 * 1000
    }
]

export const guestConfig = {
    limit: 100,
    windowMs: 10 * 60 * 1000
}

export const autoBanConfig = {
    enabled: true,
    threshold: 2000,
    windowMs: 10 * 60 * 1000,
    banDuration: 30 * 60 * 1000
}
