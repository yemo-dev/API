export const adsCSS = `
  .sponsor-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: color-mix(in srgb, var(--scalar-background-1) 85%, transparent);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    padding: 12px;
    transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .sponsor-modal {
    width: 100%;
    max-width: 440px;
    max-height: 80vh;
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.3);
    font-family: var(--scalar-font);
    opacity: 0;
    transform: scale(0.95) translateY(40px);
    display: flex;
    flex-direction: column;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sponsor-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--scalar-background-2);
    border-bottom: 1px solid var(--scalar-border-color);
    flex-shrink: 0;
  }

  .sponsor-modal-title {
    font-size: 9px;
    font-weight: 800;
    color: var(--scalar-color-1);
    margin: 0;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
  }

  .sponsor-close-btn {
    background: transparent;
    border: 1px solid var(--scalar-border-color);
    color: var(--scalar-color-3);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .sponsor-close-btn:hover {
    background: var(--scalar-background-3);
    color: var(--scalar-color-1);
    transform: rotate(90deg);
  }

  .sponsor-modal-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: var(--scalar-border-color) transparent;
  }

  .sponsor-card {
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
  }

  .sponsor-card:hover {
    border-color: #5865F2;
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(88, 101, 242, 0.15);
  }

  .sponsor-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--scalar-border-color);
    background: linear-gradient(135deg, var(--scalar-background-2) 0%, var(--scalar-background-1) 100%);
  }

  .sponsor-logo {
    width: 32px;
    height: 32px;
    background: #5865F2;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(88, 101, 242, 0.2);
    flex-shrink: 0;
  }

  .sponsor-logo img {
    width: 75%;
    height: 75%;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .sponsor-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sponsor-name {
    font-size: 13px;
    font-weight: 800;
    color: var(--scalar-color-1);
    margin: 0;
    line-height: 1.2;
  }

  .sponsor-type {
    font-size: 8px;
    font-weight: 900;
    color: #5865F2;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
  }

  .sponsor-card-body {
    width: 100%;
    aspect-ratio: 1200 / 400;
    overflow: hidden;
    background: #000;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sponsor-banner-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    opacity: 0.85;
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sponsor-card:hover .sponsor-banner-image {
    opacity: 1;
    transform: scale(1.04);
  }

  .sponsor-modal-footer {
    padding: 12px;
    text-align: center;
    background: var(--scalar-background-2);
    border-top: 1px solid var(--scalar-border-color);
    flex-shrink: 0;
  }

  .sponsor-support-text {
    font-size: 8.5px;
    color: var(--scalar-color-3);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

  .sponsor-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: skewX(-25deg);
    transition: 0.75s;
    pointer-events: none;
  }

  .sponsor-card:hover::after {
    left: 150%;
  }

  @media (max-width: 480px) {
    .sponsor-modal {
      max-width: 92%;
      max-height: 75vh;
    }
    .sponsor-modal-body {
      padding: 12px;
      gap: 10px;
    }
    .sponsor-card-header {
      padding: 8px 12px;
    }
    .sponsor-logo {
      width: 28px;
      height: 28px;
    }
    .sponsor-name {
      font-size: 12px;
    }
    .sponsor-modal-footer {
      padding: 10px;
    }
    .sponsor-support-text {
      font-size: 8px;
    }
  }
`;
