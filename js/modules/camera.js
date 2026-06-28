window.AuraCamera = (() => {
  'use strict';

  let stream = null;
  let facingMode = 'environment';
  let currentFilter = 'none';
  let isRecording = false;
  let mediaRecorder = null;
  let recordedChunks = [];
  let timerInterval = null;
  let timerSeconds = 0;
  let gridVisible = false;
  let levelVisible = false;
  let lastPhoto = null;
  let mode = 'photo';
  const timerOptions = [0, 3, 5, 10];
  let timerMode = 0;

  const filters = [
    { name: 'Normal',  value: 'none' },
    { name: 'Aura',    value: 'saturate(1.8) hue-rotate(20deg) brightness(1.05)' },
    { name: 'Noir',    value: 'grayscale(1) contrast(1.2)' },
    { name: 'Cálido',  value: 'sepia(.45) saturate(1.4) brightness(1.05)' },
    { name: 'Frío',    value: 'hue-rotate(180deg) saturate(.9) brightness(1.1)' },
    { name: 'Neón',    value: 'saturate(3) contrast(1.1) brightness(.95)' },
    { name: 'Vintage', value: 'sepia(.6) contrast(.85) brightness(1.1) saturate(.8)' },
    { name: 'Fade',    value: 'contrast(.85) brightness(1.15) saturate(.7)' },
  ];

  // ── STREAM ──
  async function _startStream() {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      const video = document.getElementById('cam-video');
      if (video) {
        video.srcObject = stream;
        await video.play();
        video.style.filter = currentFilter === 'none' ? '' : currentFilter;

        const canvas = document.getElementById('cam-canvas');
        if (canvas) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }
      }

    } catch (err) {
      AuraToast.show('No se pudo acceder a la cámara: ' + err.message, 'error');
      close();
    }
  }

  // ── RENDER ──
  function render() {
    const page = document.createElement('div');
    page.id = 'camera-page';
    page.className = 'camera-page';
    page.innerHTML = `

      <div class="camera-viewfinder" id="cam-viewfinder">
        <video id="cam-video" class="camera-video" autoplay muted playsinline></video>
        <canvas id="cam-canvas" class="camera-canvas-overlay"></canvas>

        <div class="camera-flash" id="cam-flash"></div>
        <div class="camera-timer-display hidden" id="cam-timer-display"></div>
        <div class="camera-grid hidden" id="cam-grid"></div>

        <div class="camera-level hidden" id="cam-level">
          <div class="camera-level-dot" id="cam-level-dot"></div>
        </div>

        <div class="camera-corners">
          <div class="camera-corner camera-corner--tl"></div>
          <div class="camera-corner camera-corner--tr"></div>
          <div class="camera-corner camera-corner--bl"></div>
          <div class="camera-corner camera-corner--br"></div>
        </div>

        <div class="camera-hud">
          <div class="camera-hud-pill" id="cam-rec-pill" style="display:none">
            <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;animation:timerPop .8s infinite"></span>
            REC <span id="cam-rec-time">0:00</span>
          </div>
          <div class="camera-hud-pill" id="cam-zoom-pill">1×</div>
          <div style="display:flex;gap:8px">
            <div class="camera-hud-pill" id="cam-grid-btn" style="cursor:pointer" onclick="AuraCamera._toggleGrid()">⊞</div>
            <div class="camera-hud-pill" id="cam-level-btn" style="cursor:pointer" onclick="AuraCamera._toggleLevel()">◈</div>
          </div>
        </div>

        <button onclick="AuraCamera.close()"
          style="position:absolute;top:16px;left:16px;z-index:10;
          background:rgba(0,0,0,.45);backdrop-filter:blur(8px);
          border:none;color:white;width:36px;height:36px;border-radius:50%;
          font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
          ✕
        </button>

        <div id="cam-zoom-indicator" style="
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          background:rgba(0,0,0,.6);color:white;padding:8px 18px;border-radius:99px;
          font-size:16px;font-weight:700;opacity:0;transition:opacity .3s;pointer-events:none;">
          1×
        </div>
      </div>

      <div class="camera-controls">
        <div class="camera-filters" id="cam-filters">
          ${filters.map((f, i) => `
            <div class="camera-filter-btn ${i === 0 ? 'active' : ''}"
              onclick="AuraCamera._setFilter('${f.value}', this)">
              <div class="camera-filter-preview" style="filter:${f.value === 'none' ? '' : f.value}"></div>
              <span class="camera-filter-name">${f.name}</span>
            </div>
          `).join('')}
        </div>

        <div class="camera-actions">

          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <button class="camera-side-btn" onclick="AuraCamera._cycleTimer()">⏱</button>
            <span id="cam-timer-label" style="font-size:10px;color:rgba(255,255,255,.7)">Off</span>
          </div>

          <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <div style="display:flex;gap:16px;margin-bottom:4px">
              <span id="cam-mode-photo" onclick="AuraCamera._setMode('photo')"
                style="font-size:12px;font-weight:700;color:white;cursor:pointer;opacity:1">FOTO</span>
              <span id="cam-mode-video" onclick="AuraCamera._setMode('video')"
                style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);cursor:pointer">VIDEO</span>
            </div>
            <div class="camera-shutter" id="cam-shutter" onclick="AuraCamera._shoot()"></div>
          </div>

          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <button class="camera-side-btn" onclick="AuraCamera._flip()">🔄</button>
            <span style="font-size:10px;color:rgba(255,255,255,.7)">Girar</span>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(page);
    _startStream();
    _initZoom();
    _initGyroLevel();
  }

  // ── MODO ──
  function _setMode(m) {
    mode = m;
    const shutter = document.getElementById('cam-shutter');
    document.getElementById('cam-mode-photo').style.opacity = m === 'photo' ? '1' : '.5';
    document.getElementById('cam-mode-video').style.opacity = m === 'video' ? '1' : '.5';
    if (shutter) {
      shutter.style.borderColor = m === 'video' ? '#ef4444' : 'white';
      shutter.style.background  = m === 'video' ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.15)';
    }
    if (isRecording) _stopRecording();
  }

  // ── TEMPORIZADOR ──
  function _cycleTimer() {
    timerMode = (timerMode + 1) % timerOptions.length;
    const label = document.getElementById('cam-timer-label');
    if (label) label.textContent = timerOptions[timerMode] === 0 ? 'Off' : `${timerOptions[timerMode]}s`;
  }

  function _shoot() {
    const secs = timerOptions[timerMode];
    if (secs > 0) {
      _runTimer(secs, () => mode === 'photo' ? _takePhoto() : _toggleRecording());
    } else {
      mode === 'photo' ? _takePhoto() : _toggleRecording();
    }
  }

  function _runTimer(secs, cb) {
    const display = document.getElementById('cam-timer-display');
    if (!display) return;
    display.classList.remove('hidden');
    let remaining = secs;
    display.textContent = remaining;
    navigator.vibrate?.([100]);
    const iv = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(iv);
        display.classList.add('hidden');
        cb();
      } else {
        display.textContent = remaining;
        navigator.vibrate?.([50]);
      }
    }, 1000);
  }

  // ── FOTO ──
  function _takePhoto() {
    const video = document.getElementById('cam-video');
    const flash = document.getElementById('cam-flash');
    if (!video) return;

    if (flash) {
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 120);
    }
    navigator.vibrate?.([30]);

    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    if (currentFilter !== 'none') ctx.filter = currentFilter;
    ctx.drawImage(video, 0, 0);

    lastPhoto = canvas.toDataURL('image/jpeg', .92);
    _showPreview(lastPhoto);
  }

  // ── PREVIEW FOTO ──
  function _showPreview(src) {
    document.getElementById('cam-preview-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'cam-preview-overlay';
    overlay.className = 'camera-preview';
    overlay.innerHTML = `
      <img src="${src}" alt="Foto"
        style="max-width:90%;max-height:60dvh;border-radius:16px;
        box-shadow:0 20px 60px rgba(0,0,0,.5);
        animation:bounceIn .4s cubic-bezier(.34,1.56,.64,1)">
      <div class="camera-preview-actions">
        <button onclick="AuraCamera._discardPhoto()"
          style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:white;
          border:1px solid rgba(255,255,255,.3);padding:12px 24px;border-radius:99px;
          font-size:14px;font-weight:600;cursor:pointer;">
          🗑 Descartar
        </button>
        <button onclick="AuraCamera._downloadPhoto()"
          style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:white;
          border:1px solid rgba(255,255,255,.3);padding:12px 24px;border-radius:99px;
          font-size:14px;font-weight:600;cursor:pointer;">
          ⬇ Guardar
        </button>
        <button onclick="AuraCamera._postPhoto()"
          style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;
          border:none;padding:12px 24px;border-radius:99px;
          font-size:14px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 16px rgba(124,58,237,.4);">
          ✦ Postear
        </button>
      </div>
    `;
    document.getElementById('camera-page')?.appendChild(overlay);
  }

  function _discardPhoto() {
    document.getElementById('cam-preview-overlay')?.remove();
    lastPhoto = null;
  }

  function _downloadPhoto() {
    const a = document.createElement('a');
    a.href = lastPhoto;
    a.download = `aura-${Date.now()}.jpg`;
    a.click();
    AuraToast.show('Foto guardada ✦', 'success');
  }

  function _postPhoto() {
    document.getElementById('cam-preview-overlay')?.remove();
    close();
    setTimeout(() => {
      AuraModal.show({
        title: 'Nuevo Eco',
        content: `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <img src="${lastPhoto}"
              style="width:100%;border-radius:14px;max-height:260px;object-fit:cover;">
            <textarea id="post-caption" placeholder="Escribe algo..." rows="3"
              style="width:100%;background:var(--color-bg-input);
              border:1px solid var(--color-border);border-radius:12px;
              padding:12px;font-size:15px;color:var(--color-text-primary);
              resize:none;font-family:inherit;"></textarea>
            <button onclick="AuraCamera._confirmPost()"
              style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;
              border:none;padding:14px;border-radius:14px;font-size:15px;
              font-weight:700;cursor:pointer;width:100%;">
              Publicar Eco ✦
            </button>
          </div>
        `
      });
    }, 200);
  }

  function _confirmPost() {
    const caption = document.getElementById('post-caption')?.value || '';
    AuraModal.close();
    AuraToast.show('Eco publicado ✦', 'success');
    console.log('Post:', { photo: lastPhoto, caption });
    lastPhoto = null;
  }

  // ── VIDEO ──
  function _toggleRecording() {
    isRecording ? _stopRecording() : _startRecording();
  }

  function _startRecording() {
    if (!stream) return;
    recordedChunks = [];

    // Crear stream de video sin audio del stream actual
    const videoTrack = stream.getVideoTracks()[0];
    const videoOnlyStream = new MediaStream([videoTrack]);

    try {
      mediaRecorder = new MediaRecorder(videoOnlyStream, { mimeType: 'video/webm' });
    } catch(e) {
      mediaRecorder = new MediaRecorder(videoOnlyStream);
    }

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = _handleVideoStop;
    mediaRecorder.start(100);
    isRecording = true;

    const shutter = document.getElementById('cam-shutter');
    if (shutter) shutter.style.background = 'rgba(239,68,68,.5)';

    const pill = document.getElementById('cam-rec-pill');
    if (pill) pill.style.display = 'flex';

    timerSeconds = 0;
    timerInterval = setInterval(() => {
      timerSeconds++;
      const el = document.getElementById('cam-rec-time');
      if (el) {
        const m = Math.floor(timerSeconds / 60);
        const s = timerSeconds % 60;
        el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  function _stopRecording() {
    if (mediaRecorder && isRecording) mediaRecorder.stop();
    isRecording = false;
    clearInterval(timerInterval);
    const pill = document.getElementById('cam-rec-pill');
    if (pill) pill.style.display = 'none';
    const shutter = document.getElementById('cam-shutter');
    if (shutter) shutter.style.background = 'rgba(255,255,255,.15)';
  }

  function _handleVideoStop() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    _showVideoPreview(url);
  }

  function _showVideoPreview(url) {
    document.getElementById('cam-preview-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'cam-preview-overlay';
    overlay.className = 'camera-preview';
    overlay.innerHTML = `
      <video src="${url}" controls autoplay muted loop
        style="max-width:90%;max-height:60dvh;border-radius:16px;
        box-shadow:0 20px 60px rgba(0,0,0,.5)"></video>
      <div class="camera-preview-actions">
        <button onclick="AuraCamera._discardPhoto()"
          style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:white;
          border:1px solid rgba(255,255,255,.3);padding:12px 24px;border-radius:99px;
          font-size:14px;font-weight:600;cursor:pointer;">
          🗑 Descartar
        </button>
        <button onclick="AuraCamera._downloadVideo('${url}')"
          style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:white;
          border:1px solid rgba(255,255,255,.3);padding:12px 24px;border-radius:99px;
          font-size:14px;font-weight:600;cursor:pointer;">
          ⬇ Guardar
        </button>
        <button onclick="AuraCamera._postVideo('${url}')"
          style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;
          border:none;padding:12px 24px;border-radius:99px;
          font-size:14px;font-weight:700;cursor:pointer;
          box-shadow:0 4px 16px rgba(124,58,237,.4);">
          ✦ Postear Eco
        </button>
      </div>
    `;
    document.getElementById('camera-page')?.appendChild(overlay);
  }

  function _downloadVideo(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-eco-${Date.now()}.webm`;
    a.click();
    AuraToast.show('Video guardado ✦', 'success');
  }

  function _postVideo(url) {
    document.getElementById('cam-preview-overlay')?.remove();
    close();
    setTimeout(() => {
      AuraModal.show({
        title: 'Nuevo Eco de Video',
        content: `
          <div style="display:flex;flex-direction:column;gap:14px;">
            <video src="${url}" controls muted
              style="width:100%;border-radius:14px;max-height:220px;object-fit:cover;"></video>
            <textarea id="post-caption" placeholder="Escribe algo..." rows="3"
              style="width:100%;background:var(--color-bg-input);
              border:1px solid var(--color-border);border-radius:12px;
              padding:12px;font-size:15px;color:var(--color-text-primary);
              resize:none;font-family:inherit;"></textarea>
            <button onclick="AuraCamera._confirmPost()"
              style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;
              border:none;padding:14px;border-radius:14px;font-size:15px;
              font-weight:700;cursor:pointer;width:100%;">
              Publicar Eco ✦
            </button>
          </div>
        `
      });
    }, 200);
  }

  // ── FLIP ──
  function _flip() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    const video = document.getElementById('cam-video');
    if (video) video.style.transform = facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
    _startStream();
    navigator.vibrate?.([15]);
  }

  // ── FILTROS ──
  function _setFilter(value, el) {
    currentFilter = value;
    const video = document.getElementById('cam-video');
    if (video) video.style.filter = value === 'none' ? '' : value;
    document.querySelectorAll('.camera-filter-btn').forEach(b => b.classList.remove('active'));
    el?.classList.add('active');
  }

  // ── GRID ──
  function _toggleGrid() {
    gridVisible = !gridVisible;
    document.getElementById('cam-grid')?.classList.toggle('hidden', !gridVisible);
    const btn = document.getElementById('cam-grid-btn');
    if (btn) btn.style.color = gridVisible ? '#a78bfa' : 'white';
  }

  // ── NIVEL ──
  function _toggleLevel() {
    levelVisible = !levelVisible;
    document.getElementById('cam-level')?.classList.toggle('hidden', !levelVisible);
    const btn = document.getElementById('cam-level-btn');
    if (btn) btn.style.color = levelVisible ? '#a78bfa' : 'white';
  }

  function _initGyroLevel() {
    window.addEventListener('deviceorientation', e => {
      if (!levelVisible) return;
      const dot = document.getElementById('cam-level-dot');
      if (!dot) return;
      const tilt = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      dot.style.left = `calc(50% + ${tilt * 22}px)`;
      dot.classList.toggle('leveled', Math.abs(tilt) < .08);
    });
  }

  // ── ZOOM PINCH ──
  function _initZoom() {
    const vf = document.getElementById('cam-viewfinder');
    if (!vf) return;
    let initialDist = 0;
    let currentZoom = 1;

    vf.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        initialDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    vf.addEventListener('touchmove', e => {
      if (e.touches.length !== 2) return;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / initialDist;
      currentZoom = Math.max(1, Math.min(5, currentZoom * scale));
      initialDist = dist;

      const video = document.getElementById('cam-video');
      if (video) {
        const mirror = facingMode === 'user' ? -1 : 1;
        video.style.transform = `scaleX(${mirror}) scale(${currentZoom})`;
      }

      const pill = document.getElementById('cam-zoom-pill');
      if (pill) pill.textContent = `${currentZoom.toFixed(1)}×`;

      const ind = document.getElementById('cam-zoom-indicator');
      if (ind) {
        ind.textContent = `${currentZoom.toFixed(1)}×`;
        ind.style.opacity = '1';
        clearTimeout(ind._t);
        ind._t = setTimeout(() => { ind.style.opacity = '0'; }, 800);
      }
    }, { passive: true });
  }

  // ── OPEN / CLOSE ──
  function open() {
    if (document.getElementById('camera-page'))