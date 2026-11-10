/* Aurora Estética — interactions */
(() => {
  const WA_NUMBER = '351900000000';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- WhatsApp links (prefilled message per CTA) ---------- */
  $$('[data-wa]').forEach(a => {
    a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(a.dataset.wa)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Split headings into words ---------- */
  $$('.split').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.innerHTML = `<span style="--i:${i++}">${part}</span>`;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- Loader ---------- */
  const finishLoading = () => {
    document.body.classList.add('loaded');
    document.body.classList.remove('is-loading');
    setTimeout(() => $('.loader')?.remove(), 1400);
    observeReveals();
  };
  const minTime = reduced ? 0 : 2300;
  const start = performance.now();
  const done = () => setTimeout(finishLoading, Math.max(0, minTime - (performance.now() - start)));
  if (document.readyState === 'complete') done(); else window.addEventListener('load', done);
  setTimeout(() => { if (!document.body.classList.contains('loaded')) finishLoading(); }, 5000);

  /* ---------- Reveal on scroll ---------- */
  function observeReveals() {
    if (observeReveals.ran) return;
    observeReveals.ran = true;
    // Position check instead of IntersectionObserver: clipped elements (clip-path: inset(100%))
    // don't reliably report intersections, which left images hidden.
    let pending = $$('.reveal, .reveal-img, .split');
    let queued = false;
    const check = () => {
      queued = false;
      const vh = innerHeight;
      pending = pending.filter(el => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0 || r.bottom <= 0) { el.classList.add('in'); return false; }
        return true;
      });
      if (!pending.length) { removeEventListener('scroll', queue); removeEventListener('resize', queue); }
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    check();
  }

  /* ---------- Nav: scrolled / hide on scroll down / progress ---------- */
  const nav = $('.nav');
  const bar = $('.progress span');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > lastY && y > 500 && !document.body.classList.contains('menu-open'));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // active link
  const links = $$('.nav__links a');
  const secIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.getAttribute('href')); if (s) secIO.observe(s); });

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const menu = $('.menu');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeLightbox(); } });

  /* ---------- Mouse parallax in hero ---------- */
  if (finePointer && !reduced) {
    const hero = $('.hero');
    const layers = $$('[data-depth]', hero);
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5;
      ty = (e.clientY - r.top) / r.height - .5;
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const tick = () => {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      layers.forEach(l => {
        const d = +l.dataset.depth;
        l.style.translate = `${cx * d * 2}px ${cy * d * 2}px`;
      });
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * .18}px, ${y * .3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Services: filter tabs ---------- */
  const tabs = $$('.tab');
  const pill = $('.tab__pill');
  const movePill = t => {
    pill.style.width = `${t.offsetWidth}px`;
    pill.style.transform = `translateX(${t.offsetLeft}px)`;
  };
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
    movePill(t);
    const f = t.dataset.filter;
    $$('.svc').forEach(s => {
      const show = f === 'all' || s.dataset.cat === f;
      s.classList.toggle('is-hidden', !show);
      if (show && !reduced) s.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.22,.9,.24,1)' });
    });
  }));
  const initPill = () => movePill($('.tab.is-active'));
  addEventListener('resize', initPill);
  document.fonts?.ready.then(initPill);
  initPill();

  // thumbnails for the compact (mobile) layout
  $$('.svc').forEach(s => {
    const t = document.createElement('span');
    t.className = 'svc__thumb';
    t.style.backgroundImage = `url("${s.dataset.img.replace('w=700', 'w=240')}")`;
    s.prepend(t);
  });

  // whole row opens WhatsApp
  $$('.svc').forEach(s => s.addEventListener('click', e => {
    if (e.target.closest('.svc__cta')) return;
    $('.svc__cta', s).click();
  }));

  /* ---------- Services: cursor-following image preview ---------- */
  if (finePointer && !reduced) {
    const prev = $('.svc-preview');
    const img = $('.svc-preview__img');
    let mx = 0, my = 0, px = 0, py = 0, active = false;
    $$('.svc').forEach(s => {
      new Image().src = s.dataset.img;
      s.addEventListener('pointerenter', () => { img.style.backgroundImage = `url("${s.dataset.img}")`; prev.classList.add('on'); active = true; });
      s.addEventListener('pointerleave', () => { prev.classList.remove('on'); active = false; });
    });
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
    const loop = () => {
      px += (mx - px) * .14; py += (my - py) * .14;
      const rot = Math.max(-10, Math.min(10, (mx - px) * .15));
      prev.style.transform = `translate3d(${px + 40}px, ${py - 175}px, 0) rotate(${rot}deg) scale(${active ? 1 : .6})`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Before / After slider ---------- */
  const ba = $('[data-ba]');
  const range = $('.ba__range', ba);
  const setPos = v => ba.style.setProperty('--pos', `${v}%`);
  range.addEventListener('input', () => setPos(range.value));

  // gentle intro sweep when it comes into view
  new IntersectionObserver((entries, o) => {
    if (!entries[0].isIntersecting || reduced) return;
    o.disconnect();
    const t0 = performance.now();
    const sweep = t => {
      const p = Math.min(1, (t - t0) / 2200);
      const v = 50 + Math.sin(p * Math.PI * 2) * 28 * (1 - p);
      setPos(v); range.value = v;
      if (p < 1) requestAnimationFrame(sweep);
    };
    setTimeout(() => requestAnimationFrame(sweep), 600);
  }, { threshold: .5 }).observe(ba);

  const cases = [
    { img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&q=80&auto=format&fit=crop', pos: '50% 30%' },
    { img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1400&q=80&auto=format&fit=crop', pos: '50% 50%' },
    { img: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1400&q=80&auto=format&fit=crop', pos: '50% 50%' }
  ];
  cases.forEach(c => { new Image().src = c.img; });
  $$('.ba-case').forEach(btn => btn.addEventListener('click', () => {
    if (btn.classList.contains('is-active')) return;
    $$('.ba-case').forEach(b => b.classList.toggle('is-active', b === btn));
    const c = cases[+btn.dataset.case];
    ba.classList.add('is-swapping');
    setTimeout(() => {
      $$('.ba__img', ba).forEach(i => { i.src = c.img; i.style.objectPosition = c.pos; });
      setPos(50); range.value = 50;
      ba.classList.remove('is-swapping');
    }, 450);
  }));

  /* ---------- Gallery lightbox ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<button aria-label="Fechar">×</button><img alt="">';
  document.body.appendChild(lb);
  const lbImg = $('img', lb);
  function closeLightbox() { lb.classList.remove('on'); }
  $$('.g img').forEach(i => i.addEventListener('click', () => {
    lbImg.src = i.src.replace(/w=\d+/, 'w=1600');
    lbImg.alt = i.alt;
    lb.classList.add('on');
  }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLightbox(); });

  /* ---------- Reviews carousel ---------- */
  const track = $('.reviews__track');
  const cards = $$('.review', track);
  let idx = 0;
  const step = () => cards[0].offsetWidth + 20;
  const maxIdx = () => {
    const vp = track.parentElement.offsetWidth;
    return Math.max(0, cards.length - Math.floor((vp + 20) / step()));
  };
  const go = n => {
    const m = maxIdx();
    idx = n > m ? 0 : n < 0 ? m : n;
    track.style.transform = `translateX(${-idx * step()}px)`;
  };
  $$('[data-rev]').forEach(b => b.addEventListener('click', () => { go(idx + +b.dataset.rev); restart(); }));
  let timer;
  const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(idx + 1), 5500); };
  restart();
  addEventListener('resize', () => go(idx));
  // swipe
  let sx = null;
  track.addEventListener('pointerdown', e => { sx = e.clientX; });
  addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
  });

  /* ---------- Opening hours: live open/closed (Lisbon time) ---------- */
  const hours = { 0: null, 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [8, 18] };
  const lisbon = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, h: +get('hour') % 24 + +get('minute') / 60 };
  };
  const nextOpen = day => {
    for (let k = 1; k <= 7; k++) {
      const d = (day + k) % 7;
      if (hours[d]) return { d, at: hours[d][0], tomorrow: k === 1 };
    }
  };
  const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const pad = n => `${String(Math.floor(n)).padStart(2, '0')}:00`;
  const updateStatus = () => {
    const { day, h } = lisbon();
    const today = hours[day];
    const open = today && h >= today[0] && h < today[1];
    let label, short;
    let sub;
    if (open) { label = `Aberto agora · até às ${pad(today[1])}`; short = 'Aberto'; sub = `hoje até<br>às ${pad(today[1])}`; }
    else if (today && h < today[0]) { label = `Abre hoje às ${pad(today[0])}`; short = 'Hoje'; sub = `abrimos<br>às ${pad(today[0])}`; }
    else { const n = nextOpen(day); label = `Fechado · abre ${n.tomorrow ? 'amanhã' : dayNames[n.d]} às ${pad(n.at)}`; short = 'Fechado'; sub = `abrimos ${n.tomorrow ? 'amanhã' : dayNames[n.d]}<br>às ${pad(n.at)}`; }

    const st = $('[data-status]');
    st.textContent = label;
    st.className = `status ${open ? 'open' : 'closed'}`;
    $$('.hours tr').forEach(tr => tr.classList.toggle('today', +tr.dataset.day === day));

    const badge = $('[data-open-badge]');
    badge.textContent = short;
    badge.classList.toggle('open', open);
    $('[data-open-text]').innerHTML = sub;
  };
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Floating WhatsApp bubble ---------- */
  const wa = $('.wa-float');
  let bubbleDismissed = false;
  setTimeout(() => { if (!bubbleDismissed) wa.classList.add('show-bubble'); }, 6000);
  $('.wa-float__close').addEventListener('click', () => { bubbleDismissed = true; wa.classList.remove('show-bubble'); });

  /* ---------- Year ---------- */
  $('[data-year]').textContent = new Date().getFullYear();
})();
