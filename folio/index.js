fetch('./index.json')
  .then(r => r.json())
  .then(items => {
    const grid = document.querySelector('.folio-grid');

    items.forEach(({ item, slug, title, ext, info }) => {
      const btn = document.createElement('button');
      btn.type = 'button';

      const img = document.createElement('img');
      img.src    = `./thumbs/${item}-${slug}.jpg`;
      img.alt    = `${title} — ${info.replace(/\*/g, ' ')}`;
      img.loading = 'lazy';

      const pTitle = document.createElement('p');
      pTitle.className   = 'title';
      pTitle.textContent = title;

      const pInfo = document.createElement('p');
      pInfo.className   = 'info';
      pInfo.textContent = info.replace(/\*/g, '\n');

      btn.append(img, pTitle, pInfo);

      btn.addEventListener('click', () => {
        window.open(`./web/${item}-${slug}.${ext}`, '_blank', 'noopener,noreferrer');
      });

      grid.appendChild(btn);
    });
  });
