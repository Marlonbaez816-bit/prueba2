/* ============================================
   AURA — ai-assistant.js
   Botón flotante de IA (arrastrable)
   ============================================ */

window.AuraAI = (() => {
  let btn, isDragging = false, startX, startY, initX, initY;

  function init() {
    if (!AURA_CONFIG.modules.ai_assistant) return;
    btn = document.getElementById('aura-ai-btn');
    if (!btn) return;

    // Touch drag
    btn.addEventListener('touchstart', onDragStart, { passive: true });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // Mouse drag
    btn.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // Tap to open
    btn.addEventListener('click', onTap);
  }

  function onDragStart(e) {
    isDragging = false;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    const rect = btn.getBoundingClientRect();
    initX = rect.left;
    initY = rect.top;
  }

  function onDragMove(e) {
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const x = initX + dx;
    const y = initY + dy;
    btn.style.left = `${x}px`;
    btn.style.top  = `${y}px`;
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
  }

  function onTap(e) {
    if (isDragging) return;
    openAssistant();
  }

  function openAssistant() {
    AuraModal.show({
      title: '✦ Asistente Aura',
      content: `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <p style="font-size:13px;color:var(--color-text-secondary);text-align:center;">¿Qué quieres hacer?</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${[
              ['🗑️', 'Borrar publicación', () => AuraToast.show('Selecciona la publicación')],
              ['✍️', 'Escribir mensaje', () => AuraRouter.navigate('chat')],
              ['🎵', 'Reproducir música', () => AuraToast.show('Spotify próximamente', 'warning')],
              ['📺', 'Ver TV', () => AuraToast.show('TV en vivo próximamente', 'warning')],
              ['📞', 'Llamar', () => AuraToast.show('Llamadas próximamente', 'warning')],
              ['🎨', 'Cambiar tema', () => { AuraModal.close(); AuraModal.show({ title: 'Elige tu tema', content: AuraTheme.renderPicker() }); }],
            ].map(([icon, label, action]) => `
              <button onclick="(${action.toString()})()" style="
                display:flex;flex-direction:column;align-items:center;gap:6px;
                background:var(--color-bg-input);border-radius:12px;padding:16px 8px;
                font-size:13px;font-weight:500;color:var(--color-text-primary);cursor:pointer;
                transition:background .15s;border:1px solid var(--color-border);">
                <span style="font-size:24px;">${icon}</span>
                <span>${label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `
    });
  }

  return { init, openAssistant };
})();
