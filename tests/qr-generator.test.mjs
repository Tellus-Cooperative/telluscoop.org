import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html = read('tools/qr-generator/index.html');
const js = read('tools/qr-generator/qr.js');
const css = read('tools/qr-generator/qr.css');

test('vercel.json serves the standalone QR page', () => {
  const { rewrites } = JSON.parse(read('vercel.json'));
  const rule = rewrites.find((r) => r.source === '/tools/qr-generator');
  assert.equal(rule?.destination, '/tools/qr-generator/index.html');
});

test('QR page uses absolute assets and the pinned qr-code-styling build', () => {
  assert.match(html, /href="\/tools\/qr-generator\/qr\.css"/);
  assert.match(html, /src="\/tools\/qr-generator\/qr\.js"/);
  assert.match(html, /qr-code-styling@1\.9\.2\/lib\/qr-code-styling\.js/);
  assert.doesNotMatch(html, /(src|href)="(tools|policies|uploads)\//);
});

test('QR page title, noindex and share meta', () => {
  assert.match(html, /<title>Generador de códigos QR · Tellus Cooperative<\/title>/);
  assert.match(html, /<meta name="robots" content="noindex" \/>/);
  assert.match(html, /TODO\(§15 Q8\)/);
  assert.match(html, /property="og:image" content="https:\/\/telluscoop\.org\/og\/og-qr-generator\.png"/);
  assert.match(html, /property="og:url" content="https:\/\/telluscoop\.org\/tools\/qr-generator"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});

test('QR page stays simple: link, optional image, PNG and SVG only', () => {
  assert.match(html, /id="qr-url"/);
  assert.match(html, /id="qr-image" type="file"/);
  assert.deepEqual([...html.matchAll(/data-download="(\w+)"/g)].map((m) => m[1]), ['png', 'svg']);
  assert.doesNotMatch(html + js, /jpe?g\b.*download|supabase|\/ops\//i);
});

test('center image is limited to 2 MB and forces error correction H', () => {
  assert.match(js, /MAX_IMAGE_BYTES = 2 \* 1024 \* 1024/);
  assert.match(js, /errorCorrectionLevel: image \? 'H'/);
});

test('QR page uses the shared nav, footer and tokens, and loads only Fraunces and Inter', () => {
  assert.match(html, /href="\/shared\/tokens\.css"/);
  assert.match(html, /href="\/shared\/site\.css"/);
  assert.match(html, /data-tellus="nav" data-variant="main" data-lang="es"/);
  assert.match(html, /data-tellus="footer" data-lang="es"/);
  assert.match(html, /src="\/shared\/site\.js"/);
  assert.doesNotMatch(html + css, /policy\.css|pol-footer|pol-nav|theme\.(js|css)/);
  const fonts = [...html.matchAll(/family=([A-Za-z+]+)/g)].map((m) => m[1]);
  assert.deepEqual(fonts.sort(), ['Fraunces', 'Inter']);
});
