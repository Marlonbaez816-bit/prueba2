/* ============================================
   AURA — ai-assistant.js v3
   - Arrastrable SIN bloqueos
   - Toque corto = activar/desactivar escucha
   - Toque largo = mover
   - Respuesta por voz, texto o notificación (configurable)
   - Más de 40 comandos
   - Menú de ajustes del asistente
   ============================================ */

window.AuraAI = (() => {
  let btn, isDragging = false;
  let startX, startY, btnX, btnY;
  let dragMoved = false;
  let longPressTimer = null;
  let isInDragMode = false;

  let recognition = null;
  let isListening = false;
  let isEnabled   = AuraStore.load('ai_enabled', true);

  // Modos de respuesta: 'voice' | 'toast' | 'both'
  let responseMode = AuraStore.load('ai_response_mode', 'both');

  const synth = window.speechSynthesis;

  // ══════════════════════════════════════════
  //  COMANDOS
  // ══════════════════════════════════════════
  const commands = [
    // Navegación
    { match:['ir a inicio','inicio','home','página principal'],
      action:()=>{ nav('home'); reply('Abriendo inicio'); } },
    { match:['ir a ecos','ecos','videos','reels','ver ecos'],
      action:()=>{ nav('ecos'); reply('Abriendo Ecos'); } },
    { match:['abrir chat','mensajes','ir a chat','mis mensajes'],
      action:()=>{ nav('chat'); reply('Abriendo mensajes'); } },
    { match:['mi red','red de amistad','comunidades','ir a red'],
      action:()=>{ nav('communities'); reply('Abriendo tu red'); } },
    { match:['mi perfil','perfil','ver perfil'],
      action:()=>{ nav('profile'); reply('Abriendo tu perfil'); } },
    { match:['ajustes','configuración','configuracion','settings'],
      action:()=>{ nav('settings'); reply('Abriendo ajustes'); } },
    { match:['buscar','búsqueda','busqueda','search'],
      action:()=>{ nav('search'); reply('Abriendo búsqueda'); } },
    { match:['notificaciones','mis notificaciones'],
      action:()=>{ nav('notifications'); reply('Abriendo notificaciones'); } },
    { match:['galería','galeria','mis fotos','mis videos','media'],
      action:()=>{ nav('media'); reply('Abriendo tu galería'); } },
    { match:['aura score','mi karma','mis puntos','karma'],
      action:()=>{ nav('karma'); reply('Aquí está tu Aura Score'); } },

    // Temas
    { match:['tema oscuro','modo oscuro','oscuro'],
      action:()=>{ AuraTheme.apply('theme-dark'); reply('Tema oscuro activado'); } },
    { match:['tema claro','modo claro','claro','tema blanco'],
      action:()=>{ AuraTheme.apply('theme-default'); reply('Tema claro activado'); } },
    { match:['medianoche','tema medianoche','modo noche'],
      action:()=>{ AuraTheme.apply('theme-midnight'); reply('Tema medianoche activado'); } },
    { match:['tema rosa','rosa'],
      action:()=>{ AuraTheme.apply('theme-rose'); reply('Tema rosa activado'); } },
    { match:['tema océano','oceano','azul','tema azul'],
      action:()=>{ AuraTheme.apply('theme-ocean'); reply('Tema océano activado'); } },
    { match:['tema verde','esmeralda','tema esmeralda'],
      action:()=>{ AuraTheme.apply('theme-emerald'); reply('Tema esmeralda activado'); } },
    { match:['tema dorado','oro','dorado'],
      action:()=>{ AuraTheme.apply('theme-gold'); reply('Tema dorado activado'); } },

    // Acciones
    { match:['crear eco','nuevo eco','publicar','crear publicación'],
      action:()=>{ AuraModal.close(); setTimeout(()=>AuraCreate?.open('text'),200); reply('Crear nuevo Eco'); } },
    { match:['subir foto','subir imagen','agregar foto'],
      action:()=>{ AuraModal.close(); setTimeout(()=>AuraCreate?.open('photo'),200); reply('Abriendo cámara'); } },
    { match:['grabar video','subir video','nuevo video'],
      action:()=>{ AuraModal.close(); setTimeout(()=>AuraCreate?.open('video'),200); reply('Listo para grabar'); } },
    { match:['crear hilo','nuevo hilo','hilo'],
      action:()=>{ AuraModal.close(); setTimeout(()=>AuraCreate?.open('thread'),200); reply('Creando hilo'); } },
    { match:['subir foto a galería','subir a galería','galería nueva foto'],
      action:()=>{ AuraModal.close(); setTimeout(()=>AuraMedia?.openUploader(),200); reply('Abriendo galería'); } },
    { match:['cerrar','cancelar','salir','cerrar esto','cerrar menú'],
      action:()=>{ AuraModal.close(); reply('Listo'); } },
    { match:['marcar todo leído','leído todo','limpiar notificaciones'],
      action:()=>{ AuraNotifications?.markAllRead(); reply('Todo marcado como leído'); } },

    // Modo respuesta
    { match:['responde con voz','activa voz','habla','quiero que hables'],
      action:()=>{ setResponseMode('voice'); reply('Ahora te respondo con voz'); } },
    { match:['responde sin voz','desactiva voz','silencio','modo silencioso','calla'],
      action:()=>{ setResponseMode('toast'); reply('Modo silencioso activado'); } },
    { match:['responde con todo','voz y texto','modo completo'],
      action:()=>{ setResponseMode('both'); reply('Voz y texto activados'); } },

    // Control del asistente
    { match:['desactivar asistente','apagar asistente','desactivate','duerme'],
      action:()=>{ disable(); } },
    { match:['ajustes del asistente','configurar asistente','opciones del asistente'],
      action:()=>{ openSettings(); } },

    // Info
    { match:['hola','hey','oye aura','buenos días','buenas tardes','buenas noches'],
      action:()=>{ reply('¡Hola! Aquí estoy. ¿En qué te ayudo?'); } },
    { match:['ayuda','qué puedes hacer','comandos','qué sabes hacer'],
      action:()=>{ reply('Puedo navegar entre páginas, cambiar el tema, crear Ecos, abrir la galería, manejar notificaciones, cambiar mi modo de respuesta y mucho más. Solo dímelo.'); } },
    { match:['quién eres','qué eres','cómo te llamas'],
      action:()=>{ reply('Soy el asistente de Aura. Estoy aquí para ayudarte a controlar la app con tu voz.'); } },
    { match:['cuántos ecos tengo','mis ecos'],
      action:()=>{ const u=AuraAuth.currentUser(); reply(`Tienes ${u?.eco_count||0} Ecos publicados`); } },
    { match:['cuál es mi aura','mi puntuación','cuánto aura tengo'],
      action:()=>{ const u=AuraAuth.currentUser(); reply(`Tu Aura Score es ${u?.aura_score||0} puntos`); } },
    { match:['siguiente eco','siguiente video','pasar eco'],
      action:()=>{ AuraEcos?.next(); reply('Siguiente Eco'); } },
    { match:['eco anterior','volver eco','eco anterior'],
      action:()=>{ AuraEcos?.prev(); reply('Eco anterior'); } },
    { match:['vibrar','vibración'],
      action:()=>{ navigator.vibrate?.([100,50,100,50,100]); reply('¡Bzzzt!'); } },
    { match:['instalar app','instalar aura'],
      action:()=>{ reply('Para instalar Aura toca el menú del navegador y selecciona Agregar a pantalla de inicio'); } },
  ];

  // ══════════════════════════════════════════
  //  RESPONDER
  // ══════════════════════════════════════════
  function reply(text, isError = false) {
    if (responseMode === 'voice' || responseMode === 'both') speak(text);
    if (responseMode === 'toast'  || responseMode === 'both') {
      AuraToast.show(`🤖 ${text}`, isError ? 'error' : 'default');
    }
  }

  function speak(text) {
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES'; u.rate = 1.05; u.pitch = 1.1; u.volume = 1;
    const voices = synth.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) u.voice = esVoice;
    synth.speak(u);
  }

  function setResponseMode(mode) {
    responseMode = mode;
    AuraStore.persist('ai_response_mode', mode);
  }

  function nav(page) {
    AuraModal.close();
    setTimeout(() => AuraRouter.navigate(page), 150);
  }

  // ══════════════════════════════════════════
  //  RECONOCIMIENTO DE VOZ
  // ══════════════════════════════════════════
  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = 'es-ES';
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 3;

    r.onstart = () => {
      isListening = true;
      btn.classList.add('listening');
      AuraToast.show('🎙️ Escuchando...');
      navigator.vibrate?.(50);
    };
    r.onend = () => {
      isListening = false;
      btn.classList.remove('listening');
    };
    r.onerror = (e) => {
      isListening = false;
      btn.classList.remove('listening');
      if (e.error === 'not-allowed') {
        reply('Activa el micrófono en tu navegador', true);
      } else if (e.error === 'no-speech') {
        AuraToast.show('No te escuché 🎙️', 'warning');
      }
    };
    r.onresult = (e) => {
      // Revisar todas las alternativas
      const transcripts = [];
      for (let i = 0; i < e.results[0].length; i++) {
        transcripts.push(e.results[0][i].transcript.toLowerCase().trim());
      }
      AuraToast.show(`🎙️ "${transcripts[0]}"`);
      processCommand(transcripts);
    };
    return r;
  }

  function processCommand(transcripts) {
    for (const cmd of commands) {
      for (const transcript of transcripts) {
        if (cmd.match.some(kw => transcript.includes(kw))) {
          navigator.vibrate?.([30, 20, 30]);
          cmd.action();
          return;
        }
      }
    }
    reply(`No entendí "${transcripts[0]}". Di "ayuda" para ver los comandos.`, true);
  }

  function toggleListen() {
    if (!isEnabled) return;

    if (isListening) {
      recognition?.stop();
      return;
    }

    if (!recognition) {
      recognition = initRecognition();
      if (!recognition) { openManualMenu(); return; }
    }

    try {
      recognition.start();
    } catch(e) {
      recognition = initRecognition();
      try { recognition?.start(); } catch(e2) { openManualMenu(); }
    }
  }

  // ══════════════════════════════════════════
  //  ARRASTRAR — toque corto vs largo
  // ══════════════════════════════════════════
  function initDrag() {
    // ── TOUCH ──
    btn.addEventListener('touchstart', e => {
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
      const r = btn.getBoundingClientRect();
      btnX = r.left; btnY = r.top;
      dragMoved = false; isInDragMode = false;

      // Toque largo (400ms) = modo arrastrar
      longPressTimer = setTimeout(() => {
        isInDragMode = true;
        navigator.vibrate?.(60);
        btn.querySelector('.aura-ai__orb').style.transform = 'scale(1.2)';
      }, 400);
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!longPressTimer && !isInDragMode) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragMoved = true;
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (!dragMoved && !isInDragMode) return;
      if (e.cancelable) e.preventDefault();
      moveTo(btnX + dx, btnY + dy);
    }, { passive: false });

    document.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      btn.querySelector('.aura-ai__orb').style.transform = '';
      if (!dragMoved && !isInDragMode) {
        // Toque corto = activar/desactivar escucha
        toggleListen();
      }
      isInDragMode = false;
      dragMoved = false;
    });

    // ── MOUSE ──
    btn.addEventListener('mousedown', e => {
      startX = e.clientX; startY = e.clientY;
      const r = btn.getBoundingClientRect();
      btnX = r.left; btnY = r.top;
      dragMoved = false; isInDragMode = false;
      longPressTimer = setTimeout(() => {
        isInDragMode = true;
        btn.style.cursor = 'grabbing';
      }, 400);
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!longPressTimer && !isInDragMode) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragMoved = true;
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (!dragMoved && !isInDragMode) return;
      moveTo(btnX + dx, btnY + dy);
    });

    document.addEventListener('mouseup', () => {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      btn.style.cursor = '';
      if (!dragMoved && !isInDragMode) toggleListen();
      isInDragMode = false;
      dragMoved = false;
    });
  }

  function moveTo(x, y) {
    const size = 60;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    x = Math.max(8, Math.min(vw - size - 8, x));
    y = Math.max(64, Math.min(vh - size - 80, y));
    btn.style.left   = x + 'px';
    btn.style.top    = y + 'px';
    btn.style.right  = 'auto';
    btn.style.bottom = 'auto';
    // Guardar posición
    AuraStore.persist('ai_pos', { x, y });
  }

  // ══════════════════════════════════════════
  //  MENÚ MANUAL
  // ══════════════════════════════════════════
  function openManualMenu() {
    AuraModal.show({
      title: '✦ Asistente Aura',
      content: `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <p style="font-size:13px;color:var(--color-text-secondary);text-align:center;">
            Toca una acción rápida
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${[
              ['🏠','Inicio',       "nav('home')"],
              ['🎬','Ecos',         "nav('ecos')"],
              ['💬','Mensajes',     "nav('chat')"],
              ['🌐','Mi Red',       "nav('communities')"],
              ['👤','Perfil',       "nav('profile')"],
              ['✦', 'Aura Score',  "nav('karma')"],
              ['🔍','Buscar',       "nav('search')"],
              ['🖼️','Galería',      "nav('media')"],
              ['🔔','Notificaciones',"nav('notifications')"],
              ['🎨','Temas',        "AuraModal.close();AuraModal.show({title:'Elige tu tema',content:AuraTheme.renderPicker()})"],
              ['✏️','Crear Eco',    "AuraModal.close();setTimeout(()=>AuraCreate?.open('text'),180)"],
              ['⚙️','Asistente',   "AuraModal.close();setTimeout(()=>AuraAI.openSettings(),180)"],
            ].map(([icon,label,action]) => `
              <button onclick="AuraModal.close();setTimeout(()=>{${action}},150)"
                style="display:flex;flex-direction:column;align-items:center;gap:6px;
                background:var(--color-bg-input);border-radius:14px;padding:14px 8px;
                font-size:13px;font-weight:500;cursor:pointer;
                border:1px solid var(--color-border);">
                <span style="font-size:24px;">${icon}</span>${label}
              </button>
            `).join('')}
          </div>
          <button onclick="AuraModal.close();setTimeout(()=>AuraAI.startVoice(),300)"
            class="btn btn-primary btn-block">
            🎙️ Activar voz
          </button>
        </div>
      `
    });
  }

  // ══════════════════════════════════════════
  //  AJUSTES DEL ASISTENTE
  // ══════════════════════════════════════════
  function openSettings() {
    const modeLabel = { voice:'Solo voz 🔊', toast:'Solo texto 💬', both:'Voz y texto ✦' };
    AuraModal.show({
      title: '⚙️ Asistente Aura',
      content: `
        <div style="display:flex;flex-direction:column;gap:0;">

          <div class="settings-row" onclick="AuraAI.toggleEnabled()">
            <div class="settings-row__icon">🤖</div>
            <div class="settings-row__content">
              <div class="settings-row__title">Asistente</div>
              <div class="settings-row__subtitle">${isEnabled ? 'Activado — toca para desactivar' : 'Desactivado — toca para activar'}</div>
            </div>
            <div class="toggle ${isEnabled ? 'on' : ''}" id="ai-toggle"></div>
          </div>

          <div class="settings-row" onclick="AuraAI.cycleResponseMode()">
            <div class="settings-row__icon">🔊</div>
            <div class="settings-row__content">
              <div class="settings-row__title">Modo de respuesta</div>
              <div class="settings-row__subtitle" id="mode-label">${modeLabel[responseMode]}</div>
            </div>
          </div>

          <div class="settings-row" onclick="AuraAI.startVoice();AuraModal.close()">
            <div class="settings-row__icon">🎙️</div>
            <div class="settings-row__content">
              <div class="settings-row__title">Activar escucha</div>
              <div class="settings-row__subtitle">Hablar ahora con el asistente</div>
            </div>
          </div>

          <div class="settings-row" onclick="AuraAI.openManualMenu()">
            <div class="settings-row__icon">📋</div>
            <div class="settings-row__content">
              <div class="settings-row__title">Acciones rápidas</div>
              <div class="settings-row__subtitle">Ver menú de acciones</div>
            </div>
          </div>

          <div style="padding:16px;background:var(--color-bg-secondary);border-radius:12px;margin-top:8px;">
            <div style="font-size:12px;font-weight:700;color:var(--color-text-muted);margin-bottom:8px;">INSTRUCCIONES</div>
            <div style="font-size:13px;color:var(--color-text-secondary);line-height:1.7;">
              • <b>Toque corto</b> → activar / parar escucha<br>
              • <b>Toque largo</b> → arrastrar el botón<br>
              • Di <b>"ayuda"</b> para ver todos los comandos<br>
              • Di <b>"desactivar asistente"</b> para apagarlo
            </div>
          </div>
        </div>
      `
    });
  }

  // ══════════════════════════════════════════
  //  ACTIVAR / DESACTIVAR
  // ══════════════════════════════════════════
  function enable() {
    isEnabled = true;
    AuraStore.persist('ai_enabled', true);
    if (btn) btn.style.display = 'block';
    AuraToast.show('Asistente Aura activado ✦', 'success');
  }

  function disable() {
    if (isListening) recognition?.stop();
    isEnabled = false;
    AuraStore.persist('ai_enabled', false);
    if (btn) btn.style.opacity = '0.35';
    reply('Asistente desactivado. Toca el botón para reactivarlo.');
  }

  function toggleEnabled() {
    isEnabled ? disable() : enable();
    // Actualizar toggle visual
    const t = document.getElementById('ai-toggle');
    if (t) t.classList.toggle('on', isEnabled);
    const sub = document.querySelector('#ai-toggle')?.closest('.settings-row')?.querySelector('.settings-row__subtitle');
    if (sub) sub.textContent = isEnabled ? 'Activado — toca para desactivar' : 'Desactivado — toca para activar';
  }

  function cycleResponseMode() {
    const modes = ['both', 'voice', 'toast'];
    const idx = modes.indexOf(responseMode);
    responseMode = modes[(idx + 1) % modes.length];
    AuraStore.persist('ai_response_mode', responseMode);
    const modeLabel = { voice:'Solo voz 🔊', toast:'Solo texto 💬', both:'Voz y texto ✦' };
    const el = document.getElementById('mode-label');
    if (el) el.textContent = modeLabel[responseMode];
    reply(`Modo: ${modeLabel[responseMode]}`);
  }

  // ══════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════
  function init() {
    btn = document.getElementById('aura-ai-btn');
    if (!btn) return;

    // Restaurar posición guardada
    const savedPos = AuraStore.load('ai_pos', null);
    if (savedPos) {
      btn.style.left = savedPos.x + 'px';
      btn.style.top  = savedPos.y + 'px';
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    }

    // Estado inicial
    if (!isEnabled) btn.style.opacity = '0.35';

    initDrag();

    // Precargar voces
    synth?.getVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', () => {});
  }

  function startVoice() {
    AuraModal.close();
    setTimeout(toggleListen, 300);
  }

  return {
    init, startVoice, reply, speak,
    toggleListen, openManualMenu, openSettings,
    enable, disable, toggleEnabled, cycleResponseMode,
    setResponseMode, processCommand,