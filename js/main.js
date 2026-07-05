/* ═══════════════════════════════════════════════════════════════
   ADITYA SHINDE® — motion
   Preloader count-up → staggered hero reveal → quiet scroll reveals.
   GSAP + Lenis optional; the page is fully readable without them
   and under prefers-reduced-motion (inline 4s fallback clears the
   preloader even if everything else fails).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  /* ── smooth scroll ─────────────────────────────────────────── */
  var lenis = null;
  if (!reduced && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.2, wheelMultiplier: 1.35, touchMultiplier: 1.6 });
    if (hasGsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else if (hasGsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -60 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ── preloader ─────────────────────────────────────────────── */
  var countEl = document.querySelector('[data-count]');

  function finishLoad() { html.classList.add('loaded'); }

  if (reduced || !hasGsap || !countEl) {
    finishLoad();
  } else {
    var gsap = window.gsap;
    var n = { v: 0 };

    gsap.set('[data-stagger]', { opacity: 0, y: 40 });

    gsap.timeline()
      .to(n, {
        v: 100,
        duration: 1.4,
        ease: 'power2.inOut',
        onUpdate: function () {
          countEl.textContent = String(Math.round(n.v)).padStart(3, '0');
        }
      })
      .to('.preloader', {
        opacity: 0,
        duration: 0.45,
        ease: 'power1.out',
        onComplete: finishLoad
      }, '+=0.15')
      .to('[data-stagger]', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out'
      }, '-=0.25');
  }

  if (!hasGsap || reduced) return;

  var gsap = window.gsap;

  /* ── custom cursor ─────────────────────────────────────────── */
  if (window.matchMedia('(pointer: fine)').matches) {
    var dotX = gsap.quickTo('.cursor', 'x', { duration: 0.12, ease: 'power2.out' });
    var dotY = gsap.quickTo('.cursor', 'y', { duration: 0.12, ease: 'power2.out' });
    var ringX = gsap.quickTo('.cursor-ring', 'x', { duration: 0.45, ease: 'power3.out' });
    var ringY = gsap.quickTo('.cursor-ring', 'y', { duration: 0.45, ease: 'power3.out' });
    gsap.set(['.cursor', '.cursor-ring'], { xPercent: -50, yPercent: -50 });
    window.addEventListener('pointermove', function (e) {
      html.classList.add('cursor-on'); // appears only once the pointer is real
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var interactive = e.target.closest('a, button, .work-row, .archive-row');
      gsap.to('.cursor-ring', { scale: interactive ? 1.8 : 1, duration: 0.3 });
    });
  }

  /* ── scroll reveals ────────────────────────────────────────── */
  if (window.ScrollTrigger) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }
})();
