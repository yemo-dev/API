import { createRoute, z } from '@hono/zod-openapi'
import fileLogger from '../../utils/fileLogger.js'
import { ErrorSchema, UnauthorizedSchema, ForbiddenSchema } from '../../configs/app.js'
import { apiKeys } from '../../configs/apiKeys.js'

const LogsListSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    logs: z.array(z.string()).openapi({ example: ['2026-04-27.log', '2026-04-26.log'] })
})

const LogContentSchema = z.object({
    success: z.boolean().openapi({ example: true }),
    filename: z.string().openapi({ example: '2026-04-27.log' }),
    content: z.string().openapi({ example: '[2026-04-27T10:00:00Z] [INFO] GET 200 /api/stats ...' })
})

const checkAuth = (c) => {
    const apiKey = c.req.header('x-api-key') || c.req.query('apikey') || c.req.query('apiKey')
    if (!apiKey) return false
    const keyInfo = apiKeys.find(k => k.key === apiKey)
    return keyInfo && keyInfo.type === 'Premium' // Only Premium keys can see logs
}

export const listLogsRoute = createRoute({
    method: 'get',
    path: '/api/logs',
    tags: ['admin'],
    summary: 'List log files',
    description: 'Get a list of all available log files. Requires Premium API Key.',
    security: [{ ApiKeyAuth: [] }],
    responses: {
        200: { content: { 'application/json': { schema: LogsListSchema } }, description: 'Logs list' },
        401: { content: { 'application/json': { schema: UnauthorizedSchema } }, description: 'Unauthorized' },
        403: { content: { 'application/json': { schema: ForbiddenSchema } }, description: 'Forbidden' }
    }
})

export const getLogRoute = createRoute({
    method: 'get',
    path: '/api/logs/{filename}',
    tags: ['admin'],
    summary: 'Get log content',
    description: 'Get the content of a specific log file. Requires Premium API Key.',
    security: [{ ApiKeyAuth: [] }],
    request: {
        params: z.object({
            filename: z.string().openapi({ example: '2026-04-27.log' })
        })
    },
    responses: {
        200: { content: { 'application/json': { schema: LogContentSchema } }, description: 'Log content' },
        401: { content: { 'application/json': { schema: UnauthorizedSchema } }, description: 'Unauthorized' },
        403: { content: { 'application/json': { schema: ForbiddenSchema } }, description: 'Forbidden' },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Not Found' }
    }
})

export const deleteLogRoute = createRoute({
    method: 'delete',
    path: '/api/logs/{filename}',
    tags: ['admin'],
    summary: 'Delete log file',
    description: 'Delete a specific log file. Requires Premium API Key.',
    security: [{ ApiKeyAuth: [] }],
    request: {
        params: z.object({
            filename: z.string().openapi({ example: '2026-04-27.log' })
        })
    },
    responses: {
        200: { content: { 'application/json': { schema: z.object({ success: z.boolean() }) } }, description: 'Deleted' },
        401: { content: { 'application/json': { schema: UnauthorizedSchema } }, description: 'Unauthorized' },
        403: { content: { 'application/json': { schema: ForbiddenSchema } }, description: 'Forbidden' }
    }
})

export const listLogsHandler = (c) => {
    if (!checkAuth(c)) return c.json({ success: false, status: 401, error: 'Unauthorized', message: 'Admin access required' }, 401)
    return c.json({ success: true, logs: fileLogger.listLogs() }, 200)
}

export const getLogHandler = (c) => {
    if (!checkAuth(c)) return c.json({ success: false, status: 401, error: 'Unauthorized', message: 'Admin access required' }, 401)
    const { filename } = c.req.valid('param')
    const content = fileLogger.readLog(filename)
    if (content === null) return c.json({ success: false, status: 404, error: 'Not Found', message: 'Log file not found' }, 404)
    return c.json({ success: true, filename, content }, 200)
}

export const deleteLogHandler = (c) => {
    if (!checkAuth(c)) return c.json({ success: false, status: 401, error: 'Unauthorized', message: 'Admin access required' }, 401)
    const { filename } = c.req.valid('param')
    const deleted = fileLogger.deleteLog(filename)
    return c.json({ success: deleted }, deleted ? 200 : 404)
}
