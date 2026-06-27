/* ============================================
   AURA — toast.js
   Notificaciones flotantes
   ============================================ */

window.AuraToast = (() => {
  function show(message, type = 'default', duration = 3000) {
    const container = document.getElementById('toasts');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast${type !== 'default' ? ` toast--${type}` : ''}`;

    const icons = { success: '✓', error: '✕', warning: '⚠', default: '✦' };
    toast.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { show };
})();
