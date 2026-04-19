<div align="center">
  <h1>MiuuAPI Infrastructure</h1>
  <p>A high-performance, modular API gateway and server infrastructure built for modern web services.</p>

  <p><strong>Core Technology Stack:</strong></p>
  <img src="https://skillicons.dev/icons?i=js,nodejs,hono,zod,npm,git,github,vscode,windows&theme=dark" />
</div>

<hr />

## Overview

MiuuAPI is engineered for scalability and security. Leveraging the Hono framework and Node.js runtime, it provides a robust foundation with integrated OpenAPI documentation, multi-core processing, and advanced security layers.

## Technical Specifications

| Feature | Description |
| :--- | :--- |
| **Framework** | Hono (Ultra-fast web framework for Node.js) |
| **Documentation** | Scalar API Reference (OpenAPI 3.1.0) |
| **Validation** | Zod (Schema-first validation and documentation) |
| **Runtime** | Node.js (Standardized for high-concurrency environments) |
| **Authentication** | API Key Security with granular permission levels |

## Core Components

### Security and Rate Limiting
The system implements a multi-layered security strategy:
- **Per-Key Rate Limiting**: Customizable request thresholds per API Key.
- **Dynamic Identification**: Accurate client identification using Cloudflare-transparent IP detection.
- **Cluster Synchronization**: Seamless rate limit tracking across multiple CPU cores via Master-Worker IPC.
- **IP Access Control**: Integrated blacklist support for immediate IP-based blocking.

### Documentation Portal
An interactive API reference is served at the root URL, featuring:
- **Dark Mode Architecture**: Optimized for developer accessibility.
- **Integrated Auth Testing**: Direct API Key authorization and request testing.
- **Conditional Visibility**: Intelligent UI protection that masks sensitive features on public domains while remaining fully accessible on localhost.

## Development Guide

### Adding a New Endpoint

To maintain the OpenAPI documentation and schema validation, follow this professional pattern:

#### 1. Define the Route and Handler
Create a new directory and file in `src/routes/your-feature/index.js`:

```javascript
import { createRoute, z } from '@hono/zod-openapi'

// Define the schema and route metadata
export const exampleRoute = createRoute({
    method: 'get',
    path: '/api/example',
    tags: ['example'],
    description: 'Detailed description of the endpoint',
    security: [{ ApiKeyAuth: [] }],
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean(),
                        message: z.string()
                    })
                }
            },
            description: 'Success response'
        }
    }
})

// Implement the business logic
export const exampleHandler = (c) => {
    return c.json({
        success: true,
        message: 'Endpoint is working correctly'
    }, 200)
}
```

#### 2. Register the Route
Update `src/routes/index.js` to register your new route:

```javascript
import { exampleRoute, exampleHandler } from './example/index.js'

export const setupRoutes = (app) => {
    app.openapi(exampleRoute, exampleHandler)
}
```

## Getting Started

### Prerequisites
Ensure Node.js 20 or higher is installed in your environment.

### Setup Instructions
```bash
# Clone the repository
git clone https://github.com/miuubyte/API.git

# Navigate to project directory
cd API

# Install dependencies
npm install
```

### Execution
For local development with hot-reloading:
```bash
npm run dev
```

For production deployment:
```bash
npm start
```

## Configuration Interface

### Global Application Settings
Primary configurations are centralized in `src/configs/app.js`, including port definitions and documentation metadata.

### API Key Definitions
Manage authentication keys in `src/configs/apiKeys.js`. 
- Set `limit: 0` for unlimited throughput.
- Configure `windowMs` to define the duration of the rate limit cycle.

## Project Structure
- `configs/`: Centralized settings and security definitions.
- `middlewares/`: Request processing pipeline (logging, rate limiting, formatting).
- `routes/`: Declarative API endpoint definitions.
- `utils/`: Core system utilities for terminal logging and formatting.
