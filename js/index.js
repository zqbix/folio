const dialog   = document.getElementById('reel');
const openBtn  = document.querySelector('.line07');
const closeBtn = dialog.querySelector('header > button');
const video    = dialog.querySelector('video');

function openReel() {
  if (dialog.open) return;
  dialog.showModal();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => dialog.classList.add('is-visible'))
  );
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let isClosing = false;

function closeReel() {
  if (!dialog.open || isClosing) return;
  isClosing = true;
  dialog.classList.remove('is-visible');
  if (reducedMotion) {
    dialog.close();
    video.pause();
    isClosing = false;
  } else {
    dialog.addEventListener('transitionend', () => {
      dialog.close();
      video.pause();
      isClosing = false;
    }, { once: true });
  }
}

openBtn.addEventListener('click', openReel);
closeBtn.addEventListener('click', closeReel);

dialog.addEventListener('click', e => {
  if (e.target === dialog) closeReel();
});

dialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeReel();
});

const emailBtn = document.querySelector('.line09');
const emailEl  = emailBtn.querySelector('span');
emailBtn.setAttribute('aria-label', `send email to ${emailEl.dataset.user}@${emailEl.dataset.domain}`);
emailBtn.addEventListener('click', () => {
  window.location.href = `mailto:${emailEl.dataset.user}@${emailEl.dataset.domain}`;
});