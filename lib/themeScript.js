export const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      if (!savedTheme) {
        localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.warn('Theme initialization failed:', e);
    }
  })();
`;
