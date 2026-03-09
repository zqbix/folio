const MANIFEST = './index.json';

fetch(MANIFEST)
  .then(r => {
    if (!r.ok) throw new Error(`failed to load index.json (${r.status})`);
    return r.json();
  })
  .then(items => {

    const grid = document.querySelector('.grid');
    if (!grid) throw new Error('grid element not found');

    const template = document.getElementById('grid-item').content;

    const THUMBS = './thumbs/';
    const WEB    = './web/';

    const frag = new DocumentFragment();

    for (const { item, title, info } of items) {

      const node  = template.cloneNode(true);
      const thumb = item.slice(0, item.lastIndexOf('.')) + '.jpg';

      const infoLines = (info  || '').replace(/\*/g, '\n');
      const infoAlt   = infoLines.replace(/\n/g, ' ');

      const link = node.querySelector('a');
      const img  = node.querySelector('img');

      link.href = WEB + item;
      img.src   = THUMBS + thumb;
      img.alt   = `${title || ''} — ${infoAlt}`;

      node.querySelector('.title').textContent = title || '';
      node.querySelector('.info').textContent  = infoLines;

      frag.appendChild(node);
    }

    grid.appendChild(frag);
  })
  .catch(err => console.error('folio:', err));
