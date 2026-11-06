/**
 * <article-story-blocks> – renders the structured "blocks" array of a Journal
 * article. See assets/templates/README.md ("Article blocks") for the schema.
 *
 * Block types: heading, text/paragraph, image, paragraph-image, gallery,
 * image-list, quote. Images may be given inline (src/alt/title/caption) or
 * reference a Gallery collection ("collection" + "src" or "index").
 */
(function () {
    const collectionCache = {};
    let indexPromise = null;

    function readJson(path) {
        return fetch(path).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status + ' loading ' + path);
            return response.json();
        });
    }

    /** Resolve a Gallery collection id to its photo array (cached). */
    function loadCollection(id) {
        if (!collectionCache[id]) {
            indexPromise = indexPromise || readJson('assets/data/gallery/index.json');
            collectionCache[id] = indexPromise.then(function (index) {
                const entry = index.find(function (item) { return item.id === id; });
                if (!entry) throw new Error('Unknown gallery collection: ' + id);
                return readJson('assets/data/gallery/' + entry.file);
            }).catch(function (error) {
                console.error(error);
                return [];
            });
        }
        return collectionCache[id];
    }

    function paragraphs(text) {
        return String(text || '').split(/\n{2,}/).map(function (part) { return part.trim(); }).filter(Boolean);
    }

    window.StoryBlocks = {
        props: {
            blocks: { type: Array, default: function () { return []; } }
        },
        data: function () {
            return { collections: {} };
        },
        watch: {
            blocks: { immediate: true, handler: 'loadReferences' }
        },
        methods: {
            paragraphs: paragraphs,

            /** Fetch every Gallery collection the blocks refer to. */
            loadReferences: function () {
                const self = this;
                const ids = {};
                (this.blocks || []).forEach(function (block) {
                    if (block.collection) ids[block.collection] = true;
                    (block.images || []).forEach(function (image) {
                        if (image && image.collection) ids[image.collection] = true;
                    });
                });
                Object.keys(ids).forEach(function (id) {
                    if (self.collections[id]) return;
                    loadCollection(id).then(function (photos) { self.collections[id] = photos; });
                });
            },

            /** Merge a block/image reference with the Gallery photo it points to. */
            resolveImage: function (ref, fallbackCollection) {
                const item = typeof ref === 'string' ? { src: ref } : Object.assign({}, ref);
                const photos = this.collections[item.collection || fallbackCollection] || [];
                const photo = item.src
                    ? photos.find(function (p) { return p.src === item.src; })
                    : (typeof item.index === 'number' ? photos[item.index] : null);
                const src = item.src || (photo && photo.src) || '';
                const title = item.title || (photo && photo.title) || '';
                return {
                    src: src,
                    title: title,
                    alt: item.alt || title || (photo && photo.description ? photo.description.split('. ')[0] : ''),
                    caption: item.caption || ''
                };
            },

            /** Images of a gallery / image-list block. */
            imagesOf: function (block) {
                const self = this;
                if (Array.isArray(block.images) && block.images.length) {
                    return block.images.map(function (ref) { return self.resolveImage(ref, block.collection); });
                }
                const photos = this.collections[block.collection] || [];
                const limit = block.limit || photos.length;
                return photos.slice(0, limit).map(function (photo, index) {
                    return self.resolveImage({ index: index }, block.collection);
                });
            },

            single: function (block) {
                return this.resolveImage(block, block.collection);
            },

            headingTag: function (block) {
                const level = Math.min(6, Math.max(1, parseInt(block.level, 10) || 2));
                return 'h' + level;
            },

            columnsStyle: function (block) {
                return block.columns ? { '--story-columns': block.columns } : null;
            }
        },
        template: `
            <div class="article-story-blocks">
                <template v-for="(block, index) in blocks" :key="block.id || index">
                    <component v-if="block.type === 'heading'" :is="headingTag(block)" class="story-heading">{{ block.text }}</component>

                    <div v-else-if="block.type === 'text' || block.type === 'paragraph'" class="story-text">
                        <p v-for="(part, i) in paragraphs(block.text)" :key="i">{{ part }}</p>
                    </div>

                    <figure v-else-if="block.type === 'image'" class="story-image">
                        <img :src="single(block).src" :alt="single(block).alt" :title="single(block).title || null" loading="lazy" decoding="async">
                        <figcaption v-if="single(block).caption || single(block).title">{{ single(block).caption || single(block).title }}</figcaption>
                    </figure>

                    <div v-else-if="block.type === 'paragraph-image'" class="story-paragraph-image" :class="'story-align-' + (block.align === 'right' ? 'right' : 'left')">
                        <figure class="story-paragraph-figure">
                            <img :src="single(block).src" :alt="single(block).alt" :title="single(block).title || null" loading="lazy" decoding="async">
                            <figcaption v-if="single(block).caption || single(block).title">{{ single(block).caption || single(block).title }}</figcaption>
                        </figure>
                        <div class="story-text">
                            <p v-for="(part, i) in paragraphs(block.text)" :key="i">{{ part }}</p>
                        </div>
                    </div>

                    <div v-else-if="block.type === 'gallery'" class="story-gallery" :style="columnsStyle(block)">
                        <h3 v-if="block.title" class="story-gallery-title">{{ block.title }}</h3>
                        <ul class="story-gallery-grid">
                            <li v-for="(image, i) in imagesOf(block)" :key="i">
                                <figure>
                                    <img :src="image.src" :alt="image.alt" :title="image.title || null" loading="lazy" decoding="async">
                                    <figcaption v-if="image.caption || image.title">{{ image.caption || image.title }}</figcaption>
                                </figure>
                            </li>
                        </ul>
                    </div>

                    <div v-else-if="block.type === 'image-list'" class="story-image-list">
                        <h3 v-if="block.title" class="story-gallery-title">{{ block.title }}</h3>
                        <ol>
                            <li v-for="(image, i) in imagesOf(block)" :key="i">
                                <img :src="image.src" :alt="image.alt" :title="image.title || null" loading="lazy" decoding="async">
                                <div>
                                    <strong v-if="image.title">{{ image.title }}</strong>
                                    <span v-if="image.caption">{{ image.caption }}</span>
                                </div>
                            </li>
                        </ol>
                    </div>

                    <blockquote v-else-if="block.type === 'quote'" class="story-quote">
                        <p>{{ block.text }}</p>
                        <cite v-if="block.attribution">{{ block.attribution }}</cite>
                    </blockquote>
                </template>
            </div>
        `
    };
})();
