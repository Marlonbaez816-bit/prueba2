/* ============================================
   AURA — feed.js
   Página de inicio con feed de Ecos
   ============================================ */

window.AuraFeed = (() => {
  const _mockPosts = [
    {
      id: 1, type: 'text',
      user: { name: 'Luna García', handle: '@luna', avatar: null, verified: true },
      content: '¡Aura acaba de llegar y ya no puedo imaginarme sin ella! ✨ La forma en que agrupa mis fotos es mágica.',
      time: 'hace 2m', likes: 142, comments: 28, shares: 14,
      subaura: 'Tecnología', thread: true,
    },
    {
      id: 2, type: 'image',
      user: { name: 'Mateo Ruiz', handle: '@mateo.r', avatar: null, verified: false },
      content: 'Atardecer desde mi ventana 🌅 Algunos momentos merecen ser compartidos.',
      time: 'hace 15m', likes: 89, comments: 12, shares: 5,
      media: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
      subaura: null, thread: false,
    },
    {
      id: 3, type: 'text',
      user: { name: 'Sofía Mendez', handle: '@sofi_m', avatar: null, verified: false },
      content: 'Hilo sobre por qué Aura va a cambiar las redes sociales 🧵 (1/5)',
      time: 'hace 1h', likes: 234, comments: 67, shares: 89,
      subaura: 'SubAura: Opinión', thread: true, thread_count: 5,
    },
    {
      id: 4, type: 'text',
      user: { name: 'Carlos Torres', handle: '@carlos.t', avatar: null, verified: true },
      content: 'El sistema de Aura Score me parece genial. Por fin una red que valora la calidad sobre la cantidad. Mi puntaje ya subió a 450 ✦',
      time: 'hace 3h', likes: 56, comments: 8, shares: 3,
      subaura: null, thread: false,
    },
  ];

  function renderPost(post) {
    const initials = post.user.name.split(' ').map(w => w[0]).join('').slice(0,2);
    return `
      <article class="eco-post${post.thread ? ' thread-container' : ''}">
        ${post.thread ? '<div class="thread-line"></div>' : ''}
        <div class="eco-post__header">
          <div class="avatar avatar-md avatar-ring" style="flex-shrink:0;">
            <div class="avatar-inner" style="display:flex;align-items:center;justify-content:center;
              background:var(--gradient-soft);font-weight:700;color:var(--color-primary);font-size:15px;">
              ${initials}
            </div>
          </div>
          <div class="eco-post__user">
            <div class="eco-post__name">
              ${post.user.name}
              ${post.user.verified ? '<span class="eco-post__verified">✦</span>' : ''}
              ${post.subaura ? `<a class="subaura-badge" href="#">${post.subaura}</a>` : ''}
            </div>
            <div class="eco-post__handle">${post.user.handle} · <span class="eco-post__time">${post.time}</span></div>
          </div>
          <button class="icon-btn" onclick="AuraToast.show('Opciones del Eco')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>

        <p class="eco-post__content">${post.content}</p>

        ${post.media ? `<div class="eco-post__media"><img src="${post.media}" alt="Eco media" loading="lazy"></div>` : ''}

        ${post.thread_count ? `
          <div style="display:flex;align-items:center;gap:6px;padding:8px 0;font-size:13px;color:var(--color-primary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
            Ver hilo completo (${post.thread_count} ecos)
          </div>
        ` : ''}

        <div class="eco-post__actions">
          <button class="eco-action" onclick="AuraFeed.likePost(this, ${post.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="eco-action__count">${post.likes}</span>
          </button>
          <button class="eco-action" onclick="AuraToast.show('Comentarios próximamente')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="eco-action__count">${post.comments}</span>
          </button>
          <button class="eco-action" onclick="AuraToast.show('Compartido ✦', 'success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span class="eco-action__count">${post.shares}</span>
          </button>
          <button class="eco-action" onclick="AuraToast.show('Guardado ✦', 'success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 21 12 16 5 21 5 3 19 3 19 21"/></svg>
          </button>
        </div>
      </article>
    `;
  }

  function likePost(btn, id) {
    btn.classList.toggle('eco-action--liked');
    btn.classList.add('animate-heart');
    setTimeout(() => btn.classList.remove('animate-heart'), 500);
    const count = btn.querySelector('.eco-action__count');
    const current = parseInt(count.textContent);
    count.textContent = btn.classList.contains('eco-action--liked') ? current + 1 : current - 1;
  }

  function renderStories() {
    const items = [
      { name: 'Tu Aura', add: true },
      { name: 'Luna', seen: false },
      { name: 'Mateo', seen: false },
      { name: 'Sofía', seen: true },
      { name: 'Carlos', seen: false },
      { name: 'Elena', seen: true },
    ];

    return `<div class="auras-row">
      ${items.map(item => `
        <div class="aura-item" onclick="AuraToast.show('${item.add ? 'Crear tu Aura' : `Viendo Aura de ${item.name}`}')">
          <div class="aura-ring ${item.seen ? 'aura-ring--seen' : ''} ${item.add ? 'aura-ring--add' : ''}">
            <div class="aura-ring__inner" style="display:flex;align-items:center;justify-content:center;
              background:var(--gradient-soft);font-size:18px;">
              ${item.add ? '<span style="font-size:22px;color:var(--color-primary)">+</span>' : item.name[0]}
            </div>
          </div>
          <span class="aura-item__name">${item.name}</span>
        </div>
      `).join('')}
    </div>`;
  }

  function render() {
    return `
      <div class="page">
        ${renderStories()}
        <div class="divider--thick"></div>
        <div class="chips-row">
          ${['Para ti','Siguiendo','Tendencias','SubAuras','Cercanos'].map((t,i) =>
            `<button class="chip ${i===0?'active':''}" onclick="this.closest('.chips-row').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));this.classList.add('active')">${t}</button>`
          ).join('')}
        </div>
        <div id="feed-list">
          ${_mockPosts.map(renderPost).join('')}
        </div>
        <div style="padding:32px 16px;text-align:center;">
          <button class="btn btn-secondary" onclick="AuraToast.show('Cargando más Ecos...')">Cargar más</button>
        </div>
      </div>
    `;
  }

  function init() {
    AuraRouter.register('home', render);
  }

  return { init, render, likePost };
})();
