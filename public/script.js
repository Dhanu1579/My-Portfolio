document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Menu Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('menu');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
    });
  }

  // Contact Form Logic
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevents page reload and url query parameter append

      const formData = new FormData(contactForm);
      const payload = {
        name: formData.get('name') ? formData.get('name').trim() : '',
        email: formData.get('email') ? formData.get('email').trim() : '',
        company: formData.get('company') ? formData.get('company').trim() : '',
        message: formData.get('message') ? formData.get('message').trim() : '',
        website: formData.get('website') || '' // Honeypot check
      };

      // Ignore silent bot submissions
      if (payload.website) return;

      // Validation
      if (!payload.name || !payload.email || !payload.message) {
        if (formStatus) {
          formStatus.textContent = 'Please fill out all required fields.';
          formStatus.style.color = '#ff6b6b';
        }
        return;
      }

      try {
        if (formStatus) {
          formStatus.textContent = 'Sending...';
          formStatus.style.color = '#64ffda';
        }

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send message.');
        }

        if (formStatus) {
          formStatus.textContent = result.message || 'Message sent successfully!';
          formStatus.style.color = '#64ffda';
        }
        
        contactForm.reset();
      } catch (err) {
        console.error('Submission error:', err);
        if (formStatus) {
          formStatus.textContent = err.message || 'Error sending message. Try again later.';
          formStatus.style.color = '#ff6b6b';
        }
      }
    });
  }
});