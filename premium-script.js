/**
 * STEMULAR — 3D Glassmorphism Tilt Engine
 * Uses pure vanilla JavaScript math to calculate responsive hover rotation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    const glare = card.querySelector('.card-glare');
    const isFeatured = card.getAttribute('data-featured') === 'true';

    // Set base scale depending on whether the card is the highlighted 1-Year plan
    const baseScale = isFeatured ? 1.04 : 1.0;
    const hoverScale = isFeatured ? 1.07 : 1.03;

    card.addEventListener('mousemove', (e) => {
      // Get the current dimensions and coordinates of the card
      const rect = card.getBoundingClientRect();
      
      // Calculate mouse position relative to the center of the card (-1 to 1 scale)
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      // Calculate rotation angles (max tilt: 10 degrees)
      // Note: Invert percentY so moving up tilts the top backward toward the user
      const rotateX = percentY * -10;
      const rotateY = percentX * 10;

      // Apply the 3D transform smoothly
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`;
      
      // Enhance border and shadow glow during active hover
      if (isFeatured) {
        card.style.boxShadow = `0 30px 60px rgba(0, 0, 0, 0.6), 0 0 50px rgba(0, 242, 254, 0.3)`;
      } else {
        card.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 255, 255, 0.1)`;
        card.style.borderColor = `rgba(255, 255, 255, 0.25)`;
      }

      // Move the internal radial glare to follow the mouse
      if (glare) {
        glare.style.opacity = '1';
        glare.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15), transparent 60%)`;
      }
    });

    card.addEventListener('mouseenter', () => {
      // Remove CSS transition duration on transform during active movement for instant response
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    });

    card.addEventListener('mouseleave', () => {
      // Restore smooth return transitions when cursor leaves
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease, border-color 0.6s ease';
      
      // Reset card to original flat state (maintaining featured enlargement if applicable)
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(${baseScale}, ${baseScale}, 1)`;
      
      // Reset shadows and borders
      if (isFeatured) {
        card.style.boxShadow = `0 25px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 242, 254, 0.15)`;
      } else {
        card.style.boxShadow = `0 20px 40px rgba(0, 0, 0, 0.4)`;
        card.style.borderColor = `rgba(255, 255, 255, 0.12)`;
      }

      // Fade out the glare
      if (glare) {
        glare.style.opacity = '0';
      }
    });
  });
});