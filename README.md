# MiuuAPI Infrastructure

MiuuAPI is a high-performance, production-ready API gateway and documentation portal built on a modular Hono architecture. It features a native Node.js clustering engine, real-time security monitoring, and a premium AnimeJS-powered user interface.

---

## Preview

### Desktop Version
![Desktop Preview](src/public/preview/desktop-preview.png)

### Mobile Version
![Mobile Preview](src/public/preview/mobile-preview.png)

---

## Key Features

### Advanced Security and DDoS Protection
- **Multi-Core Synchronization**: Automated and manual IP bans are synchronized in real-time across all cluster workers using a master-broadcast pattern.
- **Two-Tier Banning System**:
  - **Manual Bans**: Managed via manualBans configuration for permanent IP blocks with custom reasoning.
  - **Auto-Ban (Anti-DDoS)**: Automated temporary blocking (30-minute duration) of IPs that exceed aggressive request thresholds.
- **Real-time Monitoring**: Integrated Rate Limit Widget providing users with instant feedback on their remaining quota.

### Premium UI and UX Design
- **AnimeJS Integration**: Sophisticated entrance and exit animations for all major UI components.
- **Glassmorphism Theme**: A theme-aware documentation portal (Light/Dark mode) built on the Scalar engine with custom glassmorphism effects.
- **Interactive Sponsor Modal**: 
  - **Responsive Grid**: Supports 1 to 4 sponsor cards with automatic layout adjustment.
  - **High-Fidelity Assets**: Full support for local SVG assets and interactive hover animations including logo rotation, banner scaling, and shine effects.
- **Preloader Engine**: Hardware-accelerated SVG preloader with staggered drawing animations.

### Infrastructure and Performance
- **Node.js Clustering**: Native implementation of the cluster module for maximum multi-core CPU utilization and high availability.
- **Fault Tolerance**: Automatic worker recovery and port-cleaning on startup for seamless deployments.
- **Zero-Dependency Favicon**: Infallible logo delivery using Base64 Data URIs, ensuring 100% visibility on all browsers and platforms.
- **Optimized Logging**: Categorization of server interactions with automatic log rotation and monitoring noise filtering.

---

## Configuration Guide

### Security and API Keys (src/configs/apiKeys.js)
Manage your API access policies and global ban lists:
```javascript
export const autoBanConfig = {
    enabled: true,
    threshold: 2000,    // Requests per window
    windowMs: 10 * 60 * 1000, // 10 minutes
    banDuration: 30 * 60 * 1000 // 30 minutes
}
```

### Sponsor Ads (src/configs/ads.js)
Control the featured partnership modal:
- **enabled**: Toggle the entire system.
- **delayMs**: Set the entrance delay after preloader completes.
- **sponsors**: Array of up to 4 partners. Supports local paths (e.g., /assets/discord-logo.svg).

### Mobile Optimization
The portal is strictly optimized for mobile responsiveness:
- **Anti-Translation Layer**: Prevents Chrome and Android from forcibly translating technical content.
- **Touch-Friendly Controls**: Large interactive areas and optimized touch-tap highlights.
- **Compact UI**: Dynamic scaling of font sizes and paddings for small screens.
- **Admin Isolation**: Configuration tools are intentionally hidden on mobile devices to maintain stability and prevent accidental changes.

---

## Portal Configuration (src/configs/scalar.json)

Manage the visual appearance and behavior of your documentation portal. 

> [!TIP]
> **Manual Mode**: If you are hosting on a VPS or Public Domain where the interactive "Configure" button is hidden, you can customize everything by directly editing the `src/configs/scalar.json` file in your project directory.

### 1. Core Layout and Theme
- **`layout`**: Set the navigation style of the portal.
  - Options: `"modern"` (Recommended: Sleek sidebar style), `"classic"` (Traditional top navigation).
- **`theme`**: Choose a high-quality color palette for your portal.
  - Options: `"none"`, `"default"`, `"alternate"`, `"moon"`, `"purple"`, `"solarized"`, `"bluePlanet"`, `"saturn"`, `"kepler"`, `"mars"`, `"deepSpace"`, `"laserwave"`.

### 2. Visual Toggles (true/false)
- **`showSidebar`**: Show or hide the navigation sidebar.
- **`showDeveloperTools`**: Enable the interactive configuration panel (Local only).
- **`showToolbar`**: Display the top search and tools bar.
- **`hideModels`**: Hide the schema models section from the sidebar.
- **`hideSearch`**: Remove the search bar from the UI.
- **`hideDarkModeToggle`**: Disable the theme switcher for users.
- **`persistAuth`**: Keep authentication keys saved after page refresh.
- **`withDefaultFonts`**: Use Scalar's premium typography.

### 3. Branding & Customization
- **`title`**: The name of your API portal displayed in the browser tab and metadata.
- **`customBranding`**:
  - **`footer`**: 
    - `text`: Custom text for the bottom of the portal page.
    - `url`: Link for the footer text.
  - **`clientButton`**:
    - `text`: Text for the header action button (e.g., "Join Discord").
    - `url`: Destination URL for the button.
    - `icon`: Icon type (default is `"discord"`).

---

## Administrative Portal (Local Access Only)

MiuuAPI features a sophisticated, self-service administrative panel that allows for real-time adjustments to the portal's layout, theme, and branding without requiring server restarts.

### Desktop & Local Only Support
> [!IMPORTANT]
> **Admin Configuration tools (Configure & Save) are only visible when accessing via `localhost` or a direct server IP.**
> These tools are automatically hidden on public domains to ensure your infrastructure settings remain secure.

### How to Use
1. **Access**: Open the portal via `localhost:4000` or your server's `IP:Port` on a desktop browser.
2. **Configure**: Click the native **Configure** button provided by the Scalar engine.
3. **Edit**: Adjust the Layout, Theme, or other JSON parameters in the real-time editor.
4. **Save**: Click the professional **SAVE TO SCALAR.JSON** button at the top of the panel.
5. **Global Sync**: Changes are instantly saved to `src/configs/scalar.json` and applied to all users.

---

---

## Deployment

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Application**:
   ```bash
   # Standard Mode
   npm run start
   
   # Cluster Mode (Recommended for Production)
   npm run start -- --cluster
   ```

---

## Tech Stack
- **Framework**: Hono
- **Runtime**: Node.js (v20+)
- **Animation**: AnimeJS
- **Documentation**: Scalar
- **Validation**: Zod

---

## Community and Support
Join our community for updates and professional support:
- **Discord**: https://discord.gg/Gj8CUjCtav
- **GitHub**: https://github.com/miuubyte

*Built by the MiuuAPI Community.*
