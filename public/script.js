const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const toggleButton = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('menu');

if (toggleButton && navLinks) {
  toggleButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggleButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggleButton.setAttribute('aria-expanded', 'false');
    });
  });
}

// Staggered reveal using IntersectionObserver for a handmade feel
(function setupReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // respect user

  const items = document.querySelectorAll('.reveal');
  const options = { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // compute delay based on index within parent
      const delay = (Array.from(items).indexOf(el) % 6) * 120;
      setTimeout(() => el.classList.add('revealed'), delay);
      obs.unobserve(el);
    });
  }, options);

  items.forEach((el) => observer.observe(el));
})();

// Gentle parallax tied to mouse movement for desktop (subtle, handcrafted)
(function setupParallax() { ... })();{
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch
  const parallaxSelectors = ['.noise', '.hero', '.hero-card', '.brand-mark'];
  const layers = parallaxSelectors.map(sel => document.querySelector(sel)).filter(Boolean);
  if (!layers.length) return;

  let lastX = 0, lastY = 0, raf = null;
  window.addEventListener('mousemove', (e) => {
    lastX = (e.clientX / window.innerWidth - 0.5) * 4; // subtler
    lastY = (e.clientY / window.innerHeight - 0.5) * 3; // subtler
    if (!raf) raf = requestAnimationFrame(updateParallax);
  }, { passive: true });

  function updateParallax(){
    layers.forEach((el, i) => {
      const depth = (i + 1) * 0.35; // subtler depth
      el.style.transform = `translate3d(${lastX / (12/depth)}px, ${lastY / (18/depth)}px, 0)`;
    });
    raf = null;
  }
})();

// Load Lottie flourish animation (subtle, plays once)
(function loadLottie(){
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!document.getElementById('lottieFlourish')) return;
    // load lottie from CDN
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
    s.onload = () => {
      if (window.lottie) {
        const anim = window.lottie.loadAnimation({
          container: document.getElementById('lottieFlourish'),
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: '/lottie/flourish.json'
        });
        anim.addEventListener('DOMLoaded', () => {
          const el = document.getElementById('lottieFlourish');
          if (el) el.classList.add('playing');
        });
      }
    };
    document.head.appendChild(s);
  } catch (e) {
    // Fail silently
    console.warn('Lottie failed to load', e);
  }
})();

// ==========================================
// 🛠️ CONTACT FORM SUBMISSION HANDLER
// ==========================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      company: String(formData.get('company') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      website: String(formData.get('website') || '').trim()
    };

    if (payload.website) {
      formStatus.textContent = 'Request rejected.';
      formStatus.classList.add('error');
      return;
    }

    if (!payload.name || !payload.email || !payload.message) {
      formStatus.textContent = 'Name, email, and message are required.';
      formStatus.classList.add('error');
      return;
    }

    formStatus.textContent = 'Sending...';
    formStatus.classList.remove('error');

    // 🔴 CHOOSE CONFIGURATION OPTION BELOW BASED ON YOUR DEPLOYMENT SETUP:
    // Option A (If Frontend and Backend share the same Render project): '/api/contact'
    // Option B (If Backend is its own separate project service): 'https://onrender.com'
    const API_URL = '/api/contact';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }

      formStatus.textContent = result.message || 'Message sent successfully.';
      formStatus.classList.remove('error');
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = error.message || 'Unable to send message right now.';
      formStatus.classList.add('error');
    }
  });
}
