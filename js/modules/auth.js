/* ============================================
   AURA — auth.js v2
   Sin modo demo — solo cuentas reales
   Google + Email/Password
   ============================================ */

window.AuraAuth = (() => {
  let _user = null;
  let _profile = null;

  async function init() {
    try {
      if (!window.AuraDB) { setTimeout(init, 500); return; }
      if (!AuraDB.getClient()) await AuraDB.init();

      const { data: { session } } = await AuraDB.getClient().auth.getSession();
      if (session?.user) {
        _user = session.user;
        await _loadOrCreateProfile(session.user);
        _onLoggedIn();
      } else {
        showLoginScreen();
      }

      AuraDB.getClient().auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          _user = session.user;
          await _loadOrCreateProfile(session.user);
          AuraModal.close();
          _onLoggedIn();
          AuraToast.show('¡Bienvenido a Aura! ✦', 'success');
        } else if (event === 'SIGNED_OUT') {
          _user = null; _profile = null;
          showLoginScreen();
        }
      });
    } catch(e) {
      console.error('Auth error:', e);
      showLoginScreen();
    }
  }

  async function _loadOrCreateProfile(authUser) {
    try {
      _profile = await AuraDB.getUsuario(authUser.id);
    } catch(e) {
      const nombre = authUser.user_metadata?.full_name ||
                     authUser.email?.split('@')[0] || 'Usuario Aura';
      const newProfile = {
        id: authUser.id,
        nombre,
        handle: '@' + nombre.toLowerCase().replace(/\s+/g,'_').slice(0,20),
        bio: '✨ Nuevo en Aura',
        avatar_url: authUser.user_metadata?.avatar_url || null,
        aura_score: 100,
      };
      _profile = await AuraDB.upsertUsuario(newProfile);
    }
    AuraStore.persist('user', _profile);
  }

  function _onLoggedIn() {
    const app = document.getElementById('app');
    if (app) app.classList.remove('hidden');
    AuraRouter.navigate('home');
  }

  // ── GOOGLE ──
  async function loginWithGoogle() {
    try {
      const { error } = await AuraDB.getClient().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch(e) {
      AuraToast.show('Error con Google. Intenta con email.', 'error');
    }
  }

  // ── EMAIL LOGIN ──
  async function loginWithEmail(email, password) {
    try {
      const { error } = await AuraDB.getClient().auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login')) AuraToast.show('Email o contraseña incorrectos', 'error');
        else throw error;
      }
    } catch(e) {
      AuraToast.show('Error al iniciar sesión', 'error');
    }
  }

  // ── REGISTRO ──
  async function registerWithEmail(email, password, nombre) {
    try {
      const { error } = await AuraDB.getClient().auth.signUp({
        email, password,
        options: { data: { full_name: nombre } }
      });
      if (error) throw error;
      AuraToast.show('¡Revisa tu email para confirmar tu cuenta! ✦', 'success');
    } catch(e) {
      AuraToast.show('Error al crear cuenta: ' + e.message, 'error');
    }
  }

  // ── LOGOUT ──
  async function logout() {
    try { await AuraDB.getClient().auth.signOut(); } catch(e) {}
    _user = null; _profile = null;
    AuraStore.persist('user', null);
    AuraToast.show('Sesión cerrada');
    showLoginScreen();
  }

  // ── PANTALLA LOGIN ──
  function showLoginScreen() {
    // Ocultar app, mostrar solo el modal
    const app = document.getElementById('app');
    if (app) app.classList.add('hidden');

    AuraModal.show({
      title: null,
      content: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding-bottom:8px;">

          <!-- Logo -->
          <div style="width:72px;height:72px;border-radius:50%;
            background:radial-gradient(circle at 35% 35%,#c4b5fd,#7c3aed,#4c1d95);
            box-shadow:0 0 40px rgba(124,58,237,.5);
            display:flex;align-items:center;justify-content:center;font-size:32px;color:white;
            animation:orbBreath 3s ease-in-out infinite;">✦</div>

          <div style="text-align:center;">
            <div style="font-size:28px;font-weight:800;
              background:linear-gradient(135deg,#7c3aed,#ec4899);
              -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
              Aura
            </div>
            <div style="font-size:13px;color:var(--color-text-muted);margin-top:2px;letter-spacing:1px;">
              TU ESPACIO · TU AURA
            </div>
          </div>

          <!-- Google -->
          <button onclick="AuraAuth.loginWithGoogle()"
            style="display:flex;align-items:center;justify-content:center;gap:10px;
            width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:600;
            background:var(--color-bg-input);border:1.5px solid var(--color-border);cursor:pointer;
            transition:transform .12s;">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <!-- Separador -->
          <div style="width:100%;display:flex;align-items:center;gap:12px;">
            <div style="flex:1;height:1px;background:var(--color-border);"></div>
            <span style="font-size:12px;color:var(--color-text-muted);">o con email</span>
            <div style="flex:1;height:1px;background:var(--color-border);"></div>
          </div>

          <!-- Tabs -->
          <div style="width:100%;display:flex;gap:0;background:var(--color-bg-input);
            border-radius:12px;padding:3px;">
            <button onclick="AuraAuth._showTab('login')" id="tab-login"
              style="flex:1;padding:9px;border-radius:10px;font-size:14px;font-weight:600;
              cursor:pointer;background:var(--color-bg-card);
              box-shadow:0 1px 4px rgba(0,0,0,.1);border:none;color:var(--color-text-primary);">
              Entrar
            </button>
            <button onclick="AuraAuth._showTab('register')" id="tab-register"
              style="flex:1;padding:9px;border-radius:10px;font-size:14px;font-weight:600;
              cursor:pointer;background:transparent;border:none;color:var(--color-text-muted);">
              Crear cuenta
            </button>
          </div>

          <!-- Login -->
          <div id="form-login" style="width:100%;display:flex;flex-direction:column;gap:10px;">
            <input class="input-field" id="login-email" type="email"
              placeholder="Tu email" autocomplete="email">
            <input class="input-field" id="login-pass" type="password"
              placeholder="Contraseña" autocomplete="current-password">
            <button onclick="AuraAuth._handleLogin()" class="btn btn-primary btn-block"
              style="margin-top:4px;">
              Iniciar sesión ✦
            </button>
          </div>

          <!-- Registro (oculto) -->
          <div id="form-register" style="width:100%;display:none;flex-direction:column;gap:10px;">
            <input class="input-field" id="reg-nombre" type="text"
              placeholder="Tu nombre completo" autocomplete="name">
            <input class="input-field" id="reg-email" type="email"
              placeholder="Tu email" autocomplete="email">
            <input class="input-field" id="reg-pass" type="password"
              placeholder="Contraseña (mín. 6 caracteres)" autocomplete="new-password">
            <button onclick="AuraAuth._handleRegister()" class="btn btn-primary btn-block"
              style="margin-top:4px;">
              Crear mi cuenta ✦
            </button>
          </div>

        </div>
      `
    });
  }

  function _showTab(tab) {
    const fl = document.getElementById('form-login');
    const fr = document.getElementById('form-register');
    const tl = document.getElementById('tab-login');
    const tr = document.getElementById('tab-register');
    if (!fl || !fr) return;
    if (tab === 'login') {
      fl.style.display = 'flex'; fr.style.display = 'none';
      tl.style.background = 'var(--color-bg-card)'; tl.style.boxShadow = '0 1px 4px rgba(0,0,0,.1)'; tl.style.color = 'var(--color-text-primary)';
      tr.style.background = 'transparent'; tr.style.boxShadow = 'none'; tr.style.color = 'var(--color-text-muted)';
    } else {
      fl.style.display = 'none'; fr.style.display = 'flex';
      tr.style.background = 'var(--color-bg-card)'; tr.style.boxShadow = '0 1px 4px rgba(0,0,0,.1)'; tr.style.color = 'var(--color-text-primary)';
      tl.style.background = 'transparent'; tl.style.boxShadow = 'none'; tl.style.color = 'var(--color-text-muted)';
    }
  }

  async function _handleLogin() {
    const email = document.getElementById('login-email')?.value?.trim();
    const pass  = document.getElementById('login-pass')?.value;
    if (!email || !pass) { AuraToast.show('Completa todos los campos', 'warning'); return; }
    const btn = document.querySelector('#form-login button');
    if (btn) { btn.textContent = 'Entrando...'; btn.disabled = true; }
    await loginWithEmail(email, pass);
    if (btn) { btn.textContent = 'Iniciar sesión ✦'; btn.disabled = false; }
  }

  async function _handleRegister() {
    const nombre = document.getElementById('reg-nombre')?.value?.trim();
    const email  = document.getElementById('reg-email')?.value?.trim();
    const pass   = document.getElementById('reg-pass')?.value;
    if (!nombre || !email || !pass) { AuraToast.show('Completa todos los campos', 'warning'); return; }
    if (pass.length < 6) { AuraToast.show('Contraseña mínimo 6 caracteres', 'warning'); return; }
    const btn = document.querySelector('#form-register button');
    if (btn) { btn.textContent = 'Creando cuenta...'; btn.disabled = true; }
    await registerWithEmail(email, pass, nombre);
    if (btn) { btn.textContent = 'Crear mi cuenta ✦'; btn.disabled = false; }
  }

  function isLoggedIn() { return !!_user; }
  function currentUser() { return _profile; }

  return {
    init, loginWithGoogle, loginWithEmail, registerWithEmail,
    logout, showLoginScreen, isLoggedIn, currentUser,
    _showTab, _handleLogin, _handleRegister,
  };
})();
