# Mono Chromattic

A small, dependency-free photography portfolio: a **gallery** of collections with a lightbox, a **journal** with four article layouts, a home page and a contact form. It is plain HTML, CSS and JavaScript (Vue 3 loaded from a CDN) with all content stored as JSON and Markdown, so there is no build step and no backend.

## Features

- **Gallery** – collection index, masonry grid, keyboard-navigable lightbox with camera and exposure details, deep links (`gallery.html?collection=<id>`).
- **Journal** – search, year and tag filters, shareable URLs (`journal.html?article=<id>`), and four article layouts: `cinematic`, `editorial`, `magazine`, `photo-essay`.
- **Article blocks** – Markdown body plus structured blocks (`heading`, `text`, `image`, `paragraph-image`, `gallery`, `image-list`, `quote`) that can reference Gallery photos directly.
- **Light / dark theme**, responsive layout, accessible navigation panel.
- **Keyboard shortcuts** – `Alt+H` Home, `Alt+G` Gallery, `Alt+J` Journal, `Alt+C` Contact, `Alt+M` menu, `Esc` closes the menu or lightbox.
- **Photo privacy** – published images carry no EXIF, GPS or serial-number metadata. Camera details shown in the lightbox come from the JSON files.

## Quick start

The pages load their data with `fetch`, so they must be served over HTTP (opening the files directly with `file://` will not work).

```powershell
# from the project folder
python -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, VS Code Live Server, etc.). The site also deploys unchanged to **GitHub Pages**: *Settings → Pages → Deploy from a branch → `main` / root*.

## Project layout

```
index.html  gallery.html  journal.html  contact.html   Page shells
assets/
  css/style.css                 Shared styles and theme variables
  js/                           Navigation, theme, template loader, story blocks
  templates/pages/              Vue templates for each page
  templates/articles/           Journal article layouts
  data/page-templates.json      Which template each page uses
  data/gallery/                 index.json + one JSON file per collection
  data/journal/                 index.json + 2025/<id>.json article bodies
  gallery/local/japan/          Photographs
docs/SUPPORT.md                 Full support and how-to guide
CREDITS.md                      Image, font and library credits
```

## Adding content

**A photo** – copy the JPEG into `assets/gallery/local/<folder>/`, then add an entry to a collection file in `assets/data/gallery/` and bump that collection's `count` in `index.json`.

**A collection** – add a `<id>.json` file (an array of photos), then add an entry in `assets/data/gallery/index.json`.

**A journal article** – add `assets/data/journal/<year>/<id>.json` and a matching entry in `assets/data/journal/index.json` (newest first). Set `template` to one of the four layouts.

The [support guide](docs/SUPPORT.md) has complete field references and examples.

## Journal examples

The bundled journal entries are written to show what the system can do:

| Article | Layout | Shows off |
| --- | --- | --- |
| Tokyo After Dark | cinematic | Markdown lists and quotes, paragraph-image, gallery, quote block |
| Gates, Guardians and Quiet Courtyards | photo-essay | image-list, paragraph-image, full-width image |
| A Field Guide to Zoo Photography | magazine | Tables, author byline, three-column gallery |
| Notes from the Platform | editorial | image-list with a limit, aligned images |
| Blue Hour on the Runway | cinematic | Short-form story with quote and image blocks |
| Reading Camera Settings in Plain Terms | editorial | Gallery built from explicit image references with captions |
| How This Journal Works | magazine | Documentation written with every block type |

## Roadmap

This project is under active development. Planned work:

- **Additional templates** – more page templates and journal article layouts beyond the current four, plus further gallery layouts.
- **Automated content delivery** – tooling to generate and update the gallery and journal JSON data automatically, and to process and publish images (resizing, metadata stripping and collection updates), so adding content no longer means editing JSON by hand.

## Credits and licensing

- Photographs in `assets/gallery/` are © the repository owner, all rights reserved. Please do not reuse them without permission.
- Source code is released under the [MIT License](LICENSE).
- Third-party fonts and libraries are listed in [CREDITS.md](CREDITS.md). The site no longer links to any externally hosted photographs.

## Support

See [docs/SUPPORT.md](docs/SUPPORT.md) for setup, configuration, data formats, deployment, privacy checklist and troubleshooting.
