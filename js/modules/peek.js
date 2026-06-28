window.AuraPeek = (() => {
  let peekEl = null;
  let peekTimer = null;

  function showPeek(data, x, y) {
    hidePeek();
    navigator.vibrate?.(30);
    peekEl = document.createElement('div');
    peekEl.className = 'peek-preview';
    peekEl.innerHTML = `
      ${data.img ? `<img src="${data.img}" alt="">` : ''}
      ${data.video ? `<video src="${data.video}" autoplay muted loop></video>` : ''}
      <div class="peek-preview__body">
        <div class="peek-preview__title">${data.title || ''}</div>
        <div class="peek-preview__sub">${data.sub || ''}</div>
      </div>`;

    const vw = window.innerWidth, vh = window.innerHeight;
    const pw = 260;
    let left = x - pw / 2;
    left = Math.max(8, Math.min(vw - pw - 8, left));
    let top = y - 320;
    if (top < 70) top = y + 20;
    peekEl.style.cssText = `left:${left}px;top:${top}px;width:${pw}px;`;
    document.body.appendChild(peekEl);
  }

  function hidePeek() {
    clearTimeout(peekTimer);
    peekTimer = null;
    if (peekEl) { peekEl.remove(); peekEl = null; }
  }

  function init() {
    document.addEventListener('touchstart', e => {
      const target = e.target.closest('[data-peek]');
      if (!target) return;
      peekTimer = setTimeout(() => {
        const data = JSON.parse(target.dataset.peek);
        showPeek(data, e.touches[0].clientX, e.touches[0].clientY);
      }, 450);
    }, { passive: true });

    document.addEventListener('touchend', hidePeek, { passive: true });
    document.addEventListener('touchmove', hidePeek, { passive: true });
  }

  return { init };
})();
