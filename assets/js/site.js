(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const DATA = JSON.parse($('#site-data').textContent);
  const A = DATA.assistant;
  const TEL = '+12502682683';
  const MAIL = A.email || 'info@humblebuilt.ca';

  /* header */
  const bar = $('#bar');
  const onScroll = () => bar.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- the lot: from the ground up ---------- */
  const JOBS = [
    { id: 'clear', g: 'site', t: 'Clearing and rough grading', d: 'Clearing, rough grading and excavation, so the build starts on shaped ground.', img: 'slope-cut', cap: 'Rough grading a slope' },
    { id: 'pad', g: 'site', t: 'Building pad', d: 'Building pads and foundation preparation.', img: 'gravel-pad', cap: 'Gravel pad framed and graded' },
    { id: 'drive', g: 'site', t: 'Driveway', d: 'New driveways and road construction, base preparation and gravel.', img: 'driveway', cap: 'Graded driveway with a mountain view' },
    { id: 'wall', g: 'site', t: 'Retaining wall and drainage', d: 'Rock and lock-block retaining walls, drainage and runoff management.', img: 'wall-backfill', cap: 'Retaining wall backfill work' },
    { id: 'trench', g: 'site', t: 'Water and power trench', d: 'Water, power and service trenching, culverts and underground infrastructure.', img: 'trench', cap: 'Utility trench install' },
    { id: 'septic', g: 'site', t: 'Septic system', d: 'Septic system design and installation, with wastewater engineer coordination. ROWP registered.', img: 'stakes', cap: 'Excavator with building layout stakes' },
    { id: 'pond', g: 'site', t: 'Pond or water feature', d: 'Ponds, grading and terrain shaping.', img: 'pond', cap: 'Excavator beside a rock waterfall feature' },
    { id: 'cabin', g: 'build', t: 'Cabin or addition', d: 'New cabins, additions, and outbuildings built from the ground up.', img: 'cabin-ext', cap: 'Finished cabin exterior' },
    { id: 'deck', g: 'build', t: 'Deck or covered space', d: 'Cedar decks, fences, and outdoor spaces built to last.', img: 'deck', cap: 'Cedar deck with a forest view' },
    { id: 'shed', g: 'build', t: 'Shed or outbuilding', d: 'Sheds and accessory buildings.', img: 'cedar-shed', cap: 'Finished cedar shed' },
    { id: 'reno', g: 'build', t: 'Renovation or finish work', d: 'Interior and exterior renovations, from finish carpentry to full remodels.', img: 'kitchenette', cap: 'Cabin kitchenette interior' }
  ];
  const chosen = new Set(['clear', 'pad', 'drive']);
  const mk = (j) => {
    const l = document.createElement('label'); l.className = 'jb';
    l.innerHTML = `<input type="checkbox" value="${j.id}"${chosen.has(j.id) ? ' checked' : ''}><span>${j.t}</span>`;
    l.querySelector('input').addEventListener('change', (e) => {
      e.target.checked ? chosen.add(j.id) : chosen.delete(j.id);
      if (e.target.checked) showPhoto(j);
      paint();
    });
    return l;
  };
  JOBS.forEach(j => $(j.g === 'site' ? '#jobs-site' : '#jobs-build').appendChild(mk(j)));
  const svg = $('#lot-svg'), mq = matchMedia('(max-width: 640px)');
  const fit = () => svg.setAttribute('viewBox', mq.matches ? '300 150 800 300' : '170 104 1030 336');
  fit(); mq.addEventListener('change', fit);

  const img = $('#order-img'), cap = $('#order-cap');
  function showPhoto(j) {
    img.src = `assets/img/${j.img}-s.webp`; img.alt = j.cap;
    cap.textContent = 'From our own jobs: ' + j.cap.charAt(0).toLowerCase() + j.cap.slice(1);
  }
  function paint() {
    $$('#lot-svg .job').forEach(g => g.classList.toggle('on', chosen.has(g.dataset.job)));
    $$('#lot-svg .tree-z').forEach(g => g.classList.toggle('off', chosen.has('clear')));
    const list = $('#order-list'); list.innerHTML = '';
    JOBS.filter(j => chosen.has(j.id)).forEach(j => {
      const li = document.createElement('li'); li.innerHTML = `<b>${j.t}</b><span>${j.d}</span>`; list.appendChild(li);
    });
    $('#order-empty').hidden = chosen.size > 0;
  }
  paint();

  function brief(f) {
    const jobs = JOBS.filter(j => chosen.has(j.id)).map((j, i) => `${i + 1}. ${j.t}`).join('\n');
    return `Hi Humble Earth,\n\nHere's my project${f.where ? ' at ' + f.where : ''}:\n${jobs || '(not sure yet)'}\n${f.note ? '\nAbout the property: ' + f.note + '\n' : ''}\nCould we talk it through?\n${f.name || ''}`;
  }
  $('#send').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target)); const via = (e.submitter && e.submitter.dataset.via) || 'mail';
    const body = brief(fd);
    if (via === 'sms') location.href = `sms:${TEL}?&body=${encodeURIComponent(body)}`;
    else location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Project' + (fd.where ? ' at ' + fd.where : '') + ' (from the website)')}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- photo rails ---------- */
  $$('.rail-nav button').forEach(b => b.addEventListener('click', () => {
    const r = document.getElementById(b.dataset.rail);
    r.scrollBy({ left: Number(b.dataset.d) * r.clientWidth * 0.8, behavior: 'smooth' });
  }));

  /* ---------- map ---------- */
  const TOWNS = [
    ['Kaslo', 295.9, 97.0], ['Riondel', 332.4, 233.0], ['Crawford Bay', 354.7, 305.5, 1], ['Kootenay Bay', 325.9, 315.5],
    ['Balfour', 268.8, 359.0], ['Nelson', 74.7, 477.8], ['Boswell', 387.1, 512.3], ['Wynndel', 510.0, 758.9], ['Creston', 533.5, 838.7]
  ];
  const NS = 'http://www.w3.org/2000/svg', pins = $('#map-pins'), towns = $('#towns');
  TOWNS.forEach(([n, x, y, home]) => {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pin' + (home ? ' home' : ''));
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', home ? 10 : 7);
    const t = document.createElementNS(NS, 'text'); const left = x > 300 && n !== 'Riondel' && n !== 'Crawford Bay' && n !== 'Boswell';
    t.setAttribute('x', left ? x - 16 : x + 16); t.setAttribute('y', y + 6); t.setAttribute('text-anchor', left ? 'end' : 'start');
    if (n === 'Kootenay Bay') { t.setAttribute('x', x - 14); t.setAttribute('text-anchor', 'end'); t.setAttribute('y', y - 8); }
    if (n === 'Balfour') { t.setAttribute('x', x - 14); t.setAttribute('text-anchor', 'end'); t.setAttribute('y', y + 24); }
    t.textContent = n; g.append(c, t); pins.appendChild(g);
    const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.textContent = n + (home ? ' (home base)' : '');
    if (home) b.classList.add('home');
    const hot = (on) => { g.classList.toggle('hot', on); b.classList.toggle('hot', on); };
    b.addEventListener('mouseenter', () => hot(true)); b.addEventListener('mouseleave', () => hot(false));
    b.addEventListener('focus', () => hot(true)); b.addEventListener('blur', () => hot(false));
    b.addEventListener('click', () => { $$('.pin.hot').forEach(p => p.classList.remove('hot')); hot(true); });
    li.appendChild(b); towns.appendChild(li);
  });

  /* ---------- Ask Humble Earth ---------- */
  const ask = $('#ask'), btn = $('#ask-btn'), log = $('#ask-log');
  const say = (txt, who = 'b', acts) => {
    const m = document.createElement('div'); m.className = 'm ' + who; m.textContent = txt;
    if (acts) { const a = document.createElement('div'); a.className = 'acts'; a.innerHTML = acts; m.appendChild(a); }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  };
  const handoff = (q) => {
    const body = encodeURIComponent(`Hi Humble Earth, ${q ? 'a question from your website: ' + q : 'I have a project to talk through.'}`);
    return `<a href="tel:${TEL}">Call ${A.phone}</a><a href="sms:${TEL}?&body=${body}">Text us</a><a href="mailto:${MAIL}?subject=${encodeURIComponent('Question from the website')}&body=${body}">Email us</a>`;
  };
  const open = (v) => {
    ask.hidden = !v; btn.setAttribute('aria-expanded', v);
    if (v && !log.children.length) say("Hi, this is Humble Earth. Ask about septic, site work, driveways, cabins or where we work, and we'll point you the right way.");
    if (v) $('#ask-in').focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => open(ask.hidden)); $('#ask-x').addEventListener('click', () => open(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !ask.hidden) open(false); });

  const RULES = [
    ['price', /price|cost|how much|quote.*cost|budget|\$|rate|expensive|cheap/],
    ['septic', /septic|wastewater|tank|field|rowp|sewage|perc/],
    ['insured', /insur|licen|worksafe|liabil|bond/],
    ['where', /where|area|town|nelson|kaslo|creston|balfour|boswell|riondel|crawford|wynndel|kootenay|travel|come to|serve/],
    ['quote', /quote|estimate|book|start|hire|schedule|when can|availability|available/],
    ['cabin', /cabin|house|home|build|addition|reno|frame|framing|finish|deck|shed|fence|carpent|kitchen|bath/],
    ['excavation', /excavat|dig|grade|grading|driveway|road|gravel|wall|retain|trench|drain|culvert|pond|pad|foundation|clear|rock|stump|land/],
    ['reviews', /review|good|trust|recommend|rating|google/],
    ['contact', /phone|call|email|contact|number|talk|text/]
  ];
  const ANS = {
    septic: A.septic, insured: A.insured, where: A.where, quote: A.quote, price: A.price, reviews: A.reviews,
    cabin: 'Yes. ' + A.building, excavation: 'We do. ' + A.excavation,
    contact: `Call ${A.phone} or email ${A.email}. We return calls.`
  };
  const reply = (k, q) => {
    if (k === 'quote') { say(ANS.quote, 'b', `<a href="#lot" data-close>Open the planner</a>` + handoff(q)); return; }
    if (ANS[k]) { say(ANS[k], 'b', handoff(q)); return; }
    say("Good question. That one's best answered by the crew, since every property is a little different. Send it over and we'll get back to you.", 'b', handoff(q));
  };
  log.addEventListener('click', e => { if (e.target.matches('[data-close]')) open(false); });
  $$('#ask-quick button').forEach(b => b.addEventListener('click', () => { say(b.textContent, 'u'); reply(b.dataset.k, b.textContent); }));
  $('#ask-form').addEventListener('submit', e => {
    e.preventDefault(); const inp = $('#ask-in'); const q = inp.value.trim(); if (!q) return; inp.value = '';
    say(q, 'u'); const s = q.toLowerCase(); const hit = RULES.find(([, re]) => re.test(s)); reply(hit ? hit[0] : null, q);
  });
})();
