# YeMo - High Performance API

A high-performance codebase for building scalable APIs with Hono and Node.js.
Includes a custom Neo-Brutalist Swagger UI for a premium developer experience.

## Features

- Hono: Ultrafast web framework.
- Neo-Swagger: Custom API documentation portal.
- Zod OpenAPI: Type-safe schema validation and documentation.
- Architecture: Modular and scalable folder structure.

## Available Endpoints

### System Stats

`GET /api/stats`

- **Description:** Get detailed server system information (CPU, RAM, OS, Network).
- **Status:** Check `x-status` in route config.

## Setup

1. Clone Repository

    ```bash
    git clone https://github.com/yemo-dev/API.git
    cd API
    ```

2. Install Dependencies

    ```bash
    npm install
    ```

3. Run Development Server

    ```bash
    npm run dev
    ```

    Access the portal at <http://localhost:3000>.

## Endpoint Configuration

You can customize each endpoint's behavior directly in its route definition.

### 1. Description

Displayed in the Swagger UI to explain what the endpoint does.

```javascript
description: 'Get detailed system stats',
```

### 2. Status Label (x-status)

Controls the endpoint's availability status.

- **ONLINE**: Endpoint works normally.
- **OFFLINE**: Endpoint returns `503 Service Unavailable` automatically.

```javascript
'x-status': 'ONLINE', // or 'OFFLINE'
```

'x-status': 'ONLINE', // or 'OFFLINE'

```

## Security & Protection

### 1. Rate Limiting
- **Limit:** 100 requests per 15 minutes per IP.
- **Exceeded:** Users receive a **Neo-Brutalist 429 Page**.

### 2. IP Whitelist
- **Bypass:** IP addresses in `whitelist` enjoy unlimited requests.
- **Config:** Edit `src/utils/rateLimit.js`.

### 3. IP Ban System
- **Block:** Malicious IPs in `banList` are instantly rejected.
- **Response:** Users receive a scary **Neo-Brutalist 403 Page**.

## How to Add a New Endpoint

Follow this guide to add new API resources. We use src/api/[resource]/routes.js to define routes and handlers.

### 1. Basic Structure

Create src/api/books/routes.js and import necessary modules.

```javascript
import { createRoute, z } from '@hono/zod-openapi'

export const getBooksRoute = createRoute({
    method: 'get',
    path: '/api/books',
    description: 'Get list of books',
    'x-status': 'ONLINE',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        data: z.array(z.string())
                    })
                }
            },
            description: 'Get list of books'
        }
    }
})

export const getBooksHandler = (c) => {
    return c.json({
        status: true,
        data: ['Book 1', 'Book 2']
    })
}
```

### 2. Register Routes

Finally, import and register your new routes in src/index.js using the `register` utility.
**Note:** We use `register` instead of `app.openapi` to automatically enforce the `x-status` (Offline/Online) checks.

```javascript
import { getBooksRoute, getBooksHandler } from './api/books/routes.js'
import { register } from './utils/route.js'

register(app, getBooksRoute, getBooksHandler)
```
