# ⚡ YEMO API

> **High-Performance. Scalable. Neo-Brutalist.**
> *Built with Hono, Node.js, and a focus on Developer Experience.*

---

## 🚀 CORE FEATURES

| Feature | Description |
| :--- | :--- |
| **🏎️ Ultrafast** | Powered by `Hono` + `Node.js` for low latency. |
| **🎨 Neo-Swagger** | Custom-designed API Portal (Not your boring swagger). |
| **🛡️ Fortified** | Built-in Rate Limiting, IP Whitelist & Ban System. |
| **✅ Type-Safe** | Full validation using `Zod` & `OpenAPI`. |
| **📂 Modular** | Clean architecture for easy scalability. |

---

## 🛠️ QUICK START

### 1. Clone & Install

```bash
git clone https://github.com/yemo-dev/API.git
cd API
npm install
```

### 2. Run Server

```bash
npm run dev
```

> Access Portal: **<http://localhost:3000>**

---

## 🔌 API ENDPOINTS

| Method | Endpoint | Description | Status Config |
| :--- | :--- | :--- | :--- |
| `GET` | **/api/stats** | System CPU, RAM, Network info. | `x-status` |

> *Check endpoint status availability in their respective route files.*

---

## 🛡️ SECURITY SYSTEM

We take security seriously. This API includes a robust protection layer within `src/utils/rateLimit.js`.

| System | Default Config | Effect on Breach |
| :--- | :--- | :--- |
| **🚦 Rate Limiter** | `100 req` / `15 min` | **429** Neo-Brutalist Page |
| **✅ IP Whitelist** | Unlimited Access | Bypasses all limits |
| **⛔ IP Ban List** | Permanent Block | **403** Access Denied Page |

> **🎨 UI Note:** Error pages are located in `public/errors/` and feature a custom premium design.

---

## 💻 DEVELOPER GUIDE

### Adding a New Endpoint

 We use a specific pattern to ensure **Offline/Online** status checks work automatically.

**1. Create Route File**
`src/api/example/routes.js`

```javascript
import { createRoute, z } from '@hono/zod-openapi'

export const myRoute = createRoute({
    method: 'get',
    path: '/api/example',
    description: 'My cool endpoint',
    'x-status': 'ONLINE', // Config Status Here
    responses: { ... }
})

export const myHandler = (c) => c.json({ hello: 'world' })
```

**2. Register in `index.js`**
> ⚠️ **IMPORTANT:** Use the `register` utility, NOT `app.openapi`.

```javascript
import { myRoute, myHandler } from './api/example/routes.js'
import { register } from './utils/route.js'

// ✅ Correct Way
register(app, myRoute, myHandler)
```

---

## 📂 PROJECT STRUCTURE

```
API/
├── public/
│   └── errors/       # Custom 403, 404, 429, 500 Pages
├── src/
│   ├── api/          # Route Logic (Folder per endpoint)
│   ├── utils/        # Security & Helpers (RateLimit, Logger)
│   └── index.js      # Main Entry Point
└── package.json
```

---

<p align="center">
  <b>Built by YeMo Dev</b>
</p>
