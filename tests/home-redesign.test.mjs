import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const require = createRequire(import.meta.url);

test('home ships no in-browser Babel, Tweaks panel or editmode block', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /babel/i);
  assert.doesNotMatch(html, /type="text\/babel"/);
  assert.doesNotMatch(html, /tweaks-panel|TweaksPanel|EDITMODE/i);
  assert.ok(!existsSync(new URL('../tweaks-panel.jsx', import.meta.url)));
});

test('built home bundle exists, is non-trivial and is what index.html loads', () => {
  const p = new URL('../dist/home.js', import.meta.url);
  assert.ok(existsSync(p), 'run `npm run build:home` and commit dist/home.js');
  assert.ok(statSync(p).size > 5000);
  assert.match(read('index.html'), /<script src="\/dist\/home\.js/);
  assert.match(read('package.json'), /"build:home":\s*"esbuild/);
});

test('no JetBrains Mono anywhere in the shared shell or home', () => {
  for (const f of ['index.html', 'foundation.css', 'foundation.jsx', 'shared/tokens.css', 'shared/site.css', 'shared/site.js']) {
    assert.doesNotMatch(read(f), /JetBrains|--mono/i, f);
  }
});

test('only Fraunces and Inter are requested from Google Fonts', () => {
  const html = read('index.html');
  const link = html.match(/fonts\.googleapis\.com\/css2\?[^"]+/)[0];
  assert.match(link, /Fraunces/);
  assert.match(link, /Inter/);
  assert.doesNotMatch(link, /JetBrains|Instrument|Mono/i);
  assert.match(link, /display=swap/);
});

test('no public CORS proxies anywhere in the home code', () => {
  for (const f of ['foundation.jsx', 'i18n.js', 'index.html', 'api/articles.js', 'dist/home.js', 'shared/site.js']) {
    assert.doesNotMatch(read(f), /allorigins|corsproxy|thingproxy/i, f);
  }
});

test('articles come from our own serverless endpoint with cache headers', () => {
  assert.match(read('foundation.jsx'), /fetch\('\/api\/articles'\)/);
  const api = read('api/articles.js');
  assert.match(api, /s-maxage=3600/);
  assert.match(api, /rss\.beehiiv\.com/);
});

test('RSS parser extracts items, decodes CDATA/entities and sorts newest first', () => {
  const { parseFeed } = require('../api/articles.js');
  const xml = `<rss><channel>
    <item><title><![CDATA[Viejo &amp; nuevo]]></title><link>https://x.test/a</link><description>d1</description><pubDate>Mon, 09 Nov 2026 10:00:00 GMT</pubDate><category>Blockchain</category></item>
    <item><title>IA hoy</title><link>https://x.test/b</link><description><![CDATA[<p>d2</p>]]></description><pubDate>Wed, 11 Nov 2026 10:00:00 GMT</pubDate><category>IA</category><enclosure url="https://i.test/t.jpg" type="image/jpeg"/></item>
    <item><title>bad link</title><link>javascript:alert(1)</link></item></channel></rss>`;
  const items = parseFeed(xml);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'IA hoy');
  assert.equal(items[0].thumbnail, 'https://i.test/t.jpg');
  assert.equal(items[0].excerpt, 'd2');
  assert.equal(items[1].title, 'Viejo & nuevo');
});

test('filter chip is spelled "IA", not "Ia"', () => {
  assert.match(read('i18n.js'), /filterIa: 'IA'/);
  assert.doesNotMatch(read('foundation.jsx'), />Ia</);
});

test('footer has the 7 official social links with aria-labels, rel=noopener and no language selector', () => {
  const js = read('shared/site.js');
  for (const n of ['X', 'Instagram', 'LinkedIn', 'YouTube', 'GitHub', 'Discord', 'WhatsApp']) {
    assert.match(js, new RegExp(`\\['[a-z]+', '${n}', `), n);
  }
  assert.match(js, /socialOn: 'Tellus on '/);
  assert.match(js, /rel="noopener"/);
  assert.match(js, /aria-hidden="true"/);
  const footer = js.slice(js.indexOf('function footerHtml'), js.indexOf('function ribbonHtml'));
  assert.doesNotMatch(footer, /langSelector|tl-lang/);
  assert.match(footer, /hola@telluscoop\.org/);
  assert.doesNotMatch(js, /hello@telluscoop/);
  assert.match(js, /youtube\.com\/@telluscoop'/);
  assert.doesNotMatch(js + read('foundation.jsx'), /@telluscooperative<|youtube\.com\/@telluscooperative/);
  for (let i = 1; i <= 7; i++) assert.ok(existsSync(new URL(`../shared/img/net/n${i}.svg`, import.meta.url)), `n${i}`);
  // icon URLs must not contain network names (blocked by uBlock/AdGuard social filters)
  assert.doesNotMatch(read('shared/site.js') + read('foundation.jsx'), /img\/social\/|\/(instagram|youtube|x)\.svg/);
});

test('city ribbon: real list for screen readers, aria-hidden loop copy, no pause button, reduced motion static', () => {
  const js = read('shared/site.js');
  const ribbon = js.slice(js.indexOf('function ribbonHtml'), js.indexOf('function ctaHtml'));
  assert.match(ribbon, /hidden \? ' aria-hidden="true"'/);
  assert.match(ribbon, /aria-label/);
  assert.doesNotMatch(ribbon, /<button|pause|pausa/i);
  const css = read('shared/site.css');
  assert.match(css, /\.tl-ribbon:hover \.tl-ribbon-track, \.tl-ribbon:focus-within/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*tl-ribbon-track \{ animation: none/);
});

test('hero uses the full LatAm map, never the cropped one, and no "pastillas" mascot', () => {
  assert.ok(existsSync(new URL('../shared/img/map-latam-full.svg', import.meta.url)));
  assert.match(read('foundation.jsx'), /map-latam-full\.svg/);
  assert.doesNotMatch(read('foundation.jsx'), /mapa latam\.svg|uploads\/[^'"]*\.jpg|pastilla|green.?pill/i);
});

test('stats ship final figures in the markup (no count-up, no zeros)', () => {
  const jsx = read('foundation.jsx');
  for (const n of ['4,548+', '12+', '209+', '100%']) assert.ok(jsx.includes(n), n);
  assert.doesNotMatch(jsx, /useCountUp|requestAnimationFrame/);
});

test('Instagram/X embeds are gone, replaced by six channel cards', () => {
  const jsx = read('foundation.jsx');
  assert.doesNotMatch(jsx + read('index.html'), /platform\.twitter\.com|instagram\.com\/embed|createTweet/);
  assert.equal((jsx.match(/icon: '[a-z]+', name:/g) || []).length, 6);
});

test('join modal is accessible and keeps the Beehiiv endpoint', () => {
  const js = read('shared/site.js');
  assert.match(js, /role="dialog" aria-modal="true" aria-labelledby="tl-modal-h"/);
  assert.match(js, /fetch\('\/api\/subscribe'/);
  assert.match(js, /aria-describedby="tl-email-err"/);
  assert.match(js, /aria-live="polite"/);
  assert.match(js, /e\.key === 'Escape'/);
});

test('token file defines the five section themes and no data-theme collision', () => {
  const css = read('shared/tokens.css');
  for (const t of ['claro', 'teal', 'naranjo', 'cielo', 'verde']) assert.match(css, new RegExp(`data-section-theme="${t}"`), t);
  assert.match(css, /--clay-500: #9E441F/);
  assert.doesNotMatch(css, /\[data-theme=/);
});

test('shell CSS never sets a font size under 14px', () => {
  for (const f of ['shared/site.css', 'foundation.css', 'shared/tokens.css']) {
    const small = [...read(f).matchAll(/font(?:-size)?:[^;{}]*?\b(\d{1,2})px\//g)].map((m) => +m[1]).filter((n) => n < 14);
    assert.deepEqual(small, [], f);
  }
});

test('hub and its OG image are untouched assets', () => {
  assert.ok(existsSync(new URL('../uploads/OPENGRAPH.jpg', import.meta.url)));
});

test('package.json has no plain "build" script (Vercel would run it and require a public/ output dir)', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.build, undefined);
});
