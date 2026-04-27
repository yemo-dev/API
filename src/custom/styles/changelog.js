export const changelogCSS = `
  .cl-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 100001;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }

  .cl-modal {
    width: 90%;
    max-width: 560px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    background: var(--scalar-background-1);
    border: 1px solid var(--scalar-border-color);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.6);
    font-family: var(--scalar-font);
    opacity: 0;
    transform: scale(0.88) translateY(32px);
  }

  .cl-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid var(--scalar-border-color);
    flex-shrink: 0;
  }
  .cl-modal-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--scalar-color-1);
    margin: 0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .cl-close-btn {
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
  .cl-close-btn:hover {
    background: var(--scalar-background-3, #333);
    color: var(--scalar-color-1);
    transform: scale(1.1);
  }

  .cl-modal-body {
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
  }

  .cl-entry {
    opacity: 0;
    transform: translateY(16px);
  }
  .cl-entry-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .cl-version {
    font-size: 13px;
    font-weight: 700;
    color: var(--scalar-color-accent);
    background: color-mix(in srgb, var(--scalar-color-accent) 15%, transparent);
    padding: 2px 9px;
    border-radius: 20px;
    letter-spacing: 0.03em;
  }
  .cl-date {
    font-size: 12px;
    color: var(--scalar-color-3);
  }
  .cl-changes {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cl-change-item {
    font-size: 13px;
    color: var(--scalar-color-2, var(--scalar-color-1));
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--scalar-background-2);
    border-left: 3px solid var(--scalar-border-color);
  }
  .cl-change-item.add    { border-left-color: #22c55e; }
  .cl-change-item.change { border-left-color: #3b82f6; }
  .cl-change-item.remove { border-left-color: #f87171; }
  .cl-change-item.fix    { border-left-color: #f59e0b; }

  .cl-divider {
    height: 1px;
    background: var(--scalar-border-color);
    margin: 0;
  }

  .cl-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--scalar-color-1);
    font-size: 13px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid var(--scalar-border-color);
    background: var(--scalar-background-2);
    transition: background 0.2s, border-color 0.2s;
    text-decoration: none;
    user-select: none;
  }
  .cl-btn:hover {
    background: var(--scalar-background-3, #333);
    border-color: var(--scalar-color-accent);
  }
  .cl-btn-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px #22c55e;
    flex-shrink: 0;
    transition: background 0.3s, box-shadow 0.3s;
  }
  .cl-btn-dot.down {
    background: #f87171;
    box-shadow: 0 0 6px #f87171;
  }
  .cl-btn-dot.checking {
    background: #f59e0b;
    box-shadow: 0 0 6px #f59e0b;
    animation: cl-pulse 1s infinite;
  }
  @keyframes cl-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;
