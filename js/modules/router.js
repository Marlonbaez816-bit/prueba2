/* ============================================
   AURA — router.js LIMPIO
   Sin páginas duplicadas, sin código extra
   ============================================ */

window.AuraRouter = (() => {
  const _pages = {};
  let _current = null;

  function register(name, renderFn) {
    _pages[name] = renderFn;
  }

  function navigate(page, params = {}) {
    const main  = document.getElementById('main-content');
    const title = document.getElementById('page-title');
    if (!main) return;

    // Nav activo
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    AuraStore.set('currentPage', page);
    _current = page;

    // Renderizar
    if (_pages[page]) {
      main.innerHTML = '';
      const content = _pages[page](params);
      if (typeof content === 'string') {
        main.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        main.appendChild(content);
      }
    } else {
      main.innerHTML = `
        <div class="page empty-state">
          <div class="empty-state__icon">🚧</div>
          <div class="empty-state__title">Próximamente</div>
          <div class="empty-state__text">Esta sección está en desarrollo</div>
        </div>`;
    }

    // Título
    const titles = {
      home:'Inicio', ecos:'Ecos', communities:'Red',
      profile:'Perfil', search:'Buscar', chat:'Mensajes',
      settings:'Ajustes', notifications:'Notificaciones',
      karma:'Aura Score', media:'Galería',
    };
    if (title) title.textContent = titles[page] || page;

    main.scrollTop = 0;
    document.dispatchEvent(new CustomEvent('aura:navigate', { detail: { page, params } }));
  }

  function current() { return _current; }

  return { register, navigate, current };
})();
