# YeMo - High Performance API

A high-performance codebase for building scalable APIs with Hono and Node.js.
Includes a custom Neo-Brutalist Swagger UI for a premium developer experience.

## Features

- Hono: Ultrafast web framework.
- Neo-Swagger: Custom API documentation portal.
- Zod OpenAPI: Type-safe schema validation and documentation.
- Architecture: Modular and scalable folder structure.

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
    'x-status': 'ONLINE', // Use ONLINE or OFFLINE
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

Finally, import and register your new routes in src/index.js.

```javascript
import { getBooksRoute, getBooksHandler } from './api/books/routes.js'

app.openapi(getBooksRoute, getBooksHandler)
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
