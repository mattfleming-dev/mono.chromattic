# Support Guide

Everything you need to run, customise, deploy and troubleshoot Mono Chromattic.

- [1. Requirements](#1-requirements)
- [2. Running locally](#2-running-locally)
- [3. How it works](#3-how-it-works)
- [4. Gallery data](#4-gallery-data)
- [5. Journal data](#5-journal-data)
- [6. Article blocks](#6-article-blocks)
- [7. Page templates and layouts](#7-page-templates-and-layouts)
- [8. Theming and branding](#8-theming-and-branding)
- [9. Contact form](#9-contact-form)
- [10. Deployment](#10-deployment)
- [11. Privacy checklist for photos](#11-privacy-checklist-for-photos)
- [12. Offline use and content security policy](#12-offline-use-and-content-security-policy)
- [13. Troubleshooting](#13-troubleshooting)
- [14. Getting help](#14-getting-help)

## 1. Requirements

- A modern browser (current Chrome, Edge, Firefox or Safari).
- Any static web server. Python 3 (`python -m http.server`) is the simplest.
- An internet connection on first load: Vue, marked, DOMPurify, Font Awesome and Google Fonts come from CDNs (see [section 12](#12-offline-use-and-content-security-policy)).

There is nothing to install or build.

## 2. Running locally

```powershell
cd path\to\mono.chromattic
python -m http.server 8000
```

Open <http://localhost:8000>. Pages fetch JSON, so `file://` does not work.

## 3. How it works

Each HTML file is a thin shell. `assets/js/page-template-loader.js` reads `assets/data/page-templates.json`, loads the matching fragment from `assets/templates/pages/`, and mounts the page's Vue options. Data comes from JSON files fetched at runtime.

| Page | Data it reads |
| --- | --- |
| `index.html` | `gallery/index.json` + a random collection file (hero photo), `journal/index.json` (recent articles) |
| `gallery.html` | `gallery/index.json`, then `gallery/<collection>.json` |
| `journal.html` | `journal/index.json`, then `journal/<year>/<id>.json` |
| `contact.html` | `journal/index.json` (navigation only) |

URL parameters: `gallery.html?collection=<id>`; `journal.html?article=<id>&tag=<tag>&year=<yyyy>&q=<text>`.

## 4. Gallery data

### `assets/data/gallery/index.json`

An array, one entry per collection:

| Field | Description |
| --- | --- |
| `id` | URL-safe identifier, used in `?collection=` and in journal blocks |
| `title`, `description`, `location` | Shown on the collection card |
| `hero` | Path to the card image |
| `count` | Number of photos (shown on the card; keep in sync) |
| `file` | Collection file inside `assets/data/gallery/` |

### `assets/data/gallery/<id>.json`

An array of photos:

```json
{
  "src": "assets/gallery/local/japan/DSCF9299.jpg",
  "title": "Koi in Still Water",
  "description": "A single orange koi turns just beneath the dark, rippled surface of a pond.",
  "location": "Japan",
  "tags": ["water", "koi"],
  "date": "2025-01-31",
  "camera": {
    "make": "Fujifilm",
    "model": "X-S10",
    "lens": "XF18-55mmF2.8-4 R LM OIS",
    "settings": { "aperture": "f/5.6", "shutter": "1/200s", "iso": 640, "focal_length": "55mm" }
  },
  "dimensions": { "width": 1280, "height": 853 }
}
```

Only `src` and `title` are essential. `location`, `date`, `tags`, `camera` and `dimensions` are optional; empty or `"N/A"`/`"Unknown"` camera values are hidden. Keep `description` factual: it is shown in the lightbox and reused as alt text.

### Adding a photo

1. Remove metadata first ([section 11](#11-privacy-checklist-for-photos)).
2. Resize for the web (about 1280 px on the long edge keeps pages fast).
3. Save it under `assets/gallery/local/<folder>/`.
4. Add the entry to a collection file and update `count` in `index.json`.

## 5. Journal data

### `assets/data/journal/index.json`

An array, **newest first**, one entry per article:

| Field | Description |
| --- | --- |
| `id` | Unique number |
| `title`, `excerpt`, `date` (`YYYY-MM-DD`), `tags` | Card and filter data |
| `image` | Cover image path (local file recommended) |
| `file` | Body file, e.g. `2025/3.json` |
| `template` | `cinematic`, `editorial`, `magazine` or `photo-essay` (required) |

### `assets/data/journal/<year>/<id>.json`

Repeats the index fields and adds:

| Field | Description |
| --- | --- |
| `content` | Markdown body (sanitised with DOMPurify) |
| `blocks` | Optional structured blocks, rendered after the Markdown |
| `location` | Optional kicker above the title |
| `author` | Optional byline (shown by the `magazine` layout) |
| `imageCaption` | Optional caption under the cover image |

Minimal example:

```json
{
  "id": 8,
  "title": "Rain on the Bridge",
  "date": "2025-12-01",
  "excerpt": "A short note about wet pavement and reflections.",
  "image": "assets/gallery/local/japan/DSC00111.jpg",
  "tags": ["night", "rain"],
  "content": "## Reflections\n\nThe street becomes a second sky."
}
```

Add `"template": "editorial"` and `"file": "2025/8.json"` to the matching entry in `index.json`.

## 6. Article blocks

| `type` | Fields |
| --- | --- |
| `heading` | `text`, `level` (1–6, default 2) |
| `text` / `paragraph` | `text` (a blank line starts a new paragraph) |
| `image` | image fields |
| `paragraph-image` | image fields + `text`, `align` (`left` or `right`) |
| `gallery` | `title`, `columns`, and either `collection` (+ optional `limit`) or `images` |
| `image-list` | `title`, and either `collection` (+ optional `limit`) or `images` |
| `quote` | `text`, optional `attribution` |

**Image fields:** `src`, `title`, `alt`, `caption`. Instead of a plain `src` you can point at a Gallery photo with `collection` plus `src` (or `index`); the title and alt text are then read from the Gallery data unless you override them.

```json
{ "type": "gallery", "columns": 3, "images": [
    { "collection": "wildlife-and-nature", "src": "assets/gallery/local/japan/DSCF9299.jpg", "caption": "f/5.6 · 1/200 s" },
    { "src": "assets/gallery/local/japan/DSC00100.jpg", "alt": "Skytree at dusk" }
]}
```

The article *How This Journal Works* in the bundled data uses most block types and is the best live reference.

## 7. Page templates and layouts

`assets/data/page-templates.json` selects the template for each page.

- Switch the Gallery to the experimental hexagon layout: set `pages["gallery.html"].template` to `gallery-hive`.
- Enable the experimental journal hive: set `pages["journal.html"].experimentalHive` to `true`.
- Add an article layout: create `assets/templates/articles/<name>.html`, register it under `articleTemplates`, then use `<name>` as an article's `template`.

See also [assets/templates/README.md](../assets/templates/README.md).

## 8. Theming and branding

- Colours, glass effects and spacing are CSS variables at the top of `assets/css/style.css`; dark-mode overrides follow.
- The theme choice is saved in the browser's `localStorage` (managed by `assets/js/theme.js`).
- The brand mark in the navigation panel is in `assets/js/accordion-panel.js` (`logo`). Navigation items are in `assets/js/config.js` (`NAV_LINKS`).
- Page titles are in each HTML file's `<title>`; footer text and social links are in `assets/templates/pages/*.html`. The social links point to `#` – replace them with your own profiles.

## 9. Contact form

The form is **client-side only**. It validates input and stores messages in the visitor's own browser (`localStorage` key `contact-messages`); nothing is sent anywhere. To receive messages, post the form to a service such as Formspree or Netlify Forms by replacing the body of `handleSubmit()` in `contact.html` with a `fetch` call, and add the service's domain to `connect-src` in that page's Content Security Policy.

## 10. Deployment

**GitHub Pages:** *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*. The site appears at `https://<user>.github.io/<repo>/`. All paths are relative, so sub-paths work.

**Netlify / Cloudflare Pages / any static host:** publish the repository root, no build command.

## 11. Privacy checklist for photos

Cameras embed data that you may not want to publish: GPS coordinates, body serial numbers, owner names, editing-software paths and timestamps. Before adding photos:

1. Strip metadata with a tool such as ExifTool (`exiftool -all= -overwrite_original file.jpg`) or export from your editor with "metadata: none".
2. Verify: `exiftool file.jpg` should show only basic image properties.
3. Keep descriptions and locations to what you are happy to make public. Avoid street addresses and home locations.
4. Do not commit `.venv`, analysis dumps, backups or notes containing local paths. The included `.gitignore` covers common cases.

## 12. Offline use and content security policy

Each page has a Content Security Policy `<meta>` tag allowing scripts from `unpkg.com` and `cdn.jsdelivr.net`, styles and fonts from `cdnjs.cloudflare.com`, Google Fonts and Gstatic, and images from the site itself only. If you add a CDN or remote images, extend the matching directive (`script-src`, `style-src`, `font-src`, `img-src`, `connect-src`) in the HTML file.

To work offline, download Vue, marked, DOMPurify, Font Awesome and the fonts into `assets/vendor/`, update the `<script>`/`<link>` tags, and tighten the CSP.

## 13. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Blank page or "Could not load…" messages | The page is opened with `file://`. Serve it over HTTP ([section 2](#2-running-locally)). |
| Page stays empty, console shows Vue not defined | CDN blocked or offline. Check the network or vendor the libraries locally. |
| Collection card shows wrong photo count | `count` in `gallery/index.json` is out of date. |
| Photo is a broken image | Path in the JSON does not match the file (paths are case-sensitive on GitHub Pages and Linux). |
| Article opens blank or errors | The `file` path in `journal/index.json` is wrong, or the article JSON is invalid. Validate with `python -m json.tool file.json`. |
| Article shows the wrong layout | `template` is missing or misspelled; it must be one of the four registered layouts. |
| Gallery block in an article is empty | The `collection` id does not exist in `gallery/index.json`, or the `src` does not match a photo in that collection. |
| Remote image does not load | The host is not allowed by `img-src` in the page CSP. |
| Old data after editing | Hard refresh (Ctrl+F5); browsers cache JSON. |
| Theme resets | The browser blocks `localStorage` (private mode). |
| Alt-key shortcuts clash with the browser | Use the menu button instead, or remove the shortcut from `handleKeyboardShortcuts` in `assets/js/config.js`. |

Validate every JSON file at once:

```powershell
Get-ChildItem assets\data -Recurse -Filter *.json | ForEach-Object { python -m json.tool $_.FullName > $null; if ($LASTEXITCODE) { "Invalid: $($_.FullName)" } }
```

## 14. Getting help

- Check the [troubleshooting table](#13-troubleshooting) and the browser developer console (F12) first; most problems are a bad path or invalid JSON.
- Open an issue on the repository with: the page and URL, what you expected, what happened, console errors, and your browser and OS.
- Please do not attach photos with location metadata or any personal information to public issues.
