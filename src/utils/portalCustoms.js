import { scalarConfig } from '../configs/app.js'
import { customThemeCSS } from '../configs/themes.js'

export function buildBrandingScript() {
  const { name, url } = scalarConfig.branding

  return `
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
<script type="text/javascript">
  (function() {
    function createPreloader() {
      if (document.getElementById('miuu-preloader')) return;
      
      var preloader = document.createElement('div');
      preloader.id = 'miuu-preloader';
      preloader.innerHTML = '<div class="miuu-loader-content" style="text-align:center; display:flex; flex-direction:column; align-items:center;">' +
        '<svg class="miuu-m-svg" viewBox="0 0 3413.33 3413.33">' +
          '<g id="miuu-a-logo">' +
            '<polygon class="miuu-m-path" points="2634.05,1319.2 3373.33,3366.08 2353.15,3366.08 1947.48,3368.9" />' +
            '<polygon class="miuu-m-path" points="1239.45,45.11 2173.24,43.33 2553.3,1095.61 2072.6,2529.52" />' +
            '<polygon class="miuu-m-path" points="40,3366.08 1157.96,270.76 1628.66,1666.78 1059,3366.08" />' +
          '</g>' +
        '</svg>' +
        '<div class="miuu-loader-text">MiuuAPI</div>' +
      '</div>';
      document.body.appendChild(preloader);
      document.body.style.overflow = 'hidden';

      anime.timeline({
        complete: function() {
          setTimeout(function() {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            document.body.style.overflow = '';
            
            var scalarApp = document.querySelector('.scalar-api-reference');
            if (scalarApp) {
              scalarApp.classList.add('visible');
            }
            
            setTimeout(function() { preloader.remove(); }, 500);
          }, 300);
        }
      })
      .add({
        targets: '.miuu-m-path',
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeOutSine',
        duration: 800,
        delay: anime.stagger(100)
      })
      .add({
        targets: '.miuu-m-path',
        fill: '#ff0000',
        duration: 300,
        easing: 'easeOutQuad',
        offset: '-=300'
      })
      .add({
        targets: '.miuu-loader-text',
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        easing: 'easeOutSine',
        offset: '-=300'
      });
    }

    const drawerObserver = new MutationObserver(() => {
      const menuBtn = document.querySelector('button[aria-label="Open Menu"], button[aria-label="Close Menu"]');
      const mobileNav = document.querySelector('.scalar-api-references-standalone-mobile');
      const isOpen = (menuBtn && (menuBtn.innerText.toLowerCase().includes('close') || menuBtn.getAttribute('aria-label').toLowerCase().includes('close'))) || 
                     (mobileNav && mobileNav.classList.contains('scalar-api-references-standalone-mobile--open'));
      
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) document.body.classList.add('mobile-drawer-open');
      else document.body.classList.remove('mobile-drawer-open');
    });
    drawerObserver.observe(document.body, { childList: true, subtree: true });

    function patchScalar() {
      createPreloader();
      var styleEl = document.createElement('style');
      styleEl.textContent = [
        ${JSON.stringify(customThemeCSS)},
        '.scalar-logo, .scalar-app-logo { display: none !important; }',
        '.scalar-mcp-platform-item:not(.scalar-mcp-layer-link), a[href*="scalar.com/share"], button[id*="deploy"], button[id*="configure"], .menu-item[data-title="Deploy"], .menu-item[data-title="Share"], .menu-item[data-title="Configure"], a[href*="scalar.com"] { display: none !important; }',
        '.sidebar-item[data-tag="auth"], [data-testid="sidebar-tag-auth"] { margin-top: 40px !important; border-top: 1px solid var(--scalar-border-color); padding-top: 10px; }',
        '.sidebar-item[data-tag="auth"]::before { content: "AUTHENTICATION"; display: block; font-size: 10px; font-weight: bold; color: var(--scalar-color-3); margin-bottom: 8px; letter-spacing: 1px; }',
        '.sidebar-group { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }',
        '.sidebar-item { transition: transform 0.2s ease, padding 0.2s ease; }',
        '.sidebar-item:hover { transform: translateX(4px); }',
        '.scalar-api-reference { opacity: 0; transform: translateY(10px); }',
        '.scalar-api-reference.visible { opacity: 1 !important; transform: translateY(0) !important; }',
        '@media (max-width: 1000px) { h1 { font-size: 32px !important; text-align: left !important; width: 100% !important; } .scalar-api-references-standalone-mobile { z-index: 10000 !important; background: var(--scalar-background-1) !important; box-shadow: 0 0 20px rgba(0,0,0,0.2) !important; } .scalar-api-references-standalone-mobile--open { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden !important; } .scalar-api-reference:not(.visible) { opacity: 1 !important; transform: none !important; } }'
      ].join('\\n');
      document.head.appendChild(styleEl);

      var favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = window.location.origin + '/favicon.png';

      var lastPatch = 0;
      function customizeUI() {
        var now = Date.now();
        if (now - lastPatch < 100) return;
        lastPatch = now;
        document.querySelectorAll('a, span, p, div, footer, small').forEach(function(el) {
          if (el.childElementCount === 0 && /powered by scalar/i.test(el.textContent)) {
            var link = document.createElement('a');
            link.href = '${url}';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Powered by ${name}';
            link.style.cssText = el.style.cssText;
            el.replaceWith(link);
          }
          if (el.childElementCount === 0 && el.textContent.includes('MiuuAPI License')) {
            el.textContent = 'Website License';
          }
        });

        document.querySelectorAll('button, a, span, .menu-item').forEach(function(el) {
            var text = el.textContent.trim().toLowerCase();
            if (el.childElementCount <= 1 && (text === 'configure' || text === 'share' || text === 'deploy' || text === 'download openapi document')) {
                el.style.display = 'none';
            }
        });

        var css = '.references-header { display: none !important; } ' +
              '.miuu-nav-link { padding: 0 6px; text-decoration: none; color: var(--scalar-color-2); background: transparent; border: none; width: 100%; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-radius: var(--scalar-radius); gap: 4px; white-space: nowrap; font-size: var(--scalar-small); font-family: var(--scalar-font); transition: background 0.2s, color 0.2s; } ' +
              '.miuu-nav-link:hover { background: var(--scalar-background-2); color: var(--scalar-color-1); } ' +
              '.ask-agent-scalar-input-label, .scalar-ask-ai, form:has(.ask-agent-scalar-input-label), form:has(button[type="submit"]), button.bg-sidebar-b-search, .search-button, button[aria-label*="Ask AI"] { display: none !important; } ' +
              '.scalar-mcp-layer, .scalar-mcp-platform-item, [class*="scalar-mcp"], .references-developer-tools, [class*="developer-tools"], a[href*="scalar.com/share"], button[id*="deploy"], button[id*="configure"], .menu-item[data-title="Deploy"], .menu-item[data-title="Share"], .menu-item[data-title="Configure"], a[href*="scalar.com"] { display: none !important; } ' +
              'section[data-testid="section-introduction"], .introduction { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 40px !important; max-width: 1100px !important; margin: 0 auto !important; padding: 40px 20px !important; position: relative; overflow: visible !important; width: 100% !important; box-sizing: border-box !important; } ' +
              'section[data-testid="section-introduction"] h1, .introduction h1 { font-size: 42px !important; font-weight: 800 !important; margin-bottom: 12px !important; color: var(--scalar-color-1) !important; position: relative; z-index: 10; word-break: break-word; } ' +
              '.dark-mode section[data-testid="section-introduction"] h1, .dark-mode .introduction h1 { background: linear-gradient(135deg, #fff 0%, #ff0000 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } ' +
              'section[data-testid="section-introduction"] > div:first-child, .introduction > div:first-child { flex: 1.2 !important; position: relative; z-index: 10; width: 100% !important; } ' +
              '.miuu-banner-wrapper { flex: 1 !important; perspective: 2000px; display: flex; justify-content: flex-end; position: relative; z-index: 5; overflow: visible; width: 100% !important; } ' +
              '.miuu-intro-banner { width: 100%; max-width: 480px; aspect-ratio: 16/9; border-radius: 20px; object-fit: cover; transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.6s ease; transform: rotateY(-18deg) rotateX(6deg) rotateZ(-1deg) translate3d(0,0,0); transform-style: preserve-3d; box-shadow: 20px 20px 50px rgba(0,0,0,0.15); border: 1px solid var(--scalar-border-color); z-index: 5; position: relative; cursor: pointer; } ' +
              '.miuu-intro-banner:hover, .miuu-intro-banner.active { transform: rotateY(-4deg) rotateX(2deg) rotateZ(0deg) scale(1.05) translateY(-10px) translate3d(0,0,0) !important; box-shadow: 0 40px 80px rgba(255,0,0,0.2) !important; } ' +
              '@media (max-width: 1000px) { ' +
                'section[data-testid="section-introduction"], .introduction { flex-direction: column !important; text-align: left !important; padding: 20px 15px !important; box-sizing: border-box !important; overflow-x: hidden !important; gap: 20px !important; width: 100% !important; margin: 0 !important; } ' +
                'section[data-testid="section-introduction"] > div:first-child, .introduction > div:first-child { text-align: left !important; flex: none !important; width: 100% !important; } ' +
                'section[data-testid="section-introduction"] h1, .introduction h1 { font-size: 32px !important; line-height: 1.2 !important; text-align: left !important; margin: 0 0 12px !important; display: block !important; } ' +
                '.miuu-banner-wrapper { justify-content: center !important; width: 100% !important; margin-top: 10px !important; perspective: 1000px !important; flex: none !important; } ' +
                '.miuu-intro-banner { transform: rotateY(-8deg) rotateX(3deg) translate3d(0,0,0); max-width: 100% !important; margin: 0 auto !important; box-shadow: 10px 10px 30px rgba(0,0,0,0.2); } ' +
                '.miuu-shape { transform: scale(0.4) translate3d(0,0,0); } ' +
              '}';
    
        var style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);

        var patchInterval = setInterval(function() {
            try {
                document.querySelectorAll('.ask-agent-scalar-input-label').forEach(function(el) {
                    var form = el.closest('form');
                    if (form) form.style.display = 'none';
                    el.style.display = 'none';
                });
                document.querySelectorAll('button, a, span, .sidebar-item, .sidebar-group, .menu-item').forEach(function(el) {
                    var txt = (el.innerText || el.textContent || '').trim();
                    var targets = ['Ask AI', 'Generate MCP', 'VS Code', 'Cursor', 'Developer Tools'];
                    
                    var isTarget = targets.some(function(t) { return txt === t; });
                    if (isTarget) {
                        el.style.display = 'none';
                        var parentItem = el.closest('.sidebar-item') || el.closest('.sidebar-group');
                        if (parentItem) parentItem.style.display = 'none';
                    }
                });

                var introText = Array.from(document.querySelectorAll('span, p')).find(function(el) { 
                    return el.innerText.includes('A simple and easy to use API') || el.innerText.includes('Star to support our work'); 
                });
                
                if (introText && !document.querySelector('.miuu-intro-banner')) {
                    var introSection = introText.closest('section');
                    if (introSection) {
                        introSection.classList.add('introduction');
                        introSection.setAttribute('data-testid', 'section-introduction');
                    }

                    var wrapper = document.createElement('div');
                    wrapper.className = 'miuu-banner-wrapper';
                    
                    var s1 = document.createElement('div'); s1.className = 'miuu-shape miuu-shape-1'; wrapper.appendChild(s1);
                    var s2 = document.createElement('div'); s2.className = 'miuu-shape miuu-shape-2'; wrapper.appendChild(s2);

                    var banner = document.createElement('img');
                    banner.className = 'miuu-intro-banner';
                    banner.id = 'dynamicImage';
                    banner.src = '/assets/banner.jpg';
                    banner.alt = "MiuuAPI Banner";
                    
                    banner.addEventListener('click', function() {
                        this.classList.toggle('active');
                    });
                    
                    wrapper.appendChild(banner);
                    introText.parentElement.appendChild(wrapper);
                }

                var isMobile = window.innerWidth <= 1000;
                var h1 = document.querySelector('section[data-testid="section-introduction"] h1, .introduction h1');
                if (h1 && isMobile) {
                    h1.style.setProperty('font-size', '32px', 'important');
                    h1.style.setProperty('text-align', 'left', 'important');
                    h1.style.setProperty('display', 'block', 'important');
                }
            } catch(e) {}
        }, 500);
      }

      customizeUI();
      var observer = new MutationObserver(customizeUI);
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchScalar);
    else patchScalar();
  })();
</script>
`
}
