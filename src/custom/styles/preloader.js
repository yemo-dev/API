export const preloaderCSS = `
  #m-preloader {
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
    transition: opacity 0.3s ease-out, visibility 0.3s;
    pointer-events: none;
    will-change: opacity;
  }

  .m-loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .m-svg {
    width: 100px;
    height: 100px;
  }
  .m-path {
    stroke: var(--scalar-color-accent);
    stroke-width: 80;
    fill: none;
    stroke-dasharray: 12000;
    stroke-dashoffset: 12000;
  }

  .m-loader-text {
    font-family: var(--scalar-font);
    font-weight: 700;
    color: var(--scalar-color-1);
    font-size: 24px;
    letter-spacing: 4px;
    opacity: 0;
    margin-top: 15px;
    transform: translateY(10px);
  }

  @media (max-width: 600px) {
    .m-svg { width: 70px; height: 70px; }
    .m-loader-text { font-size: 18px; }
  }
`;
