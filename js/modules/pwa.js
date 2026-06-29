/* ============================================
   AURA — pwa.js
   Banner de instalación PWA + favicon dinámico
   ============================================ */

window.AuraPWA = (() => {
  function init() {
    // Favicon SVG dinámico
    const svg = document.getElementById('favicon-svg');
    if (svg) {
      try {
        const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
        const url  = URL.createObjectURL(blob);
        let link   = document.querySelector('link[rel="icon"]');
        if (!link) { link = document.createElement('link'); document.head.appendChild(link); }
        link.rel = 'icon'; link.type = 'image/svg+xml'; link.href = url;
      } catch(e) {}
    }

    // Banner instalar
    let _prompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      _prompt = e;
      setTimeout(() => {
        const b = document.getElementById('install-banner');
        if (b) b.classList.remove('hidden');
      }, 10000);
    });

    document.getElementById('install-btn')?.addEventListener('click', () => {
      _prompt?.prompt();
      _prompt?.userChoice.then(() => {
        document.getElementById('install-banner')?.classList.add('hidden');
      });
    });

    document.getElementById('install-close')?.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
    });
  }

  return { init };
})();
