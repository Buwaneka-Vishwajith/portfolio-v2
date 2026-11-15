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

### Projects

One `.mdx` file per project. The front matter at the top is checked against the schema in
`src/content.config.ts`; the build fails with a clear message if a field is wrong.

- `featured: true` → a card in **Selected work** plus a case-study page at `/work/<file-name>`.
- `featured: false` → a row in **More projects**.
- `frame` → card border color: `teal`, `cobalt`, `coral` or `lilac`.
- `video` → put the file in `public/media/` and set `video: /media/name.mp4`.

## The memory game and terminal

`src/components/react/Game.jsx` is the v1 file, copied byte for byte. Don't edit it.
`src/components/react/Terminal.jsx` is the v1 terminal, moved out of `Home.jsx` unchanged.
Both render inside `.legacy-scope` (in `global.css`), which restores the v1 Inter font so they
look exactly as before. They're loaded with `client:visible`, so their JavaScript downloads only
when you scroll to the Playground.

## Deploy

Vercel builds Astro with no extra configuration: import the repo (or point the existing project
at the `v2` branch). The v1 GitHub Actions workflow isn't needed.
