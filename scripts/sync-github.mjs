#!/usr/bin/env node
/**
 * Sync GitHub projects into the site.
 *
 *   npm run sync:github
 *
 * - Reads your public repos through GitHub's free public API (no key needed).
 * - Keeps the ones tagged with the topic "portfolio" (set it on GitHub:
 *   repo page → gear next to "About" → Topics).
 * - Saves them to src/data/github.json. Nothing is ever deleted: a repo that
 *   loses the tag is kept but marked hidden, so re-tagging brings it back.
 * - Repos owned by an organisation (group projects) can be added by full name
 *   in "extraRepos" in src/data/github-overrides.json.
 *
 * Env overrides (optional):
 *   GITHUB_USER=someone       a different account
 *   GITHUB_TOKEN=ghp_…        raises the rate limit (60 → 5000 requests/hour)
 *   GITHUB_API_URL=…          different API base (used for testing)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(root, 'src/data/github.json');
const OVERRIDES_FILE = path.join(root, 'src/data/github-overrides.json');
const USER = process.env.GITHUB_USER || 'Buwaneka-Vishwajith';
const API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
const TOPIC = 'portfolio';

const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'portfolio-sync',
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

const fail = (message) => {
  console.error(`\n✖ ${message}\n  Nothing was changed.\n`);
  process.exit(1);
};

async function get(url) {
  let res;
  try {
    res = await fetch(url, { headers });
  } catch (error) {
    fail(`Couldn't reach GitHub (${error.cause?.code || error.message}). Are you online?`);
  }
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    fail('GitHub rate limit reached (60 requests an hour without a token). Try again later, or set GITHUB_TOKEN.');
  }
  if (res.status === 404) return null;
  if (!res.ok) fail(`GitHub answered HTTP ${res.status} for ${url}.`);
  return res.json();
}

async function userRepos() {
  const all = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await get(`${API}/users/${USER}/repos?per_page=100&page=${page}&type=owner`);
    if (!batch) fail(`No GitHub user called "${USER}".`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

const toEntry = (repo) => ({
  id: repo.name.toLowerCase(),
  fullName: repo.full_name,
  name: repo.name,
  description: repo.description || '',
  url: repo.html_url,
  homepage: repo.homepage || '',
  language: repo.language || '',
  topics: (repo.topics || []).filter((t) => t !== TOPIC),
  stars: repo.stargazers_count || 0,
  pushed: repo.pushed_at,
  created: repo.created_at,
  tagged: (repo.topics || []).includes(TOPIC),
});

async function main() {
  const overrides = existsSync(OVERRIDES_FILE) ? JSON.parse(await readFile(OVERRIDES_FILE, 'utf8')) : {};
  console.log(`Reading github.com/${USER} (public repos tagged "${TOPIC}")`);

  const repos = await userRepos();
  for (const fullName of overrides.extraRepos || []) {
    const repo = await get(`${API}/repos/${fullName}`);
    if (repo) repos.push(repo);
    else console.warn(`  ! extraRepos: "${fullName}" not found or private; skipped`);
  }

  const cache = existsSync(DATA_FILE) ? JSON.parse(await readFile(DATA_FILE, 'utf8')) : [];
  const byId = new Map(cache.map((r) => [r.id, r]));
  const fresh = new Map(repos.map((r) => [r.name.toLowerCase(), toEntry(r)]));
  let added = 0;

  // Update or add every repo we can see that is (or was) tagged.
  for (const [id, entry] of fresh) {
    if (!entry.tagged && !byId.has(id)) continue;
    if (entry.tagged && !byId.get(id)?.tagged) added += 1;
    byId.set(id, entry);
  }
  // Repos that vanished (deleted or made private): keep, but hide.
  for (const [id, entry] of byId) {
    if (!fresh.has(id)) byId.set(id, { ...entry, tagged: false });
  }

  const all = [...byId.values()].sort((a, b) => (b.pushed || '').localeCompare(a.pushed || ''));
  await writeFile(DATA_FILE, `${JSON.stringify(all, null, 2)}\n`);

  const shown = all.filter((r) => r.tagged);
  console.log(`\n✔ ${shown.length} repos shown (${added} new) → src/data/github.json\n`);
  console.log('  id                          updated     language');
  for (const r of shown) console.log(`  ${r.id.padEnd(26)}  ${(r.pushed || '').slice(0, 10)}  ${r.language}`);
  const hidden = all.length - shown.length;
  if (hidden) console.log(`\n  (${hidden} untagged repo${hidden > 1 ? 's' : ''} kept but hidden)`);
  console.log('\nTo feature one on the homepage, add its id to src/data/home.ts.\n');
}

main();
