// Frame behaviour: ⌘K / Ctrl+K focuses the command bar; the current section
// scrolls into view in the phone row; the account menu closes on outside
// click. Everything works without this file; it only adds the shortcuts.
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
