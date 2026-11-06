// Navigation Links Configuration
const NAV_LINKS = [
    { id: 'home', label: 'Home', href: 'index.html', icon: 'fa-home' },
    { id: 'gallery', label: 'Gallery', href: 'gallery.html', icon: 'fa-picture-o' },
    { id: 'journal', label: 'Journal', href: 'journal.html', icon: 'fa-book' },
    { id: 'contact', label: 'Contact', href: 'contact.html', icon: 'fa-envelope-o' }
];

// Common Vue app methods
const commonMethods = {
    toggleAccordion() {
        this.isOpen = !this.isOpen;
    },
    handleNavClick(link) {
        this.isOpen = false;
        this.openSubmenus = {};
    },
    toggleSubmenu(id) {
        const nextState = !this.isSubmenuOpen(id);
        const updated = { ...this.openSubmenus };
        if (nextState) {
            updated[id] = true;
        } else {
            delete updated[id];
        }
        this.openSubmenus = updated;
    },
    isSubmenuOpen(id) {
        return !!this.openSubmenus[id];
    },
    handleKeyboardShortcuts(e) {
        if (e.altKey) {
            switch(e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    window.location.href = 'index.html';
                    break;
                case 'g':
                    e.preventDefault();
                    window.location.href = 'gallery.html';
                    break;
                case 'j':
                    e.preventDefault();
                    window.location.href = 'journal.html';
                    break;
                case 'c':
                    e.preventDefault();
                    window.location.href = 'contact.html';
                    break;
                case 'm':
                    e.preventDefault();
                    this.toggleAccordion();
                    break;
            }
        } else if (e.key === 'Escape' && this.isOpen) {
            this.isOpen = false;
        }
    }
};

// Common watchers
const commonWatchers = {
    isOpen(newVal) {
        if (typeof document === 'undefined' || !window.matchMedia) return;
        // Only lock page scroll on mobile, where the panel is an overlay.
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        document.body.style.overflow = (newVal && isMobile) ? 'hidden' : '';
        if (!newVal) {
            this.openSubmenus = {};
        }
    }
};

// Common lifecycle hooks
const commonLifecycle = {
    mounted() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyboardShortcuts);
        }
    },
    beforeUnmount() {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyboardShortcuts);
        }
    }
};

// Expose for the page scripts (classic <script> scope does not attach to window).
window.NAV_LINKS = NAV_LINKS;
window.commonMethods = commonMethods;
window.commonWatchers = commonWatchers;
window.commonLifecycle = commonLifecycle;
