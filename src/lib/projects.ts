import { getCollection } from 'astro:content';
import { homeProjects } from '../data/home';
import github from '../data/github.json';
import overrides from '../data/github-overrides.json';

type Frame = 'teal' | 'cobalt' | 'coral' | 'lilac';
type Bento = 'large' | 'wide' | 'tall' | 'small';

/** One project card, whether it came from an .mdx file or from GitHub. */
export interface Project {
  id: string;
  source: 'mdx' | 'github';
  title: string;
  summary: string;
  year?: number;
  meta?: string; // "Group project", "TypeScript", …
  stack: string[];
  href?: string; // where the card goes
  external: boolean;
  live?: string; // live demo link
  frame: Frame;
  bento: Bento;
  video?: string;
  poster?: string;
  /** A built-in animated demo for the big tile instead of a video, e.g. 'nudge'. */
  demo?: string;
  order: number;
  updated?: string;
}

interface Repo {
  id: string;
  fullName: string;
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  topics: string[];
  pushed: string;
  tagged: boolean;
}
interface RepoOverride {
  title?: string;
  summary?: string;
  bento?: Bento;
  frame?: Frame;
  order?: number;
  hidden?: boolean;
  video?: string;
  poster?: string;
  demo?: string;
}

export const HOME_SLOTS = 5;
const FRAMES: Frame[] = ['teal', 'cobalt', 'coral', 'lilac'];

// Words that read better in capitals.
const ACRONYMS = new Set(['api', 'cli', 'ui', 'ux', 'ai', 'ml', 'js', 'ts', 'sql', 'css', 'html', 'jwt', 'crud', 'mern', 'iot', 'pwa', 'url']);

// "expense-split" → "Expense Split", "weather-cli" → "Weather CLI"
const prettify = (name: string) =>
  name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

const normaliseUrl = (url?: string) => (url || '').toLowerCase().replace(/\/+$/, '');

/** Every project: hand-written ones first (by `order`), then GitHub ones (most recently updated first). */
export async function getAllProjects(): Promise<Project[]> {
  const mdx: Project[] = (await getCollection('projects')).map(({ id, data }) => ({
    id,
    source: 'mdx',
    title: data.title,
    summary: data.summary,
    year: data.year,
    meta: data.team,
    stack: data.stack,
    href: data.featured ? `/work/${id}` : data.github,
    external: !data.featured,
    live: data.live,
    frame: data.frame,
    bento: data.bento,
    video: data.video,
    poster: data.poster,
    order: data.order,
  }));

  // A repo that already has a hand-written .mdx (same id or same GitHub link) is skipped.
  const taken = new Set([
    ...mdx.map((p) => p.id),
    ...(await getCollection('projects')).map(({ data }) => normaliseUrl(data.github)).filter(Boolean),
  ]);
  const tweaks = (overrides.repos ?? {}) as Record<string, RepoOverride>;

  const repos: Project[] = (github as Repo[])
    .filter((r) => r.tagged && !tweaks[r.id]?.hidden && !taken.has(r.id) && !taken.has(normaliseUrl(r.url)))
    .sort((a, b) => (b.pushed || '').localeCompare(a.pushed || ''))
    .map((r, i) => {
      const t = tweaks[r.id] ?? {};
      return {
        id: r.id,
        source: 'github' as const,
        title: t.title ?? prettify(r.name),
        summary: t.summary ?? r.description,
        year: r.pushed ? new Date(r.pushed).getUTCFullYear() : undefined,
        meta: r.language || undefined,
        stack: r.topics,
        href: r.url,
        external: true,
        live: r.homepage || undefined,
        frame: t.frame ?? FRAMES[i % FRAMES.length],
        bento: t.bento ?? 'small',
        video: t.video,
        poster: t.poster,
        demo: t.demo,
        order: t.order ?? 1000 + i,
        updated: r.pushed,
      };
    });

  return [...mdx, ...repos].sort((a, b) => a.order - b.order);
}

/**
 * The homepage projects, in the order listed in src/data/home.ts.
 * Stops the build with a clear message if the list is wrong, so a
 * broken grid can never be deployed.
 */
export async function getHomeProjects(): Promise<Project[]> {
  const all = await getAllProjects();
  const byId = new Map(all.map((p) => [p.id, p]));
  const problems: string[] = [];

  if (homeProjects.length < 1 || homeProjects.length > HOME_SLOTS) {
    problems.push(`it lists ${homeProjects.length} projects; it needs 1 to ${HOME_SLOTS}`);
  }
  const unknown = homeProjects.filter((id) => !byId.has(id));
  if (unknown.length) {
    problems.push(
      `no project matches: ${unknown.map((id) => `"${id}"`).join(', ')}. ` +
        `Available: ${[...byId.keys()].join(', ')}`,
    );
  }
  const dupes = homeProjects.filter((id, i) => homeProjects.indexOf(id) !== i);
  if (dupes.length) problems.push(`listed more than once: ${[...new Set(dupes)].join(', ')}`);

  if (problems.length) {
    throw new Error(`src/data/home.ts — ${problems.join('; ')}.`);
  }
  return homeProjects.map((id) => byId.get(id)!);
}
