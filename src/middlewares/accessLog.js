import logger from '../utils/logger.js'
import fileLogger from '../utils/fileLogger.js'
import Color from '../utils/color.js'

export const logApiRequest = async (c, next) => {
    const start = performance.now()
    const apiKey = c.req.header('x-api-key') || c.req.query('apikey') || c.req.query('apiKey') || 'Guest'
    
    // IP detection
    const headers = c.req.header()
    let ip = headers['cf-connecting-ip'] || 
             headers['x-forwarded-for']?.split(',')[0] || 
             headers['x-real-ip']
    
    await next()
    const end = performance.now()
    const duration = (end - start).toFixed(2)

    const status = c.res.status
    const statusColor = status >= 400 ? Color.red : Color.green
    const method = c.req.method
    const path = c.req.path

    // Console Log
    logger.info(
        `${Color.bold(method)} ${statusColor(status)} ${Color.gray(path)} ${Color.dim(duration + 'ms')} ${Color.dim('[' + apiKey + ']')}`
    )

    // File Log
    fileLogger.write('info', `${method} ${status} ${path}`, {
        ip: ip || 'unknown',
        apiKey,
        duration: duration + 'ms'
    })
}
