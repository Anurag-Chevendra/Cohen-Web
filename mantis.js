/* Mantis page: example dependency graph. Click or press Enter on a package to trace its chain. */
(function () {
  const svg = document.getElementById('mtSvg');
  const spin = document.getElementById('mtSpin');
  if (!svg || !spin) return;

  // Example tree. Every name except the REVIEW one is a well known, clean package.
  const TREE = [
    ['react', '18.3.1', 'clean', [['react-dom', '18.3.1', 'clean'], ['scheduler', '0.23.2', 'clean'], ['loose-envify', '1.4.0', 'clean', [['js-tokens', '4.0.0', 'clean']]]]],
    ['express', '4.21.1', 'clean', [['body-parser', '1.20.3', 'clean'], ['cookie', '0.7.1', 'clean'], ['debug', '2.6.9', 'clean', [['ms', '2.0.0', 'clean']]], ['send', '0.19.0', 'queued', [['mime', '1.6.0', 'clean'], ['ms', '2.1.3', 'clean']]], ['qs', '6.13.0', 'clean'], ['path-to-regexp', '0.1.10', 'clean']]],
    ['axios', '1.7.7', 'clean', [['follow-redirects', '1.15.9', 'clean'], ['form-data', '4.0.1', 'clean'], ['proxy-from-env', '1.1.0', 'clean']]],
    ['polymarket-stake-mathss', '3.3.2', 'review', []],
    ['lodash', '4.17.21', 'clean', []],
    ['webpack', '5.95.0', 'unchecked', [['terser', '5.34.1', 'clean', [['source-map', '0.6.1', 'clean'], ['commander', '2.20.3', 'clean']]], ['acorn', '8.12.1', 'clean'], ['enhanced-resolve', '5.17.1', 'unchecked'], ['watchpack', '2.4.2', 'unchecked'], ['tapable', '2.2.1', 'clean'], ['browserslist', '4.24.0', 'clean']]],
    ['chalk', '5.3.0', 'clean', []],
    ['zod', '3.23.8', 'clean', []],
    ['eslint', '9.12.0', 'unchecked', [['espree', '10.2.0', 'clean'], ['esquery', '1.6.0', 'clean'], ['ajv', '6.12.6', 'clean'], ['minimatch', '3.1.2', 'queued']]]
  ];
  const COL = { clean: '#3FCF8E', review: '#FF2D1F', queued: '#EDEDED', unchecked: '#5A5A60' };
  const LAB = { clean: 'CLEAN', review: 'REVIEW', queued: 'QUEUED', unchecked: 'NOT CHECKED' };
  const RAD = [0, 118, 205, 258], SIZE = [0, 4.5, 3, 2.5], C = 280;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  const nodes = [];
  const add = (t, depth, ang, parent) => {
    const id = nodes.length;
    nodes.push({ id, name: t[0], v: t[1], s: t[2], depth, parent, x: C + RAD[depth] * Math.cos(ang), y: C + RAD[depth] * Math.sin(ang) });
    const kids = t[3] || [], step = depth === 1 ? 0.085 : 0.06;
    kids.forEach((k, i) => add(k, depth + 1, ang + (i - (kids.length - 1) / 2) * step, id));
  };
  TREE.forEach((t, i) => add(t, 1, -Math.PI / 2 + 0.3 + i * 2 * Math.PI / TREE.length, -1));

  // rings
  [1, 2, 3].forEach((d) => el('circle', { cx: C, cy: C, r: RAD[d], fill: 'none', stroke: 'rgba(255,255,255,.13)', 'stroke-dasharray': d === 3 ? '' : '2 5' }, spin));

  // edges
  const edges = nodes.map((n) => {
    const p = n.parent >= 0 ? nodes[n.parent] : { x: C, y: C };
    return el('line', { x1: p.x.toFixed(1), y1: p.y.toFixed(1), x2: n.x.toFixed(1), y2: n.y.toFixed(1) }, spin);
  });

  // nodes
  const rings = [];
  nodes.forEach((n) => {
    const g = el('g', { class: 'mt-n', tabindex: '0', role: 'button', 'aria-label': `${n.name} ${n.v}, ${LAB[n.s].toLowerCase()}, depth ${n.depth}` }, spin);
    el('circle', { class: 'hit', cx: n.x, cy: n.y, r: 11, fill: 'transparent' }, g);
    if (n.s === 'review') {
      el('circle', { class: 'mt-pulse', cx: n.x, cy: n.y, r: 7, fill: 'none', stroke: COL.review, 'stroke-width': 1.2 }, g);
    }
    rings[n.id] = el('circle', { cx: n.x, cy: n.y, r: 10, fill: 'none', stroke: 'rgba(237,237,237,.85)', 'stroke-width': 1.5, visibility: 'hidden' }, g);
    const r = n.s === 'review' ? 5.5 : SIZE[n.depth];
    const dot = el('circle', { class: 'dot', cx: n.x, cy: n.y, r, fill: COL[n.s] }, g);
    if (n.s === 'review') dot.style.filter = 'drop-shadow(0 0 6px rgba(255,45,31,.9))';
    else if (n.s === 'clean' && n.depth === 1) dot.style.filter = 'drop-shadow(0 0 4px rgba(63,207,142,.45))';
    g.addEventListener('click', () => select(n.id));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id); } });
  });

  const $ = (id) => document.getElementById(id);
  function select(id) {
    const sel = nodes[id];
    const chain = [];
    for (let p = sel; p; p = p.parent >= 0 ? nodes[p.parent] : null) chain.unshift(p);
    const on = new Set(chain.map((n) => n.id));

    nodes.forEach((n, i) => {
      const e = edges[i];
      let stroke = n.depth === 1 ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.11)', dash = '', w = 1;
      if (n.s === 'review') stroke = 'rgba(255,45,31,.75)';
      if (on.has(n.id)) { stroke = 'rgba(237,237,237,.9)'; dash = '4 4'; w = 1.5; }
      e.setAttribute('stroke', stroke); e.setAttribute('stroke-width', w); e.setAttribute('stroke-dasharray', dash);
      rings[i].setAttribute('visibility', i === id ? 'visible' : 'hidden');
    });

    $('mtName').innerHTML = '';
    $('mtName').append(sel.name, Object.assign(document.createElement('span'), { textContent: '@' + sel.v }));
    const chip = $('mtChip');
    chip.textContent = LAB[sel.s];
    chip.style.color = sel.s === 'unchecked' ? 'var(--ash)' : COL[sel.s];
    $('mtSub').textContent = `Depth ${sel.depth} · example scan, select any package to trace its chain`;
    const box = $('mtChain');
    box.innerHTML = '';
    box.append(Object.assign(document.createElement('div'), { className: 'root', textContent: 'your-app' }));
    chain.forEach((n, i) => {
      const d = document.createElement('div');
      d.textContent = '↳ ' + n.name;
      d.style.paddingLeft = (i + 1) * 14 + 'px';
      if (n.id === id) d.className = 'me';
      box.append(d);
    });
  }

  select(nodes.find((n) => n.name === 'mime').id);
})();
