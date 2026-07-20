/**
 * STEMULAR — Explore Page Engine
 * Handles custom animations, Intersection Observers, interactive quiz, and sign-in gates.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --- 1. INTERSECTION OBSERVER: SECTION REVEAL --- */
  const revealSections = document.querySelectorAll('.reveal-section');
  
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Trigger only once per section
      }
    });
  }, { threshold: 0.15 });

  revealSections.forEach(section => sectionObserver.observe(section));


  /* --- 2. INTERSECTION OBSERVER: STATS COUNT-UP ANIMATION --- */
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const statsSection = document.querySelector('.stats-section');
  
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1500; // 1.5 seconds total animation time
          const increment = target / (duration / 16); // 60fps step

          let current = 0;
          const updateCounter = () => {
            current += increment;
            if (current < target) {
              counter.innerText = Math.ceil(current);
              requestAnimationFrame(updateCounter);
            } else {
              counter.innerText = target;
            }
          };
          updateCounter();
        });
      }
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }


  /* --- 3. INTERACTIVE QUIZ SAMPLE --- */
  const quizOptions = document.querySelectorAll('.quiz-opt');
  const submitQuizBtn = document.getElementById('submit-quiz-btn');
  const quizFeedback = document.getElementById('quiz-feedback');
  let selectedAnswer = null;

  quizOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      quizOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      radio.checked = true;
      selectedAnswer = radio.value;
    });
  });

  if (submitQuizBtn) {
    submitQuizBtn.addEventListener('click', () => {
      if (!selectedAnswer) {
        alert('Please select an option first.');
        return;
      }
      // Reveal feedback block regardless of choice to encourage registration
      quizFeedback.classList.remove('hidden');
      submitQuizBtn.style.display = 'none'; // Hide answer button after submission
    });
  }

  /* --- 4. SIGN-IN MODAL GATEWAY --- */
  const modalOverlay = document.getElementById('gate-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  const closeAndScrollBtns = document.querySelectorAll('.close-and-scroll');

  // Open Modal with dynamic context messages
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const featureName = trigger.getAttribute('data-title') || 'This Feature';
      
      modalTitle.innerText = `Sign In Required`;
      modalDesc.innerText = `Please create a free account or sign in to access ${featureName} and unlock the full STEMULAR platform experience.`;
      
      modalOverlay.classList.remove('hidden');
    });
  });

  // Close Modal
  const closeModal = () => modalOverlay.classList.add('hidden');

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  // Close when clicking outside the glass box
  window.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Close and scroll smoothly to CTA registration section
  closeAndScrollBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal();
    });
  });


  /* --- 5. CARD TILT ON HOVER --- */
  const supportsCardTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (supportsCardTilt) {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        card.style.setProperty('--card-tilt-x', `${(-y * 7).toFixed(2)}deg`);
        card.style.setProperty('--card-tilt-y', `${(x * 7).toFixed(2)}deg`);
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-tilt-x', '0deg');
        card.style.setProperty('--card-tilt-y', '0deg');
      });
    });
  }

});
