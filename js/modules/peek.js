/* ============================================
   AURA — peek.js
   Previsualización larga presión estilo iPhone
   ============================================ */

window.AuraPeek = (() => {
  let peekEl = null, peekTimer = null;

  function init() {
    document.addEventListener('touchstart', e => {
      const target = e.target.closest('[data-peek]');
      if (!target) return;
      peekTimer = setTimeout(() => {
        try {
          const data = JSON.parse(target.dataset.peek);
          _show(data, e.touches[0].clientX, e.touches[0].clientY);
        } catch(_) {}
      }, 450);
    }, { passive: true });

    document.addEventListener('touchend',  _hide, { passive: true });
    document.addEventListener('touchmove', _hide, { passive: true });
  }

  function _show(data, x, y) {
    _hide();
    navigator.vibrate?.(30);
    peekEl = document.createElement('div');
    peekEl.className = 'peek-preview';
    peekEl.innerHTML = `
      ${data.img   ? `<img src="${data.img}" alt="">` : ''}
      ${data.video ? `<video src="${data.video}" autoplay muted loop></video>` : ''}
      <div class="peek-preview__body">
        <div class="peek-preview__title">${data.title || ''}</div>
        <div class="peek-preview__sub">${data.sub || ''}</div>
      </div>`;
    const vw = window.innerWidth, pw = 260;
    const left = Math.max(8, Math.min(vw - pw - 8, x - pw / 2));
    const top  = (y - 320 < 70) ? y + 20 : y - 320;
    peekEl.style.cssText = `left:${left}px;top:${top}px;width:${pw}px;`;
    document.body.appendChild(peekEl);
  }

  function _hide() {
    clearTimeout(peekTimer); peekTimer = null;
    if (peekEl) { peekEl.remove(); peekEl = null; }
  }

  return { init };
})();
