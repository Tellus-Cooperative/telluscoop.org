/* Tellus theme toggle — shared by every page.
   Contract: <html data-theme="dark|light">, persisted in localStorage['tellus-theme'];
   with no stored choice the page follows prefers-color-scheme (live).
   Each page also inlines a tiny <head> snippet that sets data-theme before first
   paint, so this file only wires up [data-theme-toggle] buttons. */
(function () {
  var KEY = 'tellus-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; }
    catch (e) { return null; }
  }
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function label() {
    return /^es\b/i.test(root.getAttribute('lang') || '') ? 'Cambiar a modo oscuro' : 'Switch to dark mode';
  }
  function sync() {
    var pressed = current() === 'dark' ? 'true' : 'false';
    var text = label();
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', pressed);
      buttons[i].setAttribute('aria-label', text);
      buttons[i].setAttribute('title', text);
    }
  }
  function apply(theme) { root.setAttribute('data-theme', theme); sync(); }

  if (root.getAttribute('data-theme') !== 'dark' && root.getAttribute('data-theme') !== 'light') {
    apply(stored() || (mq && mq.matches ? 'dark' : 'light'));
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
    if (!btn) return;
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (err) { /* private mode: still flip for this view */ }
    apply(next);
  });

  if (mq) {
    var follow = function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); };
    if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);
  }

  // Pages that switch language client-side (resources) update <html lang>
  if (window.MutationObserver) new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['lang'] });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
