/* ============================================
   AURA — store.js
   Estado global de la app (sin librerías externas)
   ============================================ */

window.AuraStore = (() => {
  const _state = {
    user: null,
    theme: localStorage.getItem('aura_theme') || 'theme-default',
    currentPage: 'home',
    notifications: [],
    unreadCount: 0,
    posts: [],
    ecos: [],
    communities: [],
    chats: [],
    isLoading: false,
    attention: { isActive: true },
    gyro: { x: 0, y: 0 },
  };

  const _listeners = {};

  function get(key) {
    return key ? _state[key] : { ..._state };
  }

  function set(key, value) {
    _state[key] = value;
    _emit(key, value);
  }

  function _emit(key, value) {
    if (_listeners[key]) {
      _listeners[key].forEach(fn => fn(value));
    }
    if (_listeners['*']) {
      _listeners['*'].forEach(fn => fn({ key, value }));
    }
  }

  function on(key, callback) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(callback);
    return () => {
      _listeners[key] = _listeners[key].filter(fn => fn !== callback);
    };
  }

  // Persist certain keys to localStorage
  function persist(key, value) {
    set(key, value);
    try { localStorage.setItem(`aura_${key}`, JSON.stringify(value)); } catch(e) {}
  }

  function load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`aura_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }

  return { get, set, on, persist, load };
})();
