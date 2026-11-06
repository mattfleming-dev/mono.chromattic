// Simple client-side HTML include utility
// Usage: <div data-include="path/to/fragment.html"></div>
document.addEventListener('DOMContentLoaded', () => {
  function sanitizeHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove active content elements.
    doc.querySelectorAll('script, iframe, object, embed, link[rel="import"], meta[http-equiv]').forEach((node) => {
      node.remove();
    });

    // Remove inline handlers and javascript: URLs.
    doc.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();

        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }

        if ((name === 'href' || name === 'src' || name === 'xlink:href') && /^javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  }

  const includes = document.querySelectorAll('[data-include]');
  includes.forEach(el => {
    const url = el.getAttribute('data-include');
    if (!url) return;
    fetch(url, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
        return res.text();
      })
      .then(html => {
        el.innerHTML = sanitizeHtml(html);
      })
      .catch(err => {
        // Log error and leave element empty so page still works
        console.error(err);
      });
  });
});
