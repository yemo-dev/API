export const logsCSS = `
  .m-logs-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    z-index: 1000000;
    display: none;
    flex-direction: column;
    padding: 40px;
    box-sizing: border-box;
    color: #fff;
    font-family: 'Inter', sans-serif;
  }
  .m-logs-container {
    background: #0f1115;
    border: 1px solid #2d3139;
    border-radius: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0,0,0,0.5);
  }
  .m-logs-header {
    padding: 20px 24px;
    border-bottom: 1px solid #2d3139;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #161a21;
  }
  .m-logs-title {
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .m-logs-title svg {
    color: #3b82f6;
  }
  .m-logs-close {
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  .m-logs-close:hover {
    background: #2d3139;
  }
  .m-logs-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  .m-logs-sidebar {
    width: 240px;
    border-right: 1px solid #2d3139;
    padding: 16px;
    overflow-y: auto;
    background: #0f1115;
  }
  .m-logs-content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
    background: #050505;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .m-log-file-item {
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    margin-bottom: 4px;
    color: #94a3b8;
    transition: all 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .m-log-file-item:hover {
    background: #1e293b;
    color: #fff;
  }
  .m-log-file-item.active {
    background: #3b82f6;
    color: #fff;
  }
  .m-logs-pre {
    margin: 0;
    padding: 20px;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #e2e8f0;
    white-space: pre-wrap;
  }
  .m-log-entry {
    border-bottom: 1px solid #1a1a1a;
    padding: 4px 0;
  }
  .m-log-ts { color: #64748b; margin-right: 8px; }
  .m-log-level { font-weight: bold; margin-right: 8px; }
  .m-log-level-info { color: #3b82f6; }
  .m-log-level-warn { color: #eab308; }
  .m-log-level-error { color: #ef4444; }
  
  .m-logs-btn {
    position: fixed;
    bottom: 80px;
    right: 24px;
    z-index: 999998;
    background: #1e293b;
    border: 1px solid #334155;
    color: #fff;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: all 0.2s;
  }
  .m-logs-btn:hover {
    background: #334155;
    transform: translateY(-2px);
  }
  .m-logs-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #475569;
  }
  .m-logs-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
