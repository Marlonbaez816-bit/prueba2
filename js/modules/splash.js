/* ============================================
   AURA — splash.js
   Partículas animadas en el splash
   ============================================ */

window.AuraSplash = (() => {
  function init() {
    const container = document.getElementById('splash-particles');
    if (!container) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'splash__particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%;
        bottom:${Math.random()*20}%;
        animation-duration:${Math.random()*6+4}s;
        animation-delay:${Math.random()*4}s;
        opacity:${Math.random()*.5+.1};
      `;
      container.appendChild(p);
    }
  }
  return { init };
})();
