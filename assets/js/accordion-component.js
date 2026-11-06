// AccordionPanel Vue Component
const AccordionPanel = {
    props: {
        isOpen: { type: Boolean, default: false },
        links: { type: Array, required: true },
        openSubmenus: {
            type: Object,
            default: () => ({})
        },
        currentPage: { type: String, default: '' }
    },
    emits: ['toggle', 'nav-select', 'toggle-submenu'],
    computed: {
        ariaExpanded() {
            return this.isOpen ? 'true' : 'false';
        },
        ariaHidden() {
            return (!this.isOpen).toString();
        }
    },
    methods: {
        isSubmenuOpen(id) {
            return !!this.openSubmenus[id];
        },
        submenuAriaExpanded(id) {
            return this.isSubmenuOpen(id) ? 'true' : 'false';
        },
        submenuAriaHidden(id) {
            return (!this.isSubmenuOpen(id)).toString();
        },
        prefetchPage(href) {
            // Prefetch page on hover for faster navigation
            if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = href;
                document.head.appendChild(link);
            }
        },
        getKeyboardShortcut(id) {
            const shortcuts = {
                home: 'Keyboard: Alt+H',
                gallery: 'Keyboard: Alt+G',
                journal: 'Keyboard: Alt+J',
                contact: 'Keyboard: Alt+C'
            };
            return shortcuts[id] || '';
        }
    },
    template: `
        <div class="accordion-left" id="accordion-left" :class="{ open: isOpen }">
            <aside class="panel" aria-label="Primary navigation">
                <button type="button" id="panel-toggle" class="panel-toggle" :aria-expanded="ariaExpanded" aria-controls="panel-content" aria-label="Toggle menu" @click="$emit('toggle')">
                    <span class="panel-toggle-icon" aria-hidden="true"></span>
                </button>
                <transition name="accordion-fade">
                    <div v-show="isOpen" id="panel-content" class="panel-content" role="region" aria-labelledby="panel-toggle" :aria-hidden="ariaHidden">
                        <div class="brand-block">
                            <div class="logo">Your Name</div>
                        </div>
                        <nav class="panel-nav" aria-label="Primary" role="navigation">
                            <ul>
                                <li v-for="link in links" :key="link.id" :class="{ 'has-submenu': !!link.children }">
                                    <template v-if="link.children">
                                        <button type="button" class="submenu-toggle" :aria-expanded="submenuAriaExpanded(link.id)" :aria-controls="'submenu-' + link.id" @click="$emit('toggle-submenu', link.id)">
                                            {{ link.label }}
                                            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="transform:translateY(1px);">
                                                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </button>
                                        <transition name="submenu-slide">
                                            <ul :id="'submenu-' + link.id" class="submenu" v-show="isSubmenuOpen(link.id)" :aria-hidden="submenuAriaHidden(link.id)">
                                                <li v-for="child in link.children" :key="child.id">
                                                    <a :href="child.href" @click="$emit('nav-select', child)">{{ child.label }}</a>
                                                </li>
                                            </ul>
                                        </transition>
                                    </template>
                                    <template v-else>
                                        <a :href="link.href" 
                                           @click="$emit('nav-select', link)" 
                                           @mouseenter="prefetchPage(link.href)"
                                           :class="{ 'active-page': link.href === currentPage }" 
                                           class="nav-link"
                                           :title="getKeyboardShortcut(link.id)">
                                            <i class="fa" :class="link.icon" aria-hidden="true"></i>
                                            <span class="nav-label">{{ link.label }}</span>
                                            <span v-if="link.badge" class="nav-badge" aria-label="New items">{{ link.badge }}</span>
                                        </a>
                                    </template>
                                </li>
                            </ul>
                        </nav>
                        <div class="panel-footer">
                            <div class="quick-actions">
                                <button type="button" class="theme-toggle" aria-label="Toggle theme" title="Toggle light/dark theme">
                                    <i class="fa fa-adjust" aria-hidden="true"></i>
                                </button>
                                <a href="#" class="social-link" aria-label="Instagram" title="Follow on Instagram">
                                    <i class="fa fa-instagram" aria-hidden="true"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="Twitter" title="Follow on Twitter">
                                    <i class="fa fa-twitter" aria-hidden="true"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="LinkedIn" title="Connect on LinkedIn">
                                    <i class="fa fa-linkedin" aria-hidden="true"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </transition>
            </aside>
        </div>
    `
};
