/* ─────────────────────────────────────────────────────────────────────────────
  VinylVault – Theme Selector
   Manages theme selection and persistence
   ───────────────────────────────────────────────────────────────────────────── */

const ThemeSelector = {
  STORAGE_KEY: 'vinylvault-theme',
  DEFAULT_THEME: 'dark',
  AVAILABLE_THEMES: [
    'amber',
    'dark',
    'forest',
    'gold',
    'jazz',
    'matrix',
    'midnight',
    'ocean',
    'punk',
    'retro',
    'ruby',
    'slate',
    'sunset',
    'synthwave',
    'vinyl'
  ],
  currentTheme: null,

  /**
   * Initialize theme selector
   */
  init() {
    this.loadTheme();
    this.attachEventListeners();
  },

  /**
   * Load saved theme or use default
   */
  loadTheme() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const theme = (saved && this.AVAILABLE_THEMES.includes(saved)) ? saved : this.DEFAULT_THEME;
    this.currentTheme = theme;
    this.applyTheme(theme);
  },

  /**
   * Apply theme by setting data attribute on html element
   */
  applyTheme(theme, persist = true) {
    if (!this.AVAILABLE_THEMES.includes(theme)) {
      console.warn(`Theme "${theme}" not found, using default`);
      theme = this.DEFAULT_THEME;
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      this.currentTheme = theme;
      localStorage.setItem(this.STORAGE_KEY, theme);
      this.updateSelectValue(theme);
    }
  },

  /**
   * Update select element value
   */
  updateSelectValue(theme) {
    const select = document.getElementById('theme-select');
    if (select) {
      select.value = theme;
    }
  },

  /**
   * Attach event listeners to theme selector
   */
  attachEventListeners() {
    const select = document.getElementById('theme-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.applyTheme(e.target.value);
      });
    }

    // Click: Apply theme permanently
    document.addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (!option) return;
      e.preventDefault();
      const theme = option.getAttribute('data-theme');
      this.applyTheme(theme);
      const details = option.closest('details[open]');
      if (details) details.removeAttribute('open');
    });

    // Hover: Preview theme temporarily
    document.addEventListener('mouseenter', (e) => {
      const option = e.target.closest('.theme-option');
      if (!option) return;
      const theme = option.getAttribute('data-theme');
      this.applyTheme(theme, false);
    }, true);

    document.addEventListener('mouseleave', (e) => {
      const option = e.target.closest('.theme-option');
      if (!option) return;
      this.applyTheme(this.currentTheme, false);
    }, true);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeSelector.init());
} else {
  ThemeSelector.init();
}
