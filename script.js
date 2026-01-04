/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
function initializeMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
  const body = document.body;
  
  if (!menuToggle || !mobileOverlay) return;
  
  // Toggle menu on button click
  menuToggle.addEventListener('click', () => {
    const isActive = body.classList.contains('is-active');
    
    if (isActive) {
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
    if (e.key === 'Escape' && body.classList.contains('is-active')) {
      closeMenu();
    }
  });
  
  function openMenu() {
    body.classList.add('is-active');
    mobileOverlay.classList.add('is-active');
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    body.classList.remove('is-active');
    mobileOverlay.classList.remove('is-active');
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }
}

/* ============================================
   SMOOTH SCROLL NAVIGATION
   ============================================ */
document.querySelectorAll('.navigation-pill a, .mobile-menu-link').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Only handle internal links (starting with #)
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

/* ============================================
   HORIZONTAL CARD SCROLL FUNCTIONALITY
   ============================================ */
function initializeCardScroll() {
  const scrollContainers = document.querySelectorAll('.cards');
  
  scrollContainers.forEach(container => {
    const containerParent = container.parentElement;
    const leftArrow = containerParent.querySelector('.scroll-arrow-left');
    const rightArrow = containerParent.querySelector('.scroll-arrow-right');
    
    if (!leftArrow || !rightArrow) return;
    
    // Function to update arrow visibility based on scroll position
    function updateArrowVisibility() {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Hide left arrow if at start (within 10px threshold)
      leftArrow.classList.toggle('hidden', scrollLeft <= 10);
      
      // Hide right arrow if at end (within 10px threshold)
      rightArrow.classList.toggle('hidden', scrollLeft >= maxScroll - 10);
    }
    
    // Scroll function with dynamic calculation
    function scrollCards(direction) {
      const firstCard = container.querySelector('.card');
      if (!firstCard) return;
      
      // Dynamically calculate scroll amount: card width + gap
      const cardWidth = firstCard.offsetWidth;
      const computedStyle = getComputedStyle(container);
      const gap = parseInt(computedStyle.gap) || 24;
      const scrollAmount = cardWidth + gap;
      
      const currentScroll = container.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
    
    // Add click event listeners
    leftArrow.addEventListener('click', () => scrollCards('left'));
    rightArrow.addEventListener('click', () => scrollCards('right'));
    
    // Update arrow visibility on scroll
    container.addEventListener('scroll', updateArrowVisibility);
    
    // Initial arrow visibility check
    updateArrowVisibility();
    
    // Update on window resize
    window.addEventListener('resize', updateArrowVisibility);
  });
}

/* ============================================
   INTERSECTION OBSERVER FOR ACTIVE NAVIGATION
   ============================================ */
function initializeNavigationObserver() {
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.navigation-pill, .mobile-menu-link');
  
  if (sections.length === 0 || navLinks.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -50% 0px', // Account for sticky header
    threshold: 0
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        
        // Remove active class from all nav links
        navLinks.forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to matching nav links
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);
  
  // Observe all sections
  sections.forEach(section => observer.observe(section));
}

/* ============================================
   INITIALIZATION
   ============================================ */
function init() {
  console.log('AndJ Studio website loaded');
  initializeMobileMenu();
  initializeCardScroll();
  initializeNavigationObserver();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
