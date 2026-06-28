/* ============================================
   AURA — supabase.js
   Conexión real con Supabase
   Pon este archivo en js/modules/supabase.js
   ============================================ */

const SUPABASE_URL  = 'https://akkotzmreadksrcuykhs.supabase.co';
const SUPABASE_KEY  = 'sb_publisible_1era0nuspNKNZp0BaXle0w_BRo5ock1';

/* Carga el SDK de Supabase desde CDN */
window.AuraDB = (() => {
  let client = null;

  async function init() {
    // Cargar SDK si no está cargado
    if (!window.supabase) {
      await _loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✦ Supabase conectado');
    return client;
  }

  function _loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function getClient() { return client; }

  // ── USUARIOS ──
  async function getUsuario(id) {
    const { data, error } = await client.from('usuarios').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function upsertUsuario(userData) {
    const { data, error } = await client.from('usuarios').upsert(userData).select().single();
    if (error) throw error;
    return data;
  }

  // ── ECOS ──
  async function getEcos(limit = 20) {
    const { data, error } = await client
      .from('ecos')
      .select('*, usuarios(nombre, handle, avatar_url, aura_score)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async function crearEco(eco) {
    const { data, error } = await client.from('ecos').insert(eco).select().single();
    if (error) throw error;
    return data;
  }

  async function likeEco(ecoId) {
    const { error } = await client.rpc('incrementar_likes', { eco_id: ecoId });
    if (error) {
      // Fallback manual si no existe la función RPC
      const { data } = await client.from('ecos').select('likes').eq('id', ecoId).single();
      await client.from('ecos').update({ likes: (data?.likes || 0) + 1 }).eq('id', ecoId);
    }
  }

  // ── RED DE AMISTAD ──
  async function seguir(seguidorId, seguidoId) {
    const { error } = await client.from('red_amistad').insert({ seguidor_id: seguidorId, seguido_id: seguidoId });
    if (error) throw error;
  }

  async function dejarDeSeguir(seguidorId, seguidoId) {
    const { error } = await client.from('red_amistad')
      .delete().eq('seguidor_id', seguidorId).eq('seguido_id', seguidoId);
    if (error) throw error;
  }

  async function getSeguidores(userId) {
    const { data, error } = await client
      .from('red_amistad').select('seguidor_id, usuarios!seguidor_id(nombre, handle, avatar_url)')
      .eq('seguido_id', userId);
    if (error) throw error;
    return data;
  }

  // ── MENSAJES ──
  async function getMensajes(userId, otroUserId) {
    const { data, error } = await client
      .from('mensajes')
      .select('*')
      .or(`and(de_user_id.eq.${userId},para_user_id.eq.${otroUserId}),and(de_user_id.eq.${otroUserId},para_user_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async function enviarMensaje(deUserId, paraUserId, contenido) {
    const { data, error } = await client.from('mensajes')
      .insert({ de_user_id: deUserId, para_user_id: paraUserId, contenido }).select().single();
    if (error) throw error;
    return data;
  }

  // ── REALTIME ──
  function escucharEcos(callback) {
    return client.channel('ecos_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ecos' }, callback)
      .subscribe();
  }

  function escucharMensajes(userId, callback) {
    return client.channel('mensajes_channel')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `para_user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  return {
    init, getClient,
    getUsuario, upsertUsuario,
    getEcos, crearEco, likeEco,
    seguir, dejarDeSeguir, getSeguidores,
    getMensajes, enviarMensaje,
    escucharEcos, escucharMensajes,
  };
})();
