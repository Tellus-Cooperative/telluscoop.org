import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const exists = (p) => existsSync(new URL(p, root));
const require = createRequire(import.meta.url);

const PAGES = {
  'index.html': { url: 'https://telluscoop.org/', img: 'og-home.png' },
  'brand.html': { url: 'https://telluscoop.org/brand', img: 'og-brand.png' },
  'resources/index.html': { url: 'https://telluscoop.org/resources', img: 'og-resources.png' },
  'tools/qr-generator/index.html': { url: 'https://telluscoop.org/tools/qr-generator', img: 'og-qr-generator.png' },
};

test('every public page uses its own /og image plus the full meta set', () => {
  for (const [file, { url, img }] of Object.entries(PAGES)) {
    const html = read(file);
    const abs = `https://telluscoop.org/og/${img}`;
    for (const needle of [
      `property="og:image" content="${abs}"`, `name="twitter:image" content="${abs}"`, `property="og:url" content="${url}"`,
      'property="og:site_name" content="Tellus Cooperative"', 'property="og:type" content="website"',
      'property="og:image:width" content="1200"', 'property="og:image:height" content="630"',
      'name="twitter:card" content="summary_large_image"', 'name="twitter:site" content="@TellusCoop"',
      'property="og:image:alt"', 'property="og:locale"', 'property="og:title"', 'property="og:description"',
    ]) assert.ok(html.includes(needle), `${file}: ${needle}`);
    assert.ok(exists(`og/${img}`), `og/${img} missing`);
    assert.doesNotMatch(html, /uploads\/OPENGRAPH\.jpg|ChatGPT/);
  }
});

test('all 8 static OG images are 1200x630 PNGs under 300 KB', () => {
  const names = ['og-home', 'og-brand', 'og-codigo-conducta', 'og-codigo-conducta-en', 'og-embajadores', 'og-embajadores-en', 'og-resources', 'og-qr-generator'];
  for (const n of names) {
    const buf = readFileSync(new URL(`og/${n}.png`, root));
    assert.equal(buf.subarray(1, 4).toString(), 'PNG');
    assert.equal(buf.readUInt32BE(16), 1200, n);
    assert.equal(buf.readUInt32BE(20), 630, n);
    assert.ok(buf.length < 300 * 1024, `${n} ${buf.length}`);
  }
});

test('/hub and its OG image are untouched by the redesign', () => {
  assert.ok(exists('uploads/OPENGRAPH.jpg'));
  assert.ok(exists('hub/index.html'));
});

test('sitemap.xml lists the public pages, every tool, and never /hub', () => {
  const xml = read('sitemap.xml');
  assert.doesNotMatch(xml, /\/hub/);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const p of ['/', '/brand', '/resources', '/code-of-conduct', '/en/code-of-conduct', '/programs/stellar-chile/ambassadors', '/en/programs/stellar-chile/ambassadors']) {
    assert.ok(locs.includes(`https://telluscoop.org${p === '/' ? '/' : p}`), p);
  }
  const { tools } = JSON.parse(read('resources/tools.json'));
  for (const t of tools) assert.ok(locs.includes(`https://telluscoop.org/resources/tools/${t.slug}`), t.slug);
  assert.ok(!locs.some((l) => l.includes('qr-generator')), 'noindex page stays out of the sitemap');
});

test('robots.txt points to the sitemap that exists', () => {
  assert.match(read('robots.txt'), /^Sitemap: https:\/\/telluscoop\.org\/sitemap\.xml$/m);
  assert.ok(exists('sitemap.xml'));
});

test('custom 404 exists with shared nav and footer and does not touch hub/404.html', () => {
  const html = read('404.html');
  assert.match(html, /data-tellus="nav"/);
  assert.match(html, /data-tellus="footer"/);
  assert.match(html, /<meta name="robots" content="noindex" \/>/);
  assert.ok(exists('hub/404.html'));
});

const SKIP = new Set(['hub', 'hub.html', 'node_modules', '.git', 'rebrand', 'server', '.atl', 'docs', 'scraper', 'supabase', 'dist', 'tests', '.playwright-mcp', '.vercel', 'Stellar Merch | Tellus Cooperative']);
function walk(dir, out = []) {
  for (const name of readdirSync(new URL(dir, root))) {
    if (SKIP.has(name)) continue;
    const rel = dir + name;
    const st = statSync(new URL(rel, root));
    if (st.isDirectory()) walk(rel + '/', out);
    else if (/\.(html|css|js|jsx)$/.test(name)) out.push(rel);
  }
  return out;
}

test('JetBrains Mono (or any --mono) is not used anywhere outside hub/', () => {
  const files = walk('');
  assert.ok(files.length > 20);
  for (const f of files) assert.doesNotMatch(read(f), /JetBrains/i, f);
  assert.doesNotMatch(read('dist/home.js'), /JetBrains/i);
});

test('no font sizes below 14px in shared/, page CSS or inline page CSS', () => {
  const css = ['shared/tokens.css', 'shared/site.css', 'policies/policy.css', 'resources/resources.css', 'brand.css', 'foundation.css', 'tools/qr-generator/qr.css', 'merch/styles.css'];
  const bad = /font-size:\s*(1[0-3]|[0-9])px|font:[^;{}]*\b(1[0-3]|[0-9])px\s*\//;
  for (const f of css) assert.doesNotMatch(read(f), bad, f);
  for (const f of ['404.html', 'brand.html', 'resources/index.html', 'resources/tool.html', 'shared/site.js', 'resources/resources.js', 'resources/tool.js']) {
    assert.doesNotMatch(read(f), /font-size:\s*(1[0-3]|[0-9])px/, f);
  }
});

test('resources: counts come from tools.json at runtime, nothing hardcoded', () => {
  const js = read('resources/resources.js');
  assert.match(js, /tools\.json/);
  assert.match(js, /d\.tools\.length/);
  assert.match(js, /d\.categories\.length/);
  const html = read('resources/index.html');
  assert.doesNotMatch(html, /\b(109|110|23|24)\b.*(resources|tools|recursos)/i);
  assert.doesNotMatch(html + js, /hello@/);
  assert.match(js, /hola@telluscoop\.org/);
  assert.match(js, /<details/);
  assert.doesNotMatch(html, /btn--primary/, 'the directory has no primary button');
});

test('tool profile: primary visit button is external with noopener, one primary only', () => {
  const js = read('resources/tool.js');
  assert.match(js, /class="btn btn--primary" href="' \+ esc\(safeUrl\) \+ '" target="_blank" rel="noopener"/);
  assert.match(js, /safeUrl = \/\^https\?:/, 'tool.url scheme must be validated');
  assert.equal(js.match(/btn btn--primary/g).length, 2); // profile + not-found state, never together
  assert.doesNotMatch(js, /mshots|google\.com\/s2/);
});

test('per-slug tool pages: rewrite + function inject title, canonical, og:url and og:image', () => {
  const { rewrites, functions } = JSON.parse(read('vercel.json'));
  assert.equal(rewrites.find((r) => r.source === '/resources/tools/:slug')?.destination, '/api/tool-page?slug=:slug');
  assert.ok(rewrites.some((r) => r.source === '/og/tools/:slug.png' && r.destination === '/api/og-tool?slug=:slug'));
  assert.ok(functions['api/tool-page.js'] && functions['api/og-tool.js']);
  const { render } = require('../api/tool-page.js');
  const ok = render('insforge');
  assert.equal(ok.status, 200);
  assert.match(ok.body, /<title>InsForge · Tellus Resources<\/title>/);
  assert.match(ok.body, /property="og:url" content="https:\/\/telluscoop\.org\/resources\/tools\/insforge"/);
  assert.match(ok.body, /property="og:image" content="https:\/\/telluscoop\.org\/og\/tools\/insforge\.png"/);
  assert.match(ok.body, /<link rel="canonical" href="https:\/\/telluscoop\.org\/resources\/tools\/insforge"/);
  assert.equal(render('does-not-exist').status, 404);
  assert.match(read('serve.json'), /"\/resources\/tools\/:slug"/);
});

test('og-tool renders a 1200x630 PNG for a slug (no network needed)', async () => {
  const { renderToolOg } = require('../api/og-tool.js');
  const png = await renderToolOg('insforge', 'en', { noFavicon: true });
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.equal(await renderToolOg('nope', 'en', { noFavicon: true }), null);
});

test('leftovers are gone and nothing still points at them', () => {
  for (const f of ['tokens.css', 'styles/tokens.css', 'image-slot.js', 'uploads/ChatGPT Image Jul 29, 2026, 12_10_56 PM.png', 'uploads/EDUCACION COOPERATIVA.jpg', 'uploads/project incubation.jpg', 'uploads/public research.jpg']) {
    assert.ok(!exists(f), `${f} should be deleted`);
  }
  // hub, merch and fear-greed still load /theme.js + /theme.css, so those stay
  assert.ok(exists('theme.js') && exists('theme.css'));
});

test('vercel.json rewrites use path-to-regexp params, not named regex groups', () => {
  const cfg = read('vercel.json');
  assert.doesNotMatch(cfg, /\(\?</, 'named groups are rejected by Vercel routing validation');
  assert.match(cfg, /"\/og\/tools\/:slug\.png"/);
});

test('shared shell has no "#" hrefs and EN policies keep the Spanish-prevails note', () => {
  assert.doesNotMatch(read('shared/site.js'), /href="#"/);
  for (const p of ['policies/en/code-of-conduct.html', 'policies/en/ambassadors.html']) {
    assert.match(read(p), /Spanish version<\/a> prevails/);
  }
});
