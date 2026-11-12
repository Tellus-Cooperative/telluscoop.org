/* Tellus Resources directory (/resources). Plain JS. All numbers come from /resources/tools.json at runtime. */
(function () {
  'use strict';
  var UI = {
    es: {
      title: 'Tellus Resources · La parte gratis de internet',
      eyebrow: 'Directorio para developers',
      h1: 'La parte <em>gratis</em> de internet',
      lede: 'Construí más. Gastá menos. Catálogo curado por Tellus Cooperative de productos con planes gratuitos genuinamente útiles para developers, makers y equipos pequeños.',
      statTools: 'Recursos', statCats: 'Categorías', statRec: 'Recomendados', statNoCard: 'Sin tarjeta',
      search: 'Buscar por nombre, tag o categoría…', all: 'Todos los recursos', onlyRec: 'Solo recomendados', recommended: 'Recomendado',
      one: 'resultado', many: 'resultados', empty: 'No encontramos herramientas con esa búsqueda. Probá con otro término.',
      side: 'Explora por categoría',
      suggest: '¿Conocés una herramienta con un plan gratuito genuino que deberíamos sumar? Contanos y la evaluamos.', suggestLink: 'Sugerir herramienta',
      allCats: function (n) { return 'Las ' + n + ' categorías'; }, fewerCats: 'Menos categorías',
      page: 'Página', pagination: 'Paginación',
      faqEyebrow: 'Preguntas frecuentes', faqTitle: 'Antes de que preguntes',
      faq: [
        ['¿Todas estas herramientas son completamente gratis?', 'Todos los productos ofrecen una capa gratuita útil, aunque puede tener límites de uso, almacenamiento o equipo. No es lo mismo que un producto gratuito sin límites.'],
        ['¿Cómo elegimos qué aparece en el listado?', 'Priorizamos herramientas fiables con un plan gratuito que sea realmente útil para construir, aprender o lanzar un proyecto real.'],
        ['¿Puedo usar estos servicios en producción?', 'A menudo sí, especialmente en aplicaciones pequeñas. Comprobá límites, soporte, ubicación de datos y costes de ampliación antes de depender de un plan gratuito.'],
        ['¿Cada cuánto se revisa el directorio?', 'Revisamos el catálogo regularmente, agregamos descubrimientos útiles y retiramos productos cuya oferta gratuita deja de ser relevante.'],
        ['¿Por qué está en dos idiomas?', 'Las buenas herramientas para developers deberían ser fáciles de descubrir en inglés y en español. Este directorio es un aporte de Tellus Cooperative a la comunidad de builders.']
      ]
    },
    en: {
      title: 'Tellus Resources · The free part of the internet',
      eyebrow: 'Directory for developers',
      h1: 'The <em>free</em> part of the internet',
      lede: 'Build more. Spend less. A curated catalog by Tellus Cooperative of products with genuinely useful free tiers for developers, makers and small teams.',
      statTools: 'Resources', statCats: 'Categories', statRec: 'Recommended', statNoCard: 'No card needed',
      search: 'Search by name, tag or category…', all: 'All resources', onlyRec: 'Recommended only', recommended: 'Recommended',
      one: 'result', many: 'results', empty: "We couldn't find any tools for that search. Try another term.",
      side: 'Explore by category',
      suggest: "Know a tool with a genuinely useful free tier we should add? Tell us and we'll take a look.", suggestLink: 'Suggest a tool',
      allCats: function (n) { return 'All ' + n + ' categories'; }, fewerCats: 'Fewer categories',
      page: 'Page', pagination: 'Pagination',
      faqEyebrow: 'Frequently asked questions', faqTitle: 'Before you ask',
      faq: [
        ['Are all these tools completely free?', 'Every product listed offers a useful free tier, but it may include usage, storage or team limits. It is not the same as an unlimited free product.'],
        ['How do you choose what gets listed?', 'We prioritize reliable tools with a free plan that is genuinely useful for building, learning or launching a real project.'],
        ['Can I use these services in production?', 'Often yes, especially for small apps. Check current limits, support, data location and upgrade costs with the provider before making a production decision.'],
        ['How often is the directory reviewed?', 'We review the catalog regularly, add useful discoveries and remove products whose free offer is no longer relevant.'],
        ['Why is this available in two languages?', "Great developer tools should be easy to discover in both English and Spanish. This directory is Tellus Cooperative's contribution to the builder community."]
      ]
    }
  };

  var state = { lang: 'en', query: '', category: 'all', onlyRec: false, page: 1, catsOpen: false, data: null };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var t = function (k) { return UI[state.lang][k]; };
  var pageSize = function () { return window.innerWidth < 768 ? 6 : 12; };
  var mobileChips = 6;

  function lang() { try { return window.TellusShell ? window.TellusShell.lang() : 'en'; } catch (e) { return 'en'; } }
  function catLabel(c) { return state.lang === 'es' ? c.label_es : c.label_en; }
  function pick(tool, base) { return tool[base + '_' + state.lang] || tool[base + '_en']; }

  function renderStatic() {
    document.documentElement.lang = state.lang;
    document.title = t('title');
    $('rs-eyebrow').textContent = t('eyebrow');
    $('rs-h1').innerHTML = t('h1');
    $('rs-lede').textContent = t('lede');
    $('stat-tools-l').textContent = t('statTools'); $('stat-cats-l').textContent = t('statCats');
    $('stat-rec-l').textContent = t('statRec'); $('stat-nocard-l').textContent = t('statNoCard');
    $('rs-search').placeholder = t('search'); $('rs-search').setAttribute('aria-label', t('search'));
    $('rs-switch-l').textContent = t('onlyRec');
    $('rs-side-title').textContent = t('side');
    $('rs-empty').textContent = t('empty');
    $('rs-pager').setAttribute('aria-label', t('pagination'));
    $('rs-faq-eyebrow').textContent = t('faqEyebrow'); $('rs-faq-h').textContent = t('faqTitle');
    var suggest = '<p class="t-body-m">' + esc(t('suggest')) + '</p><a class="rs-link" href="mailto:hola@telluscoop.org?subject=' + encodeURIComponent(t('suggestLink')) + '">' + esc(t('suggestLink')) + ' <span aria-hidden="true">→</span></a>';
    $('rs-suggest-side').innerHTML = suggest; $('rs-suggest-below').innerHTML = suggest;
    // FAQ: native <details>; keep open state across language switches
    var open = [].map.call(document.querySelectorAll('#rs-faq-list details'), function (d) { return d.open; });
    $('rs-faq-list').innerHTML = t('faq').map(function (f, i) {
      var isOpen = open.length ? open[i] : i === 0;
      return '<details' + (isOpen ? ' open' : '') + '><summary>' + esc(f[0]) + '</summary><p class="t-body-m">' + esc(f[1]) + '</p></details>';
    }).join('');
  }

  function stats() {
    var d = state.data; if (!d) return;
    $('stat-tools').textContent = d.tools.length;
    $('stat-cats').textContent = d.categories.length;
    $('stat-rec').textContent = d.tools.filter(function (x) { return x.recommended; }).length;
    $('stat-nocard').textContent = d.tools.filter(function (x) { return x.no_card; }).length;
  }

  function filtered() {
    var q = state.query.trim().toLowerCase();
    return state.data.tools.filter(function (tool) {
      if (state.category !== 'all' && tool.category !== state.category) return false;
      if (state.onlyRec && !tool.recommended) return false;
      if (!q) return true;
      return [tool.name, tool.description_es, tool.description_en, tool.category, (tool.tags || []).join(' ')].join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderCategories() {
    var d = state.data, counts = { all: d.tools.length };
    d.tools.forEach(function (x) { counts[x.category] = (counts[x.category] || 0) + 1; });
    var items = [{ id: 'all', label: t('all') }].concat(d.categories.map(function (c) { return { id: c.id, label: catLabel(c) }; }));
    $('rs-cat-list').innerHTML = items.map(function (c) {
      return '<button type="button" class="rs-cat" data-cat="' + esc(c.id) + '" aria-pressed="' + (state.category === c.id) + '"><span>' + esc(c.label) + '</span><span class="n">' + counts[c.id] + '</span></button>';
    }).join('');
    var shown = state.catsOpen ? items : items.slice(0, mobileChips);
    if (!state.catsOpen && state.category !== 'all' && items.slice(0, mobileChips).every(function (c) { return c.id !== state.category; })) {
      shown = items.slice(0, mobileChips - 1).concat(items.filter(function (c) { return c.id === state.category; }));
    }
    $('rs-chips').innerHTML = shown.map(function (c) {
      return '<button type="button" class="rs-chip" data-cat="' + esc(c.id) + '" aria-pressed="' + (state.category === c.id) + '">' + esc(c.label) + ' · ' + counts[c.id] + '</button>';
    }).join('');
    var more = $('rs-chips-more');
    more.setAttribute('aria-expanded', String(state.catsOpen));
    more.innerHTML = esc(state.catsOpen ? t('fewerCats') : t('allCats')(d.categories.length)) + ' <span aria-hidden="true">→</span>';
  }

  function renderGrid() {
    var list = filtered(), size = pageSize(), pages = Math.max(1, Math.ceil(list.length / size));
    if (state.page > pages) state.page = pages;
    var slice = list.slice((state.page - 1) * size, state.page * size);
    $('rs-count').textContent = list.length + ' ' + (list.length === 1 ? t('one') : t('many'));
    $('rs-empty').hidden = list.length > 0;
    $('rs-grid').innerHTML = slice.map(function (tool) {
      var tags = (tool.tags || []).slice(0, 3).map(function (g) { return '<span class="rs-tag">' + esc(g) + '</span>'; }).join('');
      return '<a class="rs-card" href="/resources/tools/' + encodeURIComponent(tool.slug) + '"><div class="rs-card-head">' +
        (tool.recommended ? '<span class="rs-badge">' + esc(t('recommended')) + '</span>' : '') +
        '<h3 class="rs-card-name t-h4">' + esc(tool.name) + '</h3></div>' +
        '<p class="rs-card-desc t-body-m">' + esc(pick(tool, 'description')) + '</p>' +
        '<p class="rs-card-plan t-eyebrow">' + esc(pick(tool, 'free_tier_note')) + '</p>' +
        '<p class="rs-card-detail t-body-s">' + esc(pick(tool, 'free_tier_detail')) + '</p>' +
        '<div class="rs-tags">' + tags + '</div></a>';
    }).join('');
    renderPager(pages);
  }

  function renderPager(pages) {
    var p = $('rs-pager');
    p.hidden = pages <= 1;
    if (pages <= 1) { p.innerHTML = ''; return; }
    var nums = [], cur = state.page;
    for (var i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 1) nums.push(i);
    var html = '', last = 0;
    nums.forEach(function (n) {
      if (last && n - last > 1) html += '<span class="gap" aria-hidden="true">…</span>';
      html += '<button type="button" data-page="' + n + '" aria-label="' + esc(t('page') + ' ' + n) + '"' + (n === cur ? ' aria-current="page"' : '') + '>' + n + '</button>';
      last = n;
    });
    p.innerHTML = html;
  }

  function renderAll() { renderStatic(); stats(); if (state.data) { renderCategories(); renderGrid(); } }

  // events
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-cat]');
    if (c) { state.category = c.getAttribute('data-cat'); state.page = 1; renderCategories(); renderGrid(); return; }
    var pg = e.target.closest && e.target.closest('[data-page]');
    if (pg) {
      state.page = parseInt(pg.getAttribute('data-page'), 10); renderGrid();
      var h = $('rs-count'); if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start' });
      var again = document.querySelector('#rs-pager [aria-current="page"]'); if (again) again.focus();
    }
  });
  $('rs-switch').addEventListener('click', function () {
    state.onlyRec = !state.onlyRec; state.page = 1; this.setAttribute('aria-checked', String(state.onlyRec)); if (state.data) renderGrid();
  });
  $('rs-chips-more').addEventListener('click', function () { state.catsOpen = !state.catsOpen; if (state.data) renderCategories(); });
  var timer;
  $('rs-search').addEventListener('input', function (e) {
    state.query = e.target.value; clearTimeout(timer);
    timer = setTimeout(function () { state.page = 1; if (state.data) renderGrid(); }, 140);
  });
  var lastSize = pageSize();
  window.addEventListener('resize', function () { var s = pageSize(); if (s !== lastSize) { lastSize = s; state.page = 1; if (state.data) renderGrid(); } });
  window.addEventListener('tellus:lang', function (e) { state.lang = e.detail.lang; renderAll(); });

  // init
  state.lang = lang() === 'es' ? 'es' : 'en';
  try { var c0 = new URLSearchParams(location.search).get('category'); if (c0) state.category = c0; } catch (e) {}
  renderStatic();
  fetch('/resources/tools.json').then(function (r) { return r.json(); }).then(function (d) {
    state.data = d;
    if (state.category !== 'all' && !d.categories.some(function (c) { return c.id === state.category; })) state.category = 'all';
    renderAll();
  }).catch(function (err) {
    $('rs-empty').hidden = false; $('rs-empty').textContent = 'Could not load the catalog. Please reload.'; console.error('tools.json', err);
  });
})();
