const MANIFEST = './index.json';

// ── manifest fetch ────────────────────────────────────────────────────────────

/*
  fetch the JSON manifest that drives the entire grid.
  the manifest is preloaded in HTML so this request is already in flight
  before this script executes — no extra latency from the defer
*/
fetch(MANIFEST)
  .then(r => {
    /*
      r.ok check is necessary because fetch() only rejects on network failure,
      not on HTTP error responses — a 404 resolves successfully without this check
    */
    if (!r.ok) throw new Error(`failed to load index.json (${r.status})`);
    return r.json();
  })
  .then(items => {

    const grid = document.querySelector('.grid');
    /*
      null guard — throws a clear error if the section is missing or renamed
      rather than silently crashing on grid.appendChild later
    */
    if (!grid) throw new Error('grid element not found');

    /*
      <template> is inert — not rendered, not fetched, not parsed as live DOM.
      cloneNode(true) deep-copies the fragment for each item, cleaner than
      manually creating 4 elements per iteration with createElement
    */
    const template = document.getElementById('grid-item').content;

    const THUMBS = './thumbs/';
    const WEB    = './web/';

    /*
      DocumentFragment batches all cell insertions into a single DOM update.
      without it each appendChild would trigger a separate reflow
    */
    const frag = new DocumentFragment();

    for (const { item, title, info } of items) {

      const node = template.cloneNode(true);

      /*
        lastIndexOf is safer than regex for stripping the extension —
        handles filenames with multiple dots correctly (e.g. my.project.mp4)
      */
      const thumb = item.slice(0, item.lastIndexOf('.')) + '.jpg';

      /*
        infoLines computed once — reused for both alt and textContent.
        asterisks in the JSON are the line-break delimiter;
        CSS white-space:pre-wrap renders \n as actual line breaks
      */
      const infoLines = (info  || '').replace(/\*/g, '\n');
      const infoAlt   = infoLines.replace(/\n/g, ' ');

      const link = node.querySelector('a');
      const img  = node.querySelector('img');

      link.href = WEB + item;

      img.src = THUMBS + thumb;
      /*
        alt combines title and cleaned info so screen readers get a
        meaningful description — decoding=async in the template lets
        the browser decode images off the main thread
      */
      img.alt = `${title || ''} — ${infoAlt}`;

      node.querySelector('.title').textContent = title || '';
      node.querySelector('.info').textContent  = infoLines;

      frag.appendChild(node);
    }

    // single DOM insertion — all cells land in one reflow
    grid.appendChild(frag);
  })
  .catch(err => console.error('folio:', err));