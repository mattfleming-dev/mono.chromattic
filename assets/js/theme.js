/**
 * ThemeManager — client-side dark/light theme support.
 *
 * - Applies the theme via `data-theme` on <html> BEFORE first paint
 *   (load this file synchronously in <head>).
 * - Persists an explicit user choice in localStorage.
 * - Falls back to the OS preference (`prefers-color-scheme`) until the
 *   user chooses a theme manually, then keeps following the system.
 */
(function (global) {
    'use strict';

    var STORAGE_KEY = 'pp-theme';
    var LIGHT_QUERY = '(prefers-color-scheme: light)';

    function readStored() {
        try {
            var stored = global.localStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') return stored;
        } catch (e) { /* storage unavailable */ }
        return null;
    }

    function systemTheme() {
        return 'light'; // light editorial theme is the default
    }

    function apply(theme) {
        global.document.documentElement.setAttribute('data-theme', theme);
    }

    var ThemeManager = {
        /** Resolve the initial theme and paint it immediately. */
        init: function () {
            var theme = readStored() || systemTheme();
            apply(theme);

            // Follow the OS only if the user has not chosen explicitly (disabled: light default).
            try {
                global.matchMedia(LIGHT_QUERY).addEventListener('change', function (e) {
                    if (!readStored()) apply('light');
                });
            } catch (e) { /* older engines: static theme is fine */ }

            return theme;
        },

        /** Current theme ('dark' | 'light'). */
        get: function () {
            var current = global.document.documentElement.getAttribute('data-theme');
            return current === 'light' ? 'light' : 'dark';
        },

        /** Set a theme explicitly and remember the choice. */
        set: function (theme) {
            apply(theme);
            try {
                global.localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) { /* ignore */ }
            return theme;
        },

        /** Flip to the other theme and return it. */
        toggle: function () {
            return this.set(this.get() === 'dark' ? 'light' : 'dark');
        }
    };

    global.ThemeManager = ThemeManager;

    // Self-initialize so the attribute is set before first paint.
    if (global.document && global.document.documentElement) {
        ThemeManager.init();
    }
})(window);
