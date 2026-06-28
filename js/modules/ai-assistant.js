/* ============================================
   AURA — ai-assistant.js
   Asistente de voz real con Web Speech API
   Botón arrastrable sin bloquearse
   ============================================ */

window.AuraAI = (() => {
  let btn, orb, isDragging = false;
  let dragStartX, dragStartY, btnStartX, btnStartY;
  let dragMoved = false;
  let recognition = null;
  let isListening = false;
  let synth = window.speechSynthesis;

  // ── COMANDOS DE VOZ ──
  const commands = [
    { match: ['inicio','home','principal'],       action: () => { AuraRouter.navigate('home');         speak('Abriendo inicio'); } },
    { match: ['ecos','videos','reels'],            action: () => { AuraRouter.navigate('ecos');         speak('Abriendo Ecos'); } },
    { match: ['chat','mensajes','mensaje'],        action: () => { AuraRouter.navigate('chat');         speak('Abriendo mensajes'); } },
    { match: ['red','comunidad','comunidades'],    action: () => { AuraRouter.navigate('communities'); speak('Abriendo tu red'); } },
    { match: ['perfil','mi perfil'],               action: () => { AuraRouter.navigate('profile');      speak('Abriendo tu perfil'); } },
    { match: ['ajustes','configuración','config'], action: () => { AuraRouter.navigate('settings');     speak('Abriendo ajustes'); } },
    { match: ['tema oscuro','modo oscuro'],        action: () => { AuraTheme.apply('theme-dark');       speak('Tema oscuro activado'); } },
    { match: ['tema claro','modo claro'],          action: () => { AuraTheme.apply('theme-default');    speak('Tema claro activado'); } },
    { match: ['tema medianoche','medianoche'],     action: () => { AuraTheme.apply('theme-midnight');   speak('Tema medianoche activado'); } },
    { match: ['tema rosa','rosa'],                 action: () => { AuraTheme.apply('theme-rose');       speak('Tema rosa activado'); } },
    { match: ['tema océano','océano','ocean'],     action: () => { AuraTheme.apply('theme-ocean');      speak('Tema océano activado'); } },
    { match: ['notificaciones','notificación'],    action: () => { document.getElementById('btn-notifications')?.click(); speak('Abriendo notificaciones'); } },
    { match: ['buscar','búsqueda','search'],       action: () => { document.getElementById('btn-search')?.click(); speak('Abriendo búsqueda'); } },
    { match: ['crear','nuevo eco','publicar'],     action: () => { document.querySelector('[data-action="create"]')?.click(); speak('Crear nuevo Eco'); } },
    { match: ['aura score','karma','puntos'],      action: () => { AuraRouter.navigate('karma');        speak('Tu Aura Score'); } },
    { match: ['cerrar','salir','cancelar'],        action: () => { AuraModal.close();                   speak('Listo'); } },
    { match: ['hola','hey','oye aura'],            action: () => { speak('Hola, aquí estoy. ¿En qué te ayudo?'); } },
    { match: ['ayuda','qué puedes hacer','comandos'], action: () => {
        speak('Puedo abrir inicio, ecos, chat, tu red, perfil, ajustes, cambiar el tema, buscar, crear ecos y más. Solo dímelo.');
    }},
  ];

  // ── HABLAR ──
  function speak(text) {
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 1.05;
    u.pitch = 1.1;
    u.volume = 1;
    // Buscar voz en español
    const voices = synth.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) u.voice = esVoice;
    synth.speak(u);
  }

  // ── RECONOCIMIENTO ──
  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = 'es-ES';
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart  = () => { isListening = true;  btn.classList.add('listening');    AuraToast.show('🎙️ Escuchando...'); };
    r.onend    = () => { isListening = false; btn.classList.remove('listening'); };
    r.onerror  = (e) => {
      isListening = false; btn.classList.remove('listening');
      if (e.error === 'not-allowed') AuraToast.show('Activa el micrófono en tu navegador', 'error');
      else if (e.error !== 'no-speech') AuraToast.show('No te escuché, intenta de nuevo', 'warning');
    };
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim();
      AuraToast.show(`🎙️ "${transcript}"`);
      processCommand(transcript);
    };
    return r;
  }

  function processCommand(text) {
    for (const cmd of commands) {
      if (cmd.match.some(kw => text.includes(kw))) {
        cmd.action();
        return;
      }
    }
    speak(`No entendí "${text}". Di "ayuda" para ver los comandos.`);
    AuraToast.show('No reconocí ese comando', 'warning');
  }

  function toggleListen() {
    if (!recognition) {
      recognition = initRecognition();
      if (!recognition) {
        // Fallback: abrir menú manual
        openManualMenu();
        return;
      }
    }
    if (isListening) {
      recognition.stop();
    } else {
      try { recognition.start(); } catch(e) { recognition = initRecognition(); try { recognition.start(); } catch(e2) {} }
    }
  }

  // ── MENÚ MANUAL (fallback si no hay micrófono) ──
  function openManualMenu() {
    AuraModal.show({
      title: '✦ Asistente Aura',
      content: `
        <p style="font-size:13px;color:var(--color-text-secondary);text-align:center;margin-bottom:16px;">
          Toca una acción o activa el micrófono
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${[
            ['🏠','Inicio',      "AuraRouter.navigate('home')"],
            ['🎬','Ecos',        "AuraRouter.navigate('ecos')"],
            ['💬','Mensajes',    "AuraRouter.navigate('chat')"],
            ['🌐','Mi Red',      "AuraRouter.navigate('communities')"],
            ['👤','Perfil',      "AuraRouter.navigate('profile')"],
            ['✦', 'Aura Score', "AuraRouter.navigate('karma')"],
            ['🎨','Temas',       "AuraModal.close();AuraModal.show({title:'Elige tu tema',content:AuraTheme.renderPicker()})"],
            ['🔔','Notificaciones',"document.getElementById('btn-notifications')?.click()"],
          ].map(([icon,label,action]) => `
            <button onclick="AuraModal.close();${action}"
              style="display:flex;flex-direction:column;align-items:center;gap:6px;
              background:var(--color-bg-input);border-radius:14px;padding:16px 8px;
              font-size:13px;font-weight:500;cursor:pointer;
              border:1px solid var(--color-border);transition:background .12s;">
              <span style="font-size:26px;">${icon}</span>
              <span>${label}</span>
            </button>
          `).join('')}
        </div>
        <button onclick="AuraAI.startVoice()" class="btn btn-primary btn-block" style="margin-top:16px;">
          🎙️ Activar voz
        </button>
      `
    });
  }

  // ── DRAG — sin bloqueo ──
  function initDrag() {
    // Touch
    btn.addEventListener('touchstart', e => {
      const t = e.touches[0];
      dragStartX = t.clientX; dragStartY = t.clientY;
      const r = btn.getBoundingClientRect();
      btnStartX = r.left; btnStartY = r.top;
      dragMoved = false;
      isDragging = true;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStartX;
      const dy = t.clientY - dragStartY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragMoved = true;
      if (!dragMoved) return;
      if (e.cancelable) e.preventDefault();
      moveTo(btnStartX + dx, btnStartY + dy);
    }, { passive: false });

    document.addEventListener('touchend', () => {
      isDragging = false;
      if (!dragMoved) toggleListen(); // tap
      dragMoved = false;
    });

    // Mouse
    btn.addEventListener('mousedown', e => {
      dragStartX = e.clientX; dragStartY = e.clientY;
      const r = btn.getBoundingClientRect();
      btnStartX = r.left; btnStartY = r.top;
      dragMoved = false;
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragMoved = true;
      if (!dragMoved) return;
      moveTo(btnStartX + dx, btnStartY + dy);
    });

    document.addEventListener('mouseup', () => {
      if (isDragging && !dragMoved) toggleListen();
      isDragging = false; dragMoved = false;
    });
  }

  function moveTo(x, y) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const size = 60;
    x = Math.max(8, Math.min(vw - size - 8, x));
    y = Math.max(64, Math.min(vh - size - 80, y));
    btn.style.left   = x + 'px';
    btn.style.top    = y + 'px';
    btn.style.right  = 'auto';
    btn.style.bottom = 'auto';
  }

  // ── INIT ──
  function init() {
    btn = document.getElementById('aura-ai-btn');
    orb = document.getElementById('ai-orb');
    if (!btn) return;
    initDrag();
    // Precargar voces
    if (synth) synth.getVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', () => {});
  }

  function startVoice() {
    AuraModal.close();
    setTimeout(toggleListen, 300);
  }

  return { init, startVoice, speak, processCommand, openManualMenu };
})();