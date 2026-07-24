/* ============================================
   THEME TOGGLE
   (initial theme is set by the inline head
   script to avoid a flash of wrong theme)
   ============================================ */
function initializeTheme() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  });
}

/* ============================================
   MOBILE MENU (iOS-safe scroll lock)
   ============================================ */
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const body = document.body;
  let savedScrollY = 0;

  if (!menuToggle || !mobileOverlay) return;

  menuToggle.addEventListener('click', () => {
    mobileOverlay.classList.contains('is-active') ? closeMenu() : openMenu();
  });

  mobileOverlay.addEventListener('click', (e) => {
    if (e.target === mobileOverlay) closeMenu();
  });

  mobileOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOverlay.classList.contains('is-active')) closeMenu();
  });

  function openMenu() {
    savedScrollY = window.scrollY;
    mobileOverlay.classList.add('is-active');
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileOverlay.classList.remove('is-active');
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.overflow = '';
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
  }
}

/* ============================================
   IMAGE TRAIL (hero cursor interaction)
   Desktop pointer devices only; disabled for
   touch, reduced motion, and no-JS — the hero
   is fully usable without it.
   ============================================ */
function initializeImageTrail() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reducedMotion) return;

  const sources = [
    'assets/works/baby-moriyama.svg',
    'assets/works/bezier-yoshimoto.svg',
    'assets/works/andjs-nametag.svg',
    'assets/works/food-innovation-hub.svg'
  ];

  // Preload so the first spawns don't pop in blank
  sources.forEach(src => { new Image().src = src; });

  const SPAWN_DISTANCE = 90;
  const MAX_ACTIVE = 7;
  let lastX = -1000;
  let lastY = -1000;
  let index = 0;
  let active = 0;

  hero.addEventListener('pointermove', (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (dx * dx + dy * dy < SPAWN_DISTANCE * SPAWN_DISTANCE) return;
    lastX = e.clientX;
    lastY = e.clientY;
    if (active >= MAX_ACTIVE) return;
    spawn(e.clientX, e.clientY);
  });

  function spawn(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const img = document.createElement('img');
    img.src = sources[index++ % sources.length];
    img.alt = '';
    img.className = 'trail-img';
    img.style.left = `${clientX - rect.left}px`;
    img.style.top = `${clientY - rect.top}px`;
    img.style.setProperty('--rot', `${(Math.random() * 14 - 7).toFixed(1)}deg`);
    hero.appendChild(img);
    active++;

    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('is-in')));
    setTimeout(() => img.classList.add('is-out'), 550);
    setTimeout(() => { img.remove(); active--; }, 1000);
  }
}

/* ============================================
   SCROLL REVEAL (progressive enhancement)
   Without JS or with reduced motion, content
   simply renders visible.
   ============================================ */
function initializeReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  document.documentElement.classList.add('js-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  els.forEach(el => observer.observe(el));
}

/* ============================================
   ACTIVE NAV STATE
   ============================================ */
function initializeNavigationObserver() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.site-nav a, .mobile-menu-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* ============================================
   COPY EMAIL
   ============================================ */
function initializeCopyEmail() {
  const btn = document.querySelector('.copy-email');
  if (!btn || !navigator.clipboard) return;

  const originalText = btn.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = originalText; }, 2000);
    } catch (e) { /* clipboard unavailable — mailto link remains */ }
  });
}

/* ============================================
   INITIALIZATION
   ============================================ */
function init() {
  initializeTheme();
  initializeMobileMenu();
  initializeImageTrail();
  initializeReveal();
  initializeNavigationObserver();
  initializeCopyEmail();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
