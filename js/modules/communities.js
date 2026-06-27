/* ============================================
   AURA — communities.js
   Red de amistad y comunidades
   ============================================ */

window.AuraCommunities = (() => {
  const _mockUsers = [
    { id: 1, name: 'Luna García', handle: '@luna', bio: 'Fotógrafa & viajera ✈️', aura: 892, following: false },
    { id: 2, name: 'Mateo Ruiz', handle: '@mateo.r', bio: 'Músico independiente 🎵', aura: 654, following: true },
    { id: 3, name: 'Sofía Mendez', handle: '@sofi_m', bio: 'Diseñadora UX · amante del café ☕', aura: 1204, following: false },
    { id: 4, name: 'Carlos Torres', handle: '@carlos.t', bio: 'Dev 💻 · open source', aura: 445, following: true },
  ];

  const _mockCommunities = [
    { id: 1, name: 'Fotografía Aura', members: 4821, icon: '📷', color: '#7C3AED' },
    { id: 2, name: 'Música & Ecos', members: 3102, icon: '🎵', color: '#EC4899' },
    { id: 3, name: 'Tecnología', members: 9234, icon: '💻', color: '#0EA5E9' },
    { id: 4, name: 'Arte Digital', members: 2801, icon: '🎨', color: '#10B981' },
  ];

  function renderUserCard(user) {
    return `
      <div class="user-item">
        <div class="avatar avatar-md" style="background:var(--gradient-soft);display:flex;
          align-items:center;justify-content:center;font-weight:700;color:var(--color-primary);">
          ${user.name[0]}
        </div>
        <div class="user-item__info">
          <div class="user-item__name">${user.name}</div>
          <div class="user-item__bio">${user.bio}</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
            <span style="font-size:11px;background:var(--gradient-primary);
              -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
              font-weight:700;">✦ ${user.aura} Aura</span>
          </div>
        </div>
        <button class="btn-follow ${user.following ? 'following' : ''}"
          onclick="AuraCommunities.toggleFollow(this, ${user.id})">
          ${user.following ? 'Siguiendo' : 'Seguir'}
        </button>
      </div>
    `;
  }

  function toggleFollow(btn, id) {
    const isFollowing = btn.classList.contains('following');
    btn.classList.toggle('following');
    btn.textContent = isFollowing ? 'Seguir' : 'Siguiendo';
    AuraToast.show(isFollowing ? 'Dejaste de seguir' : 'Agregado a tu Red ✦', isFollowing ? 'default' : 'success');
    const user = _mockUsers.find(u => u.id === id);
    if (user) user.following = !isFollowing;
  }

  function renderCommunityCard(c) {
    return `
      <div class="card gyro-card" onclick="AuraToast.show('${c.name} próximamente')"
        style="display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:8px;cursor:pointer;">
        <div style="width:48px;height:48px;border-radius:12px;background:${c.color}22;
          display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">
          ${c.icon}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:15px;">${c.name}</div>
          <div style="font-size:12px;color:var(--color-text-muted);">${c.members.toLocaleString()} miembros</div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();AuraToast.show('Unido a ${c.name} ✦', 'success')">
          Unirse
        </button>
      </div>
    `;
  }

  function render() {
    return `
      <div class="page">
        <div style="padding:16px;">
          <input class="input-field input-field--search" placeholder="Buscar personas o comunidades...">
        </div>
        <div class="tabs">
          <button class="tab-btn active" onclick="AuraCommunities.switchTab(this,'sugeridos')">Sugeridos</button>
          <button class="tab-btn" onclick="AuraCommunities.switchTab(this,'comunidades')">SubAuras</button>
          <button class="tab-btn" onclick="AuraCommunities.switchTab(this,'red')">Mi Red</button>
        </div>
        <div id="community-tab-content" style="padding-top:8px;">
          ${_mockUsers.map(renderUserCard).join('')}
        </div>
      </div>
    `;
  }

  function switchTab(btn, tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const content = document.getElementById('community-tab-content');
    if (!content) return;
    if (tab === 'sugeridos') {
      content.innerHTML = _mockUsers.map(renderUserCard).join('');
    } else if (tab === 'comunidades') {
      content.innerHTML = `<div style="padding:8px 16px 0;">${_mockCommunities.map(renderCommunityCard).join('')}</div>`;
    } else {
      content.innerHTML = `<div class="empty-state">
        <div class="empty-state__icon">🌐</div>
        <div class="empty-state__title">Tu Red está vacía</div>
        <div class="empty-state__text">Sigue personas para construir tu red de amistad</div>
      </div>`;
    }
  }

  function init() {
    AuraRouter.register('communities', render);
  }

  return { init, render, toggleFollow, switchTab };
})();
