// Beehiiv RSS → JSON, fetched server-side (no public CORS proxies in the browser).
// GET /api/articles → { items: [{ title, excerpt, link, pubDate, category, thumbnail }] }
// Cached at the Vercel edge for 1 h, stale-while-revalidate for a day.
const https = require('https');

const RSS_URL = 'https://rss.beehiiv.com/feeds/NRVrKCDABF.xml';

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
  .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

function parseFeed(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const cats = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)].map((c) => decode(c[1])).filter(Boolean);
    const enc = block.match(/<enclosure[^>]*\surl="([^"]+)"/i);
    const link = tag(block, 'link');
    if (!/^https:\/\//.test(link)) continue;
    items.push({
      title: tag(block, 'title'),
      excerpt: tag(block, 'description'),
      link,
      pubDate: tag(block, 'pubDate'),
      category: cats[0] || '',
      thumbnail: enc && /^https:\/\//.test(enc[1]) ? enc[1] : '',
    });
  }
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return items;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'telluscoop.org' } }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return reject(new Error(`status ${r.statusCode}`)); }
      let d = '';
      r.setEncoding('utf8');
      r.on('data', (c) => { d += c; });
      r.on('end', () => resolve(d));
    }).on('error', reject).setTimeout(8000, function () { this.destroy(new Error('timeout')); });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const items = parseFeed(await fetchText(RSS_URL)).slice(0, 30);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ items });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'feed unavailable' });
  }
};
module.exports.parseFeed = parseFeed;
