/* ============================================
   AURA — notifications.js
   Notificaciones reales con Push API + badge
   ============================================ */

window.AuraNotifications = (() => {
  const _mock = [
    { id:1, type:'like',    icon:'❤️', text:'<b>Luna García</b> le dio like a tu Eco', time:'hace 2m',  read:false },
    { id:2, type:'follow',  icon:'✦',  text:'<b>Mateo Ruiz</b> te siguió · +1 Aura',  time:'hace 15m', read:false },
    { id:3, type:'comment', icon:'💬', text:'<b>Sofía</b> comentó tu hilo',            time:'hace 1h',  read:false },
    { id:4, type:'share',   icon:'🔁', text:'<b>Carlos</b> compartió tu Eco',          time:'hace 3h',  read:true  },
    { id:5, type:'aura',    icon:'✨', text:'Tu Aura Score subió a <b>150</b>',        time:'hace 5h',  read:true  },
    { id:6, type:'mention', icon:'@',  text:'<b>Elena</b> te mencionó en un hilo',     time:'ayer',     read:true  },
  ];

  let _permission = 'default';

  // ── PEDIR PERMISO PUSH ──
  async function requestPermission() {
    if (!('Notification' in window)) {
      AuraToast.show('Tu navegador no soporta notificaciones', 'warning');
      return;
    }
    _permission = await Notification.requestPermission();
    if (_permission === 'granted') {
      AuraToast.show('Notificaciones activadas ✦', 'success');
      AuraStore.persist('notif_permission', 'granted');
    } else {
      AuraToast.show('Notificaciones denegadas', 'error');
    }
  }

  // ── ENVIAR NOTIFICACIÓN PUSH LOCAL ──
  function push(title, body, icon = '✦') {
    if (_permission !== 'granted') return;
    if (document.visibilityState === 'visible') {
      // App abierta: toast en vez de push
      AuraToast.show(`${icon} ${body}`);
      return;
    }
    new Notification(title, {
      body,
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/icon-192.png',
      vibrate: [100, 50, 100],
      tag: 'aura-notif',
    });
  }

  // ── ACTUALIZAR BADGE ──
  function updateBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count === 0) {
      badge.style.display = 'none';
    } else {
      badge.style.display = 'flex';
      badge.textContent = count > 99 ? '99+' : count;
    }
    // API de badge nativa (Android / iOS PWA)
    if ('setAppBadge' in navigator) navigator.setAppBadge(count).catch(() => {});
  }

  // ── MARCAR COMO LEÍDAS ──
  function markAllRead() {
    _mock.forEach(n => n.read = true);
    updateBadge(0);
  }

  // ── RENDER ──
  function render() {
    const unread = _mock.filter(n => !n.read).length;
    return `
      <div class="page">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;">
          <span style="font-size:13px;font-weight:600;color:var(--color-text-secondary);">
            ${unread} sin leer
          </span>
          <button onclick="AuraNotifications.markAllRead();AuraToast.show('Todo leído ✦','success');
            document.querySelectorAll('.notif-dot').forEach(d=>d.remove());"
            style="font-size:13px;color:var(--color-primary);font-weight:600;cursor:pointer;">
            Marcar todo leído
          </button>
        </div>

        ${_mock.map(n => `
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
            background:${n.read ? 'transparent' : 'var(--color-bg-overlay)'};
            border-bottom:1px solid var(--color-border);cursor:pointer;
            transition:background .12s;"
            onclick="AuraNotifications.tapNotif(${n.id})">
            <div style="width:42px;height:42px;border-radius:50%;
              background:var(--color-primary-soft);
              display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
              ${n.icon}
            </div>
            <div style="flex:1;">
              <div style="font-size:14px;line-height:1.5;">${n.text}</div>
              <div style="font-size:12px;color:var(--color-text-muted);margin-top:2px;">${n.time}</div>
            </div>
            ${!n.read ? '<div class="notif-dot" style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);flex-shrink:0;"></div>' : ''}
          </div>
        `).join('')}

        <div style="padding:20px;text-align:center;">
          <button onclick="AuraNotifications.requestPermission()" class="btn btn-secondary">
            🔔 Activar notificaciones push
          </button>
        </div>
      </div>
    `;
  }

  function tapNotif(id) {
    const n = _mock.find(x => x.id === id);
    if (n) {
      n.read = true;
      const unread = _mock.filter(x => !x.read).length;
      updateBadge(unread);
    }
  }

  function init() {
    AuraRouter.register('notifications', render);
    // Restaurar permiso guardado
    const saved = AuraStore.load('notif_permission');
    if (saved === 'granted') _permission = 'granted';
    // Badge inicial
    const unread = _mock.filter(n => !n.read).length;
    updateBadge(unread);
  }

  return { init, render, push, requestPermission, markAllRead, updateBadge, tapNotif };
})();