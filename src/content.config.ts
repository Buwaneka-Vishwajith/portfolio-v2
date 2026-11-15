import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * PROJECTS — one .mdx file per project in src/content/projects/.
 * Add a project = add a file. Featured projects get a case-study page
 * at /work/<file-name> and a card in "Selected work".
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number().optional(),
    role: z.string().optional(),
    team: z.string().optional(), // e.g. "Group of 4" or "Solo"
    stack: z.array(z.string()),
    github: z.url().optional(),
    live: z.string().optional(), // a URL, or an on-page anchor like "#playground"
    featured: z.boolean().default(false),
    order: z.number().default(99), // lower = shown first
    frame: z.enum(['teal', 'cobalt', 'coral', 'lilac']).default('teal'),
    // Tile size in the Selected work bento grid.
    // large = 2 x 2, wide = 2 x 1, tall = 1 x 2, small = 1 x 1
    bento: z.enum(['large', 'wide', 'tall', 'small']).default('small'),
    video: z.string().optional(), // e.g. "/media/efoods.mp4"
    poster: z.string().optional(), // still image shown before the video loads
  }),
});

/**
 * EXPERIENCE — every role lives in src/data/experience.json.
 * Add, edit or delete an object there; the section updates itself.
 * Set "hidden": true to keep an entry in the file without showing it.
 */
const experience = defineCollection({
  loader: file('./src/data/experience.json'),
  schema: z.object({
    company: z.string(),
    position: z.string(),
    period: z.string(),
    order: z.number(), // lower = shown first
    description: z.array(z.string()),
    technologies: z.array(z.string()),
    hidden: z.boolean().default(false),
    // Folder tab text. Defaults to the company name (long names get cut off).
    tab: z.string().optional(),
    // Folder colour, e.g. "#0297DE". Defaults to the next colour in the palette.
    color: z.string().optional(),
  }),
});

export const collections = { projects, experience };
