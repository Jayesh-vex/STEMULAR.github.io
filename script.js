/**
 * 60 FPS Presentation Slider & iOS Touch/Swipe Engine
 * Features Side-by-Side Carousel View and Touch-Device Parallax Protection.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.card'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const slider = document.getElementById('slider');
  const floatingActions = document.createElement('div');
  floatingActions.className = 'card-actions floating-actions';
  floatingActions.setAttribute('aria-label', 'Card actions');
  slider.appendChild(floatingActions);
  let actionSource = null;
  
  let currentIndex = 0;
  let isScrolling = false;
  let scrollTimeout = null;
  const slideDuration = 1500;

  // Mouse Parallax Tilt variables
  let mouseX = 0;
  let mouseY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Detect Touch / iOS Device to disable mouse tilt (prevents mobile jitter)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Touch Swipe variables
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;

  // Mathematics-card symbols: bounded 2D movement with separate collisions.
  const mathContainer = document.querySelector('.math-symbols');
  const reduceMathMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (mathContainer && !reduceMathMotion) {
    const mathSymbols = Array.from(mathContainer.querySelectorAll('.math-symbol'));
    const mathState = mathSymbols.map((symbol, index) => {
      const state = {
        x: symbol.offsetLeft,
        y: symbol.offsetTop,
        width: symbol.offsetWidth,
        height: symbol.offsetHeight,
        velocityX: [64, -56, 52, -68, 60][index],
        velocityY: [46, 60, -64, -50, 56][index],
        rotation: index * 40,
        rotationSpeed: [16, -13, 18, -15, 14][index]
      };

      symbol.style.left = '0px';
      symbol.style.top = '0px';
      symbol.style.right = 'auto';
      symbol.style.bottom = 'auto';
      return state;
    });
    let previousMathFrame = performance.now();

    function animateMathSymbols(now) {
      const elapsed = Math.min((now - previousMathFrame) / 1000, 0.035);
      previousMathFrame = now;
      const bounds = {
        width: mathContainer.clientWidth,
        height: mathContainer.clientHeight,
        padding: 5
      };

      mathState.forEach(state => {
        state.x += state.velocityX * elapsed;
        state.y += state.velocityY * elapsed;

        const maxX = Math.max(bounds.padding, bounds.width - state.width - bounds.padding);
        const maxY = Math.max(bounds.padding, bounds.height - state.height - bounds.padding);

        if (state.x <= bounds.padding || state.x >= maxX) {
          state.x = Math.min(Math.max(state.x, bounds.padding), maxX);
          state.velocityX *= -1;
        }

        if (state.y <= bounds.padding || state.y >= maxY) {
          state.y = Math.min(Math.max(state.y, bounds.padding), maxY);
          state.velocityY *= -1;
        }
      });

      for (let first = 0; first < mathState.length; first += 1) {
        for (let second = first + 1; second < mathState.length; second += 1) {
          const firstSymbol = mathState[first];
          const secondSymbol = mathState[second];
          const dx = (secondSymbol.x + secondSymbol.width / 2) - (firstSymbol.x + firstSymbol.width / 2);
          const dy = (secondSymbol.y + secondSymbol.height / 2) - (firstSymbol.y + firstSymbol.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          const contactDistance = Math.min(firstSymbol.width, firstSymbol.height, secondSymbol.width, secondSymbol.height) * 0.52;

          if (distance >= contactDistance) continue;

          const normalX = dx / distance;
          const normalY = dy / distance;
          const relativeVelocity = (firstSymbol.velocityX - secondSymbol.velocityX) * normalX + (firstSymbol.velocityY - secondSymbol.velocityY) * normalY;
          const overlap = (contactDistance - distance) / 2;

          firstSymbol.x -= normalX * overlap;
          firstSymbol.y -= normalY * overlap;
          secondSymbol.x += normalX * overlap;
          secondSymbol.y += normalY * overlap;

          if (relativeVelocity > 0) {
            firstSymbol.velocityX -= relativeVelocity * normalX;
            firstSymbol.velocityY -= relativeVelocity * normalY;
            secondSymbol.velocityX += relativeVelocity * normalX;
            secondSymbol.velocityY += relativeVelocity * normalY;
          }
        }
      }

      mathState.forEach((state, index) => {
        state.rotation += state.rotationSpeed * elapsed;
        mathSymbols[index].style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) rotate(${state.rotation.toFixed(2)}deg)`;
      });

      requestAnimationFrame(animateMathSymbols);
    }

    requestAnimationFrame(animateMathSymbols);
  }

  // The card itself is 3D-transformed. Keep the interactive controls in a
  // separate top-level layer so the card animation can never steal their hit area.
  function syncFloatingActions() {
    const source = cards[currentIndex]?.querySelector('.card-actions');
    if (!source) return;

    if (source !== actionSource) {
      actionSource = source;
      floatingActions.innerHTML = source.innerHTML;
      document.body.classList.add('floating-actions-ready');
    }

    const rect = source.getBoundingClientRect();
    floatingActions.style.left = `${rect.left}px`;
    floatingActions.style.top = `${rect.top}px`;
    floatingActions.style.width = `${rect.width}px`;
  }

  /**
   * Updates 3D positions: Inactive cards are smaller and visible to the left/right.
   */
  function updateSlider(animate = true) {
    document.body.dataset.cardTheme = currentIndex;

    cards.forEach((card, index) => {
      const offset = index - currentIndex;
      
      // Side-by-side positioning calculation
      // 108% X-offset keeps side cards visible without overlapping on mobile screens
      let x = offset * 108; 
      let scale = 1;
      let opacity = 1;
      let pointerEvents = 'none';

      if (offset === 0) {
        // ACTIVE CENTERED CARD
        scale = 1;
        opacity = 1;
        pointerEvents = 'auto';
        card.classList.add('active');
      } else {
        // INACTIVE CARDS (Visible to Left or Right)
        scale = 0.72; // Scales down smoothly on side views
        opacity = 0.35; // Faded out slightly
        card.classList.remove('active');
      }

      card.style.transition = animate 
        ? `transform ${slideDuration}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${slideDuration}ms ease` 
        : 'none';

      // Apply transform (using percentage for X and subtracting 50% for centering)
      if (offset !== 0 || isTouchDevice) {
        card.style.transform = `translate3d(calc(${x}% - 50%), -50%, 0px) scale(${scale})`;
      } else {
        card.style.transform = `translate3d(-50%, -50%, 0px) scale(1) rotateX(0deg) rotateY(0deg)`;
      }

      card.style.opacity = opacity;
      card.style.pointerEvents = pointerEvents;
      card.style.zIndex = 10 - Math.abs(offset);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    syncFloatingActions();
  }

  function navigateTo(index) {
    if (index < 0 || index >= cards.length || index === currentIndex) return;
    
    currentIndex = index;
    currentTiltX = 0;
    currentTiltY = 0;
    updateSlider(true);

    isScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, slideDuration + 100);
  }

  /**
   * Trackpad / Mouse Wheel Handler
   */
  window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
      if (e.deltaY > 0 || e.deltaX > 0) {
        navigateTo(currentIndex + 1);
      } else {
        navigateTo(currentIndex - 1);
      }
    }
  }, { passive: true });

  /**
   * iOS & Mobile Touch Handlers (With directional swipe detection)
   */
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Ensure the user is swiping horizontally, not scrolling vertically
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        navigateTo(currentIndex + 1); // Swipe Left -> Next Card
      } else {
        navigateTo(currentIndex - 1); // Swipe Right -> Prev Card
      }
    }
  }, { passive: true });

  /**
   * Pagination Dot Navigation
   */
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      navigateTo(index);
    });
  });

  // Capture the press on the floating control while the card continues moving.
  floatingActions.addEventListener('pointerdown', (e) => {
    const button = e.target.closest('.btn');
    if (button) {
      button.classList.add('is-pressing');
      if (button.setPointerCapture) button.setPointerCapture(e.pointerId);
    }
  });

  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((eventName) => {
    floatingActions.addEventListener(eventName, (e) => {
      e.target.closest('.btn')?.classList.remove('is-pressing');
    });
  });

  /**
   * Mouse Movement Tracker (Desktop Only)
   */
  if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function renderTilt() {
      const activeCard = cards[currentIndex];
      if (activeCard && !isScrolling) {
        const targetTiltX = mouseY * -6;
        const targetTiltY = mouseX * 6;

        currentTiltX += (targetTiltX - currentTiltX) * 0.08;
        currentTiltY += (targetTiltY - currentTiltY) * 0.08;

        activeCard.style.transition = 'none';
        activeCard.style.transform = `translate3d(-50%, -50%, 0px) scale(1) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
      }
      requestAnimationFrame(renderTilt);
    }
    requestAnimationFrame(renderTilt);
  }

  function renderFloatingActions() {
    syncFloatingActions();
    requestAnimationFrame(renderFloatingActions);
  }
  requestAnimationFrame(renderFloatingActions);

  // Initialize Layout
  updateSlider(false);
});
