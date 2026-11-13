// Tellus Home (/) — sections 01–08 of the Figma redesign (frames 8:1300 / 9:2928).
// Nav, city ribbon, final CTA, footer and the Join modal are the shared shell from /shared/site.js;
// this app renders the placeholders and the shell fills them. Compiled by `npm run build` (esbuild)
// into dist/home.js — there is no in-browser Babel any more.
const { useState, useEffect, useRef } = React;

const URL_YT_PLAYLISTS = 'https://www.youtube.com/@telluscoop/playlists';
const BEEHIIV = 'https://telluscoop.beehiiv.com';

// Static fallback shown instantly (and if /api/articles is down): the six articles of the Figma frame.
const FALLBACK_ARTICLES = [
  { kind: 'Blockchain', date: '11 nov 2026', title: 'Soroban en práctica: entiende y despliega un smart contract, sin saber programar', excerpt: 'Stellar Academy invita a una sesión online el jueves 12 de noviembre, de 12:30 a 13:30 (hora de Chile), en el Discord de Tellus Cooperative, junto a iDEA UFRO y la Universidad de La Frontera.' },
  { kind: 'Stellar', date: '11 nov 2026', title: 'Stellar en español: WalletConnect Pay llega a LOBSTR y Bell se prepara para mainnet', excerpt: 'LOBSTR es la primera wallet con WalletConnect Pay en Stellar (pagas en USDC sin XLM de fee) y los validadores votan Protocol 30 (Bell) el 23 de noviembre.' },
  { kind: 'Blockchain', date: '10 nov 2026', title: 'De la mecánica a Byetery: Cristian Medina en Stellar Academy', excerpt: 'Estudiaba Ingeniería Civil Industrial mención Mecánica en la Universidad de La Frontera y ya conocía blockchain, pero no sabía cómo aplicarla a su vida. En Stellar Academy salió de su zona de confort y construyó un proyecto de trazabilidad de baterías.' },
  { kind: 'Blockchain', date: '10 nov 2026', title: '«Yo te digo que te atrevas»: Carla Seguel y Stellar Academy', excerpt: 'Llegó al programa sin interés en blockchain. Hoy estudia Ingeniería Civil Industrial en la Universidad de La Frontera y desarrolla un proyecto que antes no se creía capaz de lograr.' },
  { kind: 'IA', date: '10 nov 2026', title: 'IA esta semana: Gemini Omni 1.2 Flash, Images 2.6 y OpenAI compra Pierre', excerpt: 'Google bajó el precio del video con Omni 1.2 Flash, OpenAI lanzó Images 2.6 y anunció la compra de Pierre, y Mistral abrió Managed Agents en Studio.' },
  { kind: 'Blockchain', date: '09 nov 2026', title: 'De cero a cien en blockchain: Diego Poveda y Local402', excerpt: 'Llegó a Stellar Academy sin saber de blockchain. Hoy construye pagos en tu moneda para personas y agentes de IA sobre Stellar.' },
].map((a, i) => ({ ...a, id: i, link: BEEHIIV, thumb: `/shared/img/articles/a${i + 1}.webp`, tag: tagFor(a.kind) }));

function tagFor(cat = '') {
  if (/\bia\b|inteligencia|gpt|gemini|claude|llm/i.test(cat)) return 'ia';
  if (/blockchain|stellar|crypto|defi|bitcoin|web3/i.test(cat)) return 'blockchain';
  return 'newsletter';
}

const PROGRAM_MASCOTS = ['bloques', 'astronauta', 'lupa'];

const PLAYLISTS = [
  { title: 'Hola Stellar · Aprende Stellar desde cero', list: 'PLLgyZ3kOWK4O-Lp1oRBUWGGbuW9ksLQc-', vid: 'RfRx7C5twi0', url: 'https://www.youtube.com/watch?v=RfRx7C5twi0&list=PLLgyZ3kOWK4O-Lp1oRBUWGGbuW9ksLQc-&index=3' },
  { title: 'Guía Completa de Stellar Quest', list: 'PLLgyZ3kOWK4OfidwhewcUJOsr2WG3j0nv', vid: '-rSLo0rioaM' },
  { title: 'Talleres', list: 'PLLgyZ3kOWK4MJeY7lqpYJ91K5kYSTqj5z', vid: 'X2md53SSNOA' },
  { title: 'Charlas Educativas', list: 'PLLgyZ3kOWK4MZk7iDpfQfwDLNtD5VPeX8', vid: 'hLtreVEM1yo' },
  { title: 'Charlas Stellares', list: 'PLLgyZ3kOWK4MkXrQni_xlO9B9Wi9sRoSx', vid: 'poGbTGRE0Nw' },
  { title: 'Introducción a Tellus Cooperative', list: 'PLLgyZ3kOWK4PZ33fsUOJa6PtLI8Rv0Itw', vid: '3erjjWHErAo' },
  { title: 'InstaWards', list: 'PLLgyZ3kOWK4Og0k1cTBJHCNc975drI5ru', vid: 'H9N3xA8eRII', url: 'https://www.youtube.com/watch?v=H9N3xA8eRII&list=PLLgyZ3kOWK4Og0k1cTBJHCNc975drI5ru&index=3' },
];

const Arrow = () => <span aria-hidden="true">→</span>;

const SectionHead = ({ eyebrow, title, sub, id, children }) => (
  <div className="hm-head">
    <div className="hm-head-text">
      <p className="t-eyebrow hm-eyebrow">{eyebrow}</p>
      <h2 className="t-h2" id={id}>{title}</h2>
      {sub && <p className="t-body-l hm-sub">{sub}</p>}
    </div>
    {children}
  </div>
);

const useMedia = (q) => {
  const [m, setM] = useState(() => (window.matchMedia ? window.matchMedia(q).matches : false));
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
};

// Placeholders that /shared/site.js fills (ribbon, final CTA, footer).
const ShellSlot = ({ kind, theme }) => {
  const ref = useRef(null);
  useEffect(() => { if (window.TellusShell && ref.current) window.TellusShell.mount(ref.current.parentNode); }, []);
  return <div ref={ref} data-tellus={kind} data-lang="auto" data-section-theme={theme} />;
};

// Neutral file names: ad/tracker blockers (e.g. uBlock social lists) block icon URLs named after social networks
const ICON_FILE = { x: 'n1', instagram: 'n2', linkedin: 'n3', youtube: 'n4', github: 'n5', discord: 'n6', whatsapp: 'n7' };
const channelIcon = (name) => { const u = `url(/shared/img/net/${ICON_FILE[name]}.svg)`; return <span className="hm-chan-ico" aria-hidden="true"><span style={{ WebkitMaskImage: u, maskImage: u }} /></span>; };

const FoundationSystem = () => {
  const { lang, t } = window.useLang();
  const isMobile = useMedia('(max-width: 767px)');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [articlesAll, setArticlesAll] = useState(FALLBACK_ARTICLES);
  const mounted = useRef(false);

  // Articles come from our own endpoint (server-side RSS fetch) — no public CORS proxies.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/articles')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('articles'))))
      .then(({ items }) => {
        if (cancelled || !Array.isArray(items) || !items.length) return;
        setArticlesAll(items.map((a, i) => ({
          id: i, kind: a.category || 'Newsletter', tag: tagFor(a.category), title: a.title, excerpt: a.excerpt,
          link: a.link, thumb: a.thumbnail || '', pubTs: Date.parse(a.pubDate) || null,
        })));
      })
      .catch(() => {}); // keep the static fallback
    return () => { cancelled = true; };
  }, []);

  // Language/page title helpers for the shell are handled by site.js; keep <html lang> in sync (useLang does it).
  useEffect(() => { mounted.current = true; }, []);

  const AMBASSADORS_URL = lang === 'es' ? '/programs/stellar-chile/ambassadors' : '/en/programs/stellar-chile/ambassadors';
  // TODO(spec §15 Q7): the three "Learn more" links need confirmed destinations; these are the ones the site already used.
  const programs = [
    { code: '01', title: t('prog1Title'), body: t('prog1Body'), stat: '4,548+', statLabel: t('prog1StatLabel'), href: URL_YT_PLAYLISTS, external: true },
    { code: '02', title: t('prog2Title'), body: t('prog2Body'), stat: '209+', statLabel: t('prog2StatLabel'), href: AMBASSADORS_URL },
    { code: '03', title: t('prog3Title'), body: t('prog3Body'), stat: '191+', statLabel: t('prog3StatLabel'), href: '/resources' },
  ];

  const FILTERS = [['all', t('filterAll')], ['blockchain', t('filterBlockchain')], ['ia', t('filterIa')], ['newsletter', t('filterNewsletter')]];
  const filtered = tab === 'all' ? articlesAll : articlesAll.filter((a) => a.tag === tab);
  const perPage = isMobile ? 3 : 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, totalPages);
  const pageArticles = filtered.slice((cur - 1) * perPage, cur * perPage);
  const locale = { en: 'en-US', es: 'es-CL', pt: 'pt-BR' }[lang] || 'en-US';
  const fmt = (a) => (a.pubTs ? new Date(a.pubTs).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : a.date);
  const goPage = (p) => { setPage(p); const el = document.getElementById('articles'); if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  const pageNums = (() => {
    const w = 4; let s = Math.max(1, cur - 1); const e = Math.min(totalPages, s + w - 1); s = Math.max(1, e - w + 1);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  })();

  const partners = [
    { name: 'Stellar Foundation', kind: 'img', src: '/shared/img/partners/stellar-foundation.webp', w: 128, h: 32 },
    { name: 'Filecoin', kind: 'img', src: '/shared/img/partners/filecoin.svg', w: 32, h: 32, label: true },
    { name: 'Ethereum', kind: 'img', src: '/shared/img/partners/ethereum.svg', w: 20, h: 32, label: true },
    { name: 'Avalanche', kind: 'img', src: '/shared/img/partners/avalanche.svg', w: 32, h: 32, label: true },
    { name: 'PizzaDAO', kind: 'mask', src: '/shared/img/partners/pizzadao-mask.svg', w: 150, h: 24 },
    { name: 'iDEA UFRO', kind: 'mask', src: '/shared/img/partners/idea-ufro-mask.png', w: 71, h: 32 },
  ];

  const channels = [
    { icon: 'x', name: 'X', desc: '@TellusCoop', href: 'https://x.com/TellusCoop' },
    { icon: 'instagram', name: 'Instagram', desc: '@telluscooperative', href: 'https://www.instagram.com/telluscooperative/' },
    { icon: 'youtube', name: 'YouTube', desc: '@telluscoop', href: 'https://www.youtube.com/@telluscoop' },
    { icon: 'linkedin', name: 'LinkedIn', desc: 'tellus-cooperative', href: 'https://www.linkedin.com/company/tellus-cooperative/' },
    { icon: 'whatsapp', name: 'WhatsApp', desc: t('wallWa').replace('WhatsApp · ', ''), href: 'https://chat.whatsapp.com/FsNIUPsmNCl2YJkQi5r4p4' },
    // TODO(spec §15 Q4): confirm the Discord invite does not expire.
    { icon: 'discord', name: 'Discord', desc: t('wallSrv'), href: 'https://discord.gg/Fy2SgR3XRu' },
  ];

  return (
    <>
      {/* 01 HERO — beige (Claro) with the full LatAm map (Figma 97:8079) */}
      <section className="hm-hero" data-section-theme="claro" aria-labelledby="hero-h">
        <div className="hm-hero-in">
          <div className="hm-hero-text">
            <p className="t-eyebrow hm-eyebrow">{t('heroEyebrow')}</p>
            <h1 className="t-display" id="hero-h">{t('heroLine1')} <em>{t('heroLine2')}</em></h1>
            <p className="t-body-l hm-lede">{t('heroLede')}</p>
            <div className="hm-actions">
              <button type="button" className="btn btn--primary" data-join>{t('heroCta')}</button>
              <a className="btn btn--link" href="#programs">{t('heroSeePrograms')} <Arrow /></a>
            </div>
          </div>
          <div className="hm-hero-map">
            <img src="/shared/img/map-latam-full.svg" alt="" width="538" height="620" fetchPriority="high" />
          </div>
        </div>
      </section>

      <ShellSlot kind="ribbon" theme="naranjo" />

      {/* 02 DATOS — final figures live in the HTML (no count-up, never zeros) */}
      <section className="hm-stats" aria-label={t('statSubscribers')}>
        <ul className="hm-stats-in">
          {[['4,548+', t('statSubscribers')], ['12+', t('statCountries')], ['209+', t('statProjects')], ['100%', t('statOpen')]].map(([n, l]) => (
            <li key={l}><p className="t-stat">{n}</p><p className="t-meta">{l}</p></li>
          ))}
        </ul>
      </section>

      {/* 03 MISIÓN */}
      <section className="hm-mission" id="about" data-section-theme="claro" aria-label={t('missionEyebrow')}>
        <div className="hm-mission-in">
          <p className="t-eyebrow">{t('missionEyebrow')}</p>
          <p className="t-lead" dangerouslySetInnerHTML={{ __html: t('missionText') }} />
        </div>
      </section>

      {/* 04 ALIADOS — static grid */}
      <section className="hm-partners" id="partners" aria-labelledby="partners-h">
        <div className="hm-wrap">
          <SectionHead eyebrow={t('partnersEyebrow')} title={t('partnersH2')} id="partners-h" />
          <ul className="hm-partners-grid">
            {partners.map((p) => (
              <li key={p.name} className="hm-partner">
                {p.kind === 'img'
                  ? <img src={p.src} alt={p.label ? '' : p.name} width={p.w} height={p.h} loading="lazy" />
                  : <span className="hm-partner-mask" {...(p.label ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': p.name })} style={{ width: p.w, height: p.h, WebkitMaskImage: `url(${p.src})`, maskImage: `url(${p.src})` }} />}
                {p.label && <span className="t-meta hm-partner-name">{p.name}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 PROGRAMAS — Teal */}
      <section className="hm-programs" id="programs" data-section-theme="teal" aria-labelledby="programs-h">
        <div className="hm-wrap">
          <SectionHead eyebrow={t('programsEyebrow')} title={t('programsH2')} sub={t('programsSub')} id="programs-h" />
          <ul className="hm-programs-grid">
            {programs.map((p, i) => (
              <li key={p.code} className="hm-card hm-program">
                <div className="hm-program-media">
                  <img src={`/shared/img/mascots/${PROGRAM_MASCOTS[i]}.webp`} srcSet={`/shared/img/mascots/${PROGRAM_MASCOTS[i]}.webp 1x, /shared/img/mascots/${PROGRAM_MASCOTS[i]}@2x.webp 2x`} alt="" width="214" height={i === 1 ? 178 : i === 0 ? 229 : 218} loading="lazy" />
                </div>
                <div className="hm-program-body">
                  <p className="t-eyebrow hm-eyebrow">{p.code}</p>
                  <h3 className="t-h3">{p.title}</h3>
                  <p className="t-body-m hm-muted">{p.body}</p>
                  <hr className="hm-rule" />
                  <p className="hm-datum"><span className="t-h4">{p.stat}</span><span className="t-meta">{p.statLabel}</span></p>
                  <a className="btn btn--link hm-stretch" href={p.href} {...(p.external ? { target: '_blank', rel: 'noopener' } : {})}>{t('progLearnMore')} <Arrow /></a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 ARTÍCULOS */}
      <section className="hm-articles" id="articles" aria-labelledby="articles-h">
        <div className="hm-wrap">
          <SectionHead eyebrow={t('articlesEyebrow')} title={t('articlesH2')} id="articles-h">
            <img className="hm-head-mascot" src="/shared/img/mascots/cyborg.webp" srcSet="/shared/img/mascots/cyborg.webp 1x, /shared/img/mascots/cyborg@2x.webp 2x" alt="" width="112" height="143" loading="lazy" />
          </SectionHead>
          <div className="hm-chips" role="group" aria-label={t('filtersLabel')}>
            {FILTERS.map(([k, label]) => (
              <button key={k} type="button" className="hm-chip" aria-pressed={tab === k} onClick={() => { setTab(k); setPage(1); }}>{label}</button>
            ))}
          </div>
          <ul className="hm-articles-grid">
            {pageArticles.map((a) => (
              <li key={a.id}>
                <a className="hm-card hm-article" href={a.link || BEEHIIV} target="_blank" rel="noopener">
                  <span className="hm-article-thumb">
                    {a.thumb && <img src={a.thumb} alt="" width="410" height="200" loading="lazy" />}
                  </span>
                  <span className="hm-article-meta t-meta"><span className="t-eyebrow hm-tag">{a.kind}</span><span aria-hidden="true">·</span><time dateTime={a.pubTs ? new Date(a.pubTs).toISOString() : undefined}>{fmt(a)}</time></span>
                  <h3 className="t-h4 hm-article-title">{a.title}</h3>
                  {a.excerpt && <p className="t-body-s hm-muted hm-clamp">{a.excerpt}</p>}
                </a>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav className="hm-pager" aria-label={t('articlesNav')}>
              <button type="button" className="hm-page" aria-label={t('prevPage')} disabled={cur === 1} onClick={() => goPage(cur - 1)}>←</button>
              {pageNums.map((n) => (
                <button key={n} type="button" className="hm-page" aria-label={`${t('pageN')} ${n}`} aria-current={n === cur ? 'page' : undefined} onClick={() => goPage(n)}>{n}</button>
              ))}
              <button type="button" className="hm-page" aria-label={t('nextPage')} disabled={cur === totalPages} onClick={() => goPage(cur + 1)}>→</button>
            </nav>
          )}
        </div>
      </section>

      {/* 07 CURSOS — Cielo */}
      <section className="hm-courses" id="courses" data-section-theme="cielo" aria-labelledby="courses-h">
        <div className="hm-wrap">
          <SectionHead eyebrow={t('coursesEyebrow')} title={t('coursesH2')} id="courses-h">
            <img className="hm-head-mascot hm-head-mascot--profe" src="/shared/img/mascots/profesor.webp" srcSet="/shared/img/mascots/profesor.webp 1x, /shared/img/mascots/profesor@2x.webp 2x" alt="" width="140" height="118" loading="lazy" />
            <a className="btn btn--link hm-view-all" href={URL_YT_PLAYLISTS} target="_blank" rel="noopener">{t('coursesViewAll')}</a>
          </SectionHead>
          <div className="hm-courses-grid">
            <a className="hm-card hm-course hm-course--feat" href={PLAYLISTS[0].url || `https://www.youtube.com/playlist?list=${PLAYLISTS[0].list}`} target="_blank" rel="noopener">
              <span className="hm-course-thumb"><img src={`https://i.ytimg.com/vi/${PLAYLISTS[0].vid}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" /></span>
              <span className="t-eyebrow hm-tag">{t('playlist')}</span>
              <h3 className="t-h3">{PLAYLISTS[0].title}</h3>
              <span className="t-link hm-course-cta">{t('viewPlaylist')} <Arrow /></span>
            </a>
            <ul className="hm-courses-list">
              {PLAYLISTS.slice(1).map((p) => (
                <li key={p.list}>
                  <a className="hm-card hm-course hm-course--row" href={p.url || `https://www.youtube.com/playlist?list=${p.list}`} target="_blank" rel="noopener">
                    <span className="hm-course-thumb"><img src={`https://i.ytimg.com/vi/${p.vid}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" /></span>
                    <span className="hm-course-text"><span className="t-eyebrow hm-tag">{t('playlist')}</span><span className="t-h4">{p.title}</span></span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 08 COMUNIDAD — 6 channel cards (replaces the Instagram/X embeds) */}
      <section className="hm-community" id="community" aria-labelledby="community-h">
        <div className="hm-wrap">
          <SectionHead eyebrow={t('wallEyebrow')} title={t('wallH2')} sub={t('wallSub')} id="community-h" />
          <ul className="hm-channels">
            {channels.map((c) => (
              <li key={c.name}>
                <a className="hm-card hm-channel" href={c.href} target="_blank" rel="noopener">
                  {channelIcon(c.icon)}
                  <span className="hm-channel-text"><span className="t-h4">{c.name}</span><span className="t-body-s hm-muted">{c.desc}</span></span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 09 LLAMADO — Naranjo, magnifier-planet mascot */}
      <ShellSlot kind="cta" theme="naranjo" />
    </>
  );
};

window.FoundationSystem = FoundationSystem;
