# Technology Horizons static site

A raw HTML/CSS/JS static site for `zcourts.github.io/technology-horizons`.

## Design notes

The layout intentionally avoids a box-heavy look. It uses editorial sections, soft gradients, timeline elements, ribbons, and a small number of cards only where they help with hierarchy.

The default language is Polish. English pages live under `/en/`.

## Publishing on GitHub Pages

GitHub Pages is configured to use GitHub Actions. Pushing to `main` runs
`.github/workflows/static.yml` and publishes the site at
`https://zcourts.github.io/technology-horizons/`.

The internal links use the `/technology-horizons/` project path, so they are ready for that GitHub Pages URL.

## Google Sheet submissions

The Contact and Suggest Talk dialogs are injected by `assets/js/site.js`. They
post JSON to a Google Apps Script web app, which writes into spreadsheet
`12of6lHoykHXQbjIkHjsQbV7FqINGk3D_nG24yDAioYs`. The receiver creates separate
`Contact messages` and `Talk submissions` tabs on first use, plus an
`All submissions` tab containing both form types.

To deploy the receiver:

1. Open the spreadsheet and select **Extensions → Apps Script**.
2. Paste `docs/google-sheets-endpoint.gs` into the editor.
3. Select **Deploy → New deployment → Web app**.
4. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
5. Deploy, then copy the generated `/exec` URL into the
   `TECHNOLOGY_HORIZONS_ENDPOINT` constant in `assets/js/site.js`.

The current deployment is configured as:

```js
const TECHNOLOGY_HORIZONS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwLDZWEpgJpI2Lf6TLkbw0h3wY7sj7bVsXaUWP5tm0XNJX_zS5I1B-EHyvMGvfq3IqVhg/exec";
```

The browser sends the payload as `text/plain` with `mode: "no-cors"`, matching
the static-site pattern used by Worka. Because `no-cors` responses are opaque,
the UI treats the request as submitted when the network call resolves. The
receiver independently validates the payload before storing it.

The web app is intentionally public because a static site cannot keep an API
credential secret. It accepts only the two known form types, rejects malformed
payloads, drops honeypot submissions, and protects cells from formula injection.

## SEO

Each public page includes:

- unique `<title>` and meta description
- canonical URL
- `hreflang` alternates for Polish and English
- Open Graph and Twitter preview metadata
- JSON-LD structured data using Schema.org vocabulary
- sitemap and robots file

The September 2026 event pages are currently marked up as normal web pages, not `Event` rich-result pages, because the exact title, date, description and agenda are not confirmed yet.
