/* ============================================
   AURA — ecos.js
   Ecos de video (estilo reels) + tabs
   ============================================ */

window.AuraEcos = (() => {
  const _mockEcos = [
    { id: 1, user: 'Luna García', handle: '@luna', likes: '12.4K', comments: '342', aura_score: 89,
      bg: 'linear-gradient(135deg,#667eea,#764ba2)', emoji: '🌙', caption: 'La magia de vivir sin filtros ✨' },
    { id: 2, user: 'Mateo Ruiz', handle: '@mateo.r', likes: '8.1K', comments: '156', aura_score: 67,
      bg: 'linear-gradient(135deg,#f093fb,#f5576c)', emoji: '🎵', caption: 'Este sonido me tiene obsesionado 🔥' },
    { id: 3, user: 'Sofía M.', handle: '@sofi_m', likes: '24.7K', comments: '890', aura_score: 95,
      bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', emoji: '🌊', caption: 'El mar siempre tiene la respuesta' },
  ];

  function renderEco(eco) {
    return `
      <div class="eco-video-item" style="background:${eco.bg};">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:80px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${eco.emoji}</span>
        </div>
        <div class="eco-video-overlay">
          <div style="display:flex;align-items:flex-end;gap:12px;">
            <div style="flex:1;">
              <div style="font-size:15px;font-weight:700;color:white;margin-bottom:4px;">${eco.user}</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-bottom:8px;">${eco.caption}</div>
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="background:rgba(255,255,255,0.2);border-radius:20px;padding:4px 10px;
                  font-size:12px;color:white;font-weight:600;">✦ ${eco.aura_score} Aura</div>
              </div>
            </div>
          </div>
        </div>
        <div class="eco-video-actions">
          <div class="eco-video-action" onclick="AuraToast.show('¡Te encantó! ✦', 'success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>${eco.likes}</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('Comentarios próximamente')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>${eco.comments}</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('Compartido ✦', 'success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span>Eco</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('Guardado ✦', 'success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 21 12 16 5 21 5 3 19 3 19 21"/></svg>
            <span>Guardar</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('SubEco próximamente', 'warning')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span>SubEco</span>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    return `
      <div class="page" style="padding:0;">
        <div class="eco-video-container attention-fade">
          ${_mockEcos.map(renderEco).join('')}
          <div class="eco-video-item" style="background:#1A1A2E;display:flex;align-items:center;justify-content:center;">
            <div style="text-align:center;color:white;padding:32px;">
              <div style="font-size:48px;margin-bottom:16px;">🎬</div>
              <div style="font-size:18px;font-weight:700;margin-bottom:8px;">Más Ecos próximamente</div>
              <div style="font-size:14px;opacity:0.7;">Sube tu primer Eco y comparte tu mundo</div>
              <button class="btn" style="background:var(--gradient-primary);color:white;margin-top:20px;"
                onclick="AuraToast.show('Subir Ecos próximamente', 'warning')">
                + Crear Eco
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    AuraRouter.register('ecos', render);
  }

  return { init, render };
})();
