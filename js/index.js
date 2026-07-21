// ── dialog refs ───────────────────────────────────────────────────────────────

const dialog   = document.getElementById('reel');
const openBtn  = document.querySelector('.line07');
const closeBtn = dialog.querySelector('header > button');
const video    = dialog.querySelector('video');

// ── reel open ─────────────────────────────────────────────────────────────────

function openReel() {
  // guard against calling showModal() on an already-open dialog —
  // it throws a DOMException if the dialog is in the open state
  if (dialog.open) return;

  dialog.showModal();

  // double rAF is necessary because the browser needs at least one full
  // render cycle between display:flex appearing (on showModal) and the
  // opacity transition being eligible to fire. a single rAF is not always
  // enough — the double ensures the painted frame is committed before
  // we add .is-visible and trigger the fade-in
  requestAnimationFrame(() =>
    requestAnimationFrame(() => dialog.classList.add('is-visible'))
  );
}

// ── reel close ────────────────────────────────────────────────────────────────

// read once at init — matchMedia().matches is synchronous and stable for
// the lifetime of the page, no need to re-check on every close
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// flag prevents a second closeReel() call from stacking a second
// transitionend listener before the first one fires and clears the dialog —
// without this, rapid double-clicks could leave the dialog in a broken state
let isClosing = false;

function closeReel() {
  if (!dialog.open || isClosing) return;
  isClosing = true;

  dialog.classList.remove('is-visible');

  if (reducedMotion) {
    // skip the transition entirely and close immediately —
    // the opacity transition is killed by the prefers-reduced-motion media
    // query but we still need to explicitly close and reset state
    dialog.close();
    video.pause();
    isClosing = false;
  } else {
    // wait for the opacity fade-out to complete before closing —
    // closing before the transition ends would cause a hard pop.
    // {once:true} auto-removes the listener after it fires, preventing
    // accumulation if closeReel is called multiple times in sequence
    dialog.addEventListener('transitionend', () => {
      dialog.close();
      video.pause();
      isClosing = false;
    }, { once: true });
  }
}

// ── close triggers ────────────────────────────────────────────────────────────

openBtn.addEventListener('click', openReel);
closeBtn.addEventListener('click', closeReel);

// clicking the backdrop (the dialog element itself, not its children)
// closes the dialog — e.target === dialog is true only when the click
// lands directly on the dialog's own area, not on the video or header
dialog.addEventListener('click', e => {
  if (e.target === dialog) closeReel();
});

// 'cancel' fires on Escape key — the browser's default is to call dialog.close()
// immediately, bypassing our fade-out transition. preventDefault stops that,
// then closeReel() handles the close with the proper animation
dialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeReel();
});

// ── easter egg ────────────────────────────────────────────────────────────────

const egg = document.getElementById('egg');

function openEgg() {
  // noopener: prevents the new tab from accessing window.opener (security)
  // noreferrer: suppresses the Referer header so the archive page
  // doesn't see the portfolio URL in its server logs
  window.open('./folio/index.html', '_blank', 'noopener,noreferrer');
}

egg.addEventListener('click', openEgg);

egg.addEventListener('keydown', e => {
  // role="link" conventionally activates on Enter;
  // Space is added here to match button behaviour since the element
  // is visually and functionally more like a button than a link.
  // preventDefault on Space stops the page from scrolling
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openEgg();
  }
});

// arm the hover transition only after greetingFlare has fully settled.
// the transition must not exist during the animation — greetingFlare drives
// color on the parent every frame, and a child color transition would chase
// each inherited frame change, causing a visible strobe on the dot.
// reading duration and delay from computed style rather than hardcoding
// means this automatically adjusts if the animation timing ever changes in CSS
const line01Style = getComputedStyle(document.querySelector('.line01'));
const eggDelay    = (parseFloat(line01Style.animationDuration) + parseFloat(line01Style.animationDelay)) * 1000;
setTimeout(() => egg.classList.add('ready'), eggDelay);

// ── email ─────────────────────────────────────────────────────────────────────

const emailBtn = document.querySelector('.line09');
const emailEl  = emailBtn.querySelector('span');

// aria-label is set here rather than in HTML so it reflects the assembled
// address — the HTML only has split data attributes, not the full email string
emailBtn.setAttribute('aria-label', `send email to ${emailEl.dataset.user}@${emailEl.dataset.domain}`);

// window.location.href opens the mailto in the current tab context rather
// than window.open, which some browsers block as a popup for mailto links
emailBtn.addEventListener('click', () => {
  window.location.href = `mailto:${emailEl.dataset.user}@${emailEl.dataset.domain}`;
});
