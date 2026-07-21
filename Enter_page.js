document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('stage');
  const actionBtn = document.getElementById('actionBtn');

  const initialDelay = 3000;      // 3-second delay after page load
  const animationDuration = 3000; // 3-second transition duration

  setTimeout(() => {
    // Triggers simultaneous sliding/fading of images
    stage.classList.add('animate');

    // Shows button after image transition ends
    setTimeout(() => {
      actionBtn.classList.add('show');
    }, animationDuration);

  }, initialDelay);
});