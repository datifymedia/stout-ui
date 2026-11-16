// Frame behaviour: ⌘K / Ctrl+K focuses the command bar; on a phone the search
// button opens it; the current section scrolls into view in the phone row;
// the account menu closes on outside click. Everything works without this
// file; it only adds the shortcuts (without it the phone form stays open).
(function () {
  'use strict';
  var input = document.querySelector('.frame-command-input');
  if (input) {
    document.addEventListener('keydown', function (event) {
      if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
  }
  var search = document.querySelector('.frame-search');
  var bar = document.querySelector('.frame-bar');
  if (search && bar && input) {
    bar.classList.add('has-search-toggle');
    search.addEventListener('click', function () {
      var open = !bar.classList.contains('is-search-open');
      bar.classList.toggle('is-search-open', open);
      search.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { input.focus(); }
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { bar.classList.remove('is-search-open'); search.setAttribute('aria-expanded', 'false'); search.focus(); }
    });
  }
  var current = document.querySelector('.frame-section[aria-current="page"]');
  if (current && current.scrollIntoView) {
    current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  var account = document.querySelector('.frame-account');
  if (account) {
    document.addEventListener('click', function (event) {
      if (account.open && !account.contains(event.target)) account.open = false;
    });
  }
})();
