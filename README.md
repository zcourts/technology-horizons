# Technology Horizons static site

A raw HTML/CSS/JS static site for `zcourts.github.io/opole-technology-horizons`.

## Structure

```text
.
├── index.html                         # Polish default home page
├── wydarzenia/index.html              # Polish events page
├── wydarzenia/2026-09/index.html      # Placeholder page for first event
├── prelegenci/index.html              # Polish speakers page
├── spolecznosc/index.html             # Polish community page
├── en/index.html                      # English home page
├── en/events/index.html               # English events page
├── en/events/2026-09/index.html       # English placeholder page for first event
├── en/speakers/index.html             # English speakers page
├── en/community/index.html            # English community page
├── assets/css/styles.css              # Shared CSS
├── assets/js/site.js                  # Shared dialog + submission JS
├── assets/img/logo.svg                # Logo
├── assets/img/social-card.svg         # Open Graph image
├── docs/google-sheets-endpoint.example.gs
├── robots.txt
├── sitemap.xml
└── .nojekyll
```

## Design notes

The layout intentionally avoids a box-heavy look. It uses editorial sections, soft gradients, timeline elements, ribbons, and a small number of cards only where they help with hierarchy.

The default language is Polish. English pages live under `/en/`.

## Publishing on GitHub Pages

1. Create a repository named `opole-technology-horizons` under the `zcourts` GitHub account.
2. Copy these files into the repository root.
3. Enable GitHub Pages from the main branch root.
4. The site will publish at:
   `https://zcourts.github.io/opole-technology-horizons/`

The internal links use the `/opole-technology-horizons/` project path, so they are ready for that GitHub Pages URL.

## Google Sheet submissions

The Contact and Suggest Talk dialogs are injected by `assets/js/site.js` and submit URL-encoded payloads to a configurable endpoint.

In `assets/js/site.js`, replace:

```js
const TECHNOLOGY_HORIZONS_ENDPOINT = "";
```

with the deployed endpoint that writes into your Google Sheet, for example:

```js
const TECHNOLOGY_HORIZONS_ENDPOINT = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

The JavaScript currently uses `mode: "no-cors"`, which is usually the simplest approach for a static page posting to a Google Apps Script web app. Because `no-cors` responses are opaque in the browser, the UI treats the request as submitted when the network call resolves.

A sample Apps Script receiver is included in `docs/google-sheets-endpoint.example.gs`.

## SEO

Each public page includes:

- unique `<title>` and meta description
- canonical URL
- `hreflang` alternates for Polish and English
- Open Graph and Twitter preview metadata
- JSON-LD structured data using Schema.org vocabulary
- sitemap and robots file

The September 2026 event pages are currently marked up as normal web pages, not `Event` rich-result pages, because the exact title, date, description and agenda are not confirmed yet.
