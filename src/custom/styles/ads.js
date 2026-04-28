export const adsCSS = `
  .sponsor-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: color-mix(in srgb, var(--scalar-background-1) 80%, transparent);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    padding: 20px;
    transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .sponsor-modal {
    width: 100%;
    max-width: 500px;
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 50px 100px rgba(0, 0, 0, 0.3);
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
    padding: 16px 20px;
    background: var(--scalar-background-2);
    border-bottom: 1px solid var(--scalar-border-color);
  }

  .sponsor-modal-title {
    font-size: 11px;
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
    width: 28px;
    height: 28px;
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
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sponsor-card {
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .sponsor-card:hover {
    border-color: #5865F2;
    transform: translateY(-6px);
    box-shadow: 0 30px 60px rgba(88, 101, 242, 0.2);
  }

  .sponsor-card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--scalar-border-color);
    background: linear-gradient(135deg, var(--scalar-background-2) 0%, var(--scalar-background-1) 100%);
  }

  .sponsor-logo {
    width: 44px;
    height: 44px;
    background: #5865F2;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
    transition: transform 0.4s ease;
  }

  .sponsor-card:hover .sponsor-logo {
    transform: scale(1.1) rotate(5deg);
  }

  .sponsor-logo img {
    width: 80%;
    height: 80%;
    object-fit: contain;
  }

  .sponsor-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sponsor-name {
    font-size: 15px;
    font-weight: 800;
    color: var(--scalar-color-1);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .sponsor-type {
    font-size: 9px;
    font-weight: 900;
    color: #5865F2;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
  }

  .sponsor-card-body {
    height: 200px;
    overflow: hidden;
    background: #000;
    position: relative;
  }

  .sponsor-banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.8;
    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sponsor-card:hover .sponsor-banner-image {
    opacity: 1;
    transform: scale(1.08);
  }

  .sponsor-modal-footer {
    padding: 20px;
    text-align: center;
    background: var(--scalar-background-2);
    border-top: 1px solid var(--scalar-border-color);
  }

  .sponsor-support-text {
    font-size: 10px;
    color: var(--scalar-color-3);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* AnimeJS-style shine effect */
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
`;
