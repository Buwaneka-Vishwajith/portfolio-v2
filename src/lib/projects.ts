import { getCollection, type CollectionEntry } from 'astro:content';
import { homeProjects } from '../data/home';

export type Project = CollectionEntry<'projects'>;

export const HOME_SLOTS = 5;

/** All projects, in the order set by each file's `order` field. */
export async function getAllProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
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

  if (homeProjects.length !== HOME_SLOTS) {
    problems.push(`it lists ${homeProjects.length} projects; it needs exactly ${HOME_SLOTS}`);
  }
  const unknown = homeProjects.filter((id) => !byId.has(id));
  if (unknown.length) {
    problems.push(
      `no project file matches: ${unknown.map((id) => `"${id}"`).join(', ')}. ` +
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
