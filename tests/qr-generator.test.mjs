import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html = read('tools/qr-generator/index.html');
const js = read('tools/qr-generator/qr.js');

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

test('QR page shares the site footer and loads only Fraunces and Inter', () => {
  const footer = (s) => s.match(/<footer[\s\S]*<\/footer>/)[0];
  assert.equal(footer(html), footer(read('policies/code-of-conduct.html')));
  const fonts = [...html.matchAll(/family=([A-Za-z+]+)/g)].map((m) => m[1]);
  assert.deepEqual(fonts.sort(), ['Fraunces', 'Inter']);
});
