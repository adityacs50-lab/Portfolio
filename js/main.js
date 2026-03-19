/* ============================================
   ADITYA SHINDE — PORTFOLIO
   Main JavaScript — Dark Cinematic Theme
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== SCATTERED GOLD DOTS ==========
    const goldDotsContainer = document.getElementById('goldDots');
    if (goldDotsContainer) {
        const dotCount = 30;
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'gold-dot-particle';
            dot.style.left = Math.random() * 100 + '%';
            dot.style.top = Math.random() * 100 + '%';
            dot.style.width = (2 + Math.random() * 4) + 'px';
            dot.style.height = dot.style.width;
            dot.style.animationDelay = (Math.random() * 6) + 's';
            dot.style.animationDuration = (3 + Math.random() * 4) + 's';
            goldDotsContainer.appendChild(dot);
        }
    }

    // ========== NAVBAR ==========
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const handleScroll = () => {
        // Navbar scroll state
        navbar.classList.toggle('scrolled', window.scrollY > 50);

        // Back to top
        backToTop.classList.toggle('visible', window.scrollY > 500);

        // Active nav tracking
        updateActiveNav();

        // Counter animation
        animateCounters();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });

    // Active nav on scroll
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ========== SCROLL REVEAL (Intersection Observer) ==========
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ========== COUNTER ANIMATION ==========
    const counters = document.querySelectorAll('.mini-stat-num[data-count]');
    let counterDone = false;

    function animateCounters() {
        if (counterDone) return;
        const statsArea = document.querySelector('.intro-stats');
        if (!statsArea) return;

        const rect = statsArea.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            counterDone = true;

            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const tick = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(tick);
                    } else {
                        counter.textContent = target;
                    }
                };
                tick();
            });
        }
    }

    // ========== BACK TO TOP ==========
    const backToTop = document.getElementById('backToTop');

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ========== SMOOTH ANCHOR SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const inputs = contactForm.querySelectorAll('input, textarea');
            const name = inputs[0]?.value.trim();
            const email = inputs[1]?.value.trim();
            const message = inputs[2]?.value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in all fields', 'error');
                return;
            }

            const mailto = `mailto:educomedyhq23@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
            window.open(mailto);
            showToast('Opening your email client...');
            contactForm.reset();
        });
    }

    // ========== TOAST ==========
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ========== KEYBOARD (Escape closes mobile menu) ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('open');
        }
    });

    // ========== ORBITAL DIAGRAM — POSITION NODES (CSS fallback) ==========
    // For browsers that don't support cos()/sin() in CSS, position nodes via JS
    const orbitalDiagram = document.getElementById('orbitalDiagram');
    if (orbitalDiagram) {
        const nodes = orbitalDiagram.querySelectorAll('.tech-node');
        const radiusMap = { '1': 100, '2': 170, '3': 235 };

        // Check screen size for responsive radii
        const updateOrbital = () => {
            const w = orbitalDiagram.offsetWidth;
            const scale = w / 500;

            nodes.forEach(node => {
                const style = node.getAttribute('style') || '';
                const angleMatch = style.match(/--angle:\s*([\d.]+)deg/);
                const orbitMatch = style.match(/--orbit:\s*(\d)/);

                if (angleMatch && orbitMatch) {
                    const angle = parseFloat(angleMatch[1]) * (Math.PI / 180);
                    const orbit = orbitMatch[1];
                    const r = (radiusMap[orbit] || 100) * scale;

                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;

                    node.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                }
            });
        };

        updateOrbital();
        window.addEventListener('resize', updateOrbital);
    }

    // ========== INITIAL CALLS ==========
    handleScroll();

    console.log('✦ Portfolio loaded — Aditya Shinde');
});