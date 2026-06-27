/* ============================================
   AURA — profile.js
   Perfil de usuario
   ============================================ */

window.AuraProfile = (() => {
  function render() {
    const user = AuraAuth.currentUser() || {
      name: 'Tu Nombre', handle: '@tu_handle', bio: 'Escribe tu bio aquí ✨',
      aura_score: 0, network_count: 0, eco_count: 0,
    };

    return `
      <div class="page">
        <!-- COVER -->
        <div style="height:120px;background:var(--gradient-primary);position:relative;margin-bottom:52px;">
          <button onclick="AuraToast.show('Cambiar portada próximamente')" style="position:absolute;bottom:8px;right:8px;
            background:rgba(0,0,0,0.4);border-radius:20px;padding:4px 12px;font-size:12px;color:white;border:none;cursor:pointer;">
            Editar portada
          </button>
          <!-- AVATAR -->
          <div style="position:absolute;bottom:-48px;left:16px;">
            <div style="position:relative;">
              <div class="avatar avatar-xl" style="border:3px solid var(--color-bg);
                background:var(--gradient-soft);display:flex;align-items:center;justify-content:center;
                font-size:32px;font-weight:700;color:var(--color-primary);box-shadow:var(--shadow-md);">
                ${user.name[0] || 'A'}
              </div>
              <button onclick="AuraToast.show('Cambiar foto próximamente')" style="position:absolute;bottom:0;right:0;
                width:28px;height:28px;border-radius:50%;background:var(--gradient-primary);
                border:2px solid var(--color-bg);display:flex;align-items:center;justify-content:center;
                color:white;font-size:14px;cursor:pointer;">+</button>
            </div>
          </div>
        </div>

        <!-- INFO -->
        <div style="padding:0 16px 16px;">
          <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
            <button class="btn btn-outline btn-sm" onclick="AuraProfile.openEditProfile()">Editar perfil</button>
          </div>

          <div style="font-size:20px;font-weight:700;font-family:var(--font-display);">${user.name}</div>
          <div style="font-size:14px;color:var(--color-text-muted);margin-top:2px;">${user.handle}</div>
          <div style="font-size:14px;color:var(--color-text-secondary);margin-top:8px;line-height:1.5;">${user.bio}</div>

          <!-- AURA SCORE -->
          <div style="margin-top:12px;">
            <div class="aura-score">
              <div class="aura-score__icon">✦</div>
              <div>
                <div class="aura-score__value">${user.aura_score || 100} Aura</div>
                <div class="aura-score__label">Tu puntuación de impacto</div>
              </div>
            </div>
          </div>

          <!-- STATS -->
          <div class="stats-row" style="margin-top:16px;">
            <div class="stat-item" onclick="AuraToast.show('Tus Ecos')">
              <div class="stat-item__value">${user.eco_count || 0}</div>
              <div class="stat-item__label">Ecos</div>
            </div>
            <div class="stat-item" onclick="AuraCommunities && AuraRouter.navigate('communities')">
              <div class="stat-item__value">${user.network_count || 0}</div>
              <div class="stat-item__label">Red</div>
            </div>
            <div class="stat-item" onclick="AuraToast.show('Tus conexiones')">
              <div class="stat-item__value">0</div>
              <div class="stat-item__label">Conexiones</div>
            </div>
            <div class="stat-item" onclick="AuraToast.show('Tus interacciones')">
              <div class="stat-item__value">0</div>
              <div class="stat-item__label">Interacciones</div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- TABS -->
        <div class="tabs">
          <button class="tab-btn active" onclick="AuraProfile.switchTab(this,'ecos')">Ecos</button>
          <button class="tab-btn" onclick="AuraProfile.switchTab(this,'hilos')">Hilos</button>
          <button class="tab-btn" onclick="AuraProfile.switchTab(this,'media')">Galería</button>
          <button class="tab-btn" onclick="AuraProfile.switchTab(this,'guardados')">Guardados</button>
        </div>
        <div id="profile-tab-content">
          <div class="empty-state">
            <div class="empty-state__icon">✦</div>
            <div class="empty-state__title">Aún no hay Ecos</div>
            <div class="empty-state__text">Crea tu primer Eco y comparte tu mundo</div>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="AuraToast.show('Crear Eco próximamente', 'warning')">
              + Crear Eco
            </button>
          </div>
        </div>

        <!-- SETTINGS SHORTCUT -->
        <div class="divider--thick"></div>
        <div class="settings-row" onclick="AuraRouter.navigate('settings')">
          <div class="settings-row__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.42 1.42M4.93 4.93l1.42 1.42M12 2v2M12 20v2M4.93 19.07l1.42-1.42M19.07 19.07l-1.42-1.42M2 12h2M20 12h2"/></svg>
          </div>
          <div class="settings-row__content">
            <div class="settings-row__title">Ajustes</div>
            <div class="settings-row__subtitle">Personalizar Aura, privacidad y más</div>
          </div>
          <div class="settings-row__right">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>
    `;
  }

  function openEditProfile() {
    const user = AuraAuth.currentUser() || {};
    AuraModal.show({
      title: 'Editar perfil',
      content: `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="input-group">
            <label class="input-label">Nombre</label>
            <input class="input-field" id="edit-name" value="${user.name || ''}" placeholder="Tu nombre">
          </div>
          <div class="input-group">
            <label class="input-label">Nombre de usuario</label>
            <input class="input-field" id="edit-handle" value="${user.handle || ''}" placeholder="@tu_usuario">
          </div>
          <div class="input-group">
            <label class="input-label">Bio</label>
            <textarea class="input-field" id="edit-bio" rows="3" placeholder="Cuéntanos sobre ti..."
              style="resize:none;">${user.bio || ''}</textarea>
          </div>
          <button class="btn btn-primary btn-block" onclick="AuraProfile._saveProfile()">Guardar cambios</button>
        </div>
      `
    });
  }

  function _saveProfile() {
    const name   = document.getElementById('edit-name')?.value?.trim();
    const handle = document.getElementById('edit-handle')?.value?.trim();
    const bio    = document.getElementById('edit-bio')?.value?.trim();
    const user = AuraAuth.currentUser();
    if (user) {
      if (name) user.name = name;
      if (handle) user.handle = handle;
      if (bio) user.bio = bio;
      AuraStore.persist('user', user);
    }
    AuraModal.close();
    AuraToast.show('Perfil actualizado ✦', 'success');
    AuraRouter.navigate('profile');
  }

  function switchTab(btn, tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function init() {
    AuraRouter.register('profile', render);
    AuraRouter.register('settings', renderSettings);
  }

  function renderSettings() {
    return `
      <div class="page">
        <div style="padding:8px 0;">
          ${[
            { icon: '🎨', title: 'Apariencia', sub: 'Tema, colores y animaciones', action: () => AuraModal.show({ title: 'Elige tu tema', content: AuraTheme.renderPicker() }) },
            { icon: '🔔', title: 'Notificaciones', sub: 'Gestiona tus alertas', action: () => AuraToast.show('Próximamente', 'warning') },
            { icon: '🔒', title: 'Privacidad', sub: 'Quién puede ver tu contenido', action: () => AuraToast.show('Próximamente', 'warning') },
            { icon: '✦', title: 'Aura Score', sub: 'Tu sistema de karma', action: () => AuraRouter.navigate('karma') },
            { icon: '👁️', title: 'Detección de atención', sub: AuraAttention.isEnabled() ? 'Activada' : 'Desactivada', action: () => AuraAttention.toggle() },
            { icon: '📱', title: 'Giroscopio', sub: AuraGyro.isEnabled() ? 'Efecto activo' : 'Efecto desactivado', action: () => AuraGyro.toggle() },
            { icon: '🌐', title: 'Idioma', sub: 'Español', action: () => AuraToast.show('Próximamente', 'warning') },
            { icon: '🚪', title: 'Cerrar sesión', sub: '', action: () => AuraAuth.logout() },
          ].map(row => `
            <div class="settings-row" onclick="(${row.action.toString()})()">
              <div class="settings-row__icon">${row.icon}</div>
              <div class="settings-row__content">
                <div class="settings-row__title">${row.title}</div>
                ${row.sub ? `<div class="settings-row__subtitle">${row.sub}</div>` : ''}
              </div>
              <div class="settings-row__right">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return { init, render, openEditProfile, _saveProfile, switchTab, renderSettings };
})();
