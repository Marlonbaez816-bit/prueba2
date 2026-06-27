/* ============================================
   AURA — attention.js
   Detecta si el usuario está mirando la pantalla
   Usa la Page Visibility API (nativa del navegador)
   ============================================ */

window.AuraAttention = (() => {
  let _enabled = false;

  function init() {
    if (!AURA_CONFIG.modules.attention_detect) return;
    _enabled = AuraStore.load('attention_enabled', false);
    if (_enabled) _attach();
  }

  function _attach() {
    document.addEventListener('visibilitychange', _onVisibility);
  }

  function _detach() {
    document.removeEventListener('visibilitychange', _onVisibility);
  }

  function _onVisibility() {
    const focused = !document.hidden;
    AuraStore.set('attention', { isActive: focused });
    document.querySelectorAll('.attention-fade').forEach(el => {
      el.classList.toggle('unfocused', !focused);
    });
  }

  function enable() {
    _enabled = true;
    AuraStore.persist('attention_enabled', true);
    _attach();
    AuraToast.show('Detección de atención activada ✦', 'success');
  }

  function disable() {
    _enabled = false;
    AuraStore.persist('attention_enabled', false);
    _detach();
    document.querySelectorAll('.attention-fade').forEach(el => el.classList.remove('unfocused'));
    AuraToast.show('Detección de atención desactivada');
  }

  function toggle() { _enabled ? disable() : enable(); }
  function isEnabled() { return _enabled; }

  return { init, enable, disable, toggle, isEnabled };
})();
