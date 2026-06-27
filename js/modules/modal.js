/* ============================================
   AURA — modal.js
   Bottom sheet modals
   ============================================ */

window.AuraModal = (() => {
  function show({ title, content, onClose }) {
    const container = document.getElementById('modals');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop"></div>
      <div class="modal" id="modal-panel" role="dialog" aria-modal="true">
        <div class="modal__handle"></div>
        ${title ? `<div class="modal__title">${title}</div>` : ''}
        <div class="modal__body">${content}</div>
      </div>
    `;

    container.style.pointerEvents = 'all';

    const close = () => {
      const panel = document.getElementById('modal-panel');
      const backdrop = document.getElementById('modal-backdrop');
      if (panel) panel.style.animation = 'slideDown var(--duration-normal) var(--ease-smooth) forwards';
      if (backdrop) backdrop.style.animation = 'fadeIn var(--duration-normal) var(--ease-smooth) reverse forwards';
      setTimeout(() => {
        container.innerHTML = '';
        container.style.pointerEvents = 'none';
        if (onClose) onClose();
      }, 280);
    };

    document.getElementById('modal-backdrop')?.addEventListener('click', close);
    document.dispatchEvent(new CustomEvent('aura:modal:open'));

    return { close };
  }

  function close() {
    const container = document.getElementById('modals');
    if (container) { container.innerHTML = ''; container.style.pointerEvents = 'none'; }
  }

  return { show, close };
})();
