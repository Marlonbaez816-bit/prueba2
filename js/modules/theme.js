/* ============================================
   AURA — theme.js
   Gestión de temas y personalización
   ============================================ */

window.AuraTheme = (() => {
  function apply(themeId) {
    const body = document.body;
    AURA_CONFIG.themes.forEach(t => body.classList.remove(t.id));
    body.classList.add(themeId);
    AuraStore.persist('theme', themeId);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', AURA_CONFIG.themes.find(t => t.id === themeId)?.color || '#7C3AED');
  }

  function current() {
    return AuraStore.get('theme');
  }

  function init() {
    apply(AuraStore.get('theme'));
  }

  function renderPicker() {
    return `
      <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:8px 0;">
        ${AURA_CONFIG.themes.map(t => `
          <button onclick="AuraTheme.apply('${t.id}'); AuraToast.show('Tema aplicado ✦', 'success');"
            style="display:flex;flex-direction:column;align-items:center;gap:6px;background:none;cursor:pointer;">
            <div style="width:44px;height:44px;border-radius:50%;background:${t.color};
              box-shadow:0 0 12px ${t.color}66;
              border:3px solid ${current()===t.id?'#fff':'transparent'};
              outline:2px solid ${current()===t.id?t.color:'transparent'};
              transition:all .2s;">
            </div>
            <span style="font-size:11px;color:var(--color-text-secondary)">${t.label}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  return { apply, current, init, renderPicker };
})();
