// Per-tool Open Graph image for /resources/tools/<slug>  →  /og/tools/<slug>.png
// Template: Figma "OG / Plantilla herramienta (Resources)" 86:1027 (1200×630, Teal theme).
// Rendered on the server with Satori (SVG) + resvg (PNG). Fonts: Fraunces 400, Inter 500/600 (api/_fonts).
// Route (vercel.json): /og/tools/:slug.png → /api/og-tool?slug=:slug   (optional &lang=es)
const fs = require('fs');
const path = require('path');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p));

let fonts, logoUri, catalog;
function assets() {
  if (!fonts) {
    fonts = [
      { name: 'Fraunces', data: read('api', '_fonts', 'fraunces-latin-400-normal.woff'), weight: 400, style: 'normal' },
      { name: 'Inter', data: read('api', '_fonts', 'inter-latin-500-normal.woff'), weight: 500, style: 'normal' },
      { name: 'Inter', data: read('api', '_fonts', 'inter-latin-600-normal.woff'), weight: 600, style: 'normal' }
    ];
    logoUri = 'data:image/svg+xml;base64,' + read('shared', 'img', 'tellus-white.svg').toString('base64');
    catalog = JSON.parse(read('resources', 'tools.json').toString('utf8'));
  }
  return { fonts, logoUri, catalog };
}

async function faviconDataUri(url) {
  try {
    const host = new URL(url).hostname;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 3000);
    const r = await fetch('https://www.google.com/s2/favicons?sz=128&domain=' + encodeURIComponent(host), { signal: ctl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const type = (r.headers.get('content-type') || 'image/png').split(';')[0];
    if (!/^image\/(png|jpeg|gif)$/.test(type)) return null;
    return 'data:' + type + ';base64,' + Buffer.from(await r.arrayBuffer()).toString('base64');
  } catch (e) { return null; }
}

const h = (type, style, children, props) => ({ type, props: Object.assign({ style, children }, props || {}) });

function tree({ tool, categoryLabel, description, logo, lang, logoUri }) {
  const T = { en: { eyebrow: 'Tellus Resources', free: 'Free plan' }, es: { eyebrow: 'Tellus Resources', free: 'Plan gratis' } }[lang];
  const url = 'telluscoop.org/resources/tools/' + tool.slug;
  const logoBox = logo
    ? h('img', { width: 168, height: 168, objectFit: 'contain' }, undefined, { src: logo, width: 168, height: 168 })
    : h('div', { fontFamily: 'Fraunces', fontSize: 88, color: '#1F3536' }, (tool.name || '?').charAt(0).toUpperCase());
  return h('div', { boxSizing: 'border-box', width: 1200, height: 630, display: 'flex', background: '#1F3536', padding: 72, gap: 48, fontFamily: 'Inter' }, [
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, alignSelf: 'stretch', minWidth: 0 }, [
      h('img', { width: 170, height: 78 }, undefined, { src: logoUri, width: 170, height: 78 }),
      h('div', { display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }, [
        h('div', { fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: '#ECE0CC', letterSpacing: 2.4, textTransform: 'uppercase' }, T.eyebrow + ' · ' + categoryLabel),
        h('div', { fontFamily: 'Fraunces', fontSize: 104, lineHeight: 0.92, letterSpacing: -3.12, color: '#FBF7F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, tool.name),
        h('div', { fontSize: 27, fontWeight: 500, lineHeight: 1.35, color: '#ECE0CC', lineClamp: 2 }, description)
      ]),
      h('div', { fontSize: 21, fontWeight: 600, lineHeight: 1.2, color: '#FBF7F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, url)
    ]),
    h('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, boxSizing: 'border-box', flexShrink: 0, alignSelf: 'center', width: 400, height: 440, padding: 40, borderRadius: 32, background: '#2D4849' }, [
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 168, height: 168, borderRadius: 32, background: '#FFFFFF', overflow: 'hidden' }, [logoBox]),
      h('div', { display: 'flex', padding: '10px 20px', borderRadius: 999, background: '#EBA57C', color: '#1F3536', fontSize: 20, fontWeight: 600, lineHeight: 1.2 }, T.free),
      h('div', { fontSize: 20, fontWeight: 600, lineHeight: 1.2, color: '#ECE0CC', whiteSpace: 'nowrap' }, categoryLabel)
    ])
  ]);
}

async function renderToolOg(slug, lang, opts) {
  const { fonts: f, logoUri: lu, catalog: c } = assets();
  const tool = c.tools.find((t) => t.slug === slug);
  if (!tool) return null;
  lang = lang === 'es' ? 'es' : 'en';
  const cat = c.categories.find((x) => x.id === tool.category) || {};
  const logo = opts && opts.noFavicon ? null : await faviconDataUri(tool.url);
  const svg = await satori(tree({
    tool, lang, logo, logoUri: lu,
    categoryLabel: (lang === 'es' ? cat.label_es : cat.label_en) || tool.category,
    description: lang === 'es' ? tool.description_es : tool.description_en
  }), { width: 1200, height: 630, fonts: f });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

module.exports = async function handler(req, res) {
  try {
    const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
    const slug = String(q.slug || '').replace(/\.png$/i, '');
    const png = /^[a-z0-9-]+$/i.test(slug) ? await renderToolOg(slug, q.lang) : null;
    if (!png) { res.statusCode = 404; res.setHeader('Content-Type', 'text/plain'); return res.end('Not found'); }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    res.end(Buffer.from(png));
  } catch (e) {
    console.error('[og-tool]', e);
    res.statusCode = 500; res.setHeader('Content-Type', 'text/plain'); res.end('Error');
  }
};
module.exports.renderToolOg = renderToolOg;
