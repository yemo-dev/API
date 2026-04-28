# MiuuAPI Infrastructure

MiuuAPI is a state-of-the-art API gateway and documentation infrastructure engineered for high-availability web services. Built on a modular Hono architecture with native Node.js clustering, it delivers exceptional performance, real-time monitoring, and a premium developer experience.

---

## Core Capabilities

### High Availability Clustering
Native implementation of the Node.js Cluster module allows for seamless multi-core process management. This ensures maximum CPU utilization, automatic worker recovery, and zero-downtime service availability under high traffic loads.

### Premium Documentation Engine
A highly customized Scalar integration featuring a glassmorphism design system. Includes a theme-aware preloader and hardware-accelerated transitions that automatically adapt to system-level light and dark mode preferences.

### Security and Rate Management
Robust security layer providing mandatory header validation, CORS policy enforcement, and a tiered rate-limiting system. Includes real-time quota tracking (`X-RateLimit-Remaining`) and optimized background monitoring that bypasses quota depletion.

### Real-time Infrastructure Logging
Sophisticated logging engine that captures and categorizes server interactions into `WEB` (portal access) and `ENDPOINT` (API usage). Automatically filters out background monitoring noise and saves clean, readable logs to daily rotated files.

### Global Mobile Optimization
The documentation portal is specifically engineered for mobile performance, featuring native-level responsiveness and multi-layer protection against forced browser auto-translation (specifically for Chrome on Android).

---

## Technical Specifications

| Component | Technology | Role |
| :--- | :--- | :--- |
| Core Framework | Hono | Ultra-fast routing and middleware execution |
| Runtime Environment | Node.js | Asynchronous event-driven execution |
| API Specification | OpenAPI 3.1.0 | Standardized documentation and schema definition |
| Data Validation | Zod | Runtime type-safety and request validation |
| Interface Styling | Vanilla CSS | Custom-built design tokens and animations |

---

## Sponsor Ads System

MiuuAPI includes a built-in, fully configurable Sponsor Ads modal that appears after the loading animation completes. It is powered by **AnimeJS** for premium entrance and exit animations.

All settings are managed in a single file: **`src/configs/ads.js`**

### Enabling & Disabling

Set `enabled` to `true` or `false` to toggle the entire feature without touching any other code.

```javascript
enabled: false // ads are hidden
enabled: true  // ads will show after 'delayMs' milliseconds
```

### Multi-Sponsor Responsive Grid

The system automatically adjusts its layout based on the number of sponsors:
- **1 Sponsor**: Featured full-width card.
- **2-4 Sponsors**: Responsive 2-column grid on desktop, single-column list on mobile.
- **Max Capacity**: Optimized for up to 4 sponsors to maintain premium aesthetics.

### Interactive Animations (AnimeJS)

- **Entrance**: Staggered slide-in and scale animation for cards and logos.
- **Hover Effects**: 
    - Banner: Subtle scale (`1.05`) and opacity transition.
    - Logo: Interactive scale and rotate (`8deg`) effect.
    - Shine: CSS-powered light sweep across the card.

### Asset Configuration

| Field | Description | Format |
| :--- | :--- | :--- |
| `logoUrl` | Square icon, displayed in blue circle | SVG (Recommended), PNG |
| `bannerUrl` | 1200×400 banner | SVG (Recommended), WebP, JPG |
| `targetUrl` | Destination link | HTTPS URL |


### Sponsor Type Categories

The `type` field displays a colored badge on the sponsor card. Recommended values:

| Type | Description |
| :--- | :--- |
| `Hosting Provider` | Web / cloud hosting services |
| `API Provider` | Third-party API services |
| `CDN Provider` | Content delivery network |
| `Developer Tool` | Libraries, tools, IDEs, etc. |
| `Security Partner` | VPN, firewall, DDoS protection |
| `Community Partner` | Discord, forums, communities |
| `Media Partner` | Streaming / media platforms |
| `Custom` | Any other category |

### Image Configuration

Both `logoUrl` and `bannerUrl` support **local paths** (files placed in `src/public/assets/`) and **remote URLs**.

| Field | Local Example | Remote Example | Recommended Size |
| :--- | :--- | :--- | :--- |
| `logoUrl` | `/assets/sponsor-logo.png` | `https://example.com/logo.png` | Min **72×72px**, square (displayed as 36×36 circle) |
| `bannerUrl` | `/assets/sponsor-banner.jpg` | `https://example.com/banner.jpg` | **1200×400px** (3:1 ratio), max rendered height 210px |

> [!TIP]
> For the best visual quality, use **JPEG** or **WebP** for banners and **PNG** for logos.

---

## Deployment Guide

### Prerequisites
Ensure your environment meets the following requirements:
- **Node.js** `v20.0.0` or higher
- **npm** `v10.0.0` or higher

### Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/miuubyte/API.git
cd API
npm install
```

### Execution Profiles

**Standard Execution**
```bash
npm run start
```

**Development Mode** (with Auto-Reload)
```bash
npm run dev
```

---



## API Reference

### Infrastructure Monitoring
System-level diagnostics and real-time health metrics.

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/stats` | `GET` | Detailed hardware metrics (CPU, RAM, Uptime, Network). |
| `/api/auth/check` | `GET` | Real-time token validation, tier status, and remaining quota. |

---

## Integration Example

### Standard API Request
Pass your `x-api-key` in the header or as a query parameter (`?apikey=`) to authenticate.

```bash
curl -X GET "http://localhost:4000/api/stats" \
     -H "x-api-key: your_api_token" \
     -H "Content-Type: application/json"
```

### Standard JSON Response
All responses follow a consistent, predictable JSON schema.

```json
{
  "success": true,
  "key": "your_api_key",
  "type": "Premium",
  "limit": 5000,
  "remaining": 4982,
  "description": "High performance API access",
  "owner": "Miuu Support"
}
```

---

<div align="center">
  <b>Developed by miuubyte</b><br>
  <i>Built with ❤️ for speed, reliability, and developer experience.</i>
</div>
