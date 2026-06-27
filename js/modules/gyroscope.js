/* ============================================
   AURA — gyroscope.js
   Efecto parallax con el giroscopio del teléfono
   ============================================ */

window.AuraGyro = (() => {
  let _active = false;

  function init() {
    if (!AURA_CONFIG.modules.gyroscope) return;
    _active = AuraStore.load('gyro_enabled', true);
    if (_active) _attach();
  }

  function _attach() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ necesita permiso
      // Se pide al hacer tap en la tarjeta por primera vez
      return;
    }
    window.addEventListener('deviceorientation', _onOrientation, { passive: true });
  }

  function requestPermission(callback) {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', _onOrientation, { passive: true });
            if (callback) callback(true);
          }
        }).catch(() => { if (callback) callback(false); });
    } else {
      _attach();
      if (callback) callback(true);
    }
  }

  function _onOrientation(e) {
    const x = (e.gamma || 0) / 30; // -1 to 1
    const y = (e.beta  || 0) / 30;
    AuraStore.set('gyro', { x, y });
    _applyToCards(x, y);
  }

  function _applyToCards(x, y) {
    const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);
    const rx = clamp(y * 15, -15, 15);
    const ry = clamp(x * 15, -15, 15);

    document.querySelectorAll('.gyro-card').forEach(card => {
      card.style.transform = `perspective(800px) rotateX(${-rx}deg) rotateY(${ry}deg)`;
    });

    document.querySelectorAll('.gyro-card__layer').forEach((layer, i) => {
      const depth = (i + 1) * 4;
      layer.style.transform = `translateX(${x * depth}px) translateY(${y * depth}px)`;
    });
  }

  function enable()  { _active = true; AuraStore.persist('gyro_enabled', true); _attach(); }
  function disable() {
    _active = false;
    AuraStore.persist('gyro_enabled', false);
    window.removeEventListener('deviceorientation', _onOrientation);
    document.querySelectorAll('.gyro-card').forEach(c => c.style.transform = '');
  }

  function toggle() { _active ? disable() : enable(); }
  function isEnabled() { return _active; }

  return { init, enable, disable, toggle, isEnabled, requestPermission };
})();
