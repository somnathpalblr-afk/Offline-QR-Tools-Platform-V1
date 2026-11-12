// Runs before React and CSS to avoid flashing the wrong theme.
(() => {
  const key = 'scanprogo-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { preference = localStorage.getItem(key); } catch {}
  if (preference !== 'light' && preference !== 'dark') preference = null;
  const apply = () => {
    const theme = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b1425' : '#ffffff');
    dispatchEvent(new Event('scanprogo-theme-change'));
  };
  window.scanprogoTheme = {
    set(theme) {
      preference = theme;
      try { localStorage.setItem(key, theme); } catch {}
      apply();
    },
    reset() { preference = null; apply(); },
  };
  system.addEventListener('change', () => { if (!preference) apply(); });
  addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
      apply();
    }
  });
  apply();
  document.addEventListener('DOMContentLoaded', apply, { once: true });
})();
