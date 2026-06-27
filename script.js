
const rawNodes = [{"id": "00 Главная карта.md", "label": "00 Главная карта", "group": "root"}, {"id": "01 Projects/CRM beauty universal.md", "label": "CRM beauty universal", "group": "01 Projects"}, {"id": "01 Projects/Поддержка малого бизнеса Приморья.md", "label": "Поддержка малого бизнеса Приморья", "group": "01 Projects"}, {"id": "01 Projects/Бизнес-ассистент и презентация бота.md", "label": "Бизнес-ассистент и презентация бота", "group": "01 Projects"}, {"id": "02 Knowledge/Продуктовые принципы Никиты.md", "label": "Продуктовые принципы Никиты", "group": "02 Knowledge"}, {"id": "02 Knowledge/Карта проектов.md", "label": "Карта проектов", "group": "02 Knowledge"}, {"id": "02 Knowledge/Как Hermes использует Obsidian.md", "label": "Как Hermes использует Obsidian", "group": "02 Knowledge"}];
const rawLinks = [{"source": "00 Главная карта.md", "target": "01 Projects/CRM beauty universal.md"}, {"source": "00 Главная карта.md", "target": "01 Projects/Поддержка малого бизнеса Приморья.md"}, {"source": "00 Главная карта.md", "target": "01 Projects/Бизнес-ассистент и презентация бота.md"}, {"source": "00 Главная карта.md", "target": "02 Knowledge/Как Hermes использует Obsidian.md"}, {"source": "00 Главная карта.md", "target": "02 Knowledge/Карта проектов.md"}, {"source": "01 Projects/CRM beauty universal.md", "target": "02 Knowledge/Карта проектов.md"}, {"source": "01 Projects/CRM beauty universal.md", "target": "01 Projects/Поддержка малого бизнеса Приморья.md"}, {"source": "01 Projects/CRM beauty universal.md", "target": "02 Knowledge/Продуктовые принципы Никиты.md"}, {"source": "01 Projects/Поддержка малого бизнеса Приморья.md", "target": "01 Projects/CRM beauty universal.md"}, {"source": "01 Projects/Поддержка малого бизнеса Приморья.md", "target": "01 Projects/Бизнес-ассистент и презентация бота.md"}, {"source": "01 Projects/Поддержка малого бизнеса Приморья.md", "target": "02 Knowledge/Карта проектов.md"}, {"source": "01 Projects/Поддержка малого бизнеса Приморья.md", "target": "02 Knowledge/Продуктовые принципы Никиты.md"}, {"source": "01 Projects/Бизнес-ассистент и презентация бота.md", "target": "01 Projects/Поддержка малого бизнеса Приморья.md"}, {"source": "01 Projects/Бизнес-ассистент и презентация бота.md", "target": "02 Knowledge/Карта проектов.md"}, {"source": "02 Knowledge/Карта проектов.md", "target": "01 Projects/CRM beauty universal.md"}, {"source": "02 Knowledge/Карта проектов.md", "target": "01 Projects/Поддержка малого бизнеса Приморья.md"}, {"source": "02 Knowledge/Карта проектов.md", "target": "01 Projects/Бизнес-ассистент и презентация бота.md"}, {"source": "02 Knowledge/Карта проектов.md", "target": "02 Knowledge/Как Hermes использует Obsidian.md"}, {"source": "02 Knowledge/Карта проектов.md", "target": "02 Knowledge/Продуктовые принципы Никиты.md"}];
const color = {root:'#7dd3fc','01 Projects':'#f0abfc','02 Knowledge':'#86efac'};
const svg = document.getElementById('svg');
const vp = document.getElementById('viewport');
const linksG = document.getElementById('links');
const nodesG = document.getElementById('nodes');
const stage = document.getElementById('stage');
const panel = document.getElementById('panel');
let W = Math.max(stage.clientWidth, 360);
let H = Math.max(stage.clientHeight, 420);
let scale = 1;
let tx = W / 2;
let ty = H / 2;
let running = true;
const nodes = rawNodes.map((n, i) => {
  const a = 2 * Math.PI * i / rawNodes.length - Math.PI / 2;
  const radius = n.group === 'root' ? 0 : (n.group === '01 Projects' ? 190 : 255);
  return {...n, x: Math.cos(a) * radius, y: Math.sin(a) * radius, vx: 0, vy: 0, fx: null, fy: null};
});
const byId = new Map(nodes.map(n => [n.id, n]));
const links = rawLinks.map(l => ({source: byId.get(l.source), target: byId.get(l.target)})).filter(l => l.source && l.target);
function setView() { vp.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`); }
function makeSvg(tag, attrs = {}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
function wrapLabel(text, max = 24) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
const linkEls = links.map(l => {
  const e = makeSvg('line', {stroke:'rgba(255,255,255,.30)','stroke-width':'2.2'});
  linksG.appendChild(e); return e;
});
const nodeEls = nodes.map(n => {
  const g = makeSvg('g'); g.classList.add('node'); g.style.cursor = 'grab';
  const r = n.group === 'root' ? 30 : 24;
  g.appendChild(makeSvg('circle', {r, fill: color[n.group] || '#ddd', stroke:'#fff', 'stroke-width':2}));
  const lines = wrapLabel(n.label);
  lines.forEach((line, idx) => {
    const t = makeSvg('text', {x:r+9, y: idx === 0 ? 5 : 5 + idx * 17, fill:'#eef3ff', 'font-size':13, 'font-family':'Inter,Arial,sans-serif', 'paint-order':'stroke', stroke:'#070b18', 'stroke-width':4});
    t.textContent = line; g.appendChild(t);
  });
  g.addEventListener('pointerdown', ev => startDragNode(ev, n, g));
  g.addEventListener('click', ev => { ev.stopPropagation(); selectNode(n); });
  nodesG.appendChild(g); return g;
});
function selectNode(n) {
  const connected = links.filter(l => l.source === n || l.target === n).map(l => (l.source === n ? l.target : l.source).label);
  panel.innerHTML = `<h2>${n.label}</h2><p><b>Файл:</b> ${n.id}</p><p><b>Тип:</b> ${n.group === 'root' ? 'главная карта' : n.group}</p><p><b>Связи:</b> ${connected.length ? connected.join(', ') : 'нет'}</p><div class="legend"><span class="pill"><i class="dot" style="background:${color[n.group] || '#ddd'}"></i>${n.group}</span></div>`;
}
function render() {
  links.forEach((l, i) => {
    linkEls[i].setAttribute('x1', l.source.x); linkEls[i].setAttribute('y1', l.source.y);
    linkEls[i].setAttribute('x2', l.target.x); linkEls[i].setAttribute('y2', l.target.y);
  });
  nodes.forEach((n, i) => nodeEls[i].setAttribute('transform', `translate(${n.x},${n.y})`));
}
function physics() {
  if (running) {
    for (let step = 0; step < 2; step++) {
      for (const n of nodes) { n.vx *= 0.88; n.vy *= 0.88; }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]; let dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy + 0.1; const d = Math.sqrt(d2); const f = 5200 / d2;
        dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
      for (const l of links) {
        const a = l.source, b = l.target; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 155) * 0.012; dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
      for (const n of nodes) {
        n.vx += -n.x * 0.0015; n.vy += -n.y * 0.0015;
        if (n.fx !== null) { n.x = n.fx; n.y = n.fy; } else { n.x += n.vx; n.y += n.vy; }
      }
    }
  }
  render(); requestAnimationFrame(physics);
}
function screenToWorld(x, y) { return {x:(x - tx) / scale, y:(y - ty) / scale}; }
let dragging = null;
function startDragNode(ev, n, g) {
  ev.preventDefault(); ev.stopPropagation(); g.setPointerCapture(ev.pointerId); dragging = {id: ev.pointerId, n, g}; g.style.cursor = 'grabbing';
  const move = e => { if (!dragging || e.pointerId !== dragging.id) return; const p = screenToWorld(e.clientX, e.clientY); n.fx = p.x; n.fy = p.y; };
  const up = e => { if (!dragging || e.pointerId !== dragging.id) return; n.fx = null; n.fy = null; g.style.cursor = 'grab'; g.releasePointerCapture(e.pointerId); dragging = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
}
const pointers = new Map(); let panStart = null; let pinchStart = null;
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('.node')) return;
  stage.setPointerCapture(e.pointerId); pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (pointers.size === 1) panStart = {x:e.clientX, y:e.clientY, tx, ty};
  if (pointers.size === 2) { const a = [...pointers.values()]; pinchStart = {d: Math.hypot(a[0].x-a[1].x, a[0].y-a[1].y), scale}; }
});
stage.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (pointers.size === 1 && panStart) { tx = panStart.tx + e.clientX - panStart.x; ty = panStart.ty + e.clientY - panStart.y; setView(); }
  if (pointers.size === 2 && pinchStart) { const a = [...pointers.values()]; const d = Math.hypot(a[0].x-a[1].x, a[0].y-a[1].y); scale = Math.max(.35, Math.min(3.5, pinchStart.scale * d / pinchStart.d)); setView(); }
});
function endPointer(e) { pointers.delete(e.pointerId); panStart = null; pinchStart = null; }
stage.addEventListener('pointerup', endPointer); stage.addEventListener('pointercancel', endPointer);
svg.addEventListener('wheel', e => {
  e.preventDefault(); const old = scale; const ns = Math.max(.35, Math.min(3.5, scale * (e.deltaY < 0 ? 1.12 : .88)));
  const wx = (e.clientX - tx) / old, wy = (e.clientY - ty) / old; scale = ns; tx = e.clientX - wx * scale; ty = e.clientY - wy * scale; setView();
}, {passive:false});
document.getElementById('fit').onclick = () => { W = Math.max(stage.clientWidth, 360); H = Math.max(stage.clientHeight, 420); scale = Math.min(W, H) / 760; tx = W / 2; ty = H / 2; setView(); };
document.getElementById('shake').onclick = () => { running = true; for (const n of nodes) { n.vx += (Math.random() - .5) * 18; n.vy += (Math.random() - .5) * 18; } };
document.getElementById('freeze').onclick = () => { running = !running; document.getElementById('freeze').textContent = running ? 'Пауза' : 'Продолжить'; };
window.addEventListener('resize', () => { W = Math.max(stage.clientWidth, 360); H = Math.max(stage.clientHeight, 420); });
document.getElementById('fit').click(); render(); physics();
