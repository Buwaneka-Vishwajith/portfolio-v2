# Buwaneka Vishwajith — Portfolio v2

Astro + React islands + Tailwind CSS v4. Motion (GSAP + Lenis) arrives in Phase 3.

## Run it

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve the built site
```

## Where things live

| You want to change… | Edit this |
| --- | --- |
| Name, email, CV, social links, nav, tech strip | `src/data/site.ts` |
| Experience (add / edit / delete roles) | `src/data/experience.json` |
| Projects and case studies | `src/content/projects/*.mdx` |
| Colors, fonts, type sizes | `@theme` in `src/styles/global.css` |
| Homepage section order | `src/pages/index.astro` |
| A single section | `src/components/sections/` |
| Nav, footer, project card | `src/components/ui/` |
| Animations (Phase 3) | `src/lib/motion.ts` |

### Experience

Each role is one object in `src/data/experience.json`:

```json
{
  "id": "internship",
  "company": "Company name",
  "position": "Software Engineer (Internship)",
  "period": "2025 — Present",
  "order": 1,
  "description": ["…", "…"],
  "technologies": ["…"],
  "hidden": false
}
```

- **Add** a role: copy an object, give it a new unique `id`.
- **Delete** a role: remove its object.
- **Hide** without deleting: set `"hidden": true`.
- **Reorder**: change `order` (lower shows first).
- Each role is drawn as a folder. Optional `"tab"` sets the short text on the folder tab
  (defaults to the company name) and optional `"color"` (e.g. `"#0297DE"`) sets its colour;
  otherwise colours rotate through the palette in `src/components/react/ExperienceFolder.jsx`.

### Homepage projects

`src/data/home.ts` lists the 5 projects in the homepage bento grid, by file name.
Position 1 is the big tile; reorder the list to rearrange the cards. The build stops with a
clear message if the list has a typo, a duplicate or the wrong number of projects.
Every project (homepage or not) is listed on `/work`.

### Projects

One `.mdx` file per project. The front matter at the top is checked against the schema in
`src/content.config.ts`; the build fails with a clear message if a field is wrong.

- `featured: true` → gets a case-study page at `/work/<file-name>`; its card links there.
- `featured: false` → its card links to `github` instead.
- `bento` → tile size on `/work`: `large` (2 x 2), `wide` (2 x 1), `tall` (1 x 2) or `small`.
- `order` → position on `/work` (lower shows first).
- `frame` → card border color: `teal`, `cobalt`, `coral` or `lilac`.
- `video` → put the file in `public/media/` and set `video: /media/name.mp4`.

### Medium articles (Writing section)

Medium has no free API for reading posts, so the site uses your public RSS feed. That feed only
lists your latest 10 posts, so articles are saved into the project and kept after they drop off.

1. After publishing on Medium, run `npm run sync:medium`. It saves every article in your feed to
   `src/data/medium.json` (adding, never removing), downloads the covers to
   `public/media/articles/`, and prints each article's id.
2. Add the ids you want shown, in order, to `src/data/articles.ts`. An empty list hides the section.
3. Commit and push.

## The memory game and terminal

`src/components/react/Game.jsx` is the v1 file, copied byte for byte. Don't edit it.
`src/components/react/Terminal.jsx` is the v1 terminal, moved out of `Home.jsx` unchanged.
Both render inside `.legacy-scope` (in `global.css`), which restores the v1 Inter font so they
look exactly as before. They're loaded with `client:visible`, so their JavaScript downloads only
when you scroll to the Playground.

## Deploy

This is a standalone project, separate from the old portfolio repo. Push it to a new GitHub repo,
then import that repo in Vercel as a new project. Vercel detects Astro and needs no extra
configuration or GitHub Actions workflow.
