/* ============================================
   AURA — ecos.js
   Ecos de video con scroll por giroscopio
   Auto-avance al terminar video
   Scroll suave de a uno por vez
   ============================================ */

window.AuraEcos = (() => {
  let currentIndex = 0;
  let totalEcos = 0;
  let isTransitioning = false;
  let tiltAccum = 0;
  let lastBeta = null;
  let gyroEnabled = false;

  const _mockEcos = [
    { id:1, user:'Luna García',  handle:'@luna',    likes:'12.4K', comments:'342', shares:'89',  aura:892,
      bg:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', emoji:'🌙',
      caption:'La magia de vivir sin filtros ✨', song:'Weightless - Marconi Union', duration:15 },
    { id:2, user:'Mateo Ruiz',   handle:'@mateo.r', likes:'8.1K',  comments:'156', shares:'44',  aura:654,
      bg:'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)', emoji:'🎵',
      caption:'Este sonido me tiene obsesionado 🔥', song:'Blinding Lights - The Weeknd', duration:18 },
    { id:3, user:'Sofía M.',     handle:'@sofi_m',  likes:'24.7K', comments:'890', shares:'201', aura:1204,
      bg:'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', emoji:'🌊',
      caption:'El mar siempre tiene la respuesta 🌊', song:'Ocean - Martin Garrix', duration:12 },
    { id:4, user:'Carlos Torres',handle:'@carlos.t',likes:'5.3K',  comments:'98',  shares:'27',  aura:445,
      bg:'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)', emoji:'🌿',
      caption:'Naturaleza pura, sin editar 🌿', song:'Chill Vibes', duration:20 },
    { id:5, user:'Elena Vega',   handle:'@elena.v', likes:'31.2K', comments:'1.2K',shares:'450', aura:2100,
      bg:'linear-gradient(135deg,#fa709a 0%,#fee140 100%)', emoji:'🔥',
      caption:'Sin miedo al éxito 🔥 Esto es solo el comienzo', song:'Power - Kanye West', duration:16 },
  ];

  // ── RENDER ECO ──
  function renderEco(eco, index) {
    return `
      <div class="eco-video-item" data-index="${index}" style="background:${eco.bg};">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          font-size:100px;filter:drop-shadow(0 8px 24px rgba(0,0,0,0.3));">
          ${eco.emoji}
        </div>

        <!-- Barra de progreso -->
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.2);">
          <div id="eco-progress-${index}" style="height:100%;width:0%;background:rgba(255,255,255,0.9);
            border-radius:99px;transition:width .1s linear;"></div>
        </div>

        <!-- Overlay info -->
        <div class="eco-video-overlay">
          <div style="display:flex;align-items:flex-end;gap:12px;">
            <div style="flex:1;">
              <!-- Usuario -->
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.25);
                  backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
                  font-size:18px;font-weight:700;color:white;border:2px solid rgba(255,255,255,0.5);">
                  ${eco.user[0]}
                </div>
                <div>
                  <div style="font-size:15px;font-weight:700;color:white;">${eco.user}</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.75);">${eco.handle}</div>
                </div>
                <button onclick="AuraEcos.followUser(this)" style="background:rgba(255,255,255,0.2);
                  backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.6);
                  border-radius:20px;padding:5px 14px;color:white;font-size:13px;font-weight:600;cursor:pointer;">
                  Seguir
                </button>
              </div>
              <!-- Caption -->
              <div style="font-size:14px;color:white;line-height:1.5;margin-bottom:8px;
                text-shadow:0 1px 4px rgba(0,0,0,0.4);">${eco.caption}</div>
              <!-- Canción -->
              <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.3);
                backdrop-filter:blur(8px);border-radius:20px;padding:5px 12px;width:fit-content;">
                <span style="font-size:12px;">🎵</span>
                <div style="font-size:12px;color:white;font-weight:500;max-width:180px;
                  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${eco.song}</div>
              </div>
              <!-- Aura Score -->
              <div style="margin-top:8px;display:flex;align-items:center;gap:6px;">
                <div style="background:rgba(124,58,237,0.6);backdrop-filter:blur(8px);
                  border-radius:20px;padding:4px 12px;font-size:12px;color:white;font-weight:600;">
                  ✦ ${eco.aura} Aura
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="eco-video-actions">
          <div class="eco-video-action" onclick="AuraEcos.likeEco(this, ${eco.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>${eco.likes}</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('Comentarios próximamente')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>${eco.comments}</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('Compartido ✦','success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span>${eco.shares}</span>
          </div>
          <div class="eco-video-action" onclick="AuraToast.show('Guardado ✦','success')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="19 21 12 16 5 21 5 3 19 3 19 21"/>
            </svg>
            <span>Guardar</span>
          </div>
          <div class="eco-video-action" onclick="AuraEcos.shareEco(${eco.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>SubEco</span>
          </div>
        </div>

        <!-- Indicador de giroscopio -->
        <div id="gyro-hint-${index}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          display:none;flex-direction:column;align-items:center;gap:8px;
          background:rgba(0,0,0,0.5);backdrop-filter:blur(12px);
          border-radius:16px;padding:16px 24px;color:white;text-align:center;">
          <span style="font-size:32px;">📱</span>
          <span style="font-size:14px;font-weight:600;">Inclina el teléfono<br>para cambiar Eco</span>
        </div>
      </div>
    `;
  }

  // ── NAVEGAR ──
  function goTo(index) {
    if (isTransitioning) return;
    if (index < 0 || index >= totalEcos) return;
    isTransitioning = true;
    currentIndex = index;
    const track = document.getElementById('eco-track');
    if (track) {
      const h = track.parentElement.clientHeight;
      track.style.transform = `translateY(-${index * h}px)`;
    }
    setTimeout(() => { isTransitioning = false; }, 620);
    startProgress(index);
  }

  function next() { if (currentIndex < totalEcos - 1) goTo(currentIndex + 1); }
  function prev() { if (currentIndex > 0) goTo(currentIndex - 1); }

  // ── PROGRESO SIMULADO ──
  function startProgress(index) {
    const bar = document.getElementById(`eco-progress-${index}`);
    if (!bar) return;
    bar.style.width = '0%';
    const eco = _mockEcos[index];
    const duration = (eco?.duration || 15) * 1000;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      bar.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(interval);
        // Auto-avance al siguiente
        setTimeout(() => {
          if (currentIndex < totalEcos - 1) next();
          else AuraToast.show('¡Viste todos los Ecos! ✦', 'success');
        }, 400);
      }
    }, 100);
  }

  // ── TOUCH SWIPE ──
  function initSwipe(container) {
    let startY = 0, startTime = 0;
    container.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }, { passive: true });
    container.addEventListener('touchend', e => {
      const dy = startY - e.changedTouches[0].clientY;
      const dt = Date.now() - startTime;
      if (Math.abs(dy) > 40 && dt < 400) {
        dy > 0 ? next() : prev();
      }
    }, { passive: true });
  }

  // ── GIROSCOPIO ──
  function initGyro() {
    const SR = window.DeviceOrientationEvent;
    if (!SR) return;

    const requestAndAttach = () => {
      if (typeof SR.requestPermission === 'function') {
        SR.requestPermission().then(s => {
          if (s === 'granted') attachGyro();
        }).catch(() => {});
      } else {
        attachGyro();
      }
    };

    // Pedir al primer tap en ecos
    document.getElementById('eco-track')?.addEventListener('click', requestAndAttach, { once: true });
  }

  function attachGyro() {
    gyroEnabled = true;
    lastBeta = null;
    tiltAccum = 0;

    window.addEventListener('deviceorientation', e => {
      if (!gyroEnabled) return;
      const beta = e.beta; // -180 a 180, adelante/atrás
      if (lastBeta === null) { lastBeta = beta; return; }

      const delta = beta - lastBeta;
      lastBeta = beta;

      // Acumular inclinación suave
      tiltAccum += delta;

      // Umbral para cambiar: 18 grados acumulados
      if (tiltAccum > 18) {
        tiltAccum = 0; lastBeta = beta;
        next();
      } else if (tiltAccum < -18) {
        tiltAccum = 0; lastBeta = beta;
        prev();
      }
    }, { passive: true });
  }

  // ── ACCIONES ──
  function likeEco(btn, id) {
    btn.classList.toggle('eco-action--liked');
    const svg = btn.querySelector('svg');
    if (btn.classList.contains('eco-action--liked')) {
      svg.style.fill = '#ec4899'; svg.style.stroke = '#ec4899';
      btn.style.transform = 'scale(1.3)';
      setTimeout(() => btn.style.transform = '', 200);
      AuraKarma?.add(2, 'Like en Eco');
    } else {
      svg.style.fill = 'none'; svg.style.stroke = 'white';
    }
  }

  function followUser(btn) {
    const following = btn.textContent.trim() === 'Siguiendo';
    btn.textContent = following ? 'Seguir' : 'Siguiendo';
    btn.style.background = following ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)';
    btn.style.color = following ? 'white' : '#7c3aed';
    AuraToast.show(following ? 'Dejaste de seguir' : 'Agregado a tu Red ✦', following ? 'default' : 'success');
  }

  function shareEco(id) {
    if (navigator.share) {
      navigator.share({ title: 'Eco en Aura', text: 'Mira este Eco en Aura ✦', url: window.location.href })
        .catch(() => {});
    } else {
      AuraToast.show('SubEco próximamente ✦', 'warning');
    }
  }

  // ── RENDER PÁGINA ──
  function render() {
    totalEcos = _mockEcos.length;
    currentIndex = 0;
    return `
      <div class="page" style="padding:0;overflow:hidden;">
        <div class="eco-video-container" id="eco-container">
          <div class="eco-video-track" id="eco-track">
            ${_mockEcos.map((eco, i) => renderEco(eco, i)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    AuraRouter.register('ecos', () => {
      const html = render();
      // Después de renderizar, activar swipe y giroscopio
      setTimeout(() => {
        const container = document.getElementById('eco-container');
        if (container) {
          initSwipe(container);
          initGyro();
          startProgress(0);
        }
      }, 100);
      return html;
    });
  }

  return { init, next, prev, goTo, likeEco, followUser, shareEco };
})();