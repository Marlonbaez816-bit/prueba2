/* ============================================
   AURA — app.js ACTUALIZADO COMPLETO
   ============================================ */

(function () {
  'use strict';

  async function bootAura() {

    // ── 1. SUPABASE (primero que todo) ──
    try { await AuraDB.init(); } catch(e) { console.warn('Supabase no disponible:', e); }

    // ── 2. TEMA ──
    AuraTheme.init();

    // ── 3. REGISTRAR PÁGINAS ──
    AuraFeed.init();
    AuraEcos.init();
    AuraChat.init();
    AuraCommunities.init();
    AuraProfile.init();
    AuraKarma.init();
    AuraNotifications.init();
    AuraMedia.init();
    AuraSearch.init();
    if (window.AuraCamera)      AuraCamera.init();
    if (window.AuraUserProfile) AuraUserProfile.init();

    // ── 4. MÓDULOS DE HARDWARE / UX ──
    AuraGyro.init();
    AuraAttention.init();
    AuraAI.init();

    // ── 5. BOTTOM NAV ──
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        AuraRouter.navigate(btn.dataset.page);
      });
    });

    // ── 6. BOTÓN CREAR ──
    document.querySelector('[data-action="create"]')?.addEventListener('click', () => {
      AuraModal.show({
        title: 'Crear Eco',
        content: `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              ${[
                ['📝','Texto',    'text'],
                ['📷','Foto',     'photo'],
                ['🎬','Video Eco','video'],
                ['🎵','Audio',    'audio'],
                ['🧵','Hilo',     'thread'],
                ['📊','Encuesta', 'poll'],
              ].map(([icon, label, type]) => `
                <button onclick="AuraModal.close();setTimeout(()=>AuraCreate.open('${type}'),180);"
                  style="display:flex;flex-direction:column;align-items:center;gap:6px;
                  background:var(--color-bg-input);border-radius:14px;padding:16px 8px;cursor:pointer;
                  border:1px solid var(--color-border);font-size:13px;font-weight:600;
                  color:var(--color-text-primary);">
                  <span style="font-size:28px;">${icon}</span>${label}
                </button>
              `).join('')}
            </div>
          </div>
        `
      });
    });

    // ── 7. BOTÓN NOTIFICACIONES ──
    document.getElementById('btn-notifications')?.addEventListener('click', () => {
      AuraRouter.navigate('notifications');
      const badge = document.getElementById('notif-badge');
      if (badge) badge.style.display = 'none';
    });

    // ── 8. BOTÓN BUSCAR ──
    document.getElementById('btn-search')?.addEventListener('click', () => {
      AuraRouter.navigate('search');
    });

    // ── 9. BOTÓN LOGO → HOME ──
    document.getElementById('btn-logo')?.addEventListener('click', () => {
      AuraRouter.navigate('home');
    });

    // ── 10. BOTÓN CÁMARA ──
    document.getElementById('btn-camera')?.addEventListener('click', () => {
      if (window.AuraCamera) AuraCamera.open();
      else AuraToast.show('Cámara próximamente', 'warning');
    });

    // ── 11. PÁGINA INICIAL ──
    AuraRouter.navigate('home');

    // ── 12. SPLASH → APP ──
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      const app    = document.getElementById('app');
      if (splash) {
        splash.style.transition = 'opacity .4s ease';
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          if (app) app.classList.remove('hidden');
          // Auth después de mostrar la app
          AuraAuth.init();
        }, 400);
      }
    }, 2000);

    // ── 13. VIBRACIÓN EN NAVEGACIÓN ──
    document.querySelectorAll('.nav-item, .btn, .icon-btn').forEach(el => {
      el.addEventListener('click', () => {
        navigator.vibrate?.(8);
      });
    });

    // ── 14. SWIPE HORIZONTAL ENTRE PÁGINAS ──
    const pages = ['home', 'ecos', 'communities', 'profile'];
    let swipeStartX = 0;
    const main = document.getElementById('main-content');
    if (main) {
      main.addEventListener('touchstart', e => {
        swipeStartX = e.touches[0].clientX;
      }, { passive: true });
      main.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - swipeStartX;
        if (Math.abs(dx) < 80) return;
        const current = AuraRouter.current();
        const idx = pages.indexOf(current);
        if (idx === -1) return;
        if (dx < 0 && idx < pages.length - 1) AuraRouter.navigate(pages[idx + 1]);
        if (dx > 0 && idx > 0) AuraRouter.navigate(pages[idx - 1]);
      }, { passive: true });
    }

    // ── 15. ONLINE / OFFLINE ──
    window.addEventListener('offline', () => AuraToast.show('Sin conexión 📡', 'warning'));
    window.addEventListener('online',  () => AuraToast.show('Conectado ✦', 'success'));

    // ── 16. PWA INSTALAR ──
    let _installPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      _installPrompt = e;
      setTimeout(() => {
        const banner = document.getElementById('install-banner');
        if (banner) banner.classList.remove('hidden');
      }, 8000);
    });
    document.getElementById('install-btn')?.addEventListener('click', () => {
      _installPrompt?.prompt();
      _installPrompt?.userChoice.then(() => {
        document.getElementById('install-banner')?.classList.add('hidden');
      });
    });
    document.getElementById('install-close')?.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
    });

    // ── 17. PREVISUALIZACIÓN LARGA PRESIÓN (peek) ──
    let peekEl = null, peekTimer = null;
    document.addEventListener('touchstart', e => {
      const target = e.target.closest('[data-peek]');
      if (!target) return;
      peekTimer = setTimeout(() => {
        try {
          const data = JSON.parse(target.dataset.peek);
          _showPeek(data, e.touches[0].clientX, e.touches[0].clientY);
        } catch(err) {}
      }, 450);
    }, { passive: true });
    document.addEventListener('touchend',  _hidePeek, { passive: true });
    document.addEventListener('touchmove', _hidePeek, { passive: true });

    function _showPeek(data, x, y) {
      _hidePeek();
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
      let left = Math.max(8, Math.min(vw - pw - 8, x - pw / 2));
      let top  = y - 320;
      if (top < 70) top = y + 20;
      peekEl.style.cssText = `left:${left}px;top:${top}px;width:${pw}px;`;
      document.body.appendChild(peekEl);
    }

    function _hidePeek() {
      clearTimeout(peekTimer); peekTimer = null;
      if (peekEl) { peekEl.remove(); peekEl = null; }
    }

  }

  // ── ESPERAR DOM ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAura);
  } else {
    bootAura();
  }

})();
