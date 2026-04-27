import { preloaderCSS } from './styles/preloader.js'
import { bannerCSS } from './styles/banner.js'
import { adsCSS } from './styles/ads.js'
import { scalarConfig } from '../configs/app.js'
import { adsConfig } from '../configs/ads.js'
const ICONS = {
  discord: '<svg viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.4,80.21a105.73,105.73,0,0,0,32.17,16.15,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c3.39-29,1.24-52.75-16.9-72.13ZM42.45,65.69C36.18,65.69,31,60,31,53s5.12-12.67,11.45-12.67S54,46,53.86,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.12-12.67,11.44-12.67S96.14,46,96,53,90.89,65.69,84.69,65.69Z"/></svg>'
}

export function buildBrandingScript() {
  const statusCSS = `
    .cl-btn { display: flex; align-items: center; gap: 8px; color: var(--scalar-color-1); font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--scalar-border-color); background: var(--scalar-background-2); cursor: default; }
    .cl-btn-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; flex-shrink: 0; }
    .cl-btn-dot.up { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
    .cl-btn-dot.warn { background: #eab308; box-shadow: 0 0 6px #eab308; }
    .cl-btn-dot.down { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
    .cl-btn-dot.checking { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; animation: cl-pulse 1s infinite; }
    @keyframes cl-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    
    .m-rl-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: color-mix(in srgb, var(--scalar-background-1) 80%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--scalar-border-color);
      border-radius: 12px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      font-family: var(--scalar-font);
      font-size: 13px;
      font-weight: 700;
      color: var(--scalar-color-1);
      user-select: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .m-rl-widget:hover { transform: scale(1.05); }
    .m-rl-label { color: var(--scalar-color-3); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .m-rl-val { color: var(--scalar-color-accent); }
  `;
  const combinedCSS = preloaderCSS + bannerCSS + adsCSS + statusCSS;
  const { footer, clientButton } = scalarConfig.customBranding;
  const btnIcon = ICONS[clientButton.icon] || '';

  return `
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
<script type="text/javascript">
  (function() {
    function patchScalar() {
      var styleEl = document.createElement('style');
      styleEl.textContent = ${JSON.stringify(combinedCSS)} + ' .scalar-mcp-layer, .scalar-mcp-layer-link, [class*="scalar-mcp"], .mcp-logo, .mcp-nav, .ask-agent-scalar-input-label, [data-v-78f5377c] { display: none !important; visibility: hidden !important; pointer-events: none !important; height: 0 !important; width: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; position: absolute !important; } .m-discord-btn svg { width: 16px; height: 16px; margin-right: 6px; fill: currentColor; vertical-align: middle; }';
      document.head.appendChild(styleEl);

      var preloader = document.createElement('div');
      preloader.id = 'm-preloader';
      preloader.innerHTML = '<div class="m-loader-content">' +
        '<svg class="m-svg" viewBox="0 0 3413.33 3413.33">' +
          '<g id="m-logo">' +
            '<polygon class="m-path" points="2634.05,1319.2 3373.33,3366.08 2353.15,3366.08 1947.48,3368.9" />' +
            '<polygon class="m-path" points="1239.45,45.11 2173.24,43.33 2553.3,1095.61 2072.6,2529.52" />' +
            '<polygon class="m-path" points="40,3366.08 1157.96,270.76 1628.66,1666.78 1059,3366.08" />' +
          '</g>' +
        '</svg>' +
        '<div class="m-loader-text">MiuuAPI</div>' +
      '</div>';
      document.body.appendChild(preloader);
      document.body.style.overflow = 'hidden';

      anime.timeline({
        complete: function() {
          preloader.style.opacity = '0';
          preloader.style.visibility = 'hidden';
          document.body.style.overflow = '';
          setTimeout(function() { preloader.remove(); }, 300);
        }
      })
      .add({ 
        targets: '.m-path', 
        strokeDashoffset: [anime.setDashoffset, 0], 
        easing: 'easeInOutQuart', 
        duration: 1000, 
        delay: anime.stagger(100) 
      })
      .add({ 
        targets: '.m-path', 
        fill: ['#ffffff00', 'var(--scalar-color-accent)'], 
        duration: 800, 
        easing: 'easeOutQuad', 
        offset: '-=200',
        update: function(anim) {
          var paths = document.querySelectorAll('.m-path');
          paths.forEach(p => p.style.filter = 'drop-shadow(0 0 10px var(--scalar-color-accent))');
        }
      })
      .add({ 
        targets: '.m-loader-text', 
        opacity: [0, 1], 
        translateY: [20, 0], 
        duration: 800, 
        easing: 'easeOutExpo', 
        offset: '-=600',
        begin: function(anim) {
          var textWrapper = document.querySelector('.m-loader-text');
          textWrapper.innerHTML = textWrapper.textContent.split('').map(function(c) {
            return "<span class='letter' style='display:inline-block'>" + (c === ' ' ? '&nbsp;' : c) + "</span>";
          }).join('');
          anime({
            targets: '.m-loader-text .letter',
            translateY: [40,0],
            translateZ: 0,
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 1000,
            delay: (el, i) => 200 + 30 * i
          });
        }
      });

      function customizeUI() {
        var targets = document.querySelectorAll('.scalar-mcp-layer, .scalar-mcp-layer-link, .mcp-logo, .ask-agent-scalar-input-label, [data-v-78f5377c]');
        for (var i = 0; i < targets.length; i++) targets[i].remove();

        var buttons = document.querySelectorAll('button');
        buttons.forEach(function(btn) {
          var txt = btn.innerText || '';
          if (txt.includes('Ask AI') || txt.includes('Deploy') || txt.includes('Share') || txt.includes('Developer Tools')) {
            btn.style.setProperty('display', 'none', 'important');
          }
        });

        var allLinks = document.querySelectorAll('a, span');
        allLinks.forEach(function(el) {
          var txt = el.innerText || '';
          if (txt.includes('Developer Tools')) {
            el.style.setProperty('display', 'none', 'important');
          }
        });

        var configTitles = document.querySelectorAll('span.text-base.font-medium.text-c-1');
        configTitles.forEach(function(el) {
          if (el.innerText.includes('Scalar Configuration')) {
            el.innerText = 'Configuration';
          }
        });

        var footerLink = document.querySelector('.scalar-footer-link, a[href*="scalar.com"]');
        if (footerLink) {
          footerLink.href = ${JSON.stringify(footer.url)};
          footerLink.innerText = ${JSON.stringify(footer.text)};
        }

        var clientButtons = document.querySelectorAll('.open-api-client-button');
        clientButtons.forEach(function(btn) {
          if (!btn.classList.contains('m-discord-btn')) {
            btn.classList.add('m-discord-btn');
            btn.href = ${JSON.stringify(clientButton.url)};
            btn.target = '_blank';
            btn.innerHTML = ${JSON.stringify(btnIcon + ' ' + clientButton.text)};
          }
        });

        var introText = Array.from(document.querySelectorAll('span, p')).find(el => el.innerText.includes('A simple and easy to use API') || el.innerText.includes('Star to support our work'));
        if (introText && !document.querySelector('.m-intro-banner')) {
          var introSection = introText.closest('section');
          if (introSection) introSection.classList.add('introduction');
          var wrapper = document.createElement('div');
          wrapper.className = 'm-banner-wrapper';
          wrapper.innerHTML = '<img class="m-intro-banner" src="/assets/banner.jpg" alt="Banner">';
          introText.parentElement.appendChild(wrapper);
        }
        
        var emailBtn = document.querySelector('a[href*="mailto:"]');
        if (emailBtn && !document.getElementById('status-indicator-btn')) {
          var statusBtn = document.createElement('div');
          statusBtn.id = 'status-indicator-btn';
          statusBtn.className = 'cl-btn mr-2';
          statusBtn.innerHTML = '<div class="cl-btn-dot checking" id="status-dot"></div><span id="status-text">STATUS: Checking...</span>';
          emailBtn.parentNode.insertBefore(statusBtn, emailBtn);

          window.fetch('/api/stats', { method: 'HEAD' }).then(function(res) {
            var dot = document.getElementById('status-dot');
            var txt = document.getElementById('status-text');
            if (dot && txt) {
              dot.classList.remove('checking');
              if (res.ok) {
                dot.classList.add('up');
                txt.innerText = 'STATUS: Online';
              } else {
                dot.classList.add('down');
                txt.innerText = 'STATUS: Offline';
              }
            }
          }).catch(function() {
            var dot = document.getElementById('status-dot');
            var txt = document.getElementById('status-text');
            if (dot && txt) {
              dot.classList.remove('checking');
              dot.classList.add('down');
              txt.innerText = 'STATUS: Offline';
            }
          });
        }

        if (!document.getElementById('m-rl-widget')) {
          var rlWidget = document.createElement('div');
          rlWidget.id = 'm-rl-widget';
          rlWidget.className = 'm-rl-widget';
          rlWidget.innerHTML = '<div class="cl-btn-dot checking" id="rl-dot"></div><span class="m-rl-label">Rate Limit:</span><span class="m-rl-val" id="m-rl-val-container"><span id="m-rl-val">--</span>/<span id="m-rl-limit">--</span></span>';
          document.body.appendChild(rlWidget);

          async function updateRL() {
            try {
              var res = await window.fetch('/api/auth/check?t=' + Date.now(), { method: 'HEAD' });
              var dot = document.getElementById('rl-dot');
              var remaining = res.headers.get('x-ratelimit-remaining');
              var limit = res.headers.get('x-ratelimit-limit');
              
              if (remaining !== null && limit !== null) {
                 document.getElementById('m-rl-val').innerText = remaining;
                 document.getElementById('m-rl-limit').innerText = limit;
                 var remainingNum = parseInt(remaining, 10);
                 var limitNum = parseInt(limit, 10);
                 if (dot) {
                   if (isNaN(remainingNum) || isNaN(limitNum)) {
                       dot.className = 'cl-btn-dot up'; // Unlimited
                   } else {
                       var percentage = (remainingNum / limitNum) * 100;
                       dot.className = 'cl-btn-dot ' + (percentage > 30 ? 'up' : (percentage > 0 ? 'warn' : 'down'));
                   }
                 }
              } else if (!res.ok) {
                 if (dot) dot.className = 'cl-btn-dot down';
              }
            } catch(e) {
               var dot = document.getElementById('rl-dot');
               if (dot) dot.className = 'cl-btn-dot down';
            }
          }
          setInterval(updateRL, 3000);
          updateRL();
        }
      }

      function showToast(msg) {
          var toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--scalar-background-1);color:var(--scalar-color-1);border:1px solid #ef4444;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;z-index:99999;box-shadow:0 10px 15px -3px rgba(0,0,0,0.2);opacity:0;transform:translateY(20px);transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:flex;align-items:center;gap:12px;font-family:var(--scalar-font);';
          toast.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>' + msg + '</span>';
          document.body.appendChild(toast);
          
          requestAnimationFrame(function() {
              toast.style.opacity = '1';
              toast.style.transform = 'translateY(0)';
          });
          
          setTimeout(function() {
              toast.style.opacity = '0';
              toast.style.transform = 'translateY(20px)';
              setTimeout(function() { toast.remove(); }, 300);
          }, 3500);
      }

      function initSponsorModal() {
        var cfg = ${JSON.stringify(adsConfig)};
        if (!cfg.enabled) return;
        if (!cfg.sponsors || cfg.sponsors.length === 0) return;
        
        // Build cards HTML for all sponsors
        var cardsHTML = cfg.sponsors.map(function(s) {
          return '<div class="sponsor-card" onclick="window.open(\\'' + s.targetUrl + '\\', \\'_blank\\')">' +
            '<div class="sponsor-card-header">' +
              '<div class="sponsor-logo"><img src="' + s.logoUrl + '" alt="' + s.name + '" onerror="this.style.display=\\'none\\'"></div>' +
              '<div class="sponsor-info">' +
                '<h4 class="sponsor-name">' + s.name + '</h4>' +
                '<span class="sponsor-type">' + (s.type || 'Sponsor') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="sponsor-card-body">' +
              '<img src="' + s.bannerUrl + '" class="sponsor-banner-image" alt="' + s.name + ' banner">' +
            '</div>' +
          '</div>';
        }).join('');

        var overlay = document.createElement('div');
        overlay.className = 'sponsor-modal-overlay';
        overlay.innerHTML = '<div class="sponsor-modal">' +
          '<div class="sponsor-modal-header">' +
            '<h3 class="sponsor-modal-title">' + cfg.title + '</h3>' +
            '<button class="sponsor-close-btn" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
          '</div>' +
          '<div class="sponsor-modal-body">' + cardsHTML + '</div>' +
          '<div class="sponsor-modal-footer">' +
            '<p class="sponsor-support-text">' + cfg.footerText + '</p>' +
          '</div>' +
        '</div>';
        
        document.body.appendChild(overlay);
        
        function closeModal() {
          anime.timeline({ easing: 'easeInQuad' })
            .add({ targets: '.sponsor-card', translateY: [0, 16], opacity: [1, 0], duration: 200, delay: anime.stagger(50) })
            .add({ targets: '.sponsor-modal', scale: [1, 0.9], opacity: [1, 0], duration: 280 }, '-=100')
            .add({ targets: overlay, opacity: [1, 0], duration: 250, complete: function() { overlay.remove(); } }, '-=200');
        }

        overlay.querySelector('.sponsor-close-btn').addEventListener('click', closeModal);

        setTimeout(function() {
          // 1. Fade in overlay
          anime({ targets: overlay, opacity: [0, 1], duration: 400, easing: 'easeOutQuad', begin: function() { overlay.style.pointerEvents = 'auto'; } });
          // 2. Elastic pop-in for modal box
          anime({ targets: '.sponsor-modal', scale: [0.85, 1], translateY: [40, 0], opacity: [0, 1], duration: 700, easing: 'easeOutElastic(1, 0.7)' });
          // 3. Staggered slide-up for cards
          anime({ targets: '.sponsor-card', translateY: [24, 0], opacity: [0, 1], duration: 500, delay: anime.stagger(120, { start: 250 }), easing: 'easeOutExpo' });
        }, cfg.delayMs);
      }

      customizeUI();
      initSponsorModal();
      var observer = new MutationObserver(customizeUI);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchScalar);
    else patchScalar();
  })();
</script>
`;
}
