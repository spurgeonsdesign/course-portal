// Showcase data. Swap these for real data when wiring up the back end.
const PROGRAMMES = [
  { name: 'Parents Connect Courses', art: 'prog-parents-connect.svg', theme: 'purple', courses: ['Teen Years', 'Primary Years', 'Neurodiversity'] },
  { name: 'Parenting After Separation', art: 'prog-separation.svg', theme: 'navy', courses: ['Parenting after Separation'] }
];

// Illustration for each course, in images/.
const COURSE_ART = {
  'Teen Years': 'course-teen.svg',
  'Primary Years': 'course-primary.svg',
  'Neurodiversity': 'course-neurodiversity.svg',
  'Parenting after Separation': 'course-separation.svg'
};
const ART_V = '?v=2';

const MODULES = [
  { title: 'Getting Started Guide', done: true, pct: 100 },
  { title: 'Facilitator Training', done: true, pct: 100 },
  { title: 'Slides', done: false, pct: 0 }
];

const state = { prog: 0, open: new Set(), query: '' };

const $ = (id) => document.getElementById(id);
const els = {
  track: $('track'),
  tabs: $('prog-tabs'),
  dots: $('dots'),
  prev: $('prev'),
  next: $('next'),
  toggleAll: $('toggle-all'),
  searchToggle: $('search-toggle'),
  searchForm: $('search-form'),
  searchWrap: $('search-wrap'),
  searchInput: $('course-search'),
  manageToggle: $('manage-toggle'),
  manageMenu: $('manage-menu')
};

const key = (p, title) => `${p}:${title}`;

const chevron = `
  <span class="chev" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 9 7 7 7-7"></path></svg>
  </span>`;

const tick = `
  <svg role="img" aria-label="Completed" width="16" height="13" viewBox="0 0 45 36" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l12 12L41 5"></path></svg>`;

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function moduleHtml(m) {
  const status = m.done
    ? `<span class="chip chip--done">${tick}<span>Complete</span></span>`
    : `<span class="chip chip--todo"><span class="chip-dot" aria-hidden="true"></span>Not Started</span>`;
  return `
    <li class="module">
      <div class="module-head">
        <a href="#module" class="module-title">${escapeHtml(m.title)}</a>
        <div class="module-status">${status}</div>
      </div>
      <div class="bar" role="progressbar" aria-label="${escapeHtml(m.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.pct}">
        <div class="bar-fill" style="width: ${m.pct}%"></div>
      </div>
    </li>`;
}

// Each course gets its own brand colour (red, purple, yellow, navy), counted across
// all programmes so no two courses share one. It stays fixed when searching.
const ACCENTS = ['red', 'purple', 'yellow', 'navy'];
function accentFor(p, t) {
  let n = PROGRAMMES[p].courses.indexOf(t);
  for (let k = 0; k < p; k++) n += PROGRAMMES[k].courses.length;
  return ACCENTS[n % ACCENTS.length];
}

const courseArt = (t) => COURSE_ART[t]
  ? `<span class="course-art" aria-hidden="true"><img src="images/${COURSE_ART[t]}${ART_V}" alt=""></span>`
  : '';

function courseHtml(p, t, i) {
  const open = state.open.has(key(p, t));
  const id = `course-${p}-${i}`;
  return `
    <div class="course${open ? ' is-open' : ''}" data-accent="${accentFor(p, t)}">
      <button type="button" class="course-toggle" data-prog="${p}" data-title="${escapeHtml(t)}" aria-expanded="${open}" aria-controls="${id}">
        ${courseArt(t)}<span class="course-name">${escapeHtml(t)}</span>${chevron}
      </button>
      <div class="modules-wrap" id="${id}">
        <ul class="modules">
          ${MODULES.map(moduleHtml).join('')}
        </ul>
      </div>
    </div>`;
}

// ---------- Carousel: tabs, dots and slides ----------

function buildCarousel() {
  els.tabs.innerHTML = PROGRAMMES.map((p, i) => `
    <button type="button" class="prog-tab" data-index="${i}" aria-controls="slide-${i}">${escapeHtml(p.name)}</button>`).join('');

  els.dots.innerHTML = PROGRAMMES.map(() => '<span class="dot"></span>').join('');

  els.track.innerHTML = PROGRAMMES.map((p, i) => `
    <section class="slide" id="slide-${i}" aria-roledescription="slide" aria-label="${i + 1} of ${PROGRAMMES.length}: ${escapeHtml(p.name)}">
      <div class="programme-card" data-theme="${p.theme}">
        <span class="programme-art" aria-hidden="true"><img src="images/${p.art}${ART_V}" alt=""></span>
        <div class="programme-text">
          <span class="programme-meta">Programme · ${p.courses.length} ${p.courses.length === 1 ? 'course' : 'courses'}</span>
          <h3>${escapeHtml(p.name)}</h3>
        </div>
      </div>
      <div class="course-list"></div>
      <p class="no-results" hidden></p>
    </section>`).join('');

  renderCourses();
  els.track.querySelectorAll('.slide').forEach((s) => fitObserver.observe(s));
  setActive(0);
}

// Fills each slide's course list, applying the search filter.
function renderCourses() {
  const q = state.query.trim().toLowerCase();
  els.track.querySelectorAll('.slide').forEach((slide, p) => {
    const titles = PROGRAMMES[p].courses.filter((t) => !q || t.toLowerCase().includes(q));
    slide.querySelector('.course-list').innerHTML = titles.map((t, i) => courseHtml(p, t, i)).join('');
    const empty = slide.querySelector('.no-results');
    empty.hidden = titles.length > 0;
    empty.textContent = titles.length ? '' : `No courses match “${state.query}”.`;
  });
  updateToggleAll();
}

function setActive(i) {
  state.prog = i;
  els.tabs.querySelectorAll('.prog-tab').forEach((tab, n) => {
    const on = n === i;
    tab.classList.toggle('is-active', on);
    tab.setAttribute('aria-current', on ? 'true' : 'false');
  });
  const activeTab = els.tabs.children[i];
  if (activeTab) els.tabs.scrollTo({ left: activeTab.offsetLeft - 8, behavior: 'smooth' });
  els.dots.querySelectorAll('.dot').forEach((d, n) => d.classList.toggle('is-active', n === i));
  els.track.querySelectorAll('.slide').forEach((s, n) => {
    s.classList.toggle('is-active', n === i);
    s.inert = n !== i; // keep keyboard focus on the visible slide
  });
  els.prev.disabled = i === 0;
  els.next.disabled = i === PROGRAMMES.length - 1;
  updateToggleAll();
  fitTrack(true);
}

// Size the track to the visible slide, so a short programme leaves no gap below.
let switchTimer;
function fitTrack(animate) {
  const slide = els.track.children[state.prog];
  if (!slide) return;
  const cs = getComputedStyle(els.track);
  const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  if (animate) {
    els.track.classList.add('is-switching');
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => els.track.classList.remove('is-switching'), 550);
  }
  els.track.style.height = `${slide.offsetHeight + pad}px`;
}
const fitObserver = new ResizeObserver(() => fitTrack(false));

// Scroll position of slide i, measured from the first slide.
const slideOffset = (i) => els.track.children[i].offsetLeft - els.track.children[0].offsetLeft;

function goTo(i) {
  i = Math.max(0, Math.min(PROGRAMMES.length - 1, i));
  els.track.scrollTo({ left: slideOffset(i), behavior: 'smooth' });
  setActive(i);
}

// Keep tabs in step when someone swipes or scrolls the track.
let scrollTimer;
els.track.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const slideW = els.track.children[1] ? slideOffset(1) : els.track.clientWidth;
    const i = Math.round(els.track.scrollLeft / slideW);
    if (i !== state.prog) setActive(i);
  }, 60);
}, { passive: true });

els.tabs.addEventListener('click', (e) => {
  const tab = e.target.closest('.prog-tab');
  if (tab) goTo(Number(tab.dataset.index));
});
els.prev.addEventListener('click', () => goTo(state.prog - 1));
els.next.addEventListener('click', () => goTo(state.prog + 1));

document.querySelector('.carousel-head').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { goTo(state.prog + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft') { goTo(state.prog - 1); e.preventDefault(); }
});

window.addEventListener('resize', () => {
  els.track.scrollLeft = slideOffset(state.prog);
});

// ---------- Course accordions ----------

function updateToggleAll() {
  const allOpen = PROGRAMMES[state.prog].courses.every((t) => state.open.has(key(state.prog, t)));
  els.toggleAll.textContent = allOpen ? 'Collapse All' : 'Expand All';
}

function setCourse(btn, open) {
  const k = key(Number(btn.dataset.prog), btn.dataset.title);
  open ? state.open.add(k) : state.open.delete(k);
  btn.setAttribute('aria-expanded', String(open));
  btn.closest('.course').classList.toggle('is-open', open);
}

els.track.addEventListener('click', (e) => {
  const btn = e.target.closest('.course-toggle');
  if (!btn) return;
  setCourse(btn, btn.getAttribute('aria-expanded') !== 'true');
  updateToggleAll();
});

els.toggleAll.addEventListener('click', () => {
  const p = state.prog;
  const courses = PROGRAMMES[p].courses;
  const allOpen = courses.every((t) => state.open.has(key(p, t)));
  courses.forEach((t) => (allOpen ? state.open.delete(key(p, t)) : state.open.add(key(p, t))));
  els.track.children[p].querySelectorAll('.course-toggle').forEach((btn, i) => {
    setTimeout(() => setCourse(btn, !allOpen), i * 60);
  });
  updateToggleAll();
});

// ---------- Search ----------

function setSearch(open) {
  els.searchWrap.classList.toggle('is-open', open);
  els.searchToggle.setAttribute('aria-expanded', String(open));
  if (open) setTimeout(() => els.searchInput.focus({ preventScroll: true }), 120);
}

els.searchToggle.addEventListener('click', () => {
  setSearch(els.searchToggle.getAttribute('aria-expanded') !== 'true');
});

els.searchInput.addEventListener('input', (e) => {
  state.query = e.target.value;
  renderCourses();
});
els.searchForm.addEventListener('submit', (e) => e.preventDefault());

// ---------- Manage Account menu ----------

const menuOpen = () => els.manageMenu.classList.contains('is-open');
function setMenu(open) {
  els.manageMenu.classList.toggle('is-open', open);
  els.manageToggle.setAttribute('aria-expanded', String(open));
}

els.manageToggle.addEventListener('click', () => setMenu(!menuOpen()));

document.addEventListener('click', (e) => {
  if (menuOpen() && !e.target.closest('.manage')) setMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen()) {
    setMenu(false);
    els.manageToggle.focus();
  }
});

buildCarousel();
