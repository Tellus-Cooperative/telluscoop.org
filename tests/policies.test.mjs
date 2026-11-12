import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

const PAGES = {
  '/code-of-conduct': 'policies/code-of-conduct.html',
  '/programs/stellar-chile/ambassadors': 'policies/ambassadors.html',
};
const EN_PAGES = {
  '/en/code-of-conduct': 'policies/en/code-of-conduct.html',
  '/en/programs/stellar-chile/ambassadors': 'policies/en/ambassadors.html',
};
const ALL = { ...PAGES, ...EN_PAGES };
const langOf = (slug) => (slug.startsWith('/en/') ? 'en' : 'es');
const twin = (slug) => (langOf(slug) === 'en' ? slug.slice(3) : `/en${slug}`);

const OG = {
  '/code-of-conduct': 'og-codigo-conducta.png',
  '/en/code-of-conduct': 'og-codigo-conducta-en.png',
  '/programs/stellar-chile/ambassadors': 'og-embajadores.png',
  '/en/programs/stellar-chile/ambassadors': 'og-embajadores-en.png',
};

test('vercel.json rewrites every policy slug to its page', () => {
  const { rewrites } = JSON.parse(read('vercel.json'));
  for (const [source, file] of Object.entries(ALL)) {
    const rule = rewrites.find((r) => r.source === source);
    assert.ok(rule, `missing rewrite for ${source}`);
    assert.equal(rule.destination, `/${file}`);
  }
});

for (const [slug, file] of Object.entries(ALL)) {
  const lang = langOf(slug);

  test(`${file} uses the shared shell, template CSS and absolute paths`, () => {
    const html = read(file);
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.match(html, /href="\/shared\/tokens\.css"/);
    assert.match(html, /href="\/shared\/site\.css"/);
    assert.match(html, /href="\/policies\/policy\.css"/);
    assert.match(html, /src="\/shared\/site\.js"/);
    assert.match(html, /src="\/policies\/policy\.js"/);
    assert.match(html, new RegExp(`data-tellus="nav" data-variant="policy" data-lang="${lang}" data-alt-href="${twin(slug)}"`));
    assert.match(html, new RegExp(`data-tellus="footer" data-lang="${lang}"`));
    assert.match(html, /data-tellus="ribbon" data-section-theme="cielo"/);
    assert.match(html, /class="tl-skip"/);
    assert.doesNotMatch(html, /(src|href)="(uploads|policies|shared)\//);
    assert.doesNotMatch(html, /theme\.(js|css)|logo-dark|pol-nav|pol-footer/);
  });

  test(`${file} has one h1, numbered clauses, a version line and the report block`, () => {
    const html = read(file);
    assert.equal(html.match(/<h1[ >]/g).length, 1);
    assert.match(html, /<main id="main">/);
    const verLine = lang === 'es' ? 'Versión 1.0 · Última actualización: 1 de noviembre de 2026' : 'Version 1.0 · Last updated: November 1, 2026';
    assert.ok(html.includes(verLine), 'version line');
    assert.match(html, /data-section-theme="naranjo"/);
    assert.match(html, /alt="" width="176" height="177"/); // decorative magnifier-planet mascot
    assert.equal(html.match(/class="btn btn--primary"/g).length, 1, 'exactly one primary button in the page body');
    const ids = [...html.matchAll(/<li><a href="#([^"]+)">/g)].map((m) => m[1]);
    assert.ok(ids.length >= 9);
    for (const id of ids) assert.match(html, new RegExp(`<section id="${id}">`), `section ${id}`);
  });

  test(`${file} loads only Fraunces and Inter and has no PDF download`, () => {
    const html = read(file);
    const fonts = [...html.matchAll(/family=([A-Za-z+]+)/g)].map((m) => m[1]);
    assert.deepEqual(fonts.sort(), ['Fraunces', 'Inter']);
    assert.doesNotMatch(html, /\.pdf|\bdownload\b/i);
  });

  test(`${file} has complete share meta pointing at /og/${OG[slug]}`, () => {
    const html = read(file);
    const url = `https://telluscoop.org${slug}`;
    const img = `https://telluscoop.org/og/${OG[slug]}`;
    for (const needle of [
      `<link rel="canonical" href="${url}"`,
      `property="og:url" content="${url}"`,
      `property="og:image" content="${img}"`,
      `name="twitter:image" content="${img}"`,
      'property="og:site_name" content="Tellus Cooperative"',
      'property="og:type" content="website"',
      'property="og:image:width" content="1200"',
      'property="og:image:height" content="630"',
      'name="twitter:card" content="summary_large_image"',
      'name="twitter:site" content="@TellusCoop"',
      'property="og:image:alt"',
      'property="og:locale"',
      'property="og:locale:alternate"',
    ]) assert.ok(html.includes(needle), `${file}: ${needle}`);
    assert.doesNotMatch(html, /policies\/assets\/og-/);
  });

  test(`${file} declares hreflang for both languages`, () => {
    const html = read(file);
    const es = langOf(slug) === 'es' ? slug : twin(slug);
    const en = langOf(slug) === 'en' ? slug : twin(slug);
    assert.ok(html.includes(`hreflang="es" href="https://telluscoop.org${es}"`));
    assert.ok(html.includes(`hreflang="en" href="https://telluscoop.org${en}"`));
  });
}

test('the OG images for the policy pages exist at 1200x630 and under 300 KB', () => {
  for (const img of Object.values(OG)) {
    const buf = readFileSync(new URL(`../og/${img}`, import.meta.url));
    assert.equal(buf.readUInt32BE(16), 1200, img);
    assert.equal(buf.readUInt32BE(20), 630, img);
    assert.ok(buf.length < 300 * 1024, `${img} is ${buf.length} bytes`);
  }
});

test('code of conduct §03 ends with the no smoking/vaping rule (ES + EN)', () => {
  const es = read(PAGES['/code-of-conduct']);
  const en = read(EN_PAGES['/en/code-of-conduct']);
  const list = (html) => html.match(/<section id="not-allowed">[\s\S]*?<\/section>/)[0];
  assert.match(list(es), /<li>Fumar o vapear dentro del establecimiento donde se realice una actividad de Tellus\.<\/li>\s*<\/ul>/);
  assert.match(list(en), /<li>Smoking or vaping inside the venue where a Tellus activity takes place\.<\/li>\s*<\/ul>/);
  assert.match(list(en), /TODO\(§15 Q5\)/);
  assert.match(list(es), /TODO\(§15 Q5\)/);
});

test('code of conduct links the #reportes Discord channel in the notice, clause 07, and the report block', () => {
  for (const file of [PAGES['/code-of-conduct'], EN_PAGES['/en/code-of-conduct']]) {
    const html = read(file);
    assert.doesNotMatch(html, /\[PUBLICAR/);
    assert.ok(html.match(/href="https:\/\/discord.gg\/qPQJkvUfsS"[^>]*>#reportes</g).length >= 3, file);
    assert.match(html, /<a class="btn btn--primary" href="https:\/\/discord\.gg\/qPQJkvUfsS"[^>]*>(Ir a|Go to) #reportes<\/a>/);
  }
});

test('every Stellar Passport mention on the ambassador pages links to Passport', () => {
  for (const file of [PAGES['/programs/stellar-chile/ambassadors'], EN_PAGES['/en/programs/stellar-chile/ambassadors']]) {
    const main = read(file).match(/<main[\s\S]*<\/main>/)[0];
    const mentions = main.match(/Stellar Passport/g).length;
    const links = main.match(/<a href="https:\/\/demo\.stellarpassport\.xyz\/"[^>]*>Stellar Passport<\/a>/g)?.length;
    assert.equal(links, mentions, file);
  }
});

test('policy CSS never uses clay or legacy teal as a text colour and has no old nav/footer rules', () => {
  const css = read('policies/policy.css');
  assert.doesNotMatch(css, /var\(--clay\)/);
  assert.doesNotMatch(css, /#3F8487/i);
  assert.doesNotMatch(css, /pol-footer|pol-nav|pol-planet|theme-toggle/);
});

test('Instagram points to telluscooperative everywhere', () => {
  for (const f of ['foundation.jsx', 'llms.txt', 'resources/index.html', 'resources/tool.html', 'shared/site.js']) {
    assert.doesNotMatch(read(f), /instagram\.com\/telluscoop\//, f);
  }
});

test('pages link to each other by slug in their own language', () => {
  assert.match(read(PAGES['/code-of-conduct']), /href="\/programs\/stellar-chile\/ambassadors"/);
  assert.match(read(PAGES['/programs/stellar-chile/ambassadors']), /href="\/code-of-conduct"/);
  assert.match(read(EN_PAGES['/en/code-of-conduct']), /href="\/en\/programs\/stellar-chile\/ambassadors"/);
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
