/* ═══════════════════════════════════════════════════════════════
   THE BUILDER'S CODEX — motion
   One orchestrated moment (the illuminated opener), then quiet.
   GSAP + ScrollTrigger + Lenis, all optional; the page is fully
   readable with none of them and under prefers-reduced-motion.
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

  /* ── scroll-spy pill nav ───────────────────────────────────── */
  (function () {
    var nav = document.querySelector('.masthead-nav');
    var pill = document.querySelector('.nav-pill');
    if (!nav || !pill) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (!('IntersectionObserver' in window) || !sections.length) return;

    function movePill(link) {
      if (!link) { pill.style.opacity = '0'; return; }
      pill.style.left = link.offsetLeft + 'px';
      pill.style.width = link.offsetWidth + 'px';
      pill.style.opacity = '1';
    }

    function setActive(link) {
      links.forEach(function (a) {
        var active = a === link;
        a.classList.toggle('is-active', active);
        if (active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      movePill(link);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = links.filter(function (a) {
          return a.getAttribute('href') === '#' + entry.target.id;
        })[0];
        if (link) setActive(link);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });

    window.addEventListener('resize', function () {
      var current = nav.querySelector('a.is-active');
      if (current) movePill(current);
    });
  })();

  /* ── scroll progress bar ───────────────────────────────────── */
  (function () {
    var bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ── hero spotlight + magnetic cue ────────────────────────────
     Decorative-only cursor tracking. Desktop pointer devices only;
     both links stay fully functional with zero JS or on touch. */
  var pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!reduced && pointerFine) {
    var hero = document.querySelector('.hero');
    var spotlight = document.querySelector('.hero-spotlight');

    var illumWrap = document.querySelector('.illum-wrap');

    if (hero && spotlight) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        spotlight.style.setProperty('--spot-x', (px * 100) + '%');
        spotlight.style.setProperty('--spot-y', (py * 100) + '%');
        spotlight.classList.add('is-active');

        if (illumWrap) {
          var rotY = (px - 0.5) * 16;
          var rotX = -(py - 0.5) * 16;
          illumWrap.style.transform =
            'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
        }
      });
      hero.addEventListener('mouseleave', function () {
        spotlight.classList.remove('is-active');
        if (illumWrap) illumWrap.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      });
    }

    var heroCue = document.querySelector('.hero-cue');
    if (heroCue) {
      heroCue.addEventListener('mousemove', function (e) {
        var r = heroCue.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.35;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        heroCue.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      heroCue.addEventListener('mouseleave', function () {
        heroCue.style.transform = '';
      });
    }

    /* project-card spotlight glow + real 3D tilt (Ventures/Commissions
       plates + Catalog specimens) — cinematic, cursor-driven perspective */
    var glowCards = document.querySelectorAll('.plate, .specimen');
    glowCards.forEach(function (card) {
      var isPlate = card.classList.contains('plate');
      var maxTilt = isPlate ? 6 : 8; // bigger plates tilt less to stay readable
      var lift = isPlate ? -6 : -8;

      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;

        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.classList.add('is-glowing');

        var rotY = (px - 0.5) * maxTilt;
        var rotX = -(py - 0.5) * maxTilt;
        card.style.transform =
          'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(' + lift + 'px) translateZ(0)';
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-glowing');
        card.style.transform = '';
      });
    });
  }

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
    var revealEls = gsap.utils.toArray('[data-reveal]').filter(function (el) {
      return !el.closest('.catalog-grid');
    });
    revealEls.forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 34,
        z: -90,
        rotationX: -8,
        transformPerspective: 900,
        transformOrigin: '50% 100%',
        duration: 1.05,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    /* catalog specimens reveal as a staggered wave, not a simultaneous row-pop —
       each card rises and tilts into place like it's lifting off the page */
    var catalogGrid = document.querySelector('.catalog-grid');
    if (catalogGrid) {
      gsap.from(catalogGrid.querySelectorAll('.specimen'), {
        opacity: 0,
        y: 28,
        z: -70,
        rotationX: -10,
        transformPerspective: 700,
        transformOrigin: '50% 100%',
        duration: 0.85,
        ease: 'power2.out',
        stagger: { each: 0.08, from: 'start', grid: 'auto' },
        scrollTrigger: { trigger: catalogGrid, start: 'top 85%' }
      });
    }

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

    /* cinematic hero exit — content pushes back into depth and fades
       as the reader scrolls past, like a camera pulling away */
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      gsap.to('.hero-fade', {
        z: -260,
        scale: 0.9,
        opacity: 0.05,
        ease: 'none',
        transformPerspective: 800,
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

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
