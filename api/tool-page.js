// Serves /resources/tools/<slug> with per-slug <title>, description, canonical, og:url and og:image
// injected server-side (crawlers do not run JS). Source template: resources/tool.html, between the
// <!--TOOL_META--> markers. Route (vercel.json): /resources/tools/:slug → /api/tool-page?slug=:slug
// Unknown slugs get the generic tags and a real HTTP 404 (the page itself renders a "not found" state).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://telluscoop.org';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let cache;
function load() {
  if (!cache) {
    cache = {
      html: fs.readFileSync(path.join(ROOT, 'resources', 'tool.html'), 'utf8'),
      data: JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'tools.json'), 'utf8'))
    };
  }
  return cache;
}

function metaBlock(tool, category) {
  const name = tool.name;
  const title = `${name} · Tellus Resources`;
  const desc = tool.description_en;
  const url = `${SITE}/resources/tools/${tool.slug}`;
  const img = `${SITE}/og/tools/${tool.slug}.png`;
  const alt = `${name}: free plan profile in Tellus Resources (${category})`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Tellus Cooperative" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:locale:alternate" content="es_LA" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@TellusCoop" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<meta name="twitter:image:alt" content="${esc(alt)}" />`
  ].join('\n  ');
}

function render(slug) {
  const { html, data } = load();
  const tool = data.tools.find((t) => t.slug === slug);
  if (!tool) return { status: 404, body: html.replace(/(<meta name="robots" content=")index, follow/, '$1noindex') };
  const cat = data.categories.find((c) => c.id === tool.category);
  const block = metaBlock(tool, cat ? cat.label_en : tool.category);
  return { status: 200, body: html.replace(/<!--TOOL_META-->[\s\S]*?<!--\/TOOL_META-->/, () => block) };
}

module.exports = function handler(req, res) {
  try {
    const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
    const slug = String(q.slug || '').toLowerCase();
    const out = /^[a-z0-9-]+$/.test(slug) ? render(slug) : render('');
    res.statusCode = out.status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', out.status === 200 ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' : 'public, max-age=0, s-maxage=60');
    res.end(out.body);
  } catch (e) {
    console.error('[tool-page]', e);
    res.statusCode = 500; res.setHeader('Content-Type', 'text/plain'); res.end('Error');
  }
};
module.exports.render = render;
