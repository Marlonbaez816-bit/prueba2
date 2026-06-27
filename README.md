# ✦ Aura — Tu espacio. Tu aura.

Red social modular, moderna y elegante.

---

## 📁 Estructura del proyecto

aura/
├── index.html
├── manifest.json
├── README.md
├── css/
│   ├── variables.css
│   ├── reset.css
│   ├── typography.css
│   ├── layout.css
│   ├── components.css
│   ├── animations.css
│   └── themes.css
└── js/
    ├── app.js
    └── modules/
        ├── config.js
        ├── store.js
        ├── router.js
        ├── toast.js
        ├── modal.js
        ├── theme.js
        ├── auth.js
        ├── feed.js
        ├── ecos.js
        ├── chat.js
        ├── communities.js
        ├── profile.js
        ├── karma.js
        ├── ai-assistant.js
        ├── attention.js
        └── gyroscope.js

---

## 🚀 Cómo publicar gratis en GitHub Pages

1. Sube toda la carpeta a un repositorio en GitHub
2. Ve a Settings → Pages
3. En Source selecciona main y carpeta /root
4. Guarda → tu app estará en https://TU_USUARIO.github.io/aura

---

## ➕ Cómo agregar una nueva página

1. Crea js/modules/mi-modulo.js
2. Dentro registra la página:

window.MiModulo = (() => {
  function render() {
    return '<div class="page">tu contenido</div>';
  }
  function init() {
    AuraRouter.register('mi-pagina', render);
  }
  return { init, render };
})();

3. Agrega el script en index.html antes de app.js
4. En app.js llama MiModulo.init()

---

## ✦ Módulos próximos

- TV en vivo gratuita
- Sincronización con Spotify
- YouTube integrado
- Llamadas de voz y video
- Juegos dentro de la app
- IA generativa en Ecos
- Notificaciones push reales
- SubAuras completas
