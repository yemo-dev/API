export const apiKeys = [
    {
        name: 'Administrator',
        key: 'miuu_k7m2n8p4q9s1t',
        limit: 0,
        windowMs: 10 * 60 * 1000
    }
]

export const guestConfig = {
    limit: 100,
    windowMs: 10 * 60 * 1000
}

export const banList = []

export const getApiKeyInfo = (key) => {
    return apiKeys.find(k => k.key === key)
}
