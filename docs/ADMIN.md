# Editing OOVERT (the `/admin` control panel)

Your site content lives in plain data files in this repo, and a small build
(Eleventy) renders them into the real pages. The `/admin` page is a form editor
(Sveltia CMS) that writes those files for you. Save → the site rebuilds on
Vercel in about a minute.

Nothing about the public site changed: it's still static, fast, and makes no
external requests. Only the *editing* is new.

---

## One-time setup: your access token

You sign in with a GitHub token — no password, no app to install.

1. Go to **GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
   (Direct link: https://github.com/settings/tokens?type=beta)
2. Set:
   - **Token name:** `OOVERT admin`
   - **Expiration:** your choice (90 days is a good balance; you'll re-generate when it lapses).
   - **Repository access:** *Only select repositories* → **`ezanbhutta/oovert`**.
   - **Permissions → Repository permissions → Contents:** **Read and write**.
     (That's the only permission needed.)
3. **Generate token** and copy it (you only see it once).

Keep it somewhere safe (a password manager). Treat it like a password.

---

## Signing in

1. Go to **`https://<your-site>/admin/`** (e.g. `https://oovert-agency.vercel.app/admin/`).
2. Click **“Sign In Using Access Token.”**
3. Paste the token. It's stored only in your browser.

That's it — you're in.

---

## What you can edit

**Site** — everything on the homepage: the hero, the manifesto, every package
tier and price, the studio principles, contact details, footer, and the SEO /
social-share text.

**Case studies** — one entry per project. Create a new one, fill in the copy,
drop in images, and pick its look.

### Adding a case study
1. **Case studies → New Case study.**
2. Fill in **slug** (this becomes the URL: `/work/<slug>/`), **name**, client,
   sector, year, scope.
3. Under **sections**, add images where you have them. Any slot you leave empty
   shows a labelled placeholder that tells you exactly what image belongs there
   (ratio, size, composition) — so an unfinished project still looks intentional.
4. Set **status** to `published` when it's ready. Drafts don't appear publicly.
5. Save.

### Using video instead of an image
Every media slot (and every item in the multi-image sections — concept,
stationery, social, environment, gallery) has a collapsed **Video** group under
the image. Open it and upload a clip to that slot; **when a video file is set it
replaces the image** there. Use `.mp4` (widest support) or `.webm`.

The Video group is your control panel for how it plays:
- **Autoplay in view** — the clip plays (silently) when it scrolls onto screen
  and pauses when it leaves. Great for a moving hero or a full-bleed moment.
  Leave it on for background clips.
- **Loop** — repeat continuously.
- **Muted** — required for autoplay (browsers block sound-on autoplay). Only
  turn this off if you also turn autoplay off and switch controls on.
- **Show player controls** — the play / pause / volume bar. Best left off for
  background clips; turn it on for a clip people should choose to watch with
  sound.
- **Playback speed** — `1` is normal, `0.5` is half-speed (dreamy), `2` is
  double.
- **Start / End (seconds)** — trim: play only a slice of the clip. Leave **End**
  at `0` to run to the natural end. With Loop on, it loops that slice.
- **Poster image** — a still shown before the clip plays / while it loads, so
  nothing flashes empty.

A good background hero clip: autoplay on, loop on, muted on, controls off, and a
poster still. Keep clips short and compressed — a heavy file is slow to load.

### Giving a project its own look (theme)
Open a case study's **theme** section:
- **accent** — pick one brand colour. The build automatically derives
  accessible (AA-legible) shades for small text on light and dark grounds, so
  you can't accidentally ship an unreadable accent.
- **field** — the colour for the one full-bleed identity moment.
- **motion** — the reveal tempo. `1` is the house pace; `1.2` is bigger and
  more expressive; `0.8` is calmer.
- **displayWidth / displayWeight** — the headline "voice" (condensed and urgent
  → wide and monumental).

Leave theme empty and the project uses the standard OOVERT violet look.

### A note on the HTML in some fields
A few fields (big headlines, the manifesto) accept small bits of HTML so a word
can be emphasised — e.g. wrapping a word in `<em>…</em>` sets it in the italic
serif. Edit around those tags; if in doubt, leave them as they are.

---

## Where things live (for reference)
- Homepage content: `src/_data/site.json`
- Case studies: `src/_data/projects/<slug>.json`
- Uploaded images & videos: `src/assets/uploads/`

## If you ever want to edit without the admin (the escape hatch)
Because everything is just files in your repo, you're never locked in:
- Edit the JSON files directly on GitHub (or locally) and commit — the site
  rebuilds the same way.
- The admin (Sveltia) is a drop-in for **Decap CMS**; if you ever wanted to
  switch, the same `src/admin/config.yml` works with little to no change.

## Maintenance notes (for a developer)
- Build: `npm install` then `npm run build` (outputs `_site/`). Local preview: `npm run dev`.
- Eleventy is pinned to v3; Sveltia CMS is vendored at `src/admin/sveltia-cms.js`
  (pinned). Bump deliberately, not automatically.
