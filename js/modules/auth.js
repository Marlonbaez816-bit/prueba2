/* ============================================
   AURA — auth.js
   Autenticación (preparado para Firebase)
   ============================================ */

window.AuraAuth = (() => {
  // Estado mock - reemplazar con Firebase
  let _user = AuraStore.load('user', null);

  function isLoggedIn() { return !!_user; }
  function currentUser() { return _user; }

  function mockLogin(name = 'Usuario Aura') {
    _user = {
      id: 'user_' + Date.now(),
      name,
      handle: '@' + name.toLowerCase().replace(/\s/g, ''),
      avatar: null,
      bio: '✨ Nueva en Aura',
      aura_score: 100,
      network_count: 0,
      eco_count: 0,
      joined: new Date().toISOString(),
    };
    AuraStore.persist('user', _user);
    return _user;
  }

  function logout() {
    _user = null;
    AuraStore.persist('user', null);
    AuraToast.show('Sesión cerrada');
    showLoginScreen();
  }

  function showLoginScreen() {
    AuraModal.show({
      title: null,
      content: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding-bottom:8px;">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--gradient-orb);
            box-shadow:var(--shadow-glow);display:flex;align-items:center;justify-content:center;
            font-size:28px;color:white;">✦</div>
          <div style="text-align:center;">
            <div style="font-size:24px;font-weight:700;font-family:var(--font-display);">Bienvenido a Aura</div>
            <div style="font-size:14px;color:var(--color-text-secondary);margin-top:4px;">Tu espacio. Tu aura.</div>
          </div>

          <div style="width:100%;display:flex;flex-direction:column;gap:10px;">
            <button onclick="AuraAuth._handleSocialLogin('google')" style="
              display:flex;align-items:center;justify-content:center;gap:10px;
              width:100%;padding:14px;border-radius:12px;font-size:15px;font-weight:600;
              background:var(--color-bg-input);border:1px solid var(--color-border);cursor:pointer;">
              <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google">
              Continuar con Google
            </button>
            <button onclick="AuraAuth._handleSocialLogin('apple')" style="
              display:flex;align-items:center;justify-content:center;gap:10px;
              width:100%;padding:14px;border-radius:12px;font-size:15px;font-weight:600;
              background:#000;color:#fff;border:none;cursor:pointer;">
              🍎 Continuar con Apple
            </button>
            <button onclick="AuraAuth._handleSocialLogin('x')" style="
              display:flex;align-items:center;justify-content:center;gap:10px;
              width:100%;padding:14px;border-radius:12px;font-size:15px;font-weight:600;
              background:#1DA1F2;color:#fff;border:none;cursor:pointer;">
              𝕏 Continuar con X
            </button>
          </div>

          <div style="width:100%;border-top:1px solid var(--color-border);padding-top:16px;">
            <input id="auth-name" class="input-field" placeholder="O ingresa tu nombre para demo"
              style="margin-bottom:10px;">
            <button onclick="AuraAuth._handleDemoLogin()" class="btn btn-primary btn-block">
              Probar Aura ✦
            </button>
          </div>
        </div>
      `
    });
  }

  function _handleSocialLogin(provider) {
    // TODO: integrar Firebase Auth
    AuraToast.show(`${provider} próximamente. Usa el modo demo.`, 'warning');
  }

  function _handleDemoLogin() {
    const input = document.getElementById('auth-name');
    const name = input?.value?.trim() || 'Aura User';
    mockLogin(name);
    AuraModal.close();
    AuraToast.show(`¡Bienvenido a Aura, ${_user.name}! ✦`, 'success');
    AuraRouter.navigate('home');
  }

  function init() {
    if (!_user) {
      setTimeout(showLoginScreen, 800);
    }
  }

  return { isLoggedIn, currentUser, mockLogin, logout, showLoginScreen, init, _handleSocialLogin, _handleDemoLogin };
})();