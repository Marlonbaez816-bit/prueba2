/* ============================================
   AURA — user-profile.js
   Ver perfil de otros usuarios
   ============================================ */

window.AuraUserProfile = (() => {

  async function openProfile(userId) {
    // Mostrar loading
    AuraModal.show({
      title: null,
      content: `
        <div style="display:flex;justify-content:center;align-items:center;padding:40px;">
          <div style="width:40px;height:40px;border-radius:50%;border:3px solid var(--color-primary);
            border-top-color:transparent;animation:spin .8s linear infinite;"></div>
        </div>
      `
    });

    try {
      // Cargar perfil desde Supabase
      let perfil;
      if (window.AuraDB && AuraDB.getClient()) {
        perfil = await AuraDB.getUsuario(userId);
      } else {
        // Fallback datos mock
        perfil = {
          id: userId,
          nombre: 'Usuario Aura',
          handle: '@usuario',
          bio: '✨ En Aura',
          aura_score: 0,
          avatar_url: null,
        };
      }
      _renderProfile(perfil);
    } catch(e) {
      AuraModal.close();
      AuraToast.show('No se pudo cargar el perfil', 'error');
    }
  }

  async function _renderProfile(perfil) {
    const yo = AuraAuth.currentUser();
    const esPropio = yo?.id === perfil.id;

    // Verificar si lo sigo
    let loSigo = false;
    if (!esPropio && window.AuraDB && AuraDB.getClient()) {
      try {
        const { data } = await AuraDB.getClient()
          .from('red_amistad')
          .select('id')
          .eq('seguidor_id', yo?.id)
          .eq('seguido_id', perfil.id)
          .single();
        loSigo = !!data;
      } catch(e) {}
    }

    // Contar seguidores y seguidos
    let seguidores = 0, siguiendo = 0, ecos = 0;
    if (window.AuraDB && AuraDB.getClient()) {
      try {
        const [s1, s2, e1] = await Promise.all([
          AuraDB.getClient().from('red_amistad').select('id', {count:'exact'}).eq('seguido_id', perfil.id),
          AuraDB.getClient().from('red_amistad').select('id', {count:'exact'}).eq('seguidor_id', perfil.id),
          AuraDB.getClient().from('ecos').select('id', {count:'exact'}).eq('user_id', perfil.id),
        ]);
        seguidores = s1.count || 0;
        siguiendo  = s2.count || 0;
        ecos       = e1.count || 0;
      } catch(e) {}
    }

    const initials = perfil.nombre?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'AU';

    AuraModal.show({
      title: null,
      content: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:0;">

          <!-- Cover -->
          <div style="width:calc(100% + 40px);margin:-24px -20px 0;height:110px;
            background:linear-gradient(135deg,#7c3aed,#ec4899);position:relative;margin-bottom:50px;">

            <!-- Avatar -->
            <div style="position:absolute;bottom:-44px;left:20px;">
              <div style="width:88px;height:88px;border-radius:50%;
                background:${perfil.avatar_url ? 'none' : 'linear-gradient(135deg,#ede9fe,#fce7f3)'};
                border:3px solid var(--color-bg);box-shadow:0 4px 16px rgba(124,58,237,.2);
                display:flex;align-items:center;justify-content:center;
                font-size:28px;font-weight:800;color:var(--color-primary);overflow:hidden;">
                ${perfil.avatar_url
                  ? `<img src="${perfil.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
                  : initials}
              </div>
            </div>

            <!-- Botón acción -->
            <div style="position:absolute;bottom:-36px;right:20px;">
              ${esPropio
                ? `<button onclick="AuraRouter.navigate('profile');AuraModal.close();"
                    class="btn btn-outline btn-sm">Editar perfil</button>`
                : `<button id="follow-btn-${perfil.id}"
                    onclick="AuraUserProfile.toggleFollow('${perfil.id}', this)"
                    class="btn ${loSigo ? 'btn-outline' : 'btn-primary'} btn-sm">
                    ${loSigo ? 'Siguiendo' : 'Seguir'}
                  </button>`
              }
            </div>
          </div>

          <!-- Info -->
          <div style="width:100%;padding:0 4px;">
            <div style="font-size:20px;font-weight:700;">${perfil.nombre}</div>
            <div style="font-size:14px;color:var(--color-text-muted);margin-top:2px;">${perfil.handle || ''}</div>
            ${perfil.bio ? `<div style="font-size:14px;margin-top:8px;line-height:1.5;color:var(--color-text-secondary);">${perfil.bio}</div>` : ''}

            <!-- Aura Score -->
            <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
              <div style="width:28px;height:28px;border-radius:50%;
                background:linear-gradient(135deg,#c4b5fd,#7c3aed);
                display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">✦</div>
              <span style="font-size:15px;font-weight:700;
                background:linear-gradient(135deg,#7c3aed,#ec4899);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                ${perfil.aura_score || 0} Aura
              </span>
            </div>

            <!-- Stats -->
            <div style="display:flex;gap:24px;margin-top:16px;padding-top:16px;
              border-top:1px solid var(--color-border);">
              <div style="text-align:center;cursor:pointer;">
                <div style="font-size:18px;font-weight:700;">${ecos}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Ecos</div>
              </div>
              <div style="text-align:center;cursor:pointer;"
                onclick="AuraUserProfile.showFollowers('${perfil.id}')">
                <div style="font-size:18px;font-weight:700;">${seguidores}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Red</div>
              </div>
              <div style="text-align:center;cursor:pointer;">
                <div style="font-size:18px;font-weight:700;">${siguiendo}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Siguiendo</div>
              </div>
            </div>
          </div>

          <!-- Tabs de contenido -->
          <div style="width:calc(100% + 40px);margin:16px -20px 0;
            border-bottom:1px solid var(--color-border);display:flex;">
            <button class="tab-btn active" style="flex:1;padding:12px;font-size:13px;font-weight:600;
              color:var(--color-primary);border-bottom:2px solid var(--color-primary);">Ecos</button>
            <button class="tab-btn" style="flex:1;padding:12px;font-size:13px;font-weight:600;
              color:var(--color-text-muted);" onclick="AuraToast.show('Media próximamente')">Media</button>
            <button class="tab-btn" style="flex:1;padding:12px;font-size:13px;font-weight:600;
              color:var(--color-text-muted);" onclick="AuraToast.show('Hilos próximamente')">Hilos</button>
          </div>

          <!-- Ecos del usuario -->
          <div id="user-ecos-list" style="width:100%;margin-top:8px;">
            <div style="display:flex;justify-content:center;padding:20px;">
              <div style="width:28px;height:28px;border-radius:50%;border:2px solid var(--color-primary);
                border-top-color:transparent;animation:spin .8s linear infinite;"></div>
            </div>
          </div>

          <!-- Acciones -->
          ${!esPropio ? `
            <div style="width:100%;display:flex;gap:10px;margin-top:8px;
              padding-top:16px;border-top:1px solid var(--color-border);">
              <button onclick="AuraRouter.navigate('chat');AuraModal.close();"
                class="btn btn-secondary" style="flex:1;">
                💬 Mensaje
              </button>
              <button onclick="AuraToast.show('Compartir perfil próximamente')"
                class="btn btn-outline" style="flex:1;">
                📤 Compartir
              </button>
            </div>
          ` : ''}
        </div>
      `
    });

    // Cargar ecos del usuario
    _loadUserEcos(perfil.id);
  }

  async function _loadUserEcos(userId) {
    const container = document.getElementById('user-ecos-list');
    if (!container) return;

    try {
      let ecosList = [];
      if (window.AuraDB && AuraDB.getClient()) {
        const { data } = await AuraDB.getClient()
          .from('ecos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        ecosList = data || [];
      }

      if (ecosList.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:32px 16px;color:var(--color-text-muted);">
            <div style="font-size:36px;margin-bottom:8px;">✦</div>
            <div style="font-size:14px;">Aún no hay Ecos</div>
          </div>`;
        return;
      }

      container.innerHTML = ecosList.map(eco => `
        <div style="padding:14px 0;border-bottom:1px solid var(--color-border);">
          <div style="font-size:14px;line-height:1.6;color:var(--color-text-primary);">${eco.contenido || ''}</div>
          ${eco.media_url ? `<img src="${eco.media_url}" style="width:100%;border-radius:10px;margin-top:8px;max-height:200px;object-fit:cover;">` : ''}
          <div style="display:flex;gap:16px;margin-top:8px;">
            <span style="font-size:12px;color:var(--color-text-muted);">❤️ ${eco.likes || 0}</span>
            <span style="font-size:12px;color:var(--color-text-muted);">💬 ${eco.comentarios || 0}</span>
            <span style="font-size:12px;color:var(--color-text-muted);">${_timeAgo(eco.created_at)}</span>
          </div>
        </div>
      `).join('');
    } catch(e) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--color-text-muted);font-size:14px;">No se pudieron cargar los Ecos</div>`;
    }
  }

  // ── SEGUIR / DEJAR DE SEGUIR ──
  async function toggleFollow(userId, btn) {
    const yo = AuraAuth.currentUser();
    if (!yo) { AuraToast.show('Inicia sesión primero', 'warning'); return; }

    const siguiendo = btn.textContent.trim() === 'Siguiendo';
    btn.disabled = true;
    btn.textContent = '...';

    try {
      if (siguiendo) {
        await AuraDB.dejarDeSeguir(yo.id, userId);
        btn.textContent = 'Seguir';
        btn.className = 'btn btn-primary btn-sm';
        AuraToast.show('Dejaste de seguir');
      } else {
        await AuraDB.seguir(yo.id, userId);
        btn.textContent = 'Siguiendo';
        btn.className = 'btn btn-outline btn-sm';
        AuraToast.show('Agregado a tu Red ✦', 'success');
        AuraKarma?.add(1, 'Nuevo seguidor en tu red');
      }
    } catch(e) {
      AuraToast.show('Error, intenta de nuevo', 'error');
      btn.textContent = siguiendo ? 'Siguiendo' : 'Seguir';
    }
    btn.disabled = false;
  }

  async function showFollowers(userId) {
    AuraToast.show('Red de amistad próximamente');
  }

  function _timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'ahora';
    if (m < 60) return `hace ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h}h`;
    return `hace ${Math.floor(h/24)}d`;
  }

  function init() {
    // Exponer globalmente para usar en tarjetas de usuario
    window.openUserProfile = openProfile;
  }

  return { init, openProfile, toggleFollow, showFollowers };
})();
