/**
 * STEMULAR — Vanilla JavaScript Scroll Engine
 * Uses Intersection Observer API for 60fps hardware-accelerated animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // Select all layout blocks engineered for animation
  const animatedElements = document.querySelectorAll('.animate-element');

  // Configure the Intersection Observer
  const observerOptions = {
    root: null,          // Use the viewport as the bounding box
    rootMargin: '0px',   // No margins
    threshold: 0.2       // Trigger when 20% of the element is visible
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      
      // Check if the element has entered the viewport
      if (entry.isIntersecting) {
        
        // Add the active class to trigger CSS transitions (Fade in, Slide, Scale)
        entry.target.classList.add('active');
        
        // Unobserve the element so the animation triggers EXACTLY ONCE
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Initialize observer on each target element
  animatedElements.forEach(element => {
    scrollObserver.observe(element);
  });

  // Match the home page's smooth mouse-parallax tilt on desktop pointers.
  const supportsTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (supportsTilt) {
    const tiltTargets = document.querySelectorAll('.glass-card, .image-wrapper');
    let mouseX = 0;
    let mouseY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let hasMouseMoved = false;

    window.addEventListener('pointermove', event => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      hasMouseMoved = true;
    });

    function renderTilt() {
      if (hasMouseMoved) {
        const targetTiltX = mouseY * -6;
        const targetTiltY = mouseX * 6;

        currentTiltX += (targetTiltX - currentTiltX) * 0.08;
        currentTiltY += (targetTiltY - currentTiltY) * 0.08;

        tiltTargets.forEach(target => {
          if (!target.classList.contains('active')) return;

          target.classList.add('is-tilting');
          target.style.setProperty('--tilt-x', `${currentTiltX.toFixed(2)}deg`);
          target.style.setProperty('--tilt-y', `${currentTiltY.toFixed(2)}deg`);
        });
      }

      requestAnimationFrame(renderTilt);
    }

    requestAnimationFrame(renderTilt);
  }

});
