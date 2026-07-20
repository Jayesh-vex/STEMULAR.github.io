/**
 * 60 FPS E.V.E. Authentication Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE & DOM REFERENCES ---
  let isRegistering = false;
  let isPasswordRevealed = false;
  let isConfirmRevealed = false;
  let isFocusedOnPassword = false;
  let blinkInterval = null;

  // UI Tabs & Form Elements
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const tabIndicator = document.getElementById('tab-indicator');
  const formTitle = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const alertBox = document.getElementById('alert-box');
  const authForm = document.getElementById('auth-form');
  const btnText = document.getElementById('btn-text');
  const forgotLink = document.getElementById('forgot-link');

  // Input Fields & Groups
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const groupEmail = document.getElementById('group-email');
  const groupConfirm = document.getElementById('group-confirm-password');
  const rememberCheckbox = document.getElementById('remember-me');

  // Password Toggles
  const togglePasswordBtn = document.getElementById('toggle-password');
  const toggleConfirmBtn = document.getElementById('toggle-confirm-password');

  // Robot Elements
  const robot = document.getElementById('robot');
  const robotHead = document.getElementById('robot-head');
  const eyeLeft = document.getElementById('eye-left');
  const eyeRight = document.getElementById('eye-right');


  // =========================================================
  // 1. INITIALIZATION & REMEMBER ME CHECK
  // =========================================================
  function init() {
    startDigitalBlinking();
    checkRememberedUser();
  }

  function checkRememberedUser() {
    const savedUser = localStorage.getItem('eve_remembered_user');
    if (savedUser) {
      usernameInput.value = savedUser;
      rememberCheckbox.checked = true;
    }
  }


  // =========================================================
  // 2. TAB SWITCHING LOGIC
  // =========================================================
  function switchTab(toRegister) {
    if (isRegistering === toRegister) return;
    isRegistering = toRegister;

    clearAlert();
    setRobotState('idle');

    if (isRegistering) {
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      tabIndicator.style.transform = 'translateX(100%)';
      
      formTitle.textContent = 'Create Account';
      formSubtitle.textContent = 'Register your credentials for terminal access.';
      btnText.textContent = 'Register Account';
      forgotLink.style.display = 'none';

      groupEmail.classList.add('expanded');
      groupConfirm.classList.add('expanded');
      emailInput.required = true;
      confirmInput.required = true;
    } else {
      tabRegister.classList.remove('active');
      tabLogin.classList.add('active');
      tabIndicator.style.transform = 'translateX(0)';
      
      formTitle.textContent = 'Welcome Back';
      formSubtitle.textContent = 'Enter your details to access your secure portal.';
      btnText.textContent = 'Sign In';
      forgotLink.style.display = 'inline';

      groupEmail.classList.remove('expanded');
      groupConfirm.classList.remove('expanded');
      emailInput.required = false;
      confirmInput.required = false;
    }
  }

  tabLogin.addEventListener('click', () => switchTab(false));
  tabRegister.addEventListener('click', () => switchTab(true));


  // =========================================================
  // 3. SHOW / HIDE PASSWORD & EVE PEEKING
  // =========================================================
  function setupPasswordToggle(button, inputField, isConfirmField = false) {
    button.addEventListener('click', () => {
      const openEye = button.querySelector('.open-eye');
      const closedEye = button.querySelector('.closed-eye');
      
      if (inputField.type === 'password') {
        inputField.type = 'text';
        openEye.classList.add('hidden');
        closedEye.classList.remove('hidden');
        if (isConfirmField) isConfirmRevealed = true;
        else isPasswordRevealed = true;
      } else {
        inputField.type = 'password';
        openEye.classList.remove('hidden');
        closedEye.classList.add('hidden');
        if (isConfirmField) isConfirmRevealed = false;
        else isPasswordRevealed = false;
      }

      if (isFocusedOnPassword) {
        evaluateRobotPasswordState();
      }
    });
  }

  setupPasswordToggle(togglePasswordBtn, passwordInput, false);
  setupPasswordToggle(toggleConfirmBtn, confirmInput, true);


  // =========================================================
  // 4. E.V.E. STATE ENGINE & DIGITAL BLINKING
  // =========================================================
  function setRobotState(state) {
    robot.classList.remove('covering', 'peeking', 'success', 'error');

    // Reset inline eye styles from tracking when entering special states
    if (state !== 'idle') {
      eyeLeft.style.transform = '';
      eyeRight.style.transform = '';
      robotHead.style.transform = '';
    }

    switch (state) {
      case 'covering':
        robot.classList.add('covering');
        break;
      case 'peeking':
        robot.classList.add('peeking');
        break;
      case 'success':
        robot.classList.add('success');
        break;
      case 'error':
        robot.classList.add('error');
        setTimeout(() => robot.classList.remove('error'), 1200);
        break;
      case 'idle':
      default:
        break;
    }
  }

  function evaluateRobotPasswordState() {
    if (isPasswordRevealed || (isRegistering && isConfirmRevealed)) {
      setRobotState('peeking');
    } else {
      setRobotState('covering');
    }
  }

  // EVE Digital LED Blink Routine (Eyes flatten vertically)
  function startDigitalBlinking() {
    blinkInterval = setInterval(() => {
      if (robot.classList.contains('covering') || robot.classList.contains('success') || robot.classList.contains('error')) return;

      const currentLeftTransform = eyeLeft.style.transform;
      const currentRightTransform = eyeRight.style.transform;

      // Flatten LED eyes to simulate digital blink
      eyeLeft.style.transform = `${currentLeftTransform} scaleY(0.1)`;
      eyeRight.style.transform = `${currentRightTransform} scaleY(0.1)`;

      setTimeout(() => {
        if (robot.classList.contains('covering') || robot.classList.contains('success')) return;
        eyeLeft.style.transform = currentLeftTransform;
        eyeRight.style.transform = currentRightTransform;
      }, 120);
    }, 4500);
  }

  // Focus listeners
  [usernameInput, emailInput].forEach(input => {
    input.addEventListener('focus', () => {
      isFocusedOnPassword = false;
      setRobotState('idle');
    });
  });

  [passwordInput, confirmInput].forEach(input => {
    input.addEventListener('focus', () => {
      isFocusedOnPassword = true;
      evaluateRobotPasswordState();
    });
    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement !== passwordInput && document.activeElement !== confirmInput) {
          isFocusedOnPassword = false;
          setRobotState('idle');
        }
      }, 50);
    });
  });


  // =========================================================
  // 5. MOUSE TRACKING ENGINE (60 FPS Using Trigonometry)
  // =========================================================
  window.addEventListener('mousemove', (e) => {
    if (robot.classList.contains('covering') || robot.classList.contains('success') || robot.classList.contains('error')) return;

    const headRect = robotHead.getBoundingClientRect();
    const headCenterX = headRect.left + headRect.width / 2;
    const headCenterY = headRect.top + headRect.height / 2;

    const deltaX = e.clientX - headCenterX;
    const deltaY = e.clientY - headCenterY;
    const angle = Math.atan2(deltaY, deltaX);

    // Keep digital eyes smoothly contained within the visor boundary (Max 12px)
    const distance = Math.min(12, Math.hypot(deltaX, deltaY) / 18);

    const eyeX = Math.cos(angle) * distance;
    const eyeY = Math.sin(angle) * distance;

    const headTilt = (deltaX / window.innerWidth) * 14; 

    if (!robot.classList.contains('peeking')) {
      eyeLeft.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
      eyeRight.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
      robotHead.style.transform = `rotate(${headTilt}deg)`;
    } else {
      // If peeking, only let right eye track while left eye stays open wide
      eyeRight.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
    }
  }, { passive: true });


  // =========================================================
  // 6. VALIDATION & LOCAL STORAGE AUTH
  // =========================================================
  function showAlert(msg, type = 'error') {
    alertBox.textContent = msg;
    alertBox.className = `alert-box ${type}`;
    if (type === 'error') setRobotState('error');
  }

  function clearAlert() {
    alertBox.className = 'alert-box';
    alertBox.textContent = '';
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  async function writeAuditEntry(action, details = {}) {
    const response = await fetch(`http://localhost:3000/api/audit/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });

    if (!response.ok) {
      throw new Error('The audit server could not save the entry.');
    }
  }

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const confirmPass = confirmInput.value;

    if (!username || !password) {
      return showAlert('Please fill in all required terminal fields.');
    }

    let usersDb = JSON.parse(localStorage.getItem('eve_users') || '[]');

    if (isRegistering) {
      if (!email) return showAlert('Please enter an email address.');
      if (!validateEmail(email)) return showAlert('Please enter a valid email format.');
      if (password.length < 6) return showAlert('Password must be at least 6 characters long.');
      if (password !== confirmPass) return showAlert('Passwords do not match!');

      const userExists = usersDb.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (userExists) return showAlert('Username already registered in database.');

      try {
        await writeAuditEntry('register', { username, password });
      } catch (error) {
        return showAlert('Account could not be recorded. Run npm start and try again.');
      }

      usersDb.push({ username, email, password });
      localStorage.setItem('eve_users', JSON.stringify(usersDb));

      if (rememberCheckbox.checked) {
        localStorage.setItem('eve_remembered_user', username);
      } else {
        localStorage.removeItem('eve_remembered_user');
      }

      showAlert('Terminal account registered! You can now sign in.', 'success');
      setRobotState('success');

      setTimeout(() => {
        authForm.reset();
        switchTab(false);
        usernameInput.value = username;
        setRobotState('idle');
      }, 1800);

    } else {
      const foundUser = usersDb.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      // Demo fallback credentials
      const isDemoUser = (username === 'admin' && password === 'admin123');

      if (foundUser || isDemoUser) {
        if (rememberCheckbox.checked) {
          localStorage.setItem('eve_remembered_user', username);
        } else {
          localStorage.removeItem('eve_remembered_user');
        }

        showAlert('Access Granted! Welcome to STEMULAR!', 'success');
        setRobotState('success');
        
        const allInputs = authForm.querySelectorAll('input, button');
        allInputs.forEach(el => el.disabled = true);

      } else {
        showAlert('Access Denied: Invalid username or password.');
      }
    }
  });

  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    showAlert('Reset instruction broadcasted to your registered frequency.', 'success');
  });

  // Allow pages such as Explore to open the correct authentication tab directly.
  if (window.location.hash === '#register') {
    switchTab(true);
  }

  init();
});
