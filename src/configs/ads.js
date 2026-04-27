/**
 * Sponsor Ads Configuration
 *
 * enabled   — Toggle the entire ads feature on/off (true | false).
 * delayMs   — Delay in milliseconds before the modal appears after page load (default: 3500).
 * title     — Title text shown in the modal header.
 * sponsors  — Array of sponsor objects. Add as many as you need.
 * footerText — Footer message inside the modal.
 *
 * ── Sponsor Object Fields ──
 * name      — Sponsor's display name.
 * type      — Sponsor category label. Recommended values:
 *               'Hosting Provider'    — Web / cloud hosting services
 *               'API Provider'        — Third-party API services
 *               'CDN Provider'        — Content delivery network
 *               'Developer Tool'      — Libraries, tools, IDEs, etc.
 *               'Security Partner'    — VPN, firewall, DDoS protection
 *               'Community Partner'   — Discord, forums, communities
 *               'Media Partner'       — Streaming, media platforms
 *               'Custom'              — Any other category
 *
 * logoUrl   — Sponsor logo. Supports:
 *               Local path  : '/assets/sponsor-logo.png'  (place in src/public/assets/)
 *               Remote URL  : 'https://example.com/logo.png'
 *               Recommended : Square image, minimum 72x72px (displayed as 36x36 circle)
 *
 * bannerUrl — Sponsor banner image. Supports:
 *               Local path  : '/assets/sponsor-banner.jpg' (place in src/public/assets/)
 *               Remote URL  : 'https://example.com/banner.jpg'
 *               Recommended : 1200x400px (3:1 ratio), max-height rendered is 210px
 *
 * targetUrl — URL to open when user clicks the sponsor card.
 * bgColor   — Background color for the card body (hex or CSS color). Default: '#0d1117'
 * textColor — Text color for the card body. Default: '#ffffff'
 */

export const adsConfig = {
    enabled: false,
    delayMs: 3500,
    title: 'Sponsored Ads',
    sponsors: [
        {
            name: '',
            type: 'Hosting Provider',
            logoUrl: '',
            bannerUrl: '',
            targetUrl: '',
            bgColor: '#0d1117',
            textColor: '#ffffff'
        }
    ],
    footerText: 'Support these amazing services ❤'
};
