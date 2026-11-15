#!/usr/bin/env node
/**
 * Sync Medium articles into the site.
 *
 *   npm run sync:medium
 *
 * - Reads your public Medium RSS feed (free, no API key). Medium only lists
 *   the latest 10 posts there, so this script ADDS to src/data/medium.json
 *   and never removes articles. Older articles stay available forever.
 * - Downloads each cover image to public/media/articles/<id>.<ext>, so the
 *   site never depends on Medium's image servers.
 * - Prints every article's id. Put the ids you want shown, in order,
 *   in src/data/articles.ts.
 *
 * Env overrides (optional):
 *   MEDIUM_USER=@someone       different Medium account
 *   MEDIUM_FEED_URL=https://…  read a different feed URL (used for testing)
 */
import { XMLParser } from 'fast-xml-parser';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(root, 'src/data/medium.json');
const COVER_DIR = path.join(root, 'public/media/articles');
const USER = process.env.MEDIUM_USER || '@buwaneka10000';
const FEED_URL = process.env.MEDIUM_FEED_URL || `https://medium.com/feed/${USER}`;
const UA = 'Mozilla/5.0 (portfolio sync; +https://github.com/Buwaneka-Vishwajith/portfolio-v2)';

const fail = (message) => {
  console.error(`\n✖ ${message}\n  Nothing was changed.\n`);
  process.exit(1);
};

const asArray = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);
const text = (value) => (typeof value === 'object' && value !== null ? value['#text'] ?? '' : value ?? '');

// Medium's post id is the hex string at the end of the guid: https://medium.com/p/<id>
const postId = (item) => {
  const guid = String(text(item.guid));
  const fromGuid = guid.match(/\/p\/([0-9a-f]{8,})/i)?.[1];
  const fromLink = String(item.link).split('?')[0].match(/-([0-9a-f]{8,})$/i)?.[1];
  return (fromGuid || fromLink || '').toLowerCase();
};

const firstImage = (html) => html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;

const excerpt = (html) => {
  const firstParagraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '';
  const plain = firstParagraph.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ').trim();
  return plain.length > 180 ? `${plain.slice(0, 177).trimEnd()}…` : plain;
};

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

async function downloadCover(id, url) {
  // Already downloaded on an earlier run?
  const existing = (await readdir(COVER_DIR)).find((f) => f.startsWith(`${id}.`));
  if (existing) return `/media/articles/${existing}`;

  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get('content-type') || '').split(';')[0].trim();
  const ext = EXT[type] || path.extname(new URL(url).pathname).slice(1) || 'jpg';
  const file = `${id}.${ext}`;
  await writeFile(path.join(COVER_DIR, file), Buffer.from(await res.arrayBuffer()));
  return `/media/articles/${file}`;
}

async function main() {
  console.log(`Reading ${FEED_URL}`);

  let xml;
  try {
    const res = await fetch(FEED_URL, { headers: { 'user-agent': UA, accept: 'application/rss+xml, application/xml' } });
    if (!res.ok) fail(`Medium answered HTTP ${res.status}. Check the username, or try again in a minute.`);
    xml = await res.text();
  } catch (error) {
    fail(`Couldn't reach Medium (${error.cause?.code || error.message}). Are you online?`);
  }

  const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
  const items = asArray(parsed?.rss?.channel?.item);
  if (!items.length) fail('The feed has no articles. Is the username right?');

  await mkdir(COVER_DIR, { recursive: true });
  const cache = existsSync(DATA_FILE) ? JSON.parse(await readFile(DATA_FILE, 'utf8')) : [];
  const byId = new Map(cache.map((a) => [a.id, a]));
  let added = 0;

  for (const item of items) {
    const id = postId(item);
    if (!id) continue;
    const html = String(item['content:encoded'] ?? '');
    const before = byId.get(id);
    const imageUrl = firstImage(html);

    let cover = before?.cover ?? null;
    if (imageUrl && (!cover || cover.endsWith('_default.png'))) {
      try {
        cover = await downloadCover(id, imageUrl);
      } catch (error) {
        console.warn(`  ! cover for "${text(item.title)}" failed (${error.message}); using the default cover`);
      }
    }

    byId.set(id, {
      id,
      title: String(text(item.title)).trim(),
      link: String(item.link).split('?')[0],
      published: new Date(text(item.pubDate)).toISOString(),
      tags: asArray(item.category).map((c) => String(text(c))),
      excerpt: excerpt(html) || before?.excerpt || '',
      cover: cover ?? '/media/articles/_default.png',
    });
    if (!before) added += 1;
  }

  const all = [...byId.values()].sort((a, b) => b.published.localeCompare(a.published));
  await writeFile(DATA_FILE, `${JSON.stringify(all, null, 2)}\n`);

  console.log(`\n✔ ${all.length} articles saved (${added} new) → src/data/medium.json\n`);
  console.log('  id              published   title');
  for (const a of all) console.log(`  ${a.id.padEnd(14)}  ${a.published.slice(0, 10)}  ${a.title}`);
  console.log('\nTo show an article on the site, add its id to src/data/articles.ts.\n');
}

main();
