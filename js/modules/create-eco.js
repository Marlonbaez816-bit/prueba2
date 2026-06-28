/* ============================================
   AURA — create-eco.js
   Crear Ecos reales: texto, foto, video, audio, hilo
   Con previsualización antes de publicar
   ============================================ */

window.AuraCreate = (() => {
  let _draft = { type:'text', content:'', media:null, mediaType:null, subaura:'', tags:[] };

  // ── ABRIR CREATOR ──
  function open(type = 'text') {
    _draft = { type, content:'', media:null, mediaType:null, subaura:'', tags:[] };
    AuraModal.show({
      title: null,
      content: _renderCreator(type)
    });
  }

  function _renderCreator(type) {
    const user = AuraAuth.currentUser();
    const initials = user ? user.name[0] : 'A';
    return `
      <div style="display:flex;flex-direction:column;gap:0;">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <button onclick="AuraModal.close()" style="font-size:15px;color:var(--color-text-secondary);cursor:pointer;">Cancelar</button>
          <span style="font-size:16px;font-weight:700;">Nuevo Eco</span>
          <button onclick="AuraCreate.publish()" class="btn btn-primary btn-sm" id="publish-btn" disabled>Publicar</button>
        </div>

        <!-- Tipo de Eco -->
        <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:12px;scrollbar-width:none;">
          ${[['📝','Texto','text'],['📷','Foto','photo'],['🎬','Video','video'],['🎵','Audio','audio'],['🧵','Hilo','thread']].map(([icon,label,t]) => `
            <button onclick="AuraCreate.switchType('${t}')"
              id="type-${t}"
              style="display:flex;flex-direction:column;align-items:center;gap:4px;
              padding:8px 14px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;
              background:${type===t?'var(--color-primary-soft)':'var(--color-bg-input)'};
              color:${type===t?'var(--color-primary)':'var(--color-text-secondary)'};
              border:1.5px solid ${type===t?'var(--color-primary-light)':'transparent'};
              cursor:pointer;transition:all .12s;flex-shrink:0;">
              <span style="font-size:18px;">${icon}</span>${label}
            </button>
          `).join('')}
        </div>

        <!-- Área de composición -->
        <div style="display:flex;gap:12px;padding-top:4px;">
          <div class="avatar avatar-md" style="background:var(--gradient-soft);
            display:flex;align-items:center;justify-content:center;
            font-weight:700;color:var(--color-primary);flex-shrink:0;">${initials}</div>
          <div style="flex:1;">
            <textarea id="eco-text" rows="4"
              placeholder="${_placeholder(type)}"
              oninput="AuraCreate.onInput(this)"
              style="width:100%;background:none;border:none;outline:none;resize:none;
              font-size:16px;line-height:1.6;color:var(--color-text-primary);
              font-family:-apple-system,BlinkMacSystemFont,sans-serif;"></textarea>

            <!-- Previsualización de media -->
            <div id="media-preview" style="margin-top:8px;"></div>

            <!-- SubAura -->
            <div style="margin-top:8px;">
              <input id="subaura-input" placeholder="SubAura (opcional)" 
                oninput="_draft.subaura=this.value"
                style="background:var(--color-bg-input);border-radius:20px;padding:6px 14px;
                font-size:13px;width:100%;border:none;outline:none;color:var(--color-text-primary);">
            </div>
          </div>
        </div>

        <!-- Acciones de media -->
        <div style="border-top:1px solid var(--color-border);margin-top:16px;padding-top:12px;
          display:flex;align-items:center;gap:4px;">
          <button onclick="AuraCreate.attachMedia('image')" class="icon-btn" title="Foto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button onclick="AuraCreate.attachMedia('video')" class="icon-btn" title="Video">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </button>
          <button onclick="AuraCreate.recordAudio()" class="icon-btn" title="Audio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </button>
          <div style="margin-left:auto;font-size:13px;color:var(--color-text-muted);" id="char-count">0 / 500</div>
        </div>

        <input type="file" id="media-input" accept="image/*,video/*" style="display:none"
          onchange="AuraCreate.handleMedia(this.files[0])">
      </div>
    `;
  }

  function _placeholder(type) {
    const map = {
      text:   '¿Qué quieres compartir?',
      photo:  'Describe tu foto...',
      video:  'Describe tu Eco de video...',
      audio:  '¿Sobre qué es tu audio?',
      thread: 'Comienza tu hilo... (1/n)',
    };
    return map[type] || '¿Qué quieres compartir?';
  }

  function switchType(type) {
    _draft.type = type;
    document.querySelectorAll('[id^="type-"]').forEach(b => {
      const t = b.id.replace('type-','');
      b.style.background = t === type ? 'var(--color-primary-soft)' : 'var(--color-bg-input)';
      b.style.color = t === type ? 'var(--color-primary)' : 'var(--color-text-secondary)';
      b.style.borderColor = t === type ? 'var(--color-primary-light)' : 'transparent';
    });
    const ta = document.getElementById('eco-text');
    if (ta) ta.placeholder = _placeholder(type);
    if (type === 'photo' || type === 'video') attachMedia(type === 'photo' ? 'image' : 'video');
    if (type === 'audio') recordAudio();
  }

  function onInput(ta) {
    _draft.content = ta.value;
    const count = ta.value.length;
    const el = document.getElementById('char-count');
    if (el) {
      el.textContent = `${count} / 500`;
      el.style.color = count > 450 ? 'var(--color-error)' : 'var(--color-text-muted)';
    }
    const btn = document.getElementById('publish-btn');
    if (btn) btn.disabled = count === 0 && !_draft.media;
  }

  function attachMedia(type) {
    const input = document.getElementById('media-input');
    if (input) {
      input.accept = type === 'image' ? 'image/*' : 'video/*';
      input.click();
    }
  }

  function handleMedia(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      _draft.media = e.target.result;
      _draft.mediaType = file.type.startsWith('video') ? 'video' : 'image';
      const preview = document.getElementById('media-preview');
      if (preview) {
        preview.innerHTML = _draft.mediaType === 'video'
          ? `<div style="position:relative;border-radius:12px;overflow:hidden;">
               <video src="${_draft.media}" style="width:100%;max-height:200px;object-fit:cover;" controls></video>
               <button onclick="AuraCreate.removeMedia()" style="position:absolute;top:8px;right:8px;
                 background:rgba(0,0,0,.5);border-radius:50%;width:28px;height:28px;color:white;font-size:16px;cursor:pointer;">✕</button>
             </div>`
          : `<div style="position:relative;border-radius:12px;overflow:hidden;">
               <img src="${_draft.media}" style="width:100%;max-height:200px;object-fit:cover;">
               <button onclick="AuraCreate.removeMedia()" style="position:absolute;top:8px;right:8px;
                 background:rgba(0,0,0,.5);border-radius:50%;width:28px;height:28px;color:white;font-size:16px;cursor:pointer;">✕</button>
             </div>`;
      }
      const btn = document.getElementById('publish-btn');
      if (btn) btn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  function removeMedia() {
    _draft.media = null; _draft.mediaType = null;
    const preview = document.getElementById('media-preview');
    if (preview) preview.innerHTML = '';
  }

  function recordAudio() {
    AuraToast.show('Grabación de audio próximamente 🎙️', 'warning');
  }

  // ── PUBLICAR ──
  function publish() {
    if (!_draft.content && !_draft.media) return;
    const user = AuraAuth.currentUser();
    const post = {
      id: Date.now(),
      type: _draft.type,
      user: { name: user?.name || 'Anon', handle: user?.handle || '@anon', verified: false },
      content: _draft.content,
      media: _draft.media,
      mediaType: _draft.mediaType,
      subaura: _draft.subaura || null,
      time: 'ahora',
      likes: 0, comments: 0, shares: 0,
    };
    // Guardar en store
    const posts = AuraStore.load('user_posts', []);
    posts.unshift(post);
    AuraStore.persist('user_posts', posts);

    AuraModal.close();
    AuraToast.show('¡Eco publicado! ✦', 'success');
    AuraKarma?.add(10, 'Nuevo Eco publicado');

    // Ir al feed
    setTimeout(() => AuraRouter.navigate('home'), 300);
  }

  function init() {
    // Registrar acciones del botón crear
    document.querySelector('[data-action="create"]')?.addEventListener('click', () => open('text'));
  }

  return { init, open, switchType, onInput, attachMedia, handleMedia, removeMedia, recordAudio, publish };
})();