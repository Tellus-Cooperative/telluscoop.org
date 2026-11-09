/* Tellus /hub — home link + theme toggle inside the hero's existing notches.
   The hub is a Next.js static export and React hydrates <body>, so nothing may be
   added to its markup before hydration (React #418). We wait until the hero's menu
   button is hydrated, then append (never move) our own nodes:
   - an <a href="/"> covering the top-left logo notch (Tellus logo -> home)
   - "Inicio" + the theme toggle at the start of the top-right menu notch. */
(function () {
  var TOGGLE = '<button type="button" class="theme-toggle" data-theme-toggle aria-pressed="false" aria-label="Cambiar a modo oscuro" title="Cambiar a modo oscuro"><svg class="theme-toggle-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg><svg class="theme-toggle-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg></button>';
  var tries = 0;

  function hydrated(el) {
    for (var k in el) if (k.indexOf('__reactFiber') === 0 || k.indexOf('__reactProps') === 0) return true;
    return false;
  }

  function mount() {
    var menu = document.querySelector('header button[aria-label="Menú"]');
    if (!menu || !hydrated(menu)) {
      if (++tries < 200) return setTimeout(mount, 50);
    }
    if (document.querySelector('.hub-notch-tools')) return;
    var left = document.querySelector('header .absolute.top-0.left-0');
    var right = menu && menu.closest('.absolute.top-0.right-0');

    if (left) {
      var home = document.createElement('a');
      home.href = '/';
      home.className = 'hub-notch-home';
      home.setAttribute('aria-label', 'Tellus Cooperative — inicio');
      left.appendChild(home);
    }
    var tools = document.createElement('div');
    tools.className = 'hub-notch-tools';
    tools.innerHTML = '<a class="hub-notch-link" href="/">Inicio</a>' + TOGGLE;
    if (right) right.insertBefore(tools, right.firstChild);
    else { tools.classList.add('is-floating'); document.body.appendChild(tools); }

    // Let /theme.js sync aria-pressed + label on the new button
    var root = document.documentElement;
    root.setAttribute('lang', root.getAttribute('lang') || 'es');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
