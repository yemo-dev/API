import logger from './logger.js'
import Color from './color.js'

export const logApiRequest = async (c, next) => {
    const start = performance.now()
    await next()
    const end = performance.now()
    const duration = (end - start).toFixed(2)

    const status = c.res.status
    const statusColor = status >= 400 ? Color.red : Color.green
    const method = c.req.method
    const path = c.req.path

    logger.info(
        `${Color.bold(method)} ${statusColor(status)} ${Color.gray(path)} ${Color.dim(duration + 'ms')}`
    )
}
