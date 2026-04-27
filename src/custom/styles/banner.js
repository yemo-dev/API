export const bannerCSS = `
  .introduction {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 40px !important;
    max-width: 1100px !important;
    margin: 0 auto !important;
    padding: 40px 20px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .m-banner-wrapper {
    flex: 1 !important;
    display: flex;
    justify-content: flex-end;
    perspective: 2000px;
  }

  .m-intro-banner {
    width: 100%;
    max-width: 480px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--scalar-border-color);
    transform: rotate(3deg);
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s;
    cursor: pointer;
  }
  .m-intro-banner:hover {
    transform: rotate(0deg) translateY(-10px) scale(1.02) !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
  }

  @media (max-width: 1000px) {
    .introduction {
      flex-direction: column !important;
      padding: 20px 15px !important;
      gap: 20px !important;
    }
    .m-banner-wrapper { justify-content: center !important; }
    .m-intro-banner { transform: rotate(2deg) scale(0.95); }
  }
`;
