/* ============================================
   AURA — router.js
   Navegación entre páginas sin recargar
   ============================================ */

window.AuraRouter = (() => {
  const _pages = {};
  let _current = null;

  function register(name, renderFn) {
    _pages[name] = renderFn;
  }

  function navigate(page, params = {}) {
    const main = document.getElementById('main-content');
    const title = document.getElementById('page-title');
    if (!main) return;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Update store
    AuraStore.set('currentPage', page);
    _current = page;

    // Render page
    if (_pages[page]) {
      main.innerHTML = '';
      const content = _pages[page](params);
      if (typeof content === 'string') {
        main.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        main.appendChild(content);
      }
    } else {
      main.innerHTML = `<div class="page empty-state">
        <div class="empty-state__icon">🚧</div>
        <div class="empty-state__title">Próximamente</div>
        <div class="empty-state__text">Esta sección está en desarrollo</div>
      </div>`;
    }

    // Update page title
    const titles = {
      home: 'Inicio', ecos: 'Ecos', communities: 'Red',
      profile: 'Perfil', search: 'Buscar', chat: 'Mensajes',
      settings: 'Ajustes', notifications: 'Notificaciones',
    };
    if (title) title.textContent = titles[page] || page;

    // Scroll to top
    main.scrollTop = 0;

    // Dispatch event for modules to hook into
    document.dispatchEvent(new CustomEvent('aura:navigate', { detail: { page, params } }));
  }

  function current() { return _current; }

  return { register, navigate, current };
})();
// ============================================================
// REGISTRAR PÁGINAS - AÑADE ESTO AL FINAL DE router.js
// ============================================================

// Página de inicio (Home)
AuraRouter.register('home', function(params) {
  return `
    <div class="page home-page" style="padding:16px;">
      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <button class="feed-tab active" style="padding:8px 20px; border-radius:30px; border:none; background:rgba(168,85,247,0.15); color:#a855f7; font-weight:600; font-family:inherit;">Para ti</button>
        <button class="feed-tab" style="padding:8px 20px; border-radius:30px; border:none; background:transparent; color:rgba(255,255,255,0.3); font-family:inherit;">Siguiendo</button>
        <button class="feed-tab" style="padding:8px 20px; border-radius:30px; border:none; background:transparent; color:rgba(255,255,255,0.3); font-family:inherit;">Tendencias</button>
      </div>

      <!-- Post 1 -->
      <div style="background:rgba(255,255,255,0.02); border-radius:16px; padding:16px 20px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.04);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <img src="https://ui-avatars.com/api/?name=Luna+Garcia&background=7c3aed&color=fff" style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(168,85,247,0.3);">
          <div>
            <strong style="color:#fff;">Luna García</strong>
            <span style="color:rgba(255,255,255,0.3);font-size:13px;display:block;">@luna · hace 2m</span>
          </div>
        </div>
        <p style="color:rgba(255,255,255,0.85);">¡Aura acaba de llegar y ya no puedo imaginarme sin ella! ✨</p>
        <div style="display:flex; gap:24px; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.04);">
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">❤️ 0</button>
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">💬 0</button>
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">🔄 0</button>
        </div>
      </div>

      <!-- Post 2 -->
      <div style="background:rgba(255,255,255,0.02); border-radius:16px; padding:16px 20px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.04);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <img src="https://ui-avatars.com/api/?name=Mateo+Ruiz&background=7c3aed&color=fff" style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(168,85,247,0.3);">
          <div>
            <strong style="color:#fff;">Mateo Ruiz</strong>
            <span style="color:rgba(255,255,255,0.3);font-size:13px;display:block;">@mateo.r · hace 15m</span>
          </div>
        </div>
        <p style="color:rgba(255,255,255,0.85);">Atardecer desde mi ventana 🌅</p>
        <div style="display:flex; gap:24px; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.04);">
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">❤️ 12</button>
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">💬 5</button>
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">🔄 3</button>
        </div>
      </div>

      <!-- Post 3 -->
      <div style="background:rgba(255,255,255,0.02); border-radius:16px; padding:16px 20px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.04);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <img src="https://ui-avatars.com/api/?name=Sofia+Mendez&background=7c3aed&color=fff" style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(168,85,247,0.3);">
          <div>
            <strong style="color:#fff;">Sofía Méndez</strong>
            <span style="color:rgba(255,255,255,0.3);font-size:13px;display:block;">@sofi_m · hace 1h</span>
          </div>
        </div>
        <p style="color:rgba(255,255,255,0.85);">Hilo sobre por qué Aura va a cambiar las redes sociales 🧵 (1/5)</p>
        <div style="display:flex; gap:24px; margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.04);">
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">❤️ 45</button>
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">💬 23</button>
          <button style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-family:inherit;">🔄 12</button>
        </div>
      </div>
    </div>
  `;
});

// Página de Ecos
AuraRouter.register('ecos', function(params) {
  return `
    <div class="page ecos-page" style="padding:16px;">
      <h2 style="font-size:20px;color:rgba(255,255,255,0.8);margin-bottom:16px;">🎬 Ecos</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:rgba(255,255,255,0.02); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.04);">
          <div style="background:#1a1a2e; aspect-ratio:9/16; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.2); font-size:32px;">🎥</div>
          <div style="padding:12px;">
            <div style="color:#fff; font-weight:600;">@usuario</div>
            <div style="color:rgba(255,255,255,0.3); font-size:12px;">1.2k views</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.02); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.04);">
          <div style="background:#1a1a2e; aspect-ratio:9/16; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.2); font-size:32px;">🎥</div>
          <div style="padding:12px;">
            <div style="color:#fff; font-weight:600;">@otro</div>
            <div style="color:rgba(255,255,255,0.3); font-size:12px;">856 views</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.02); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.04);">
          <div style="background:#1a1a2e; aspect-ratio:9/16; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.2); font-size:32px;">🎥</div>
          <div style="padding:12px;">
            <div style="color:#fff; font-weight:600;">@creador</div>
            <div style="color:rgba(255,255,255,0.3); font-size:12px;">2.4k views</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.02); border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.04);">
          <div style="background:#1a1a2e; aspect-ratio:9/16; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.2); font-size:32px;">🎥</div>
          <div style="padding:12px;">
            <div style="color:#fff; font-weight:600;">@artista</div>
            <div style="color:rgba(255,255,255,0.3); font-size:12px;">3.1k views</div>
          </div>
        </div>
      </div>
    </div>
  `;
});

// Página de Comunidades
AuraRouter.register('communities', function(params) {
  return `
    <div class="page communities-page" style="padding:16px;">
      <h2 style="font-size:20px;color:rgba(255,255,255,0.8);margin-bottom:16px;">👥 Red</h2>
      <div style="background:rgba(255,255,255,0.02); border-radius:16px; padding:16px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; gap:14px;">
        <div style="font-size:32px;">🏛️</div>
        <div style="flex:1;">
          <div style="color:#fff; font-weight:600;">Tecnología</div>
          <div style="color:rgba(255,255,255,0.3); font-size:13px;">12.4k miembros</div>
        </div>
        <button style="padding:6px 16px; border-radius:30px; border:none; background:rgba(168,85,247,0.15); color:#a855f7; font-weight:600; cursor:pointer; font-family:inherit;">Unirse</button>
      </div>
      <div style="background:rgba(255,255,255,0.02); border-radius:16px; padding:16px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; gap:14px;">
        <div style="font-size:32px;">🎨</div>
        <div style="flex:1;">
          <div style="color:#fff; font-weight:600;">Arte Digital</div>
          <div style="color:rgba(255,255,255,0.3); font-size:13px;">8.2k miembros</div>
        </div>
        <button style="padding:6px 16px; border-radius:30px; border:none; background:rgba(168,85,247,0.15); color:#a855f7; font-weight:600; cursor:pointer; font-family:inherit;">Unirse</button>
      </div>
      <div style="background:rgba(255,255,255,0.02); border-radius:16px; padding:16px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; gap:14px;">
        <div style="font-size:32px;">🎵</div>
        <div style="flex:1;">
          <div style="color:#fff; font-weight:600;">Música</div>
          <div style="color:rgba(255,255,255,0.3); font-size:13px;">5.7k miembros</div>
        </div>
        <button style="padding:6px 16px; border-radius:30px; border:none; background:rgba(168,85,247,0.15); color:#a855f7; font-weight:600; cursor:pointer; font-family:inherit;">Unirse</button>
      </div>
    </div>
  `;
});

// Página de Perfil
AuraRouter.register('profile', function(params) {
  return `
    <div class="page profile-page" style="padding:16px;">
      <div style="position:relative; margin-bottom:16px;">
        <div style="width:100%; height:120px; background:linear-gradient(135deg,#7c3aed,#ec4899); border-radius:16px;"></div>
        <img src="https://ui-avatars.com/api/?name=Usuario&background=7c3aed&color=fff&size=80" style="position:absolute; bottom:-30px; left:20px; width:72px; height:72px; border-radius:50%; border:4px solid #0a0a0f;">
      </div>
      <div style="padding: 0 16px 16px; margin-top:16px;">
        <h2 style="font-size:20px; color:#fff;">Usuario</h2>
        <span style="color:rgba(255,255,255,0.3); font-size:14px;">@usuario</span>
        <p style="color:rgba(255,255,255,0.5); margin:8px 0;">Bienvenido a Aura ✦</p>
        <div style="display:flex; gap:24px; margin:12px 0;">
          <span><strong style="color:#fff;">12</strong> <span style="color:rgba(255,255,255,0.3);">Publicaciones</span></span>
          <span><strong style="color:#fff;">34</strong> <span style="color:rgba(255,255,255,0.3);">Seguidores</span></span>
          <span><strong style="color:#fff;">56</strong> <span style="color:rgba(255,255,255,0.3);">Siguiendo</span></span>
        </div>
        <button style="width:100%; padding:12px; border-radius:30px; border:none; background:linear-gradient(135deg,#7c3aed,#ec4899); color:#fff; font-weight:600; cursor:pointer; font-family:inherit;">✏️ Editar perfil</button>
      </div>
    </div>
  `;
});

// ============================================================
// INICIAR LA APP - Navegar a la página de inicio
// ============================================================

console.log('🚀 Registrando páginas en AuraRouter...');

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    AuraRouter.navigate('home');
  });
} else {
  AuraRouter.navigate('home');
}
