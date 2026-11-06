/**
 * AccordionPanel — shared Vue 3 navigation component for every page.
 *
 * Design notes (Vue best practice):
 * - The component is stateless: all state lives in the root app and is passed
 *   down via props. Child-to-parent communication uses declared `emits` only;
 *   props are never mutated.
 * - ARIA state is derived with `computed`, not duplicated in data.
 * - Register per page:  app.component('AccordionPanel', window.AccordionPanel)
 */
(function (global) {
    'use strict';

    global.AccordionPanel = {
        name: 'AccordionPanel',

        props: {
            isOpen: { type: Boolean, default: false },
            links: { type: Array, required: true },
            openSubmenus: { type: Object, default: function () { return {}; } },
            currentPage: { type: String, default: '' },
            theme: { type: String, default: 'dark' }
        },

        emits: ['toggle', 'nav-select', 'toggle-submenu', 'toggle-theme'],

        computed: {
            ariaExpanded: function () {
                return this.isOpen ? 'true' : 'false';
            },
            ariaHidden: function () {
                return (!this.isOpen).toString();
            },
            themeIcon: function () {
                // Show the icon of the mode we would switch TO.
                return this.theme === 'dark' ? 'fa-sun-o' : 'fa-moon-o';
            }
        },

        methods: {
            isSubmenuOpen: function (id) {
                return !!this.openSubmenus[id];
            },
            submenuAriaExpanded: function (id) {
                return this.isSubmenuOpen(id) ? 'true' : 'false';
            },
            submenuAriaHidden: function (id) {
                return (!this.isSubmenuOpen(id)).toString();
            },
            prefetchPage: function (href) {
                // Prefetch page on hover for faster navigation.
                if (href && !document.querySelector('link[rel="prefetch"][href="' + href + '"]')) {
                    var link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = href;
                    document.head.appendChild(link);
                }
            },
            getKeyboardShortcut: function (id) {
                var shortcuts = {
                    home: 'Keyboard: Alt+H',
                    gallery: 'Keyboard: Alt+G',
                    journal: 'Keyboard: Alt+J',
                    contact: 'Keyboard: Alt+C'
                };
                return shortcuts[id] || '';
            },
            emitNavSelect: function (link) {
                this.$emit('nav-select', link);
            }
        },

        template: `
            <nav class="panel" role="navigation" aria-label="Main navigation">
                <!-- Toggle button -->
                <button 
                    class="panel-toggle" 
                    :class="{ open: isOpen }"
                    @click="$emit('toggle')"
                    :aria-expanded="ariaExpanded"
                    :aria-label="isOpen ? 'Close menu' : 'Open menu'"
                >
                    <div class="panel-toggle-icon"></div>
                </button>

                <!-- Collapsible content -->
                <transition name="accordion-fade">
                    <div v-show="isOpen" class="panel-content" :aria-hidden="ariaHidden">
                        <div class="brand-block">
                            <span class="logo">PP</span>
                        </div>
                        
                        <!-- Main navigation links -->
                        <div class="panel-nav">
                            <ul>
                                <li v-for="link in links" :key="link.id" class="nav-item">
                                    <!-- Links with submenus get a toggle button -->
                                    <template v-if="link.children && link.children.length > 0">
                                        <a 
                                            :href="link.href" 
                                            class="nav-link has-submenu"
                                            :class="{ 'active-page': currentPage === link.href }"
                                            @click="$emit('nav-select', link)"
                                            @mouseenter="prefetchPage(link.href)"
                                            :title="getKeyboardShortcut(link.id)"
                                        >
                                            <i class="fa" :class="link.icon"></i>
                                            <span class="nav-label">{{ link.label }}</span>
                                            <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
                                            <span 
                                                class="submenu-toggle"
                                                role="button"
                                                tabindex="0"
                                                @click.stop="$emit('toggle-submenu', link.id)"
                                                @keydown.enter.stop="$emit('toggle-submenu', link.id)"
                                                @keydown.space.stop="$emit('toggle-submenu', link.id)"
                                                :aria-expanded="submenuAriaExpanded(link.id)"
                                                :aria-controls="'submenu-' + link.id"
                                                :aria-label="'Toggle ' + link.label + ' submenu'"
                                            >
                                                <i class="fa" :class="isSubmenuOpen(link.id) ? 'fa-caret-down' : 'fa-caret-right'" aria-hidden="true"></i>
                                            </span>
                                        </a>
                                        
                                        <!-- Submenu with transition -->
                                        <transition name="submenu-slide">
                                            <ul v-show="isSubmenuOpen(link.id)" 
                                                :id="'submenu-' + link.id"
                                                class="submenu"
                                                role="group">
                                                <li v-for="child in link.children" :key="child.id || child.href">
                                                    <a 
                                                        :href="child.href" 
                                                        class="nav-link submenu-item"
                                                        @click="$emit('nav-select', { id: 'article', articleId: child.articleId, label: child.label })"
                                                        @mouseenter="prefetchPage(child.href)"
                                                    >
                                                        {{ child.label }}
                                                    </a>
                                                </li>
                                            </ul>
                                        </transition>
                                    </template>
                                    
                                    <!-- Regular links without submenus -->
                                    <template v-else>
                                        <a 
                                            :href="link.href" 
                                            class="nav-link"
                                            :class="{ 'active-page': currentPage === link.href }"
                                            @click="$emit('nav-select', link)"
                                            @mouseenter="prefetchPage(link.href)"
                                            :title="getKeyboardShortcut(link.id)"
                                        >
                                            <i class="fa" :class="link.icon"></i>
                                            <span class="nav-label">{{ link.label }}</span>
                                            <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
                                        </a>
                                    </template>
                                </li>
                            </ul>
                        </div>

                        <!-- Footer quick actions -->
                        <div class="panel-footer">
                            <div class="quick-actions">
                                <button 
                                    type="button"
                                    class="theme-toggle"
                                    @click="$emit('toggle-theme')"
                                    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
                                    :title="'Theme: ' + theme"
                                >
                                    <i class="fa" :class="themeIcon"></i>
                                </button>
                                <a href="#" aria-label="Instagram"><i class="fa fa-instagram"></i></a>
                                <a href="#" aria-label="Twitter"><i class="fa fa-twitter"></i></a>
                                <a href="#" aria-label="LinkedIn"><i class="fa fa-linkedin"></i></a>
                            </div>
                        </div>
                    </div>
                </transition>
            </nav>
        `
    };
})(window);
