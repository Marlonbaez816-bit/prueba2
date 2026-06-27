/* ============================================
   AURA — app.js
   Punto de entrada principal
   Inicializa todos los módulos en orden
   ============================================ */

(function () {
  'use strict';

  function bootAura() {
    // 1. Tema
    AuraTheme.init();

    // 2. Registrar páginas en el router
    AuraFeed.init();
    AuraEcos.init();
    AuraChat.init();
    AuraCommunities.init();
    AuraProfile.init();
    AuraKarma.init();

    // 3. Módulos de hardware / UX
    AuraGyro.init();
    AuraAttention.init();
    AuraAI.init();

    // 4. Navegación bottom bar
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        AuraRouter.navigate(btn.dataset.page);
      });
    });

    // 5. Botón crear
    document.querySelector('[data-action="create"]')?.addEventListener('click', () => {
      AuraModal.show({
        title: 'Crear Eco',
        content: `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              ${[
                ['📝', 'Texto', 'Comparte tus pensamientos'],
                ['📷', 'Foto', 'Comparte una imagen'],
                ['🎬', 'Video Eco', 'Graba un Eco de video'],
                ['🎵', 'Audio', 'Eco de voz o música'],
                ['🧵', 'Hilo', 'Crea un hilo de Ecos'],
                ['📊', 'Encuesta', 'Pregunta a tu red'],
              ].map(([icon, label, sub]) => `
                <button onclick="AuraToast.show('${label} próximamente', 'warning');AuraModal.close();"
                  style="display:flex;flex-direction:column;align-items:center;gap:6px;
                  background:var(--color-bg-input);border-radius:12px;padding:16px 8px;cursor:pointer;
                  border:1px solid var(--color-border);transition:background .15s;">
                  <span style="font-size:28px;">${icon}</span>
                  <span style="font-size:14px;font-weight:600;">${label}</span>
                  <span style="font-size:11px;color:var(--color-text-muted);text-align:center;">${sub}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `
      });
    });

    // 6. Botón notificaciones
    document.getElementById('btn-notifications')?.addEventListener('click', () => {
      AuraModal.show({
        title: 'Notificaciones',
        content: `
          <div style="display:flex;flex-direction:column;gap:2px;">
            ${[
              { icon: '❤️', text: '<b>Luna García</b> le dio like a tu Eco', time: 'hace 2m' },
              { icon: '✦', text: '<b>Mateo</b> te siguió · +1 Aura', time: 'hace 15m' },
              { icon: '💬', text: '<b>Sofía</b> comentó tu hilo', time: 'hace 1h' },
              { icon: '🔁', text: '<b>Carlos</b> compartió tu Eco', time: 'hace 3h' },
            ].map(n => `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 0;
                border-bottom:1px solid var(--color-border);">
                <span style="font-size:20px;">${n.icon}</span>
                <div style="flex:1;font-size:14px;">${n.text}</div>
                <div style="font-size:11px;color:var(--color-text-muted);white-space:nowrap;">${n.time}</div>
              </div>
            `).join('')}
          </div>
        `
      });
      const badge = document.getElementById('notif-badge');
      if (badge) badge.style.display = 'none';
    });

    // 7. Botón buscar
    document.getElementById('btn-search')?.addEventListener('click', () => {
      AuraModal.show({
        title: 'Buscar en Aura',
        content: `
          <div style="display:flex;flex-direction:column;gap:16px;">
            <input class="input-field input-field--search" placeholder="Buscar Ecos, personas, SubAuras..."
              autofocus oninput="AuraSearch.query(this.value)">
            <div id="search-results">
              <div style="font-size:13px;font-weight:600;color:var(--color-text-secondary);margin-bottom:8px;">TENDENCIAS</div>
              ${['#AuraApp','#EcosVirales','#SubAura','#RedesDelFuturo'].map(t => `
                <div style="padding:10px 0;border-bottom:1px solid var(--color-border);
                  font-size:15px;cursor:pointer;color:var(--color-primary);" 
                  onclick="AuraToast.show('Buscando ${t}...')">
                  ${t}
                </div>
              `).join('')}
            </div>
          </div>
        `
      });
    });

    // 8. Navegar a home
    AuraRouter.navigate('home');

    // 9. Splash → app
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      const app    = document.getElementById('app');
      if (splash) splash.classList.add('fade-out');
      setTimeout(() => {
        if (splash) splash.style.display = 'none';
        if (app) app.classList.remove('hidden');
        // Auth check
        AuraAuth.init();
      }, 400);
    }, 1600);
  }

  // Esperar DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAura);
  } else {
    bootAura();
  }

  // Búsqueda simple (stub)
  window.AuraSearch = {
    query(term) {
      const el = document.getElementById('search-results');
      if (!el || !term) return;
      el.innerHTML = `<div style="font-size:14px;color:var(--color-text-muted);text-align:center;padding:20px;">
        Buscando "${term}"... (próximamente conectado a base de datos)
      </div>`;
    }
  };

})();
