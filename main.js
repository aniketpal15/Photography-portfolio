// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Connect Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
    });
    gsap.to(cursorFollower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3
    });
});

// Mobile Menu Logic
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Preloader Animation
window.addEventListener('load', () => {
    const preloaderTl = gsap.timeline();
    const statusText = document.querySelector('.status-text');

    // Stop lenis initially
    lenis.stop();

    // 1. Initial State
    gsap.set('.bracket', { scale: 1.5, opacity: 0 });
    gsap.set('.preloader-status', { opacity: 0, y: 20 });

    preloaderTl
        // 2. Focus Phase (The "Premium" feel)
        .to('.preloader-status', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .to('.bracket', {
            scale: 1,
            opacity: 0.8,
            duration: 0.4,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        }, "-=0.2")
        .to({}, {
            duration: 0.3, onStart: () => {
                statusText.innerText = 'FOCUSING...';
            }
        })
        .to('.bracket', {
            scale: 0.95,
            opacity: 1,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut'
        })
        .to({}, {
            duration: 0.2, onStart: () => {
                statusText.innerText = 'EXPOSURE LOCKED';
                document.querySelector('.status-box').style.background = 'var(--accent-color)';
                document.querySelector('.status-box').style.color = '#000';
            }
        })

        // 3. Opening Phase
        .to('.blade', {
            y: 120, // Fully opens the aperture
            duration: 0.6,
            ease: 'expo.inOut',
        }, "+=0.2")
        .to('.lens-glass', {
            opacity: 1,
            duration: 0.3
        }, "-=0.3")
        .to('.flash', {
            opacity: 1,
            duration: 0.1,
            ease: 'power4.in'
        }, "-=0.1")
        .to('.flash', {
            opacity: 0,
            duration: 0.4,
            ease: 'power4.out'
        })
        .to('.preloader', {
            opacity: 0,
            duration: 0.6,
            ease: 'power3.inOut',
            onComplete: () => {
                document.querySelector('.preloader').style.display = 'none';
                lenis.start();
                heroTl.play();
            }
        }, "-=0.3");
});

// Failsafe: Remove preloader after 10 seconds regardless of load state
setTimeout(() => {
    const preloader = document.querySelector('.preloader');
    if (preloader && preloader.style.display !== 'none') {
        console.warn('Preloader failsafe triggered: Removing preloader manually.');
        gsap.to(preloader, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                preloader.style.display = 'none';
                lenis.start();
                if (typeof heroTl !== 'undefined') heroTl.play();
            }
        });
    }
}, 10000);


// Hero Animations
const heroTl = gsap.timeline({ paused: true });

heroTl.from(".hero-title span", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out"
})
    .from(".hero-subtitle", {
        opacity: 0,
        y: 20,
        duration: 1
    }, "-=1")
    .from(".floating-img", {
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: "expo.out"
    }, "-=1.5");

// 3D Effect on Hero Visuals (Mouse Parallax)
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
    window.addEventListener('mousemove', (e) => {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 40;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 40;

        gsap.to(".img-1", { x: xPos * 1.5, y: yPos * 1.5, duration: 1 });
        gsap.to(".img-2", { x: -xPos * 1.2, y: -yPos * 1.2, duration: 1 });
        gsap.to(".img-3", { x: xPos * 0.8, y: -yPos * 1.8, duration: 1 });
        gsap.to(".img-4", { x: -xPos * 1.6, y: yPos * 1.1, duration: 1 });
        gsap.to(".img-5", { x: xPos * 1.3, y: -yPos * 1.4, duration: 1 });
    });
}

// Gallery Marquee Logic with Manual Scroll
function initGalleryMarquee() {
    const rows = document.querySelectorAll('.gallery-row');

    rows.forEach((row, index) => {
        const content = row.querySelector('.marquee-content');

        // Clone items for seamless loop
        const items = [...content.children];
        items.forEach(item => {
            const clone = item.cloneNode(true);
            content.appendChild(clone);
        });

        const totalWidth = content.scrollWidth / 2;
        let xPos = index === 0 ? -totalWidth : 0;
        let isDragging = false;
        let startX = 0;
        let lastXPos = xPos;
        let velocity = index === 0 ? 0.8 : -0.8; // Initial auto-scroll velocity

        // Set initial position
        gsap.set(content, { x: xPos });

        // Animation Loop
        function update() {
            if (!isDragging) {
                xPos += velocity;

                // Infinite Wrap
                if (xPos > 0) xPos = -totalWidth;
                if (xPos < -totalWidth) xPos = 0;

                gsap.set(content, { x: xPos });
            }
            requestAnimationFrame(update);
        }
        update();

        // Drag Logic
        row.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - row.offsetLeft;
            lastXPos = xPos;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        row.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - row.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed mult
            xPos = lastXPos + walk;

            // Loop while dragging
            if (xPos > 0) {
                xPos = -totalWidth + (xPos % totalWidth);
                lastXPos = xPos - walk; // Reset anchor to avoid jump
            }
            if (xPos < -totalWidth) {
                xPos = xPos % totalWidth;
                lastXPos = xPos - walk;
            }

            gsap.set(content, { x: xPos });
        });

        // Slow down on hover
        row.addEventListener('mouseenter', () => {
            if (!isDragging) velocity *= 0.3;
        });
        row.addEventListener('mouseleave', () => {
            if (!isDragging) velocity = index === 0 ? 0.8 : -0.8;
        });

        // Touch Support
        row.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].pageX - row.offsetLeft;
            lastXPos = xPos;
        });

        row.addEventListener('touchend', () => {
            isDragging = false;
        });

        row.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].pageX - row.offsetLeft;
            const walk = (x - startX) * 1.5;
            xPos = lastXPos + walk;

            if (xPos > 0) xPos = -totalWidth;
            if (xPos < -totalWidth) xPos = 0;

            gsap.set(content, { x: xPos });
        });
    });
}

// Initialize marquee when images are likely loaded
window.addEventListener('load', initGalleryMarquee);

// Gallery Filtering (Updated for Marquee)
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const allItems = document.querySelectorAll('.gallery-item');
        allItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                gsap.to(item, { opacity: 1, scale: 1, duration: 0.5 });
            } else {
                gsap.to(item, { opacity: 0.2, scale: 0.9, duration: 0.5 });
            }
        });
    });
});

// Parallax Effect on Gallery Images
gsap.utils.toArray('.gallery-item img').forEach(img => {
    gsap.to(img, {
        scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        y: -30,
        ease: "none"
    });
});

// Navigation Highlight or simple interaction
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 3, duration: 0.3 });
    });
    link.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, duration: 0.3 });
    });
});

// Horizontal Drag to Scroll Functionality
const sliders = document.querySelectorAll('.gallery-horizontal-scroll');

sliders.forEach(slider => {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.2; // slower scroll speed multiplier
        slider.scrollLeft = scrollLeft - walk;
    });

    // Translate vertical scroll to horizontal
    slider.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && Math.abs(e.deltaX) === 0) {
            e.preventDefault();
            // Smooth natural scrolling with wheel
            slider.scrollBy({
                left: e.deltaY * 0.8, // slower wheel scrolling
                behavior: 'smooth'
            });
        }
    }, { passive: false });
});


// Glass Card Animations
gsap.utils.toArray('.glass-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: (i % 4) * 0.1
    });
});
// Contact Form Submission
const contactForm = document.querySelector('form'); // Ensure you have a <form> tag in index.html

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Change button state
        const submitBtn = contactForm.querySelector('button');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "SENDING...";

        const formData = {
            name: contactForm.querySelector('input[name="name"]').value,
            email: contactForm.querySelector('input[name="email"]').value,
            message: contactForm.querySelector('textarea[name="message"]').value
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Message sent successfully!");
                contactForm.reset();
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Could not connect to the server.");
        } finally {
            submitBtn.innerText = originalText;
        }
    });
}