/* ============================================
   AURA — search.js
   Búsqueda real con filtros, historial y tendencias
   ============================================ */

window.AuraSearch = (() => {
  let _history = AuraStore.load('search_history', []);
  let _timer = null;

  const _trending = [
    { tag:'#AuraApp',       count:'24.5K ecos' },
    { tag:'#EcosVirales',   count:'18.2K ecos' },
    { tag:'#SubAuras',      count:'12.1K ecos' },
    { tag:'#RedesDelFuturo',count:'9.8K ecos'  },
    { tag:'#AuraScore',     count:'7.3K ecos'  },
  ];

  const _mockUsers = [
    { name:'Luna García',   handle:'@luna',    bio:'Fotógrafa ✈️',      aura:892  },
    { name:'Mateo Ruiz',    handle:'@mateo.r', bio:'Músico 🎵',          aura:654  },
    { name:'Sofía Mendez',  handle:'@sofi_m',  bio:'Diseñadora UX ☕',  aura:1204 },
    { name:'Carlos Torres', handle:'@carlos.t',bio:'Dev 💻',             aura:445  },
    { name:'Elena Vega',    handle:'@elena.v', bio:'Creadora 🔥',        aura:2100 },
  ];

  const _mockPosts = [
    { user:'Luna García', handle:'@luna', content:'La magia de Aura ✨ Esta app cambió mi forma de compartir', likes:'142' },
    { user:'Sofía M.',    handle:'@sofi_m', content:'Hilo sobre diseño en Aura 🧵 El futuro de las redes', likes:'890' },
    { user:'Elena Vega',  handle:'@elena.v', content:'Sin miedo al éxito 🔥 #AuraApp', likes:'1.2K' },
  ];

  // ── BUSCAR ──
  function query(term) {
    clearTimeout(_timer);
    if (!term || term.length < 2) {
      renderDefault();
      return;
    }
    _timer = setTimeout(() => {
      const t = term.toLowerCase();
      const users = _mockUsers.filter(u =>
        u.name.toLowerCase().includes(t) || u.handle.toLowerCase().includes(t) || u.bio.toLowerCase().includes(t)
      );
      const posts = _mockPosts.filter(p =>
        p.content.toLowerCase().includes(t) || p.user.toLowerCase().includes(t)
      );
      renderResults(term, users, posts);
    }, 280);
  }

  function renderDefault() {
    const el = document.getElementById('search-body');
    if (!el) return;
    el.innerHTML = `
      ${_history.length > 0 ? `
        <div style="padding:0 16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0 8px;">
            <span style="font-size:13px;font-weight:700;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:.4px;">Recientes</span>
            <button onclick="AuraSearch.clearHistory()" style="font-size:13px;color:var(--color-primary);cursor:pointer;">Borrar</button>
          </div>
          ${_history.slice(0,5).map(h => `
            <div onclick="AuraSearch.setQuery('${h}')"
              style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--color-border);cursor:pointer;">
              <span style="color:var(--color-text-muted);">🕐</span>
              <span style="font-size:15px;">${h}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="padding:0 16px;margin-top:8px;">
        <div style="font-size:13px;font-weight:700;color:var(--color-text-secondary);
          text-transform:uppercase;letter-spacing:.4px;padding:10px 0 8px;">Tendencias</div>
        ${_trending.map(t => `
          <div onclick="AuraSearch.setQuery('${t.tag}')"
            style="display:flex;justify-content:space-between;align-items:center;
            padding:12px 0;border-bottom:1px solid var(--color-border);cursor:pointer;">
            <div>
              <div style="font-size:15px;font-weight:600;color:var(--color-primary);">${t.tag}</div>
              <div style="font-size:12px;color:var(--color-text-muted);">${t.count}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderResults(term, users, posts) {
    const el = document.getElementById('search-body');
    if (!el) return;
    el.innerHTML = `
      ${users.length > 0 ? `
        <div style="padding:0 16px;">
          <div style="font-size:13px;font-weight:700;color:var(--color-text-secondary);
            text-transform:uppercase;letter-spacing:.4px;padding:10px 0 6px;">Personas</div>
          ${users.map(u => `
            <div class="user-item" style="padding:10px 0;">
              <div class="avatar avatar-md" style="background:var(--gradient-soft);
                display:flex;align-items:center;justify-content:center;
                font-weight:700;color:var(--color-primary);">${u.name[0]}</div>
              <div class="user-item__info">
                <div class="user-item__name">${u.name}</div>
                <div class="user-item__bio">${u.bio} · ✦ ${u.aura}</div>
              </div>
              <button class="btn-follow" onclick="AuraToast.show('Siguiendo a ${u.name} ✦','success')">Seguir</button>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${posts.length > 0 ? `
        <div style="padding:0 16px;margin-top:8px;">
          <div style="font-size:13px;font-weight:700;color:var(--color-text-secondary);
            text-transform:uppercase;letter-spacing:.4px;padding:10px 0 6px;">Ecos</div>
          ${posts.map(p => `
            <div style="padding:12px 0;border-bottom:1px solid var(--color-border);">
              <div style="font-size:13px;font-weight:600;">${p.user} <span style="color:var(--color-text-muted);font-weight:400;">${p.handle}</span></div>
              <div style="font-size:14px;margin-top:4px;line-height:1.5;">${p.content}</div>
              <div style="font-size:12px;color:var(--color-text-muted);margin-top:4px;">❤️ ${p.likes}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${users.length === 0 && posts.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__title">Sin resultados</div>
          <div class="empty-state__text">No encontramos nada para "${term}"</div>
        </div>
      ` : ''}
    `;
  }

  function setQuery(term) {
    const input = document.getElementById('search-input');
    if (input) { input.value = term; input.focus(); }
    saveHistory(term);
    query(term);
  }

  function saveHistory(term) {
    _history = [term, ..._history.filter(h => h !== term)].slice(0, 10);
    AuraStore.persist('search_history', _history);
  }

  function clearHistory() {
    _history = [];
    AuraStore.persist('search_history', []);
    renderDefault();
  }

  function render() {
    return `
      <div class="page">
        <div style="padding:12px 16px;">
          <div style="position:relative;">
            <input id="search-input" class="input-field input-field--search"
              placeholder="Buscar en Aura..."
              oninput="AuraSearch.query(this.value)"
              onfocus="AuraSearch.renderDefault()"
              style="width:100%;">
          </div>
        </div>
        <div class="tabs">
          <button class="tab-btn active" onclick="AuraSearch.switchTab(this,'todo')">Todo</button>
          <button class="tab-btn" onclick="AuraSearch.switchTab(this,'personas')">Personas</button>
          <button class="tab-btn" onclick="AuraSearch.switchTab(this,'ecos')">Ecos</button>
          <button class="tab-btn" onclick="AuraSearch.switchTab(this,'subauras')">SubAuras</button>
        </div>
        <div id="search-body"></div>
      </div>
    `;
  }

  function switchTab(btn, tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function init() {
    AuraRouter.register('search', () => {
      const html = render();
      setTimeout(() => renderDefault(), 50);
      return html;
    });
  }

  return { init, query, render, renderDefault, setQuery, clearHistory, switchTab };
})();