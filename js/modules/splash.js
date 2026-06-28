window.AuraSplash = (() => {
  function init() {
    const c = document.getElementById('splash-particles');
    if (!c) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'splash__particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 20}%;
        animation-duration:${Math.random() * 6 + 4}s;
        animation-delay:${Math.random() * 4}s;
        opacity:${Math.random() * .5 + .1};
      `;
      c.appendChild(p);
    }

    // Favicon SVG dinámico
    const svg = document.getElementById('favicon-svg');
    if (svg) {
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.querySelector('link[rel="icon"]') || document.createElement('link');
      link.rel = 'icon'; link.type = 'image/svg+xml'; link.href = url;
      document.head.appendChild(link);
    }
  }

  return { init };
})();
