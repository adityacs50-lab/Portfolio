/* ═══════════════════════════════════════════════════════════════
   THE BUILDER'S CODEX — motion
   One orchestrated moment (the illuminated opener), then quiet.
   GSAP + ScrollTrigger, optional; the page is fully readable with
   none of them and under prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  if (hasGsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* anchor navigation offset for the masthead */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    // Fallback to native smooth scroll behavior
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  if (!hasGsap || reduced) return; // page stays fully visible; nothing to stage

  var gsap = window.gsap;

  /* ── the illuminated opener ────────────────────────────────── */
  function preparePath(path) {
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    return len;
  }

  function runHero() {
    var frames = gsap.utils.toArray('.illum-frame, .illum-flourish path');
    frames.forEach(preparePath);

    var letter = document.querySelector('.illum-letter');
    var sheenText = document.querySelector('.illum-letter-sheen');
    var sheenGrad = document.getElementById('sheen');

    // stage initial states (JS only, so no-JS visitors see everything)
    gsap.set('.illum-contours', { opacity: 0 });
    gsap.set('.illum-diamond path', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(letter, {
      fillOpacity: 0,
      strokeDasharray: 2600,
      strokeDashoffset: 2600
    });
    gsap.set(sheenText, { opacity: 0 });
    gsap.set('.hero-fade', { opacity: 0, y: 22 });

    var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.to('.illum-frame', { strokeDashoffset: 0, duration: 1.1, stagger: 0.15, ease: 'power1.inOut' })
      .to('.illum-flourish path', { strokeDashoffset: 0, duration: 0.6, stagger: 0.08 }, '-=0.55')
      .to('.illum-contours', { opacity: 1, duration: 1.2 }, '-=0.5')
      .to('.illum-diamond path', { scale: 1, duration: 0.4, ease: 'back.out(2.5)', stagger: 0.1 }, '-=0.8')
      // ink-in: the initial draws itself…
      .to(letter, { strokeDashoffset: 0, duration: 1.5, ease: 'power1.inOut' }, '-=0.7')
      // …then takes the gold leaf
      .to(letter, { fillOpacity: 1, duration: 1.0, ease: 'power2.inOut' }, '-=0.35')
      // one pass of candlelight across the gilding
      .to(sheenText, { opacity: 1, duration: 0.01 })
      .fromTo(sheenGrad,
        { attr: { x1: -320, x2: -80 } },
        { attr: { x1: 380, x2: 620 }, duration: 1.1, ease: 'power2.inOut' })
      .to(sheenText, { opacity: 0, duration: 0.4 }, '-=0.2')
      // the rest of the page introduces itself quietly
      .to('.hero-fade', { opacity: 1, y: 0, duration: 0.85, stagger: 0.12 }, '-=1.2');
  }

  // wait for Fraunces so the initial draws in its true face (2s safety net)
  var fontsReady = (document.fonts && document.fonts.ready)
    ? document.fonts.ready
    : Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise(function (res) { setTimeout(res, 2000); })
  ]).then(runHero);

  /* ── quiet scroll reveals ──────────────────────────────────── */
  if (window.ScrollTrigger) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.95,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    /* marginalia drift in from the margin, like a note being added */
    gsap.utils.toArray('[data-margin]').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        x: 14,
        duration: 1.1,
        delay: 0.25,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    /* gentle parallax on the hero contour etching */
    gsap.utils.toArray('.contour-parallax').forEach(function (el) {
      gsap.to(el, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }
})();
