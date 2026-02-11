// --------- API ROUTES ---------
import { statsRoute, statsHandler } from './stats/routes.js'

// --------- UTILS ---------
import { register } from '../utils/route.js'

export const setupRoutes = (app) => {
    // REGISTER ALL API ENDPOINTS HERE
    register(app, statsRoute, statsHandler)
}
