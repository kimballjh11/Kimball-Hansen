# Kimball Hansen personal site

Static site built with HTML, CSS, and vanilla JavaScript. There is no build step, package manager, or framework. Open `index.html` directly to view it locally.

## Files

| File | Purpose |
|---|---|
| `index.html` | Five section site: About me, Work experience, Education, Side projects, Contact |
| `horizon-planner.html` | Horizon Planner case study |
| `chick-fil-a.html` | Chick-fil-A case study |
| `lawn-care.html` | Lawn care business case study |
| `styles.css` | Shared layout, colors, responsive styles, dark mode, print styles |
| `main.js` | Section navigation, filters, accordions, and small interface behaviors |
| `map.js` | Interactive United States map behavior |
| `tools/build-map.mjs` | Instructions and generator for the inline map data |
| `assets/` | Images, logos, project examples, resume, transcript, and favicon |

## Current design and behavior

The site uses five hash linked sections: `#about`, `#experience`, `#education`, `#projects`, and `#contact`. Navigation works as page anchors when JavaScript is unavailable. The experience section has category filters and expandable entries. The map is embedded locally and does not use a map service at runtime. Dark mode follows the visitor's operating system setting. Reduced motion is supported, and the print stylesheet lays out the content for paper.

The interactive map uses these source facts: states visited are all states except Alaska, Maine, Vermont, Mississippi, and Massachusetts. Places lived are Utah, Spokane, Durham, Minneapolis, San Francisco, and Oakland. Minneapolis is the hometown marker. Keep the list in the map legend aligned with the state data in `index.html` and the marker data in `map.js`.

## Editing content

Page copy lives in the HTML. Edit the matching file directly.

To add or reorder a project, copy a project card in `index.html`. Keep the linked card class only for cards that lead to a case study. To add a case study, use one of the existing case study pages as a template. Keep the sections Context, What I did, Result, and What I would do differently. Update its title, description, metrics, and footer links too.

Every factual claim and number should be checked against a source before publishing. Do not fill gaps by guessing. Unknown details should stay as visible `{{PLACEHOLDER}}` chips until verified. Do not add private recruiting details, test scores, home address, unapproved research details, or stories about private individuals. Keep research descriptions general unless the research team has approved more detail.

The current open placeholder is `{{DOMAIN}}`, shown once in the footer on each HTML page. After choosing a domain, replace it on all four pages, add a canonical tag to each page, and make the social image URLs absolute.

## Updating common assets

Replace `assets/headshot.jpg` with a portrait cropped to a 4:5 ratio. Keep its actual pixel dimensions in the image element in `index.html`.

Replace `assets/resume.pdf` to update the resume. The existing resume links already point to that filename.

The transcript and resume files are excluded from Git by `.gitignore`. Check the intended audience and deployment contents before publishing documents from `assets/`.

## Updating the footer date

The footer currently says `Last updated November 2026`. Replace the date in all four HTML files when the site content changes:

```sh
sed -i '' 's/Last updated November 2026/Last updated MONTH YEAR/' *.html
```

## Deploying

This is a static site and needs no build command or output directory. It can be hosted by GitHub Pages, Netlify, or Vercel. The repository currently has no Git remote configured, so deployment status cannot be inferred from this checkout.

Before deployment, review the placeholder, PDF, and image contents in the exact folder or repository being published. For a custom domain, replace `{{DOMAIN}}` in all four pages, add a canonical link in each page head, and use absolute URLs for social preview images.
