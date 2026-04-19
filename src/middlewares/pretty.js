export const prettyPrint = async (c, next) => {
    await next()
    const contentType = c.res.headers.get('Content-Type')
    if (contentType && contentType.includes('application/json')) {
        const body = await c.res.json()
        c.res = new Response(JSON.stringify(body, null, 2), c.res)
        c.res.headers.set('Content-Type', 'application/json; charset=utf-8')
    }
}
