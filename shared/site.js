/* Tellus Cooperative — shared shell: nav, footer, city ribbon, final CTA, Join modal.
   Plain browser JS (no build, no framework) so every static page can use it.

   Usage on any page (after <link rel="stylesheet" href="/shared/tokens.css"> + site.css):

     <a class="tl-skip" href="#main">Saltar al contenido</a>
     <div data-tellus="nav" data-variant="main" data-lang="es" data-alt-href="/en/code-of-conduct"></div>
     <main id="main"> … </main>
     <div data-tellus="ribbon" data-section-theme="cielo"></div>      <!-- optional -->
     <div data-tellus="cta"    data-section-theme="naranjo"></div>    <!-- optional -->
     <div data-tellus="footer" data-lang="es"></div>
     <script src="/shared/site.js" defer></script>

   data-variant : "main" (mega panels) | "policy" (light bar + clean burger + dark "Todo Tellus" panel)
   data-lang    : "es" | "en" | omit/"auto" → <html lang> if es/en, else localStorage["tellus-lang"] (Home).
   data-alt-href: URL of the same page in the other language (route-based pages). When missing,
                  the selector switches language in place (stores tellus-lang, fires "tellus:lang").
   data-overlay : "true" → nav floats over the first section (Home hero) instead of taking 77 px.
   Any element with [data-join] opens the Join modal; window.TellusShell.openJoin() does too.

   TODO(spec §15 Q1): confirm "Únete" vs "Unirse" and use the same verb in nav, modal and CTA.
   TODO(spec §15 Q2): Portuguese is not in the redesign (ES/EN only). Home still renders PT text when
                      localStorage["tellus-lang"] === "pt"; the selector then shows no active option.
   TODO(spec §15 Q3): "New York, NY" stays in the legal line until confirmed.
   TODO(spec §15 Q4): confirm the Discord invite URL does not expire. */
(function () {
  'use strict';

  var URL_WA = 'https://chat.whatsapp.com/FsNIUPsmNCl2YJkQi5r4p4';
  var URL_DISCORD = 'https://discord.gg/Fy2SgR3XRu';
  var URL_REPORTES = 'https://discord.gg/qPQJkvUfsS'; // #reportes channel (see code of conduct)
  var URL_NEWS = 'https://telluscoop.beehiiv.com';
  var URL_YT = 'https://www.youtube.com/@telluscoop';
  var URL_YT_PLAYLISTS = 'https://www.youtube.com/@telluscoop/playlists';
  var URL_LUMA = 'https://lu.ma/telluscoop';

  var CITIES = ['Santiago', 'Mexico City', 'São Paulo', 'Buenos Aires', 'Bogotá', 'Lima', 'Montevideo', 'Quito', 'Medellín', 'Porto Alegre'];

  var D = {
    en: {
      skip: 'Skip to content', home: 'Home', programs: 'Programs', resources: 'Resources', community: 'Community', hub: 'Hub',
      join: 'Join', joinFull: 'Join the cooperative', openMenu: 'Open menu', closeMenu: 'Close menu', language: 'Language',
      mainNav: 'Main', allTellus: 'All of Tellus',
      threePrograms: 'Three programs', stellarChile: 'Stellar Chile', learnWithUs: 'Learn with us',
      edu: 'Cooperative education', inc: 'Project incubation', pub: 'Public resources',
      eduD: 'Quarterly cohorts on blockchain, AI, and decentralized economics. Full scholarships for students from public universities across Latin America.',
      incD: 'We help new projects emerge, find resources, and access funding opportunities, connecting founders with the cooperative network, mentors, and partners to build with real backing.',
      pubD: 'Open publications on data sovereignty, cooperative organizational models, and digital economics, freely available for communities across Latin America.',
      amb: 'Stellar Chile Ambassadors', ambD: 'Who can apply, what the role involves and what it does not authorize.',
      coc: 'Code of Conduct', cocD: 'How we look after each other in Tellus spaces.',
      hubEyebrow: 'Tellus Blockchain Hub', hubTitle: 'Pasan cosas en el Hub.', hubLink: 'Visit the Hub →',
      articles: 'Articles', ytCourses: 'YouTube courses', tellusRes: 'Tellus Resources', brand: 'Brand guidelines', brandShort: 'Brand guide',
      newsletter: 'Newsletter', newsTitle: 'Weekly guides, events, and resources for blockchain entrepreneurship, free.',
      subscribe: 'Subscribe ↗', tellusHub: 'Tellus Hub',
      footerBrand: 'A Latin American blockchain cooperative for education, incubation, and open knowledge.',
      wa: 'WhatsApp · 300+ members', discord: 'Discord', events: 'Events on lu.ma', github: 'GitHub',
      policies: 'Policies', reportes: 'Go to #reportes', back: 'Back to top ↑',
      legal: '© 2026 Tellus Cooperative Foundation · New York, NY',
      socialOn: 'Tellus on ', cities: 'Chapters in Latin America',
      ctaH: 'Ready to build with us?', ctaSub: 'Membership is free, open, and takes 90 seconds.', ctaJoin: 'Join the cooperative',
      ctaWa: 'Or join our WhatsApp community, 300+ members →', ctaWaShort: 'Or join WhatsApp · 300+ members →',
      mTitle: 'Join Tellus.', mSub: 'Weekly guides, events, and resources for blockchain entrepreneurship, free.',
      mEmail: 'Email', mPlaceholder: 'your@email.com', mSubscribe: 'Subscribe', mAlso: 'also join the community',
      mWa: 'WhatsApp · 300+ members', mDiscord: 'Discord community', mOkTitle: 'Check your inbox.',
      mOkSub: 'Confirm your subscription in the email we just sent. Then join the community:', mDone: 'Done', mClose: 'Close',
      mErr: 'Error: could not subscribe. Visit blog.telluscoop.com/subscribe to sign up directly.'
    },
    es: {
      skip: 'Saltar al contenido', home: 'Inicio', programs: 'Programas', resources: 'Recursos', community: 'Comunidad', hub: 'Hub',
      join: 'Únete', joinFull: 'Únete a la cooperativa', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', language: 'Idioma',
      mainNav: 'Principal', allTellus: 'Todo Tellus',
      threePrograms: 'Tres programas', stellarChile: 'Stellar Chile', learnWithUs: 'Aprende con nosotros',
      edu: 'Educación cooperativa', inc: 'Incubación de proyectos', pub: 'Recursos públicos',
      eduD: 'Cohortes trimestrales sobre blockchain, IA y economía descentralizada. Becas completas para estudiantes de universidades públicas en toda Latinoamérica.',
      incD: 'Ayudamos a nuevos proyectos a surgir, encontrar recursos y acceder a oportunidades de financiamiento, conectando a los fundadores con la red cooperativa, mentores y socios.',
      pubD: 'Publicaciones abiertas sobre soberanía de datos, modelos organizativos cooperativos y economía digital, disponibles gratuitamente para comunidades de Latinoamérica.',
      amb: 'Embajadores Stellar Chile', ambD: 'Quién puede postular, qué implica el rol y qué no autoriza.',
      coc: 'Código de Conducta', cocD: 'Cómo nos cuidamos en los espacios de Tellus.',
      hubEyebrow: 'Tellus Blockchain Hub', hubTitle: 'Pasan cosas en el Hub.', hubLink: 'Ir al Hub →',
      articles: 'Artículos', ytCourses: 'Cursos en YouTube', tellusRes: 'Tellus Resources', brand: 'Guía de marca', brandShort: 'Guía de marca',
      newsletter: 'Newsletter', newsTitle: 'Guías semanales, eventos y recursos para el emprendimiento blockchain, gratis.',
      subscribe: 'Suscríbete ↗', tellusHub: 'Tellus Hub',
      footerBrand: 'Una cooperativa blockchain latinoamericana para la educación, la incubación y el conocimiento abierto.',
      wa: 'WhatsApp · 300+ miembros', discord: 'Discord', events: 'Eventos en lu.ma', github: 'GitHub',
      policies: 'Políticas', reportes: 'Ir a #reportes', back: 'Volver arriba ↑',
      legal: '© 2026 Tellus Cooperative Foundation · New York, NY',
      socialOn: 'Tellus en ', cities: 'Capítulos en Latinoamérica',
      ctaH: '¿Listo para construir con nosotros?', ctaSub: 'La membresía es gratis, abierta y toma 90 segundos.', ctaJoin: 'Únete a la cooperativa',
      ctaWa: 'O únete a nuestra comunidad de WhatsApp, más de 300 miembros →', ctaWaShort: 'O únete a WhatsApp · 300+ miembros →',
      mTitle: 'Unite a Tellus.', mSub: 'Guías semanales, eventos y recursos para el emprendimiento blockchain, gratis.',
      mEmail: 'Email', mPlaceholder: 'tu@email.com', mSubscribe: 'Suscribirme', mAlso: 'también únete a la comunidad',
      mWa: 'WhatsApp · 300+ miembros', mDiscord: 'Comunidad Discord', mOkTitle: 'Revisá tu bandeja de entrada.',
      mOkSub: 'Confirma tu suscripción en el correo que te acabamos de enviar. Luego únete a la comunidad:', mDone: 'Listo', mClose: 'Cerrar',
      mErr: 'Error: no se pudo suscribir. Visitá blog.telluscoop.com/subscribe para registrarte directamente.'
    },
    pt: { // TODO(§15 Q2): only the strings that already existed in PT; the rest fall back to EN.
      join: 'Participar', joinFull: 'Entrar na cooperativa', programs: 'Programas', resources: 'Recursos', community: 'Comunidade',
      mTitle: 'Entrar na Tellus.', mSub: 'Guias semanais, eventos e recursos para o empreendedorismo blockchain, grátis.',
      mPlaceholder: 'seu@email.com', mSubscribe: 'Assinar', mAlso: 'também entre na comunidade',
      mWa: 'WhatsApp · 300+ membros', mDiscord: 'Comunidade Discord', mOkTitle: 'Verifique sua caixa de entrada.',
      mOkSub: 'Confirme sua assinatura no e-mail que acabamos de enviar. Depois entre na comunidade:', mDone: 'Feito',
      mErr: 'Erro: não foi possível assinar. Visite blog.telluscoop.com/subscribe para se registrar diretamente.',
      ctaH: 'Pronto para construir com a gente?', ctaSub: 'A associação é gratuita, aberta e leva 90 segundos.', ctaJoin: 'Entrar na cooperativa',
      ctaWa: 'Ou entre na nossa comunidade do WhatsApp, 300+ membros →', ctaWaShort: 'Ou entre no WhatsApp · 300+ membros →',
      footerBrand: 'Uma cooperativa blockchain latino-americana para educação, incubação e conhecimento aberto.'
    }
  };

  function langOf(el) {
    var l = el && el.getAttribute('data-lang');
    if (l === 'es' || l === 'en' || l === 'pt') return l;
    if (l !== 'auto') {
      var h = (document.documentElement.getAttribute('lang') || '').slice(0, 2);
      if (h === 'es' || h === 'en') return h;
    }
    try { var s = localStorage.getItem('tellus-lang'); if (s === 'es' || s === 'en' || s === 'pt') return s; } catch (e) {}
    return 'en';
  }
  function S(lang, k) { return (D[lang] && D[lang][k]) || D.en[k] || k; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  var CHEV = '<svg class="tl-chev" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CLOSE = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4 4 16"/></svg>';
  var SOCIAL = [
    ['x', 'X', 'https://x.com/TellusCoop'],
    ['instagram', 'Instagram', 'https://www.instagram.com/telluscooperative/'],
    ['linkedin', 'LinkedIn', 'https://www.linkedin.com/company/tellus-cooperative/'],
    ['youtube', 'YouTube', URL_YT],
    ['github', 'GitHub', 'https://github.com/Tellus-Cooperative/'],
    ['discord', 'Discord', URL_DISCORD],
    ['whatsapp', 'WhatsApp', URL_WA]
  ];

  function urls(lang) {
    var en = lang === 'en';
    return {
      coc: en ? '/en/code-of-conduct' : '/code-of-conduct',
      amb: en ? '/en/programs/stellar-chile/ambassadors' : '/programs/stellar-chile/ambassadors'
    };
  }

  function socialHtml(lang) {
    return '<div class="tl-social">' + SOCIAL.map(function (s) {
      return '<a href="' + s[2] + '" target="_blank" rel="noopener" aria-label="' + esc(S(lang, 'socialOn') + s[1]) + '"><img src="/shared/img/social/' + s[0] + '.svg" alt="" width="20" height="20" aria-hidden="true"></a>';
    }).join('') + '</div>';
  }

  function langSelector(lang, alt) {
    var other = lang === 'es' ? 'en' : 'es';
    var opts = ['es', 'en'].map(function (l) {
      var active = lang === l;
      if (alt) {
        return active
          ? '<span aria-current="true" lang="' + l + '">' + l.toUpperCase() + '</span>'
          : '<a href="' + esc(alt) + '" hreflang="' + l + '" lang="' + l + '">' + l.toUpperCase() + '</a>';
      }
      return '<button type="button" data-set-lang="' + l + '" lang="' + l + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + l.toUpperCase() + '</button>';
    }).join('');
    void other;
    return '<div class="tl-lang" role="group" aria-label="' + esc(S(lang, 'language')) + '">' + opts + '</div>';
  }

  /* ── Nav ─────────────────────────────────────────────────────────────── */
  function megaProgramsHtml(lang) {
    var u = urls(lang);
    function item(href, t, d) { return '<a class="tl-mega-item" href="' + href + '"><strong>' + esc(t) + '</strong><span>' + esc(d) + '</span></a>'; }
    // TODO(§15 Q7): confirm real "Learn more" URLs for the three programs (these mirror the Programs cards).
    return '<div class="tl-mega-card tl-mega-card--prog">' +
      '<div class="tl-mega-col"><div class="tl-mega-eyebrow">' + S(lang, 'threePrograms') + '</div>' +
      item(URL_YT_PLAYLISTS, S(lang, 'edu'), S(lang, 'eduD')) + item(u.amb, S(lang, 'inc'), S(lang, 'incD')) + item('/resources', S(lang, 'pub'), S(lang, 'pubD')) + '</div>' +
      '<div class="tl-mega-col"><div class="tl-mega-eyebrow">' + S(lang, 'stellarChile') + '</div>' +
      item(u.amb, S(lang, 'amb'), S(lang, 'ambD')) + item(u.coc, S(lang, 'coc'), S(lang, 'cocD')) + '</div>' +
      '<div class="tl-mega-hub"><p class="tl-mega-eyebrow">' + S(lang, 'hubEyebrow') + '</p><p class="t-h3">' + S(lang, 'hubTitle') + '</p><a class="tl-hub-link" href="/hub">' + S(lang, 'hubLink') + '</a></div></div>';
  }
  function megaResourcesHtml(lang) {
    function item(href, t, ext) { return '<a class="tl-mega-item" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '><strong>' + esc(t) + (ext ? ' ↗' : '') + '</strong></a>'; }
    return '<div class="tl-mega-card tl-mega-card--res">' +
      '<div class="tl-mega-col"><div class="tl-mega-eyebrow">' + S(lang, 'learnWithUs') + '</div>' +
      item('/#articles', S(lang, 'articles')) + item(URL_YT_PLAYLISTS, S(lang, 'ytCourses'), true) + item('/resources', S(lang, 'tellusRes')) + item('/brand', S(lang, 'brand')) + '</div>' +
      '<div class="tl-mega-hub"><p class="tl-mega-eyebrow">' + S(lang, 'newsletter') + '</p><p class="t-h3">' + S(lang, 'newsTitle') + '</p><a class="btn--outline" href="' + URL_NEWS + '" target="_blank" rel="noopener">' + S(lang, 'subscribe') + '</a></div></div>';
  }
  function logoImg(w) { return '<img src="/shared/img/tellus-color.svg" alt="Tellus Cooperative" width="132" height="44">'; }
  function logoWhite() { return '<img src="/shared/img/tellus-white.svg" alt="Tellus Cooperative" width="132" height="60">'; }

  function footerCols(lang) {
    var u = urls(lang);
    return [
      [S(lang, 'programs'), [[URL_YT_PLAYLISTS, S(lang, 'edu'), 1], [u.amb, S(lang, 'inc')], ['/resources', S(lang, 'pub')], ['/hub', S(lang, 'tellusHub')]]],
      [S(lang, 'resources'), [['/#articles', S(lang, 'articles')], [URL_NEWS, S(lang, 'newsletter'), 1], [URL_YT_PLAYLISTS, S(lang, 'ytCourses'), 1], ['/resources', S(lang, 'tellusRes')]]],
      [S(lang, 'community'), [[URL_WA, S(lang, 'wa'), 1], [URL_DISCORD, S(lang, 'discord'), 1], [URL_LUMA, S(lang, 'events'), 1], ['https://github.com/Tellus-Cooperative/', S(lang, 'github'), 1]]],
      [S(lang, 'policies'), [[u.coc, S(lang, 'coc')], [u.amb, S(lang, 'amb')], ['/brand', S(lang, 'brand')], [URL_REPORTES, S(lang, 'reportes'), 1]]]
    ];
  }
  function linkList(items, cls) {
    return items.map(function (i) { return '<li><a class="' + cls + '" href="' + esc(i[0]) + '"' + (i[2] ? ' target="_blank" rel="noopener"' : '') + '>' + esc(i[1]) + '</a></li>'; }).join('');
  }

  function group(id, title, items) {
    return '<div class="tl-m-group"><button type="button" class="tl-m-trigger" aria-expanded="false" aria-controls="' + id + '">' + title + CHEV + '</button><div class="tl-m-sub" id="' + id + '">' +
      items.map(function (i) { return '<a href="' + esc(i[0]) + '"' + (/youtube|discord\.gg/.test(i[0]) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(i[1]) + '</a>'; }).join('') + '</div></div>';
  }

  function navHtml(el) {
    var lang = langOf(el), variant = el.getAttribute('data-variant') === 'policy' ? 'policy' : 'main';
    var alt = el.getAttribute('data-alt-href');
    var u = urls(lang);
    var join = '<button type="button" class="btn btn--secondary" data-join>' + S(lang, 'join') + '</button>';
    var burger = function (ctl) { return '<button type="button" class="tl-burger" aria-expanded="false" aria-controls="' + ctl + '" aria-label="' + esc(S(lang, 'openMenu')) + '" data-open-label="' + esc(S(lang, 'openMenu')) + '" data-close-label="' + esc(S(lang, 'closeMenu')) + '"><span></span><span></span></button>'; };
    var html;
    if (variant === 'policy') {
      html = '<header class="tl-nav tl-nav--policy" data-tl-nav><div class="tl-nav-bar">' +
        '<a class="tl-logo" href="/" aria-label="Tellus Cooperative">' + logoImg() + '</a>' +
        '<nav class="tl-nav-links" aria-label="' + esc(S(lang, 'mainNav')) + '">' +
        '<a class="tl-nav-item" href="/">' + S(lang, 'home') + '</a><a class="tl-nav-item" href="/#programs">' + S(lang, 'programs') + '</a>' +
        '<a class="tl-nav-item" href="/resources">' + S(lang, 'resources') + '</a><a class="tl-nav-item" href="/hub">' + S(lang, 'hub') + '</a></nav>' +
        burger('tl-policy-panel') + '</div></header>' +
        '<div class="tl-policy-panel" id="tl-policy-panel" role="dialog" aria-modal="true" aria-label="' + esc(S(lang, 'allTellus')) + '" data-panel>' +
        '<div class="tl-pp-top"><a class="tl-logo" href="/" aria-label="Tellus Cooperative"><img src="/shared/img/tellus-white.svg" alt="Tellus Cooperative" width="120" height="55"></a>' +
        '<button type="button" class="tl-burger" aria-expanded="true" aria-label="' + esc(S(lang, 'closeMenu')) + '" data-close-panel><span></span><span></span></button></div>' +
        '<div class="tl-pp-body"><div class="tl-pp-mob">' +
        '<div class="tl-m-group"><a class="tl-m-link" href="/">' + S(lang, 'home') + '</a></div>' +
        '<div class="tl-m-group"><a class="tl-m-link" href="/#programs">' + S(lang, 'programs') + '</a></div>' +
        '<div class="tl-m-group"><a class="tl-m-link" href="/resources">' + S(lang, 'resources') + '</a></div>' +
        '<div class="tl-m-group"><a class="tl-m-link" href="/hub">' + S(lang, 'hub') + '</a></div>' +
        group('pp-pol', S(lang, 'policies'), [[u.coc, S(lang, 'coc')], [u.amb, S(lang, 'amb')], [URL_REPORTES, S(lang, 'reportes')]]) +
        '</div><p class="tl-pp-title">' + S(lang, 'allTellus') + '</p><div class="tl-pp-cols">' +
        footerCols(lang).map(function (c) { return '<div class="tl-pp-col"><h3>' + esc(c[0]) + '</h3>' + linkList(c[1], '').replace(/<li>/g, '').replace(/<\/li>/g, '') + '</div>'; }).join('') +
        '</div><div class="tl-pp-foot"><div class="tl-m-langrow"><span class="tl-m-label">' + S(lang, 'language') + '</span>' + langSelector(lang, alt) + '</div>' + socialHtml(lang) + '<button type="button" class="btn btn--primary" data-join>' + S(lang, 'join') + '</button></div></div></div>';
    } else {
      var mob = '<div class="tl-mobile" id="tl-mobile" role="dialog" aria-modal="true" aria-label="' + esc(S(lang, 'mainNav')) + '" data-panel>' +
        '<div class="tl-mobile-top"><a class="tl-logo" href="/" aria-label="Tellus Cooperative"><img src="/shared/img/tellus-white.svg" alt="Tellus Cooperative" width="120" height="55"></a>' +
        '<button type="button" class="tl-burger" aria-expanded="true" aria-label="' + esc(S(lang, 'closeMenu')) + '" data-close-panel><span></span><span></span></button></div>' +
        '<div class="tl-mobile-body">' +
        group('m-prog', S(lang, 'programs'), [[URL_YT_PLAYLISTS, S(lang, 'edu')], [u.amb, S(lang, 'inc')], ['/resources', S(lang, 'pub')], [u.amb, S(lang, 'amb')]]) +
        group('m-res', S(lang, 'resources'), [['/#articles', S(lang, 'articles')], [URL_YT_PLAYLISTS, S(lang, 'ytCourses') + ' ↗'], ['/resources', S(lang, 'tellusRes')], ['/brand', S(lang, 'brand')]]) +
        '<div class="tl-m-group"><a class="tl-m-link" href="/#community">' + S(lang, 'community') + '</a></div>' +
        '<div class="tl-m-group"><a class="tl-m-link" href="/hub">' + S(lang, 'hub') + '</a></div>' +
        '<div class="tl-m-tools"><div class="tl-m-langrow"><span class="tl-m-label">' + S(lang, 'language') + '</span>' + langSelector(lang, alt) + '</div>' + socialHtml(lang) +
        '<button type="button" class="btn btn--primary" data-join>' + S(lang, 'join') + '</button></div></div></div>';
      html = '<header class="tl-nav" data-tl-nav><div class="tl-nav-bar">' +
        '<a class="tl-logo" href="/" aria-label="Tellus Cooperative">' + logoImg() + '</a>' +
        '<nav class="tl-nav-links" aria-label="' + esc(S(lang, 'mainNav')) + '">' +
        '<button type="button" class="tl-nav-item" aria-expanded="false" aria-controls="tl-mega-programs" data-mega="programs">' + S(lang, 'programs') + CHEV + '</button>' +
        '<button type="button" class="tl-nav-item" aria-expanded="false" aria-controls="tl-mega-resources" data-mega="resources">' + S(lang, 'resources') + CHEV + '</button>' +
        '<a class="tl-nav-item" href="/#community">' + S(lang, 'community') + '</a><a class="tl-nav-item" href="/hub">' + S(lang, 'hub') + '</a></nav>' +
        '<div class="tl-nav-actions">' + langSelector(lang, alt) + join + '</div>' + burger('tl-mobile') + '</div>' +
        '<div class="tl-mega" id="tl-mega-programs" hidden>' + megaProgramsHtml(lang) + '</div>' +
        '<div class="tl-mega" id="tl-mega-resources" hidden>' + megaResourcesHtml(lang) + '</div></header>' + mob;
    }
    return html;
  }

  /* ── Footer / ribbon / CTA ───────────────────────────────────────────── */
  function footerHtml(el) {
    var lang = langOf(el);
    var cols = footerCols(lang).map(function (c) { return '<div class="tl-f-col"><h2>' + esc(c[0]) + '</h2><ul>' + linkList(c[1], 'tl-f-link') + '</ul></div>'; }).join('');
    return '<footer class="tl-footer"><div class="tl-footer-in">' +
      '<div class="tl-f-news"><div><p class="tl-f-eyebrow">' + S(lang, 'newsletter') + '</p><p class="t-h3">' + S(lang, 'newsTitle') + '</p></div>' +
      '<a class="tl-f-btn" href="' + URL_NEWS + '" target="_blank" rel="noopener">' + S(lang, 'subscribe') + '</a></div>' +
      '<div class="tl-f-nav"><div class="tl-f-brand"><img src="/shared/img/tellus-white.svg" alt="Tellus Cooperative" width="160" height="73" loading="lazy"><p class="t-body-m">' + S(lang, 'footerBrand') + '</p>' +
      '<a class="tl-f-link" href="mailto:hola@telluscoop.org">hola@telluscoop.org</a></div><div class="tl-f-cols">' + cols + '</div></div>' +
      '<div class="tl-f-base"><div class="tl-f-legal"><p>' + S(lang, 'legal') + '</p><a class="tl-f-link" href="#top" data-top>' + S(lang, 'back') + '</a></div>' + socialHtml(lang) + '</div>' +
      '</div></footer>';
  }
  function ribbonHtml(el) {
    var lang = langOf(el);
    var row = function (hidden) {
      return '<ul class="tl-ribbon-row t-cinta"' + (hidden ? ' aria-hidden="true"' : ' aria-label="' + esc(S(lang, 'cities')) + '"') + '>' + CITIES.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
    };
    return '<div class="tl-ribbon" data-tl-ribbon><span class="tl-ribbon-fade tl-ribbon-fade--l"></span><span class="tl-ribbon-fade tl-ribbon-fade--r"></span><div class="tl-ribbon-track">' + row(false) + row(true) + '</div></div>';
  }
  function ctaHtml(el) {
    var lang = langOf(el);
    return '<section class="tl-cta" aria-labelledby="tl-cta-h"><div class="tl-cta-inner">' +
      '<img src="/shared/img/mascots/planeta-lupa.webp" srcset="/shared/img/mascots/planeta-lupa.webp 1x, /shared/img/mascots/planeta-lupa@2x.webp 2x" alt="" width="170" height="171" loading="lazy">' +
      '<h2 class="t-h2" id="tl-cta-h">' + S(lang, 'ctaH') + '</h2><p class="t-body-l">' + S(lang, 'ctaSub') + '</p>' +
      '<div class="tl-cta-actions"><button type="button" class="btn btn--primary" data-join>' + S(lang, 'ctaJoin') + '</button>' +
      '<a class="btn btn--link" href="' + URL_WA + '" target="_blank" rel="noopener">' + S(lang, 'ctaWa') + '</a></div></div></section>';
  }

  /* ── Behaviours ──────────────────────────────────────────────────────── */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function prefersReduce() { return !!(reduce && reduce.matches); }
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function trap(container, e) {
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null || n === document.activeElement; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function lock(on) { document.body.classList.toggle('tl-lock', !!on); }

  function wireNav(slot, sig) {
    var nav = slot.querySelector('[data-tl-nav]');
    if (!nav) return;
    var panel = slot.querySelector('[data-panel]');
    var burger = nav.querySelector('.tl-burger');
    var megaBtns = nav.querySelectorAll('[data-mega]');
    var hoverT;

    function closeMega(focusBack) {
      var had = nav.classList.contains('is-open');
      megaBtns.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); var p = document.getElementById(b.getAttribute('aria-controls')); if (p) p.hidden = true; });
      nav.classList.remove('is-open');
      return had;
    }
    function openMega(btn) {
      closeMega();
      btn.setAttribute('aria-expanded', 'true');
      var p = document.getElementById(btn.getAttribute('aria-controls'));
      if (p) p.hidden = false;
      nav.classList.add('is-open');
    }
    megaBtns.forEach(function (b) {
      b.addEventListener('click', function () { if (b.getAttribute('aria-expanded') === 'true') closeMega(); else openMega(b); });
      // hover with intent (mouse only)
      b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(function () { openMega(b); }, 140); });
      b.addEventListener('pointerleave', function () { clearTimeout(hoverT); });
    });
    nav.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { clearTimeout(hoverT); hoverT = setTimeout(function () { closeMega(); }, 220); } });
    nav.addEventListener('pointerenter', function () { clearTimeout(hoverT); });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeMega(); }, { signal: sig });
    nav.addEventListener('focusout', function (e) { if (e.relatedTarget && !nav.contains(e.relatedTarget)) closeMega(); });
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openBtn = nav.querySelector('[data-mega][aria-expanded="true"]');
      if (openBtn) { closeMega(); openBtn.focus(); }
    });

    // Condensed state after ~80 px
    function onScroll() { nav.classList.toggle('is-condensed', window.scrollY > 80); }
    window.addEventListener('scroll', onScroll, { passive: true, signal: sig }); onScroll();

    // Mobile / policy panel
    if (panel && burger) {
      var opener;
      var setOpen = function (open) {
        panel.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', burger.getAttribute(open ? 'data-close-label' : 'data-open-label'));
        lock(open && (panel.classList.contains('tl-mobile') || window.innerWidth < 768));
        if (open) {
          opener = document.activeElement;
          var vis = Array.prototype.filter.call(panel.querySelectorAll(FOCUSABLE), function (n) { return n.offsetParent !== null; });
          var f = vis.filter(function (n) { return n.hasAttribute('data-close-panel'); })[0] || vis[0];
          if (f) f.focus();
        }
        else if (opener) { burger.focus(); }
      };
      burger.addEventListener('click', function () { setOpen(!panel.classList.contains('is-open')); });
      panel.querySelectorAll('[data-close-panel]').forEach(function (b) { b.addEventListener('click', function () { setOpen(false); }); });
      panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } else trap(panel, e); });
      // desktop dropdown: focus may still sit on the header burger, so Esc is also handled globally
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false); }, { signal: sig });
      panel.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href], [data-join], [data-set-lang]'); if (a) setOpen(false); });
      // desktop policy dropdown also closes on outside click
      document.addEventListener('click', function (e) { if (panel.classList.contains('is-open') && !panel.contains(e.target) && !burger.contains(e.target)) setOpen(false); }, { signal: sig });
      window.addEventListener('resize', function () {
        if (!panel.classList.contains('is-open')) return;
        if (panel.classList.contains('tl-mobile') && window.innerWidth >= 1024) { setOpen(false); return; }
        // policy dropdown: scroll lock only applies below 768 px, so recompute when the width changes
        lock(panel.classList.contains('tl-mobile') || window.innerWidth < 768);
      }, { signal: sig });
    }
    slot.querySelectorAll('.tl-m-trigger').forEach(function (t) {
      t.addEventListener('click', function () {
        var g = t.parentElement, open = !g.classList.contains('is-open');
        g.classList.toggle('is-open', open); t.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  function wireRibbon(root, sig) {
    var r = root.querySelector('[data-tl-ribbon]');
    if (!r) return;
    var track = r.querySelector('.tl-ribbon-track');
    function speed() {
      var mobile = window.innerWidth < 768, pxs = mobile ? 32 : 40;
      var half = track.scrollWidth / 2; // one full row (+ gap)
      track.style.setProperty('--ribbon-duration', Math.max(10, half / pxs).toFixed(1) + 's');
    }
    speed(); window.addEventListener('resize', speed, { signal: sig });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { r.classList.toggle('is-offscreen', !es[0].isIntersecting); });
      io.observe(r);
      if (sig) sig.addEventListener('abort', function () { io.disconnect(); });
    }
  }

  function wireFooter(root) {
    var t = root.querySelector('[data-top]');
    if (t) t.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReduce() ? 'auto' : 'smooth' }); });
  }

  /* ── Join modal ──────────────────────────────────────────────────────── */
  var modal, modalTrigger;
  function currentLang() { return langOf(document.querySelector('[data-tellus="nav"]') || document.documentElement); }

  function buildModal() {
    var lang = currentLang();
    var bg = document.createElement('div');
    bg.className = 'tl-modal-bg';
    bg.innerHTML =
      '<div class="tl-modal" role="dialog" aria-modal="true" aria-labelledby="tl-modal-h">' +
      '<div class="tl-modal-head"><img src="/shared/img/isotipo.svg" alt="" width="32" height="32">' +
      '<button type="button" class="tl-modal-close" aria-label="' + esc(S(lang, 'mClose')) + '" data-modal-close>' + CLOSE + '</button></div>' +
      '<div data-state="form"><h2 id="tl-modal-h">' + S(lang, 'mTitle') + '</h2><p class="tl-modal-sub t-body-m">' + S(lang, 'mSub') + '</p>' +
      '<form novalidate data-form><div class="tl-field"><label for="tl-email">' + S(lang, 'mEmail') + '</label><div class="tl-field-row">' +
      '<input class="tl-input" id="tl-email" name="email" type="email" autocomplete="email" required placeholder="' + esc(S(lang, 'mPlaceholder')) + '" aria-describedby="tl-email-err">' +
      '<button type="submit" class="btn btn--primary">' + S(lang, 'mSubscribe') + '</button></div>' +
      '<p class="tl-field-error" id="tl-email-err" aria-live="polite"></p></div>' +
      '<label class="tl-check"><input type="checkbox" data-also checked><span class="tl-check-box"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5"/></svg></span><span>' + S(lang, 'mAlso') + '</span></label>' +
      '<div class="tl-modal-comm" data-comm><a href="' + URL_WA + '" target="_blank" rel="noopener">' + S(lang, 'mWa') + '</a><a href="' + URL_DISCORD + '" target="_blank" rel="noopener">' + S(lang, 'mDiscord') + '</a></div></form></div>' +
      '<div data-state="ok" hidden><div class="tl-modal-ok"><h2 id="tl-modal-ok-h" tabindex="-1">' + S(lang, 'mOkTitle') + '</h2><p class="tl-modal-sub t-body-m">' + S(lang, 'mOkSub') + '</p>' +
      '<div class="tl-modal-comm" style="border:0;padding:0;margin:0;width:100%"><a href="' + URL_WA + '" target="_blank" rel="noopener">' + S(lang, 'mWa') + '</a><a href="' + URL_DISCORD + '" target="_blank" rel="noopener">' + S(lang, 'mDiscord') + '</a></div>' +
      '<button type="button" class="btn btn--primary" data-modal-close>' + S(lang, 'mDone') + '</button></div></div></div>';
    document.body.appendChild(bg);
    modal = bg;
    var form = bg.querySelector('[data-form]'), input = bg.querySelector('#tl-email'), err = bg.querySelector('#tl-email-err'), btn = bg.querySelector('button[type="submit"]');
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-modal-close]')) closeJoin(); });
    bg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeJoin(); } else trap(bg, e); });
    bg.querySelector('[data-also]').addEventListener('change', function (e) { bg.querySelector('[data-comm]').hidden = !e.target.checked; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var L = currentLang(), v = input.value.trim();
      err.textContent = ''; input.removeAttribute('aria-invalid');
      var showErr = function (msg) { err.textContent = msg; input.setAttribute('aria-invalid', 'true'); input.focus(); };
      if (!v || !input.checkValidity()) { showErr(S(L, 'mErr')); return; }
      btn.disabled = true;
      fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v }) })
        .then(function (r) { if (!r.ok) throw new Error('subscribe'); bg.querySelector('[data-state="form"]').hidden = true; bg.querySelector('[data-state="ok"]').hidden = false; bg.querySelector('[role="dialog"]').setAttribute('aria-labelledby', 'tl-modal-ok-h'); bg.querySelector('#tl-modal-ok-h').focus(); })
        .catch(function () { showErr(S(L, 'mErr')); })
        .then(function () { btn.disabled = false; });
    });
  }
  function openJoin(trigger) {
    if (modal) { modal.remove(); modal = null; } // rebuilt each time so copy follows the current language
    buildModal();
    modalTrigger = trigger || document.activeElement;
    modal.classList.add('is-open'); lock(true);
    modal.querySelector('#tl-email').focus();
  }
  function closeJoin() {
    if (!modal) return;
    modal.remove(); modal = null; lock(false);
    if (modalTrigger && modalTrigger.focus && document.contains(modalTrigger)) modalTrigger.focus();
  }

  /* ── Mount + language ────────────────────────────────────────────────── */
  var BUILD = { nav: navHtml, footer: footerHtml, ribbon: ribbonHtml, cta: ctaHtml };
  var WIRE = { nav: wireNav, footer: wireFooter, ribbon: wireRibbon };

  function mount(scope) {
    (scope || document).querySelectorAll('[data-tellus]').forEach(function (el) {
      var kind = el.getAttribute('data-tellus');
      if (!BUILD[kind]) return;
      if (kind === 'nav') {
        el.classList.add('tl-nav-slot');
      }
      // abort listeners from a previous mount (language switch re-mounts every slot)
      if (el._tlAbort) el._tlAbort.abort();
      var ctl = typeof AbortController === 'function' ? new AbortController() : null;
      el._tlAbort = ctl;
      el.innerHTML = BUILD[kind](el);
      if (WIRE[kind]) WIRE[kind](el, ctl ? ctl.signal : undefined);
    });
    // skip-link text follows the language
    var sk = document.querySelector('.tl-skip[data-i18n-skip]');
    if (sk) sk.textContent = S(langOf(document.querySelector('[data-tellus="nav"]') || document.documentElement), 'skip');
  }

  function setLang(l) {
    if (l !== 'es' && l !== 'en') return;
    try { localStorage.setItem('tellus-lang', l); } catch (e) {}
    document.documentElement.setAttribute('lang', l);
    document.querySelectorAll('[data-tellus][data-lang]').forEach(function (n) { if (n.getAttribute('data-lang') === 'auto') n.setAttribute('data-lang', l); });
    mount();
    window.dispatchEvent(new CustomEvent('tellus:lang', { detail: { lang: l } }));
  }

  document.addEventListener('click', function (e) {
    var j = e.target.closest && e.target.closest('[data-join]');
    if (j) { e.preventDefault(); openJoin(j); return; }
    var s = e.target.closest && e.target.closest('[data-set-lang]');
    if (s) { setLang(s.getAttribute('data-set-lang')); }
  });

  window.TellusShell = { mount: mount, openJoin: openJoin, closeJoin: closeJoin, setLang: setLang, lang: function () { return currentLang(); } };

  function init() { mount(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
