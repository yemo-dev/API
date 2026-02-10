# YeMo - High Performance API

A high-performance codebase for building scalable APIs with **Hono** and **Node.js**.
Includes a custom **Neo-Brutalist Swagger UI** for a premium developer experience.

## ✨ Features

- **Hono**: Ultrafast web framework.
- **Neo-Swagger**: Custom API documentation portal.
- **Zod OpenAPI**: Type-safe schema validation and documentation.
- **Architecture**: Modular and scalable folder structure.

## 🚀 Setup

1. **Clone Repository**

    ```bash
    git clone https://github.com/yemo-dev/API.git
    cd API
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Run Development Server**

    ```bash
    npm run dev
    ```

    Access the portal at `http://localhost:3000`.

## Configuration

## 🛠️ How to Add a New Endpoint

Follow this guide to add new API resources. We use `src/api/[resource]/routes.js` to define routes and handlers.

### 1. Basic Structure

Create `src/api/books/routes.js` and import necessary modules.

```javascript
import { createRoute, z } from '@hono/zod-openapi'

export const getBooksRoute = createRoute({
    method: 'get',
    path: '/api/books',
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

### 2. Path Parameters

Use curly braces `{}` in the `path` and define the parameter in `request.params`.

**Example:** `GET /api/books/{id}`

```javascript
export const getBookByIdRoute = createRoute({
    method: 'get',
    path: '/api/books/{id}',
    request: {
        params: z.object({
            id: z.string().openapi({ example: '123' })
        })
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        data: z.string()
                    })
                }
            },
            description: 'Get single book'
        }
    }
})

export const getBookByIdHandler = (c) => {
    const { id } = c.req.valid('param')
    return c.json({
        status: true,
        data: `Book ID: ${id}`
    })
}
```

### 3. Query Parameters

Define optional or required query parameters in `request.query`.

**Example:** `GET /api/books?sort=asc`

```javascript
export const getBooksRoute = createRoute({
    method: 'get',
    path: '/api/books',
    request: {
        query: z.object({
            sort: z.string().optional().openapi({ example: 'asc' }),
            page: z.string().optional().openapi({ example: '1' })
        })
    },
    // ... responses
})

export const getBooksHandler = (c) => {
    const { sort, page } = c.req.valid('query')
    // Logic here
}
```

### 4. Request Body (JSON)

For `POST` or `PUT` requests, define the expected JSON structure in `request.body.content`.

**Example:** `POST /api/books`

```javascript
export const createBookRoute = createRoute({
    method: 'post',
    path: '/api/books',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        title: z.string().openapi({ example: 'New Book' }),
                        author: z.string().openapi({ example: 'John Doe' })
                    })
                }
            }
        }
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.boolean(),
                        message: z.string()
                    })
                }
            },
            description: 'Book created'
        }
    }
})

export const createBookHandler = (c) => {
    const { title, author } = c.req.valid('json')
    return c.json({
        status: true,
        message: `Created ${title} by ${author}`
    }, 201)
}
```

### 5. Register Routes

Finally, import and register your new routes in `src/index.js`.

```javascript
import { getBooksRoute, getBooksHandler } from './api/books/routes.js'

app.openapi(getBooksRoute, getBooksHandler)
```
