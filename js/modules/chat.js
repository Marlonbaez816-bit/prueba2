/* ============================================
   AURA — chat.js
   Mensajes directos y comunidades
   ============================================ */

window.AuraChat = (() => {
  const _mockChats = [
    { id: 1, name: 'Luna García', handle: '@luna', last: '¡Gracias por el Eco! ✦', time: '2m', unread: 2, online: true },
    { id: 2, name: 'Mateo Ruiz', handle: '@mateo.r', last: '¿Viste el Eco de hoy?', time: '15m', unread: 0, online: true },
    { id: 3, name: 'Comunidad Aura', handle: 'Grupo · 128 miembros', last: 'Sofía: Bienvenidos todos 🎉', time: '1h', unread: 5, online: false, isGroup: true },
    { id: 4, name: 'Sofía Mendez', handle: '@sofi_m', last: 'Excelente idea para el hilo', time: '3h', unread: 0, online: false },
  ];

  function renderChatList() {
    return _mockChats.map(chat => `
      <div class="user-item" onclick="AuraChat.openChat(${chat.id})">
        <div style="position:relative;">
          <div class="avatar avatar-md" style="background:var(--gradient-soft);display:flex;
            align-items:center;justify-content:center;font-weight:700;color:var(--color-primary);">
            ${chat.isGroup ? '👥' : chat.name[0]}
          </div>
          ${chat.online ? `<div style="position:absolute;bottom:0;right:0;width:12px;height:12px;
            border-radius:50%;background:#10B981;border:2px solid var(--color-bg);"></div>` : ''}
        </div>
        <div class="user-item__info">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="user-item__name">${chat.name}</div>
            <div style="font-size:11px;color:var(--color-text-muted);">${chat.time}</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
            <div class="user-item__bio">${chat.last}</div>
            ${chat.unread > 0 ? `<div class="badge" style="position:static;margin-left:8px;">${chat.unread}</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  function openChat(id) {
    const chat = _mockChats.find(c => c.id === id);
    if (!chat) return;

    const messages = [
      { out: false, text: `¡Hola! Bienvenido a Aura ✦`, time: '10:30' },
      { out: true,  text: '¡Gracias! Esta app es increíble', time: '10:31' },
      { out: false, text: chat.last, time: '10:35' },
    ];

    AuraModal.show({
      title: chat.name,
      content: `
        <div style="display:flex;flex-direction:column;height:60dvh;">
          <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding-bottom:8px;">
            ${messages.map(m => `
              <div style="display:flex;justify-content:${m.out?'flex-end':'flex-start'};">
                <div class="chat-bubble chat-bubble--${m.out?'out':'in'}">
                  ${m.text}
                  <div style="font-size:10px;opacity:0.7;margin-top:4px;text-align:right;">${m.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <input class="input-field" id="chat-input" placeholder="Escribe un mensaje..." style="flex:1;">
            <button onclick="AuraChat._sendMessage()" class="btn btn-primary" style="flex-shrink:0;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      `
    });
  }

  function _sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';
    AuraToast.show('Mensaje enviado ✦', 'success');
  }

  function render() {
    return `
      <div class="page">
        <div style="padding:16px;">
          <input class="input-field input-field--search" placeholder="Buscar mensajes...">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 12px;">
          <span style="font-size:13px;font-weight:600;color:var(--color-text-secondary);">MENSAJES</span>
          <button class="btn btn-sm btn-secondary" onclick="AuraToast.show('Nueva comunidad próximamente', 'warning')">
            + Nueva
          </button>
        </div>
        ${renderChatList()}
      </div>
    `;
  }

  function init() {
    AuraRouter.register('chat', render);
  }

  return { init, render, openChat, _sendMessage };
})();
