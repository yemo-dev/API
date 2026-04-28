/**
 * Configuration for the Sponsor Ads Modal
 * This file defines the behavior and content of the sponsorship system.
 */
export const adsConfig = {
    /**
     * Set to true to enable the sponsor modal on the dashboard
     */
    enabled: true,

    /**
     * Delay before the modal appears (in milliseconds)
     */
    delayMs: 3500,

    /**
     * The title displayed at the top of the modal
     */
    title: 'Sponsored Partners',

    /**
     * List of sponsors to be displayed
     * - name: Name of the sponsor
     * - type: Label (e.g., Core Developer, Premium Sponsor)
     * - logoUrl: URL to the sponsor's logo (1:1 ratio recommended)
     * - bannerUrl: URL to the sponsor's banner image (3:1 ratio recommended)
     * - targetUrl: URL to open when the card is clicked
     * - bgColor: Optional background color for the card
     * - textColor: Optional text color for the card
     */
    sponsors: [
        {
            name: 'miuubyte',
            type: 'Core Developer',
            logoUrl: '/favicon.png',
            bannerUrl: '/assets/banner.jpg',
            targetUrl: 'https://github.com/miuubyte',
            bgColor: '#000000',
            textColor: '#ffffff'
        },
        {
            name: 'MiuuAPI Community',
            type: 'Official Sponsor',
            logoUrl: '/favicon.png',
            bannerUrl: '/assets/banner.jpg',
            targetUrl: 'https://github.com/miuubyte/API',
            bgColor: '#000000',
            textColor: '#ffffff'
        }
    ],

    /**
     * Text displayed at the bottom of the modal
     */
    footerText: 'Support our amazing infrastructure partners ❤'
};
