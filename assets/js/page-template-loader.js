(async function () {
    const root = document.getElementById('app');
    if (!root) return;

    async function readText(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error('HTTP ' + response.status + ' loading ' + path);
        return response.text();
    }

    async function readJson(path) {
        const response = await fetch(path);
        if (!response.ok) throw new Error('HTTP ' + response.status + ' loading ' + path);
        return response.json();
    }

    try {
        const config = await readJson('assets/data/page-templates.json');
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const page = config.pages && config.pages[pageName];
        const pageTemplate = page && config.templates && config.templates[page.template];
        if (!page || !page.template || !pageTemplate) {
            throw new Error('No page template is configured for ' + pageName);
        }
        window.PAGE_TEMPLATE_CONFIG = page;

        root.innerHTML = await readText(pageTemplate);

        const app = Vue.createApp(window.PAGE_APP_OPTIONS || {});
        if (window.AccordionPanel) {
            app.component('AccordionPanel', window.AccordionPanel);
        }

        if (window.StoryBlocks) {
            app.component('article-story-blocks', window.StoryBlocks);
        }

        const layouts = page.articleTemplates || {};
        for (const [name, source] of Object.entries(layouts)) {
            const template = await readText(source);
            app.component('article-layout-' + name, {
                props: [
                    'post',
                    'formattedDate',
                    'contentHtml',
                    'contentError',
                    'storyBlocks',
                    'previousArticle',
                    'nextArticle'
                ],
                emits: ['close', 'navigate', 'filter-tag'],
                template: template
            });
        }

        app.mount(root);
    } catch (error) {
        console.error('Failed to load the configured page template:', error);
        root.innerHTML = '<p class="loading" role="alert">Could not load this page. Please refresh and try again.</p>';
    }
})();
