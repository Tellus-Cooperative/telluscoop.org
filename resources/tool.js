/* Tellus Resources — tool profile (/resources/tools/<slug>). Client-rendered from /resources/tools.json. */
(function () {
  'use strict';
  var UI = {
    es: {
      title: function (n) { return n + ' · Tellus Resources'; },
      dir: 'Directorio', profile: 'Ficha del recurso', visit: 'Visitar', back: 'Volver al directorio', official: 'Sitio oficial',
      shortEyebrow: 'En resumen', whatIs: function (n) { return '¿Qué es ' + n + '?'; },
      usefulFor: function (n, tags) { return n + ' resulta especialmente útil para ' + tags + '.'; },
      freeFlow: function (d) { return 'Su oferta gratuita actual permite probar un flujo real: ' + d; },
      useEyebrow: 'Cuándo usarlo', useH: 'Casos de uso prácticos', tryEyebrow: 'Por dónde empezar',
      cavEyebrow: 'Antes de elegirlo', cavH: 'Qué revisar antes de elegirlo',
      cavNoCard: 'Puedes empezar sin añadir tarjeta, reduciendo el riesgo de cargos accidentales por exceso.',
      cavCard: 'Hace falta tarjeta para desbloquear toda la cuota gratuita. Configura límites de gasto antes de enviar tráfico real.',
      planH: 'Plan gratuito de un vistazo', included: 'Incluido sin coste', bestFor: 'Ideal para', category: 'Categoría', reviewed: 'Última revisión', tags: 'Tags',
      pricing: 'Comprobar precios actuales', noCard: 'Sin tarjeta', card: 'Tarjeta para la cuota completa',
      keep: 'Seguí explorando', alts: function (n) { return 'Alternativas a ' + n; }, seeCat: 'Ver toda la categoría',
      recommended: 'Recomendado', locale: 'es-CL',
      nfH: 'No encontramos ese recurso', nfP: 'El recurso que buscás no está en el catálogo o el enlace es incorrecto.', nfLink: 'Volver al directorio'
    },
    en: {
      title: function (n) { return n + ' · Tellus Resources'; },
      dir: 'Directory', profile: 'Resource profile', visit: 'Visit', back: 'Back to directory', official: 'Official site',
      shortEyebrow: 'The short version', whatIs: function (n) { return 'What is ' + n + '?'; },
      usefulFor: function (n, tags) { return n + ' is especially relevant for ' + tags + '.'; },
      freeFlow: function (d) { return 'Its current free offer is concrete enough to test a real workflow: ' + d; },
      useEyebrow: 'When it fits', useH: 'Practical use cases', tryEyebrow: 'Try this first',
      cavEyebrow: 'Before you choose it', cavH: 'What to check before committing',
      cavNoCard: 'You can start without adding a card, reducing the risk of accidental overage charges.',
      cavCard: 'A card is required to unlock the full free quota. Set spending limits before sending real traffic.',
      planH: 'Free plan at a glance', included: 'Included at no cost', bestFor: 'Best for', category: 'Category', reviewed: 'Last reviewed', tags: 'Tags',
      pricing: 'Check current pricing', noCard: 'No card required', card: 'Card for full limits',
      keep: 'Keep exploring', alts: function (n) { return 'Alternatives to ' + n; }, seeCat: 'See the whole category',
      recommended: 'Recommended', locale: 'en-US',
      nfH: "We couldn't find that resource", nfP: "The resource you're looking for isn't in the catalog, or the link is wrong.", nfLink: 'Back to directory'
    }
  };
  var state = { lang: 'en', data: null, tool: null };
  var t = function (k) { return UI[state.lang][k]; };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pick = function (o, base) { return o[base + '_' + state.lang] || o[base + '_en']; };

  function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; } }
  function joinTags(tags) {
    if (!tags || !tags.length) return '';
    if (tags.length === 1) return tags[0];
    return tags.slice(0, -1).join(', ') + (state.lang === 'en' ? ' and ' : ' y ') + tags[tags.length - 1];
  }
  function setMeta(title, desc) {
    document.title = title;
    [['meta[name="description"]', desc], ['meta[property="og:title"]', title], ['meta[property="og:description"]', desc], ['meta[name="twitter:title"]', title], ['meta[name="twitter:description"]', desc]].forEach(function (p) {
      var el = document.querySelector(p[0]); if (el) el.setAttribute('content', p[1]);
    });
  }
  function setSocial(slug, name) {
    var url = 'https://telluscoop.org/resources/tools/' + slug, img = 'https://telluscoop.org/og/tools/' + slug + '.png';
    [['meta[property="og:url"]', url], ['meta[property="og:image"]', img], ['meta[name="twitter:image"]', img], ['meta[property="og:image:alt"]', name + ' · Tellus Resources'], ['meta[name="twitter:image:alt"]', name + ' · Tellus Resources']].forEach(function (p) {
      var el = document.querySelector(p[0]); if (el) el.setAttribute('content', p[1]);
    });
    var can = document.querySelector('link[rel="canonical"]'); if (can) can.setAttribute('href', url);
  }

  function card(tool) {
    var tags = (tool.tags || []).slice(0, 3).map(function (g) { return '<span class="rs-tag">' + esc(g) + '</span>'; }).join('');
    return '<a class="rs-card" href="/resources/tools/' + encodeURIComponent(tool.slug) + '"><div class="rs-card-head">' +
      (tool.recommended ? '<span class="rs-badge">' + esc(t('recommended')) + '</span>' : '') + '<h3 class="rs-card-name t-h4">' + esc(tool.name) + '</h3></div>' +
      '<p class="rs-card-desc t-body-m">' + esc(pick(tool, 'description')) + '</p>' +
      '<p class="rs-card-plan t-eyebrow">' + esc(pick(tool, 'free_tier_note')) + '</p>' +
      '<p class="rs-card-detail t-body-s">' + esc(pick(tool, 'free_tier_detail')) + '</p><div class="rs-tags">' + tags + '</div></a>';
  }

  function render() {
    document.documentElement.lang = state.lang;
    var root = $('tp-root'), tool = state.tool;
    if (!state.data) return;
    if (!tool) {
      setMeta(t('nfH') + ' · Tellus Resources', t('nfP'));
      root.innerHTML = '<section class="tp-missing" data-section-theme="teal"><div class="rs-wrap"><h1 class="t-h2">' + esc(t('nfH')) + '</h1><p class="t-lead">' + esc(t('nfP')) + '</p><a class="btn btn--primary" href="/resources">' + esc(t('nfLink')) + '</a></div></section>';
      return;
    }
    var cat = state.data.categories.filter(function (c) { return c.id === tool.category; })[0] || { label_es: tool.category, label_en: tool.category };
    var catName = pick(cat, 'label'), content = (window.TELLUS_DEV_CATEGORY_CONTENT || {})[tool.category] || {};
    var L = function (k) { return (content[k] && content[k][state.lang]) || (k === 'useCases' || k === 'trySteps' ? [] : ''); };
    var name = tool.name, desc = pick(tool, 'description'), detail = pick(tool, 'free_tier_detail'), safeUrl = /^https?:\/\//i.test(tool.url || '') ? tool.url : '', h = host(safeUrl);
    var reviewed = '';
    try { reviewed = new Date(state.data.meta.last_reviewed + 'T12:00:00Z').toLocaleDateString(t('locale'), { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); } catch (e) {}
    setMeta(t('title')(name), desc); setSocial(tool.slug, name);

    var alts = state.data.tools.filter(function (x) { return x.category === tool.category && x.slug !== tool.slug; }).slice(0, 4);
    var steps = function (arr, pad) { return arr.map(function (s, i) { return '<li class="tp-step"><span class="num" aria-hidden="true">' + (pad ? ('0' + (i + 1)).slice(-2) : i + 1) + '</span><p>' + esc(s) + '</p></li>'; }).join(''); };
    var caveats = [tool.no_card ? t('cavNoCard') : t('cavCard'), L('caveat2')].filter(Boolean);

    root.innerHTML =
      '<section class="tp-profile" data-section-theme="teal"><div class="rs-wrap">' +
        '<nav class="tp-crumbs" aria-label="Breadcrumb"><a href="/resources">' + esc(t('dir')) + '</a><span class="sep" aria-hidden="true">/</span>' +
          '<a href="/resources?category=' + encodeURIComponent(tool.category) + '">' + esc(catName) + '</a><span class="sep" aria-hidden="true">/</span><span class="cur" aria-current="page">' + esc(name) + '</span></nav>' +
        '<div class="tp-head"><div class="tp-title"><p class="rs-eyebrow t-eyebrow">' + esc(t('profile')) + ' · ' + esc(catName) + '</p>' +
          '<h1 class="t-display">' + esc(name) + '</h1><p class="tp-desc t-lead">' + esc(desc) + '</p></div>' +
          '<div class="tp-actions">' + (safeUrl ? '<a class="btn btn--primary" href="' + esc(safeUrl) + '" target="_blank" rel="noopener">' + esc(t('visit') + ' ' + name) + ' ↗</a>' : '') +
          '<a class="btn btn--secondary" href="/resources">' + esc(t('back')) + '</a></div></div>' +
        '<p class="tp-official t-meta">' + esc(t('official')) + ' · ' + esc(h) + '</p>' +
      '</div></section>' +

      '<div class="tp-content" data-section-theme="claro"><div class="rs-wrap">' +
        '<article class="tp-main">' +
          '<section class="tp-sec"><div><p class="rs-eyebrow t-eyebrow">' + esc(t('shortEyebrow')) + '</p><h2 class="t-h2">' + esc(t('whatIs')(name)) + '</h2></div>' +
            '<p>' + esc(desc) + '</p><p>' + esc(t('usefulFor')(name, joinTags(tool.tags))) + ' ' + esc(L('shortVersionExtra')) + '</p><p>' + esc(t('freeFlow')(detail)) + '</p></section>' +
          '<section class="tp-sec"><div><p class="rs-eyebrow t-eyebrow">' + esc(t('useEyebrow')) + '</p><h2 class="t-h2">' + esc(t('useH')) + '</h2></div><ol class="tp-steps">' + steps(L('useCases'), true) + '</ol></section>' +
          '<section class="tp-sec"><div><p class="rs-eyebrow t-eyebrow">' + esc(t('tryEyebrow')) + '</p><h2 class="t-h2">' + esc(L('tryTitle')) + '</h2></div><ol class="tp-steps">' + steps(L('trySteps'), false) + '</ol></section>' +
          '<section class="tp-sec"><div><p class="rs-eyebrow t-eyebrow">' + esc(t('cavEyebrow')) + '</p><h2 class="t-h2">' + esc(t('cavH')) + '</h2></div><ul class="tp-bullets">' +
            caveats.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></section>' +
        '</article>' +
        '<aside class="tp-plan" aria-labelledby="tp-plan-h"><h2 class="t-h4" id="tp-plan-h">' + esc(t('planH')) + '</h2>' +
          '<p class="tag t-eyebrow">' + esc(tool.no_card ? t('noCard') : t('card')) + '</p>' +
          '<dl><div><dt class="t-eyebrow">' + esc(t('included')) + '</dt><dd>' + esc(detail) + '</dd></div>' +
          '<div><dt class="t-eyebrow">' + esc(t('bestFor')) + '</dt><dd>' + esc(L('idealFor') || catName) + '</dd></div>' +
          '<div><dt class="t-eyebrow">' + esc(t('category')) + '</dt><dd>' + esc(catName) + '</dd></div>' +
          (reviewed ? '<div><dt class="t-eyebrow">' + esc(t('reviewed')) + '</dt><dd>' + esc(reviewed) + '</dd></div>' : '') +
          ((tool.tags || []).length ? '<div><dt class="t-eyebrow">' + esc(t('tags')) + '</dt><dd>' + esc((tool.tags || []).join(' · ')) + '</dd></div>' : '') + '</dl>' +
          (safeUrl ? '<a class="rs-link" href="' + esc(safeUrl) + '" target="_blank" rel="noopener">' + esc(t('pricing')) + ' <span aria-hidden="true">→</span></a>' : '') + '</aside>' +
      '</div></div>' +

      (alts.length ? '<section class="tp-alt" data-section-theme="naranjo" aria-labelledby="tp-alt-h"><div class="rs-wrap"><div class="tp-alt-head"><div><p class="rs-eyebrow t-eyebrow">' + esc(t('keep')) + '</p><h2 class="t-h2" id="tp-alt-h">' + esc(t('alts')(name)) + '</h2></div>' +
        '<a class="rs-link" href="/resources?category=' + encodeURIComponent(tool.category) + '">' + esc(t('seeCat')) + ' <span aria-hidden="true">→</span></a></div>' +
        '<div class="rs-grid">' + alts.map(card).join('') + '</div></div></section>' : '');
  }

  function slugFromPath() {
    var m = location.pathname.match(/\/resources\/tools\/([^/]+?)(?:\.html)?\/?$/);
    return m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('slug');
  }

  window.addEventListener('tellus:lang', function (e) { state.lang = e.detail.lang; render(); });
  try { state.lang = window.TellusShell.lang() === 'es' ? 'es' : 'en'; } catch (e) {}
  fetch('/resources/tools.json').then(function (r) { return r.json(); }).then(function (d) {
    state.data = d;
    var slug = slugFromPath();
    state.tool = d.tools.filter(function (x) { return x.slug === slug; })[0] || null;
    render();
  }).catch(function (err) {
    $('tp-root').innerHTML = '<section class="tp-missing" data-section-theme="teal"><div class="rs-wrap"><h1 class="t-h2">Error</h1><p class="t-lead">Could not load the catalog. Please reload.</p></div></section>';
    console.error('tools.json', err);
  });
})();
