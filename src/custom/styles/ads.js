export const adsCSS = `
  /* ── Sponsor Ads Modal ── */

  /* Overlay / Backdrop */
  .sponsor-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }

  /* Modal Container */
  .sponsor-modal {
    width: 90%;
    max-width: 620px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.6);
    font-family: var(--scalar-font);
    opacity: 0;
    transform: scale(0.85) translateY(40px);
  }

  /* Header */
  .sponsor-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid var(--scalar-border-color);
    flex-shrink: 0;
  }
  .sponsor-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--scalar-color-1);
    margin: 0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Close Button */
  .sponsor-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 6px;
    border-radius: 8px;
    border: 1px solid var(--scalar-border-color);
    background: var(--scalar-background-2);
    color: var(--scalar-color-3);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
  }
  .sponsor-close-btn:hover {
    background: var(--scalar-background-3, #333);
    color: var(--scalar-color-1);
    transform: scale(1.1);
  }

  /* Scrollable Body */
  .sponsor-modal-body {
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
  }

  /* Sponsor Card */
  .sponsor-card {
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid var(--scalar-border-color);
    opacity: 0;
    transform: translateY(24px);
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .sponsor-card:hover {
    box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.35);
    border-color: var(--scalar-color-accent);
  }
  .sponsor-card:hover .sponsor-banner-image {
    transform: scale(1.02);
  }

  /* Card Header (Logo + Info) */
  .sponsor-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    background: var(--scalar-background-2);
    border-bottom: 1px solid var(--scalar-border-color);
  }
  .sponsor-logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--scalar-border-color);
    flex-shrink: 0;
  }
  .sponsor-logo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .sponsor-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sponsor-name {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    color: var(--scalar-color-1);
  }
  .sponsor-type {
    display: inline-block;
    font-size: 9px;
    font-weight: 800;
    color: var(--scalar-color-accent);
    border: 1px solid var(--scalar-color-accent);
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    background: color-mix(in srgb, var(--scalar-color-accent) 8%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--scalar-color-accent) 25%, transparent);
    position: relative;
    overflow: hidden;
  }
  .sponsor-type::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: sponsor-shimmer 3s infinite;
  }
  @keyframes sponsor-shimmer {
    0% { left: -100%; }
    20%, 100% { left: 100%; }
  }

  /* Card Body (Banner Image) */
  .sponsor-card-body {
    padding: 0;
    overflow: hidden;
  }
  .sponsor-banner-image {
    width: 100%;
    display: block;
    object-fit: cover;
    /* Banner recommended: 1200x400px or 3:1 ratio */
    max-height: 210px;
    transition: transform 0.4s ease;
  }

  /* Footer */
  .sponsor-modal-footer {
    padding: 13px 22px;
    text-align: center;
    border-top: 1px solid var(--scalar-border-color);
    background: var(--scalar-background-2);
    flex-shrink: 0;
  }
  .sponsor-support-text {
    font-size: 12px;
    color: var(--scalar-color-3);
    margin: 0;
    letter-spacing: 0.01em;
  }
`;
