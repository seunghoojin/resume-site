/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  const body = document.body;
  let savedScrollY = 0;

  if (!menuToggle || !mobileOverlay) return;

  menuToggle.addEventListener('click', () => {
    if (mobileOverlay.classList.contains('is-active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking overlay background (outside content)
  mobileOverlay.addEventListener('click', (e) => {
    if (e.target === mobileOverlay) {
      closeMenu();
    }
  });

  // Close menu when clicking a link
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOverlay.classList.contains('is-active')) {
      closeMenu();
    }
  });

  function openMenu() {
    savedScrollY = window.scrollY;
    mobileOverlay.classList.add('is-active');
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    // position: fixed is required to stop background scrolling on iOS Safari,
    // where overflow: hidden alone is not enough
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
   HORIZONTAL CARD SCROLL FUNCTIONALITY
   ============================================ */
function initializeCardScroll() {
  const rails = document.querySelectorAll('.card-rail');
  const visibilityUpdaters = [];

  rails.forEach(rail => {
    const container = rail.parentElement;
    const leftArrow = container.querySelector('.scroll-arrow-left');
    const rightArrow = container.querySelector('.scroll-arrow-right');

    if (!leftArrow || !rightArrow) return;

    function updateArrowVisibility() {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      leftArrow.classList.toggle('hidden', rail.scrollLeft <= 10);
      rightArrow.classList.toggle('hidden', rail.scrollLeft >= maxScroll - 10);
    }

    function scrollCards(direction) {
      const firstCard = rail.querySelector('.card');
      if (!firstCard) return;

      const gap = parseInt(getComputedStyle(rail).gap) || 24;
      const scrollAmount = firstCard.offsetWidth + gap;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      rail.scrollTo({
        left: rail.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }

    leftArrow.addEventListener('click', () => scrollCards('left'));
    rightArrow.addEventListener('click', () => scrollCards('right'));
    rail.addEventListener('scroll', updateArrowVisibility);

    updateArrowVisibility();
    visibilityUpdaters.push(updateArrowVisibility);
  });

  // Single debounced resize listener for all rails
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => visibilityUpdaters.forEach(update => update()), 150);
  });
}

/* ============================================
   INTERSECTION OBSERVER FOR ACTIVE NAVIGATION
   ============================================ */
function initializeNavigationObserver() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.navigation-pill, .mobile-menu-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
      }
    });
  }, {
    root: null,
    rootMargin: '-80px 0px -50% 0px', // Account for sticky header
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

/* ============================================
   INITIALIZATION
   ============================================ */
function init() {
  initializeMobileMenu();
  initializeCardScroll();
  initializeNavigationObserver();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
