# Kimball Hansen — personal site

Static site. Plain HTML, one stylesheet, one small script. No build step, no npm, no framework.
Open `index.html` by double-clicking it and the whole site works, offline, including every internal link.

```
index.html              hero, selected work, experience, about, contact
horizon-planner.html    case study
chick-fil-a.html        case study
lawn-care.html          case study
styles.css              all styling for all four pages
main.js                 sticky-nav rule, mobile menu, scroll reveal
assets/headshot.jpg     880 × 1100 (4:5)
assets/favicon.svg
assets/resume.pdf
.gitignore              keeps .DS_Store out of version control
```

Private files (transcript, raw headshot, resume copy, old prompts and briefs) live in
`../PersonalSite-private/`, outside this folder, so they are never deployed. Keep it that way.

## Editing content

All copy lives directly in the HTML. There is no CMS and no templating, so edit the page you want to change.

- **Add or reorder a project:** copy an `<article class="card">` block in `index.html` and move it. Keep
  `card--linked` only on cards that link to a case study; the class is what makes the whole card clickable.
- **Write a new case study:** copy `lawn-care.html`, change the title, meta description, header, metrics, and
  the four body sections. The four sections — Context, What I did, Result, What I would do differently — are
  deliberate. The last one is the most credible thing on the page; do not drop it.
- **Update the metric count on a case study:** the `style="--metric-cols: 4"` on `.metrics` sets how many
  columns appear from 768px up. Use 3 or 4. They always stack two-up on mobile.
- **Change the date in the footer:** search for `Last updated November 2026`, which appears once per page,
  and replace it on all four pages at once:
  `sed -i '' 's/Last updated November 2026/Last updated MONTH YEAR/' *.html`

## Swapping the headshot

Replace `assets/headshot.jpg` with your own file at a 4:5 ratio, then update **one line** in `index.html`:

```html
<img src="assets/headshot.jpg" width="880" height="1100" alt="...">
```

Set `width` and `height` to the real pixel dimensions of the new file. They prevent layout shift while the
image loads, so wrong values are worse than no values. From a Mac terminal, crop and convert any image with:

```sh
sips -s format jpeg -s formatOptions 72 -c 1100 880 input.png --out assets/headshot.jpg
```

## Swapping the resume

Drop a new PDF at `assets/resume.pdf`. Nothing else changes — every resume link on every page already points
there. Keep the filename.

## Deploying

Any static host. No configuration, no build command, no output directory.

- **GitHub Pages:** push this folder to a repo, then Settings → Pages → deploy from `main`, root.
- **Netlify / Vercel:** drag the folder onto the dashboard, or connect the repo and leave the build settings
  empty.

After you have a domain, do these three things:

1. Replace `{{DOMAIN}}` everywhere (see the checklist below).
2. Add a canonical tag to each page's `<head>`: `<link rel="canonical" href="https://yourdomain.com/">`.
3. Make the social images absolute. `og:image` and `twitter:image` currently read `assets/headshot.jpg`;
   scrapers need the full `https://yourdomain.com/assets/headshot.jpg`.

## Placeholder checklist

Every unresolved value is wrapped in `<span class="todo">` and shows as a yellow highlighted chip on the page,
so you cannot miss one while editing and nothing breaks if one ships. Each is a plain find-and-replace.

| Placeholder | File | Appears | What it expects |
|---|---|---|---|
| `{{DOMAIN}}` | `index.html`, `horizon-planner.html`, `chick-fil-a.html`, `lawn-care.html` | 1× per page | Footer domain, written plainly, e.g. `kimballhansen.com`. Leave until a domain exists. |

To clear the domain everywhere at once, from this folder:

```sh
sed -i '' 's/<span class="todo" title="Replace before publishing">{{DOMAIN}}<\/span>/kimballhansen.com/g' *.html
```

## Worth knowing

- **Every number on this site comes from your resume**, not from the site generator: 47% catering growth,
  ~$105K annualized catering revenue, ~$500K sticker cost, $60K app revenue, $200K lifetime and $50K final-year
  lawn revenue, 50+ contracts, 90% retention, 100+ Horizon Planner users, GPA 3.90. If you revise the resume,
  revise these too — a recruiter will read both.
- **GPA is 3.90**, per the cumulative GPA on the September 2026 transcript. The resume PDF still says 3.91.
  Update the resume to 3.90 before you send either out.
- **Dark mode is automatic**, driven by the visitor's OS setting. There is no toggle by design. Both palettes
  are defined in one place at the top of `styles.css`.
- **The site works with JavaScript off.** Nav links wrap onto a second row instead of collapsing into a
  hamburger, and all content is visible because the reveal animation only ever hides things via a class that
  JS adds.
- **Printing works.** The nav, footer, and buttons drop out, and link URLs are expanded after the link text.
