import { statsRoute, statsHandler } from './stats/index.js'
import { keyStatusRoute, keyStatusHandler } from './auth/index.js'
import { listLogsRoute, listLogsHandler, getLogRoute, getLogHandler, deleteLogRoute, deleteLogHandler } from './logs/index.js'

export const setupRoutes = (app) => {
    app.openapi(statsRoute, statsHandler)
    app.openapi(keyStatusRoute, keyStatusHandler)
    app.openapi(listLogsRoute, listLogsHandler)
    app.openapi(getLogRoute, getLogHandler)
    app.openapi(deleteLogRoute, deleteLogHandler)
}
