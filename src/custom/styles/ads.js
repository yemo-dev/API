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
    transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .sponsor-modal {
    width: 90%;
    max-width: 480px;
    max-height: 85vh;
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
    padding: 10px 14px;
    background: var(--scalar-background-2);
    border-bottom: 1px solid var(--scalar-border-color);
    flex-shrink: 0;
  }

  .sponsor-modal-title {
    font-size: 8.5px;
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
    width: 22px;
    height: 22px;
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
    padding: 10px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: var(--scalar-border-color) transparent;
  }

  @media (min-width: 640px) {
    .sponsor-modal {
      max-width: 600px;
    }
    .sponsor-modal-body:has(.sponsor-card:nth-child(2)) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .sponsor-card {
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    -webkit-tap-highlight-color: transparent;
  }

  .sponsor-card:hover {
    border-color: #5865F2;
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(88, 101, 242, 0.15);
  }

  .sponsor-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--scalar-border-color);
    background: linear-gradient(135deg, var(--scalar-background-2) 0%, var(--scalar-background-1) 100%);
  }

  .sponsor-logo {
    width: 26px;
    height: 26px;
    background: #5865F2;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: none;
  }

  .sponsor-card:hover .sponsor-logo {
    transform: scale(1.15) rotate(8deg);
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
    gap: 1px;
    pointer-events: none;
  }

  .sponsor-name {
    font-size: 11px;
    font-weight: 800;
    color: var(--scalar-color-1);
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sponsor-type {
    font-size: 7px;
    font-weight: 900;
    color: #5865F2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
  }

  .sponsor-card-body {
    width: 100%;
    aspect-ratio: 1200 / 400;
    overflow: hidden;
    background: #000;
    position: relative;
    pointer-events: none;
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
    transform: scale(1.05);
  }

  .sponsor-modal-footer {
    padding: 8px;
    text-align: center;
    background: var(--scalar-background-2);
    border-top: 1px solid var(--scalar-border-color);
    flex-shrink: 0;
  }

  .sponsor-support-text {
    font-size: 7.5px;
    color: var(--scalar-color-3);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  @media (max-width: 480px) {
    .sponsor-modal {
      width: 94%;
      margin: 0;
    }
    .sponsor-modal-body {
      padding: 8px;
      gap: 8px;
    }
    .sponsor-card-header {
      padding: 6px 10px;
    }
    .sponsor-logo {
      width: 22px;
      height: 22px;
    }
    .sponsor-name {
      font-size: 10px;
    }
    .sponsor-modal-footer {
      padding: 6px;
    }
  }
`;
