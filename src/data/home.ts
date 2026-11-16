/**
 * The 5 projects shown in the homepage "Selected work" bento grid.
 *
 * - Use project ids: a file name from src/content/projects/ (without .mdx),
 *   or a GitHub repo id printed by `npm run sync:github`.
 * - The position in this list decides the tile (1 to 5 projects):
 *     1 → big feature tile (2 x 2)
 *     2, 3 → right column
 *     4, 5 → bottom row (next to "See all projects")
 *   With fewer than 5, "See all projects" stretches to fill the bottom row.
 * - Reorder the list to rearrange the cards. Swap a name to change a project.
 * - Every project, including these, is listed on /work.
 */
export const homeProjects = [
  'ai-browser-popup', // Nudge (big tile)
  'ddos-map',         // Threat Scope
  'highlight-hunt',
  // 4th and 5th: add up to two more here later
];
