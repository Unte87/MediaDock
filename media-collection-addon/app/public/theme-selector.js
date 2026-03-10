/* ─────────────────────────────────────────────────────────────────────────────
  VinylVault – Theme Selector
   Manages theme selection and persistence
   ───────────────────────────────────────────────────────────────────────────── */

const ThemeSelector = {
  STORAGE_KEY: 'vinylvault-theme',
  DEFAULT_THEME: 'dark',
  AVAILABLE_THEMES: ['dark', 'vinyl', 'ocean', 'forest', 'synthwave'],

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
    this.applyTheme(theme);
  },

  /**
   * Apply theme by setting data attribute on html element
   */
  applyTheme(theme) {
    if (!this.AVAILABLE_THEMES.includes(theme)) {
      console.warn(`Theme "${theme}" not found, using default`);
      theme = this.DEFAULT_THEME;
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateSelectValue(theme);
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
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeSelector.init());
} else {
  ThemeSelector.init();
}
