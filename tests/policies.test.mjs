import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const PAGES = {
  '/code-of-conduct': 'policies/code-of-conduct.html',
  '/programs/stellar-chile/ambassadors': 'policies/ambassadors.html',
};

test('vercel.json rewrites English slugs to policy pages', () => {
  const { rewrites } = JSON.parse(read('vercel.json'));
  for (const [source, file] of Object.entries(PAGES)) {
    const rule = rewrites.find((r) => r.source === source);
    assert.ok(rule, `missing rewrite for ${source}`);
    assert.equal(rule.destination, `/${file}`);
  }
});

for (const file of Object.values(PAGES)) {
  test(`${file} is a Spanish policy page with absolute asset paths`, () => {
    const html = read(file);
    assert.match(html, /<html lang="es">/);
    assert.match(html, /href="\/policies\/policy\.css"/);
    assert.match(html, /src="\/policies\/policy\.js"/);
    // Relative asset paths break under the nested rewrite URL
    assert.doesNotMatch(html, /(src|href)="(uploads|policies)\//);
    assert.match(html, /class="pol-chip">v1\.0</);
  });

  test(`${file} keeps the full text on the page with no PDF download`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /\.pdf|\bdownload\b/i);
  });

  test(`${file} loads only Fraunces and Inter`, () => {
    const html = read(file);
    const fonts = [...html.matchAll(/family=([A-Za-z+]+)/g)].map((m) => m[1]);
    assert.deepEqual(fonts.sort(), ['Fraunces', 'Inter']);
  });

  test(`${file} shows no draft or effective-date status`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /borrador|no está vigente|pol-draft|<time/i);
  });

  test(`${file} has the shared footer with working links`, () => {
    const html = read(file);
    for (const href of [
      'https://telluscoop.org/brand',
      'https://discord.gg/Fy2SgR3XRu',
      'https://x.com/TellusCoop',
      'https://blog.telluscoop.com/',
      'mailto:hola@telluscoop.org',
      'https://telluscoop.org/hub',
      'https://www.instagram.com/telluscooperative/',
      'https://www.linkedin.com/company/tellus-cooperative/',
      'https://github.com/Tellus-Cooperative/',
      'https://chat.whatsapp.com/FsNIUPsmNCl2YJkQi5r4p4',
    ]) assert.ok(html.includes(`href="${href}"`), `missing ${href}`);
  });
}

test('each page has its own 1200x630 share image', () => {
  const images = {
    '/code-of-conduct': 'og-code-of-conduct.png',
    '/programs/stellar-chile/ambassadors': 'og-ambassadors.png',
  };
  for (const [slug, img] of Object.entries(images)) {
    const html = read(PAGES[slug]);
    const url = `https://telluscoop.org/policies/assets/${img}`;
    assert.ok(html.includes(`property="og:image" content="${url}"`), `${slug} og:image`);
    assert.ok(html.includes(`name="twitter:image" content="${url}"`), `${slug} twitter:image`);
    assert.ok(html.includes(`property="og:url" content="https://telluscoop.org${slug}"`), `${slug} og:url`);
    const png = readFileSync(new URL(`../policies/assets/${img}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
});

test('both pages share an identical footer', () => {
  const footer = (f) => read(f).match(/<footer[\s\S]*<\/footer>/)[0];
  assert.equal(footer(PAGES['/code-of-conduct']), footer(PAGES['/programs/stellar-chile/ambassadors']));
});

test('policy CSS never uses clay or legacy teal as a text color', () => {
  const css = read('policies/policy.css');
  assert.doesNotMatch(css, /(^|[^-])color:\s*var\(--clay\)/m);
  assert.doesNotMatch(css, /#3F8487/i);
});

test('code of conduct keeps the report-channel placeholder until a real URL exists', () => {
  assert.match(read(PAGES['/code-of-conduct']), /\[PUBLICAR ENLACE AL CANAL DE REPORTE\]/);
});

test('Instagram points to telluscooperative everywhere', () => {
  for (const f of ['foundation.jsx', 'llms.txt', 'resources/index.html', 'resources/tool.html', 'policies/code-of-conduct.html']) {
    assert.doesNotMatch(read(f), /instagram\.com\/telluscoop\//, f);
  }
});

test('pages link to each other by English slug', () => {
  assert.match(read(PAGES['/code-of-conduct']), /href="\/programs\/stellar-chile\/ambassadors"/);
  assert.match(read(PAGES['/programs/stellar-chile/ambassadors']), /href="\/code-of-conduct"/);
});

test('ambassadors page shows the no-funding notice and no proposal CTA', () => {
  const html = read(PAGES['/programs/stellar-chile/ambassadors']);
  assert.match(html, /no implica financiamiento ni autorización para organizar actividades oficiales/);
  assert.doesNotMatch(html, /Enviar propuesta|Solicitar evento/i);
});

test('internal-only documents are not shipped', () => {
  for (const f of ['protocolo-interno', 'modelo-acuerdo', 'guia-publicacion']) {
    assert.ok(!existsSync(new URL(`../policies/${f}.html`, import.meta.url)));
  }
});
