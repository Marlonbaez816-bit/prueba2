/* ============================================
   AURA — config.js
   Toda la configuración del proyecto en un lugar
   Para agregar una función nueva, solo agrega aquí
   ============================================ */

window.AURA_CONFIG = {
  app: {
    name: 'Aura',
    version: '1.0.0',
    tagline: 'Tu espacio. Tu aura.',
  },

  // Rutas / páginas disponibles
  pages: {
    home:        'home',
    ecos:        'ecos',
    communities: 'communities',
    profile:     'profile',
    search:      'search',
    chat:        'chat',
    settings:    'settings',
    notifications: 'notifications',
  },

  // Temas disponibles
  themes: [
    { id: 'theme-default',  label: 'Aura',    color: '#7C3AED' },
    { id: 'theme-dark',     label: 'Oscuro',  color: '#1A1A2E' },
    { id: 'theme-midnight', label: 'Medianoche', color: '#060614' },
    { id: 'theme-rose',     label: 'Rosa',    color: '#E11D48' },
    { id: 'theme-ocean',    label: 'Océano',  color: '#0EA5E9' },
    { id: 'theme-emerald',  label: 'Esmeralda', color: '#10B981' },
    { id: 'theme-gold',     label: 'Oro',     color: '#D97706' },
  ],

  // Módulos activos (puedes desactivar los que no uses)
  modules: {
    ai_assistant:  true,
    attention_detect: true,
    gyroscope:     true,
    karma:         true,
    communities:   true,
    chat:          true,
    ecos_video:    true,
    live_tv:       false,   // próximamente
    spotify_sync:  false,   // próximamente
    youtube_sync:  false,   // próximamente
    games:         false,   // próximamente
  },

  // Textos de la UI (i18n básico)
  labels: {
    eco:          'Eco',
    ecos:         'Ecos',
    subaura:      'SubAura',
    subeco:       'SubEco',
    aura_score:   'Aura',     // lo que otros llaman "karma"
    network:      'Red',      // lo que otros llaman "seguidores"
    connections:  'Conexiones',
    interactions: 'Interacciones',
    threads:      'Hilos',
  },
};
