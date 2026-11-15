import medium from '../data/medium.json';
import { selectedArticles } from '../data/articles';

export interface Article {
  id: string;
  title: string;
  link: string;
  published: string;
  tags: string[];
  excerpt: string;
  cover: string;
}

/**
 * The articles listed in src/data/articles.ts, in that order.
 * Stops the build with a clear message if an id is wrong.
 */
export function getSelectedArticles(): Article[] {
  const all = medium as Article[];
  const byId = new Map(all.map((a) => [a.id, a]));
  const unknown = selectedArticles.filter((id) => !byId.has(id));
  const dupes = selectedArticles.filter((id, i) => selectedArticles.indexOf(id) !== i);
  const problems: string[] = [];

  if (unknown.length) {
    problems.push(
      `no synced article has the id ${unknown.map((id) => `"${id}"`).join(', ')}. ` +
        (all.length
          ? `Synced ids: ${all.map((a) => `${a.id} (${a.title})`).join('; ')}`
          : 'src/data/medium.json is empty; run `npm run sync:medium` first'),
    );
  }
  if (dupes.length) problems.push(`listed more than once: ${[...new Set(dupes)].join(', ')}`);
  if (problems.length) throw new Error(`src/data/articles.ts — ${problems.join('; ')}.`);

  return selectedArticles.map((id) => byId.get(id)!);
}

export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
