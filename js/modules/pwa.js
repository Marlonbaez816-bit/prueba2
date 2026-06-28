window.AuraPWA = (() => {
  let _installPrompt = null;

  function init() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      _installPrompt = e;
      setTimeout(() => {
        const b = document.getElementById('install-banner');
        if (b) b.classList.remove('hidden');
      }, 8000);
    });

    document.getElementById('install-btn')?.addEventListener('click', () => {
      _installPrompt?.prompt();
      _installPrompt?.userChoice.then(() => {
        document.getElementById('install-banner')?.classList.add('hidden');
      });
    });

    document.getElementById('install-close')?.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
    });
  }

  return { init };
})();
