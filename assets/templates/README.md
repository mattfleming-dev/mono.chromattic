# Client-side Vue templates

Page templates are selected by `assets/data/page-templates.json`. The `templates`
object maps template IDs to HTML fragments, and the `pages` object assigns one
of those IDs to each existing HTML page. The shared `assets/js/page-template-loader.js`
loads the configured fragment, then mounts that page's Vue options. Templates use
the existing browser-loaded Vue runtime; no compilation or bundling is required.

The Gallery uses the `gallery` card/masonry template by default. The
`gallery-hive` template remains experimental and can be tested by changing
`pages.gallery.html.template` to `gallery-hive` in `assets/data/page-templates.json`.

The Journal uses cards by default. Set `pages.journal.html.experimentalHive` to
`true` in the same config file to test the hidden Hive layout.

Journal article layouts are registered under `pages.journal.articleTemplates`.
Each entry in `assets/data/journal/index.json` must set `template` to one of those
layout IDs (`cinematic`, `editorial`, `magazine`, or `photo-essay`). Add a new
layout by adding an HTML fragment and registering its path in that mapping.

Article body JSON files keep their existing Markdown `content`. They may also
include optional presentation fields such as `location`, `author`, or
`imageCaption`, and a `blocks` array rendered after the Markdown in every
layout (`assets/js/story-blocks.js`). Existing articles without these optional
fields continue to render normally.

Block types:

| type | fields |
| --- | --- |
| `heading` | `text`, `level` (1–6, default 2) |
| `text` / `paragraph` | `text` (blank line = new paragraph) |
| `image` | image fields (below) |
| `paragraph-image` | image fields + `text`, `align` (`left`/`right`) |
| `gallery` | `title`, `columns`, plus `collection` (+`limit`) or `images` |
| `image-list` | `title`, plus `collection` (+`limit`) or `images` |
| `quote` | `text`, optional `attribution` |

Image fields: `src`, `title`, `alt`, `caption`. Instead of `src`, an image can
reference a Gallery photo with `collection` (an id from
`assets/data/gallery/index.json`) plus `src` or `index`; its title and alt text
come from the Gallery data unless overridden. In `images` arrays each entry is
an image-fields object (so entries may mix Gallery references and custom images).
