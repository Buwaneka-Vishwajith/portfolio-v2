/**
 * Medium articles shown in the "Writing" section, in this order.
 *
 * 1. Run `npm run sync:medium` after you publish. It saves your articles to
 *    src/data/medium.json and prints each one's id.
 * 2. Put the ids you want on the site here. Keep the title as a comment so
 *    the list stays readable.
 *
 * Leave the list empty to hide the section.
 */
export const selectedArticles: string[] = [
  'f13dacf3ca51', // Why Auto Increment IDs Quietly Break Your App (And Why UUIDs Save You)
  '99db3baa1927', // Dijkstra’s Algorithm… The GPS Inside Your Apps
  '0c107cc3d574', // GraphQL Feels Like Chatting with Your Database!
  'c4f0912ade73', // React Hooks-useEffect Explained
  'ce5cc100b581', // Javascript arrow function =>
  '7381cd31effe', // Javascript map() vs forEach()
  '4658bff2e15f', // Why didn’t JavaScript use the require() function, which was already there?
];

/** Your Medium profile, linked from the section's "More on Medium" button. */
export const mediumProfile = 'https://medium.com/@buwaneka10000';
