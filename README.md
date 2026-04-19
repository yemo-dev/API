# MiuuAPI Infrastructure

MiuuAPI is a high-performance, modular API gateway and server infrastructure built on Node.js and the Hono framework. It provides a robust foundation for building scalable web services with built-in security, documentation, and monitoring.

## Core Features

- **High-Performance Routing**: Optimized for low-latency request handling.
- **Automated Documentation**: Integrated Scalar API Reference with a modern dark theme and secure authorization.
- **Security-First Architecture**: Per-client API key authentication with granular rate limiting and IP-based access control.
- **System Resilience**: Built-in process synchronization and automatic port management for development and production environments.
- **Real-Time Monitoring**: Detailed system statistics and authentication status tracking.

## Technical Architecture

The project follows a clean, modular architecture:
- **configs/**: Centralized application settings and security definitions.
- **middlewares/**: Request processing pipeline including rate limiting, logging, and data formatting.
- **routes/**: Declarative API endpoint definitions using OpenAPI specifications.
- **utils/**: Core system utilities for logging and terminal formatting.

## Installation and Deployment

### Prerequisites
- Node.js (version 20 or higher)
- npm or yarn

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/miuubyte/API.git
   cd API
   npm install
   ```

### Running the Application
To start the server in a development environment with hot-reloading:
```bash
npm run dev
```

To deploy in a production environment:
```bash
npm start
```

## Configuration

### API Key Management
Authentication is managed via `src/configs/apiKeys.js`. You can define custom limits and window durations for individual clients. Setting the limit to `0` enables unlimited access.

Example configuration:
```javascript
export const apiKeys = [
    {
        name: 'Internal Admin',
        key: 'your_secret_key',
        limit: 0,
        windowMs: 600000
    }
]
```

### Rate Limiting
The system implements a sophisticated rate limiter that supports Cloudflare-transparent IP detection and master-worker synchronization in cluster mode.

## API Documentation
The interactive documentation portal is accessible at the root URL of the server. It provides a comprehensive overview of all available endpoints, including request/response schemas and testing tools.

## Development and Contributions
The codebase is maintained with a strict "clean code" policy. All system logic is documented within this README to ensure the source code remains focused and efficient.

## License
This project is licensed under the MIT License. Developed and maintained by the Miuu project team.
