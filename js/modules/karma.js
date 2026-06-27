/* ============================================
   AURA — karma.js
   Sistema de Aura Score (karma)
   ============================================ */

window.AuraKarma = (() => {
  const _rules = [
    { action: 'Publicar un Eco', points: +10, icon: '✦' },
    { action: 'Recibir un like', points: +2, icon: '❤️' },
    { action: 'Recibir un comentario', points: +5, icon: '💬' },
    { action: 'Ser compartido', points: +8, icon: '🔁' },
    { action: 'Seguir a alguien', points: +1, icon: '➕' },
    { action: 'Eco guardado por otros', points: +15, icon: '🔖' },
    { action: 'Contenido reportado', points: -20, icon: '⚠️' },
    { action: 'SubAura activa', points: +25, icon: '🌐' },
  ];

  function render() {
    const user = AuraAuth.currentUser();
    const score = user?.aura_score || 100;
    const level = score < 100 ? 'Semilla' : score < 500 ? 'Brote' : score < 1000 ? 'Llama' : 'Nova';
    const levelColors = { Semilla: '#10B981', Brote: '#F59E0B', Llama: '#EF4444', Nova: '#7C3AED' };
    const nextLevel = score < 100 ? 100 : score < 500 ? 500 : score < 1000 ? 1000 : 9999;
    const progress = Math.min((score / nextLevel) * 100, 100);

    return `
      <div class="page">
        <div style="padding:24px 16px;text-align:center;">
          <div style="width:100px;height:100px;border-radius:50%;background:var(--gradient-orb);
            box-shadow:var(--shadow-glow);display:flex;align-items:center;justify-content:center;
            font-size:36px;margin:0 auto 16px;animation:orbPulse 2s ease-in-out infinite;">
            ✦
          </div>
          <div style="font-size:48px;font-weight:800;font-family:var(--font-display);
            background:var(--gradient-primary);-webkit-background-clip:text;
            -webkit-text-fill-color:transparent;background-clip:text;">${score}</div>
          <div style="font-size:16px;font-weight:600;margin-top:4px;
            color:${levelColors[level] || 'var(--color-primary)'};">Nivel ${level}</div>

          <!-- PROGRESS -->
          <div style="margin-top:16px;">
            <div style="height:8px;background:var(--color-border);border-radius:999px;overflow:hidden;">
              <div style="height:100%;width:${progress}%;background:var(--gradient-primary);
                border-radius:999px;transition:width .6s var(--ease-spring);"></div>
            </div>
            <div style="font-size:12px;color:var(--color-text-muted);margin-top:6px;">
              ${score} / ${nextLevel} para el siguiente nivel
            </div>
          </div>
        </div>

        <div class="divider--thick"></div>

        <div style="padding:16px;">
          <div class="section-title" style="margin-bottom:12px;">Cómo ganar Aura</div>
          ${_rules.map(r => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border);">
              <span style="font-size:20px;width:32px;text-align:center;">${r.icon}</span>
              <div style="flex:1;font-size:14px;">${r.action}</div>
              <div style="font-weight:700;color:${r.points > 0 ? 'var(--color-success)' : 'var(--color-error)'};font-size:14px;">
                ${r.points > 0 ? '+' : ''}${r.points}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function add(points, reason) {
    const user = AuraAuth.currentUser();
    if (!user) return;
    user.aura_score = (user.aura_score || 0) + points;
    AuraStore.persist('user', user);
    AuraToast.show(`${points > 0 ? '+' : ''}${points} Aura · ${reason}`, points > 0 ? 'success' : 'error');
  }

  function init() {
    AuraRouter.register('karma', render);
  }

  return { init, render, add };
})();
