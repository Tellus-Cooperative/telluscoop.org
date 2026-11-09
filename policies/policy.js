// Marks the section currently in view in the table of contents.
(function () {
  var toc = document.querySelector('.pol-toc');
  if (!toc) return;

  var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });

  function activate(index) {
    links.forEach(function (a, i) {
      a.classList.toggle('is-active', i === index);
      if (i === index) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  function update() {
    var doc = document.documentElement;
    // At the very bottom the last sections can never reach the reading line
    if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) return activate(sections.length - 1);
    var line = window.innerHeight * 0.3;
    var current = 0;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    activate(current);
  }

  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
