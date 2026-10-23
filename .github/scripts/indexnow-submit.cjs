'use strict';

const fs = require('node:fs');

const HOST = 'welcirc.pro';
const KEY = '16cda67c1e6c13d8f5f74ddeb35d10e78758350f';
const FORMATS = new Set([
  '/raus/', '/show/', '/nomera/', '/novogodniy-korporativ/',
]);

// sitemap.xml is the single source of canonical URLs; no duplicate SEO pages.
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const canonical = [...sitemap.matchAll(/<loc>\s*(https:\/\/welcirc\.pro\/[^<\s]*)\s*<\/loc>/g)]
  .map(match => match[1]);
if (!canonical.length || canonical.some(url => new URL(url).host !== HOST)) {
  throw new Error('No valid canonical URLs found in sitemap.xml');
}

const urlByPath = new Map(canonical.map(url => [new URL(url).pathname, url]));
const allPaths = [...urlByPath.keys()];
const genrePaths = allPaths.filter(path => path !== '/' && !FORMATS.has(path));
const changed = fs.readFileSync(process.argv[2] || 'changed-files.txt', 'utf8')
  .split(/\r?\n/).map(line => line.trim()).filter(Boolean);
const selected = new Set();
const add = path => {
  if (urlByPath.has(path)) selected.add(urlByPath.get(path));
};
const addMany = paths => paths.forEach(add);

if (changed.some(path => [
  '__ALL__', 'sitemap.xml',
  '.github/workflows/indexnow.yml',
  '.github/scripts/indexnow-submit.cjs',
].includes(path))) {
  addMany(allPaths);
} else {
  for (const path of changed) {
    if (path === 'index.html' || [
      'home-page-content.json', 'gallery-data.json',
      'videos-data.json', 'price-data.json',
    ].includes(path)) {
      add('/');
    } else if (path === 'site-media.json') {
      addMany(allPaths);
    } else if (['artist-content.json', 'artist-media.json'].includes(path)) {
      addMany(genrePaths);
    } else if (['format-pages-content.json', 'format-home-genres.json'].includes(path)) {
      addMany([...FORMATS]);
    } else if (path.endsWith('/index.html')) {
      add('/' + path.slice(0, -'index.html'.length));
    }
  }
}

const urlList = [...selected];
console.log('Changed files:', changed.length);
console.log('Canonical URLs selected for IndexNow:', urlList.length);
urlList.forEach(url => console.log(' - ' + url));

async function submit() {
  if (!urlList.length) {
    console.log('No canonical pages changed; nothing to submit.');
    return;
  }

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: 'https://' + HOST + '/' + KEY + '.txt',
      urlList,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const message = (await response.text()).slice(0, 500);
  console.log('IndexNow response: HTTP ' + response.status + (message ? ': ' + message : ''));
  if (![200, 202].includes(response.status)) {
    throw new Error('IndexNow rejected the URLs (HTTP ' + response.status + ')');
  }
  console.log('IndexNow accepted the submission (this does not guarantee indexing).');
}

submit().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
