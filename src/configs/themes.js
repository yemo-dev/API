export const customThemeCSS = `
  /* Global Theme Overrides */
  :root {
    --scalar-font: 'Inter', system-ui, -apple-system, sans-serif;
    --scalar-radius-lg: 12px;
  }

  /* ============================================================
     LIGHT MODE
     ============================================================ */
  .light-mode {
    --scalar-color-accent: #ff0000;
    --scalar-background-1: #ffffff;
    --scalar-background-2: #fcfcfc;
    --scalar-background-3: #f5f5f5;
    --scalar-background-accent: rgba(255, 0, 0, 0.05);
    
    --scalar-color-1: #111111;
    --scalar-color-2: #444444;
    --scalar-color-3: #888888;
    
    --scalar-border-color: #eeeeee;
    
    /* Sidebar Specific */
    --scalar-sidebar-background-1: #fcfcfc;
    --scalar-sidebar-border-color: #eeeeee;
    --scalar-sidebar-item-hover-background: #fffafa;
    --scalar-sidebar-item-hover-color: #ff0000;
    --scalar-sidebar-item-active-background: #fffafa;
    --scalar-sidebar-color-active: #ff0000;
  }

  /* ============================================================
     DARK MODE
     ============================================================ */
  .dark-mode {
    --scalar-color-accent: #ff0000;
    --scalar-background-1: #000000;
    --scalar-background-2: #0e0e12;
    --scalar-background-3: #1a1a24;
    --scalar-background-accent: rgba(255, 0, 0, 0.1);
    
    --scalar-color-1: #ffffff;
    --scalar-color-2: #e2e8f0;
    --scalar-color-3: #94a3b8;
    
    --scalar-border-color: #33333a;
    
    /* Sidebar Specific */
    --scalar-sidebar-background-1: #000000;
    --scalar-sidebar-border-color: #27272a;
    --scalar-sidebar-item-hover-background: #1a1a24;
    --scalar-sidebar-item-hover-color: #ff0000;
    --scalar-sidebar-item-active-background: #1e1e24;
    --scalar-sidebar-color-active: #ff0000;
  }

  /* Buttons & UI Elements */
  .scalar-button-solid {
    background: var(--scalar-color-accent) !important;
    color: white !important;
    font-weight: 600 !important;
  }
  
  .scalar-button-ghost:hover {
    color: var(--scalar-color-accent) !important;
  }

  /* Scrollbar */
  ::-webkit-scrollbar-thumb {
    background: var(--scalar-border-color);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--scalar-color-accent);
  }

  /* Layout Fixes */
  *, *::before, *::after { box-sizing: border-box !important; }
  body { margin: 0 !important; padding: 0 !important; }

  /* Sidebar Morph Animation & Tightening */
  /* Sidebar & Navigation Overrides */
  .sidebar-item {
  }
  
  @media (max-width: 1000px) {
  }

  /* Preloader Base */
  #miuu-preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--scalar-background-1);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.5s;
    pointer-events: all;
    backface-visibility: hidden;
  }
  
  .scalar-api-reference {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .scalar-api-reference.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .miuu-m-svg {
    width: 80px;
    height: 80px;
    will-change: transform;
    transform: translateZ(0) scale(0.9);
  }

  .miuu-m-path {
    stroke: #ff0000;
    stroke-width: 80;
    fill: none;
    stroke-dasharray: 12000;
    stroke-dashoffset: 12000;
    will-change: stroke-dashoffset;
  }

  .miuu-loader-text {
    font-family: var(--scalar-font);
    font-weight: 700;
    color: var(--scalar-color-1);
    font-size: 24px;
    letter-spacing: 4px;
    opacity: 0;
    margin-top: 15px;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }

  /* Sidebar Enhancements */
  .sidebar {
    transform: translateX(-10px);
    opacity: 0;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
  }
  .scalar-api-reference.visible .sidebar {
    transform: translateX(0);
    opacity: 1;
  }
  
  .sidebar-group { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .sidebar-item { transition: transform 0.2s ease, padding 0.2s ease; }
  .sidebar-item:hover { transform: translateX(4px); }

  /* Dynamic Shapes */
  .miuu-shape { 
    position: absolute; 
    border-radius: 50%; 
    background: linear-gradient(135deg, var(--scalar-color-accent), #000); 
    opacity: 0.15; 
    animation: miuu-float 10s infinite alternate ease-in-out; 
    pointer-events: none; 
  }
  .miuu-shape-1 { width: 300px; height: 300px; top: -100px; right: -50px; }
  .miuu-shape-2 { width: 200px; height: 200px; bottom: -50px; right: 200px; opacity: 0.08; }
  
  @keyframes miuu-float { 
    0% { transform: translateY(0) rotate(0deg); } 
    100% { transform: translateY(-30px) rotate(10deg); } 
  }
`;
