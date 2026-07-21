document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const actionBtn = document.getElementById('actionBtn');
  const bgAnim = document.getElementById('bgAnim');

  const initialDelay = 3000;      // 1. Wait 3s after page load
  const animationDuration = 3000; // 2. 3s image slide duration
  const bgDelay = 5000;           // 3. Wait 5s after button appears

  setTimeout(() => {
    stage.classList.add('animate');

    setTimeout(() => {
      actionBtn.classList.add('show');

      setTimeout(() => {
        // Simultaneously triggers the gradient wave AND both left/right blur balls
        bgAnim.classList.add('show');
      }, bgDelay);

    }, animationDuration);

  }, initialDelay);
});
