/* ============================================================
   COMBINA GLOBAL — main.js
   Sticky header · Mobile menu · Scroll animations · Back to top
============================================================ */

(function () {
  'use strict';

  /* ── DOM references ── */
  const header      = document.getElementById('site-header');
  const navToggle   = document.getElementById('nav-toggle');
  const mainNav     = document.getElementById('main-nav');
  const backToTop   = document.getElementById('back-to-top');
  const yearEl      = document.getElementById('year');

  /* ── Year ── */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Sticky header on scroll ── */
  function onScroll() {
    const y = window.scrollY;

    // Header shadow
    if (header) {
      header.classList.toggle('scrolled', y > 40);
    }

    // Back-to-top visibility
    if (backToTop) {
      backToTop.classList.toggle('visible', y > 400);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ── Back to top ── */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Mobile nav toggle ── */
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));

      // Prevent body scroll when nav is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close nav when a non-dropdown link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        const parent = link.closest('.has-dropdown');
        if (parent && window.innerWidth <= 768) {
          // Toggle mobile dropdown
          e.preventDefault();
          parent.classList.toggle('open');
          return;
        }
        // Close the nav for regular links
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        mainNav.classList.contains('open') &&
        !mainNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close nav on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── Intersection Observer: scroll-in animations ── */
  const animatedEls = document.querySelectorAll('.animate-fade-up, .animate-fade-in');

  if (animatedEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animatedEls.forEach(el => observer.observe(el));
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* ── Active nav link highlighting based on scroll position ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"], .main-nav a[href="index.html"]');

  function updateActiveNav() {
    const scrollY = window.scrollY + (header ? header.offsetHeight : 0) + 80;
    let current = '';

    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}` || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
  }

  /* ── Counter animation for stats ── */
  function animateCounter(el, target, duration) {
    let start = 0;
    const startTime = performance.now();
    const isDecimal = String(target).includes('.');
    const isMillion = el.dataset.suffix === 'M';

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * target;

      if (isMillion) {
        el.textContent = (current / 1e6).toFixed(0);
      } else {
        el.textContent = Math.floor(current);
      }

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  // Observe stat numbers for counter animation
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Extract the numeric part from the text (e.g. "500" from "500+", "$10M" → 10)
            const raw = el.textContent.replace(/[^0-9.]/g, '');
            const target = parseFloat(raw);
            if (!isNaN(target) && target > 0) {
              // Store the plus/suffix spans so we can restore them
              const plus = el.querySelector('.stat-plus');
              const plusHTML = plus ? plus.outerHTML : '';
              el.textContent = '0';
              if (plusHTML) el.insertAdjacentHTML('beforeend', plusHTML);

              // Animate the text node before the span
              const textNode = el.firstChild;
              let count = 0;
              const duration = 1400;
              const start = performance.now();

              function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);
                textNode.textContent = current;
                if (progress < 1) requestAnimationFrame(tick);
                else textNode.textContent = target;
              }
              requestAnimationFrame(tick);
            }
            statObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(el => statObserver.observe(el));
  }

})();
