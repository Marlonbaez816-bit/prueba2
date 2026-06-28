/* ============================================
   AURA — media.js
   Galería real con agrupación de fotos/videos
   Visor de pantalla completa
   Subida de archivos real (FileReader API)
   ============================================ */

window.AuraMedia = (() => {
  let _items = AuraStore.load('media_items', []);

  // ── SUBIR ARCHIVO REAL ──
  function openUploader() {
    AuraModal.show({
      title: 'Subir a tu Galería',
      content: `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div id="drop-zone" onclick="document.getElementById('file-input').click()"
            style="border:2px dashed var(--color-border-strong);border-radius:16px;
            padding:32px;text-align:center;cursor:pointer;
            background:var(--color-bg-input);transition:all .2s;">
            <div style="font-size:36px;margin-bottom:8px;">📁</div>
            <div style="font-size:15px;font-weight:600;">Toca para elegir</div>
            <div style="font-size:13px;color:var(--color-text-muted);margin-top:4px;">
              Fotos y videos · JPG, PNG, MP4, MOV
            </div>
          </div>
          <input type="file" id="file-input" multiple accept="image/*,video/*"
            style="display:none" onchange="AuraMedia.handleFiles(this.files)">

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <button onclick="AuraMedia.openCamera('photo')" class="btn btn-secondary">
              📷 Cámara
            </button>
            <button onclick="AuraMedia.openCamera('video')" class="btn btn-secondary">
              🎬 Grabar
            </button>
          </div>
        </div>
      `
    });
  }

  // ── PROCESAR ARCHIVOS ──
  function handleFiles(files) {
    if (!files || files.length === 0) return;
    AuraModal.close();
    const arr = Array.from(files);
    let loaded = 0;
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = {
          id: Date.now() + Math.random(),
          type: file.type.startsWith('video') ? 'video' : 'image',
          src: e.target.result,
          name: file.name,
          size: file.size,
          date: new Date().toISOString(),
          group: _getDateGroup(new Date()),
        };
        _items.unshift(item);
        loaded++;
        if (loaded === arr.length) {
          AuraStore.persist('media_items', _items);
          AuraToast.show(`${loaded} archivo${loaded>1?'s':''} subido${loaded>1?'s':''} ✦`, 'success');
          AuraKarma?.add(5, 'Contenido subido');
          if (AuraRouter.current() === 'media') AuraRouter.navigate('media');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ── CÁMARA ──
  function openCamera(mode) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mode === 'video' ? 'video/*' : 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handleFiles(e.target.files);
    input.click();
  }

  // ── AGRUPAR POR FECHA ──
  function _getDateGroup(date) {
    const today = new Date();
    const diff  = Math.floor((today - date) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7)  return 'Esta semana';
    return date.toLocaleDateString('es', { month:'long', year:'numeric' });
  }

  function _groupItems(items) {
    const groups = {};
    items.forEach(item => {
      const g = item.group || 'Sin fecha';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  }

  // ── VISOR PANTALLA COMPLETA ──
  function openViewer(id) {
    const item = _items.find(x => x.id === id);
    if (!item) return;
    AuraModal.show({
      title: null,
      content: `
        <div style="text-align:center;">
          ${item.type === 'video'
            ? `<video src="${item.src}" controls autoplay style="width:100%;border-radius:12px;max-height:60dvh;object-fit:contain;"></video>`
            : `<img src="${item.src}" style="width:100%;border-radius:12px;max-height:60dvh;object-fit:contain;" alt="Foto">`
          }
          <div style="margin-top:12px;display:flex;gap:10px;justify-content:center;">
            <button onclick="AuraMedia.deleteItem(${id})" class="btn btn-outline btn-sm">🗑️ Borrar</button>
            <button onclick="AuraMedia.shareItem('${item.src}')" class="btn btn-primary btn-sm">📤 Compartir</button>
          </div>
        </div>
      `
    });
  }

  function deleteItem(id) {
    _items = _items.filter(x => x.id !== id);
    AuraStore.persist('media_items', _items);
    AuraModal.close();
    AuraToast.show('Eliminado');
    setTimeout(() => AuraRouter.navigate('media'), 200);
  }

  function shareItem(src) {
    if (navigator.share) {
      navigator.share({ title: 'Compartir desde Aura', url: window.location.href }).catch(() => {});
    } else {
      AuraToast.show('Compartir próximamente', 'warning');
    }
  }

  // ── RENDER ──
  function render() {
    const groups = _groupItems(_items);
    const hasItems = _items.length > 0;

    return `
      <div class="page">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 16px 8px;">
          <span style="font-size:13px;color:var(--color-text-muted);">${_items.length} archivos</span>
          <button onclick="AuraMedia.openUploader()" class="btn btn-primary btn-sm">+ Subir</button>
        </div>

        ${!hasItems ? `
          <div class="empty-state">
            <div class="empty-state__icon">🖼️</div>
            <div class="empty-state__title">Tu galería está vacía</div>
            <div class="empty-state__text">Sube fotos y videos para verlos aquí agrupados</div>
            <button onclick="AuraMedia.openUploader()" class="btn btn-primary" style="margin-top:16px;">
              + Subir fotos o videos
            </button>
          </div>
        ` : Object.entries(groups).map(([group, items]) => `
          <div style="padding:0 16px;">
            <div style="font-size:13px;font-weight:700;color:var(--color-text-secondary);
              padding:12px 0 8px;text-transform:uppercase;letter-spacing:.5px;">${group}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;border-radius:12px;overflow:hidden;">
              ${items.map(item => `
                <div onclick="AuraMedia.openViewer(${item.id})"
                  style="aspect-ratio:1;background:var(--color-bg-secondary);cursor:pointer;
                  position:relative;overflow:hidden;">
                  ${item.type === 'video'
                    ? `<video src="${item.src}" style="width:100%;height:100%;object-fit:cover;" muted></video>
                       <div style="position:absolute;bottom:4px;right:4px;
                         background:rgba(0,0,0,.5);border-radius:4px;padding:2px 5px;
                         font-size:11px;color:white;">▶</div>`
                    : `<img src="${item.src}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" alt="">`
                  }
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <div style="height:24px;"></div>
      </div>
    `;
  }

  function init() {
    AuraRouter.register('media', render);
  }

  return { init, render, openUploader, handleFiles, openCamera, openViewer, deleteItem, shareItem };
})();