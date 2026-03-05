// ── event listeners ────────────────────────────────────────────────────────

// nav buttons — dialog id is derived from button text content
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => openDialog(btn.textContent.trim()));
});

// close buttons — dialog id is derived from the closest parent dialog
document.querySelectorAll('dialog div button').forEach(btn => {
  btn.addEventListener('click', () => closeDialog(btn.closest('dialog').id));
});

// ESC key — intercepted and rerouted through closeDialog so the fade-out plays
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('cancel', e => {
    e.preventDefault();
    closeDialog(dialog.id);
  });
});

// ── functions ──────────────────────────────────────────────────────────────

function openDialog(id) {
  const dialog = document.getElementById(id);

  // lazy-load the folio grid on the first open of dump
  if (id === 'dump' && !dialog.dataset.loaded) {
    const grid = dialog.querySelector('.folio-grid');
    if (typeof FOLIO_ITEMS !== 'undefined') {
      grid.innerHTML = FOLIO_ITEMS;
      dialog.dataset.loaded = 1;
    } else {
      grid.textContent = 'FAILED TO LOAD';
    }
    grid.ariaBusy = 'false';
  }

  dialog.showModal();

  // blur the auto-focused close button so it doesn't appear highlighted on open
  dialog.querySelector('div button').blur();

  // double rAF ensures the transition fires after display:flex is painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dialog.classList.add('is-visible'));
  });
}

function closeDialog(id) {
  const dialog = document.getElementById(id);

  dialog.classList.remove('is-visible');

  // pause any playing media before the dialog closes
  dialog.querySelectorAll('video, audio').forEach(media => media.pause());

  // duration is read from CSS so JS stays in sync if the value ever changes
  const duration = parseFloat(getComputedStyle(dialog).transitionDuration) * 1000;

  setTimeout(() => {
    dialog.close();
    // clear any lingering focus state on nav buttons
    document.activeElement.blur();
  }, duration);
}

// ── email obfuscation ──────────────────────────────────────────────────────

// the href is built lazily on first interaction — keeps the address out of the DOM
const emailLink = document.querySelector('dialog section a');

if (emailLink) {
  emailLink.tabIndex = 0;

  const buildHref = () => {
    emailLink.href = 'mailto:' + emailLink.dataset.user + '@' + emailLink.dataset.domain;
  };

  emailLink.addEventListener('pointerover', buildHref, { once: true });
  emailLink.addEventListener('focus',       buildHref, { once: true });
}