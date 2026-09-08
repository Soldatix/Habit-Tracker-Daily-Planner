export function applyTheme(theme) {
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function watchSystemTheme(getTheme, onChange) {
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!media) return;
  media.addEventListener('change', () => {
    if (getTheme() === 'system') {
      applyTheme('system');
      onChange?.();
    }
  });
}
