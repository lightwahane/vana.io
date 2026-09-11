/**
 * VANA — A Cinematic Interactive Story for Ana & Vashu
 * Mobile-first, manual pace, increasing vibration & bi-directional reanimation
 */

(function () {
  'use strict';

  // --- Core References ---
  const gateScreen = document.getElementById('gate-screen');
  const gateStartBtn = document.getElementById('gate-start-btn');
  const gateError = document.getElementById('gate-error');
  const bgMusic = document.getElementById('bg-music');
  const storyContainer = document.getElementById('story-container');
  const scenes = Array.from(document.querySelectorAll('.scene'));

  // Lights Nodes
  const nodeV = document.getElementById('nodeV');
  const nodeA = document.getElementById('nodeA');

  // Interaction Controls
  const holdCue = document.querySelector('[data-cue-type="hold-heart"]');
  const holdCircleMeter = document.getElementById('holdCircleMeter');
  const holdCueLabel = document.getElementById('holdCueLabel');
  const tapLightCue = document.querySelector('[data-cue-type="tap-light"]');

  // Climax Controls
  const mergeTriggerBtn = document.getElementById('mergeTriggerBtn');
  const finalInteractionUI = document.getElementById('finalInteractionUI');
  const revelationCard = document.getElementById('revelationCard');
  const orbV = document.getElementById('orbV');
  const orbA = document.getElementById('orbA');
  const replayExperienceBtn = document.getElementById('replayExperienceBtn');

  // State Management
  let currentSceneIndex = 0;
  let isExperienceUnlocked = false;
  let isUserInteracting = false;

  /* ==========================================================================
     1. AMBIENT STARDUST ENGINE (Lightweight Canvas)
     ========================================================================== */
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 38;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  class StardustParticle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 1.8 + 0.6;
      this.speedY = Math.random() * 0.35 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.5 ? '212, 175, 55' : '226, 142, 155';
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new StardustParticle());
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(renderParticles);
  }
  requestAnimationFrame(renderParticles);

  /* ==========================================================================
     2. MUSIC GATE CONTROLLER (Strict Interaction Start)
     ========================================================================== */
  gateStartBtn.addEventListener('click', async () => {
    gateError.style.display = 'none';
    try {
      await bgMusic.play();
      gateScreen.classList.add('dismissed');
      setTimeout(() => {
        gateScreen.style.display = 'none';
        unlockExperience();
      }, 1800);
    } catch (err) {
      console.warn('Audio playback waiting for gesture confirmation:', err);
      gateError.style.display = 'block';
    }
  });

  function unlockExperience() {
    isExperienceUnlocked = true;
    storyContainer.classList.remove('locked');
    storyContainer.focus();
    activateScene(0);
  }

  /* ==========================================================================
     3. LIGHTS CHOREOGRAPHY (V & A Movement Per Scene)
     ========================================================================== */
  function updateCelestialLights(index) {
    if (!nodeV || !nodeA) return;

    switch(index) {
      case 0: // Prologue
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(20vw, 25vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(75vw, 40vh, 0)';
        break;
      case 1: // Photo 1
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(25vw, 18vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(72vw, 22vh, 0)';
        break;
      case 2: // Photo 2
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(35vw, 20vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(65vw, 24vh, 0)';
        break;
      case 3: // Photo 3
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(40vw, 16vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(60vw, 18vh, 0)';
        break;
      case 4: // Confluence
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(46vw, 28vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(54vw, 28vh, 0)';
        break;
    }
  }

  /* ==========================================================================
     4. SCENE CONTROLLER (Manual Pace, Bi-directional Reanimation)
     ========================================================================== */
  function activateScene(index) {
    if (index < 0 || index >= scenes.length) return;
    currentSceneIndex = index;

    // Toggle active classes (reanimates gracefully whenever entering viewport)
    scenes.forEach((scene, i) => {
      if (i === index) {
        scene.classList.add('active-scene');
      } else {
        scene.classList.remove('active-scene');
      }
    });

    updateCelestialLights(index);
  }

  function smoothScrollToScene(targetIndex) {
    if (targetIndex >= scenes.length) return;
    const targetScene = scenes[targetIndex];
    if (targetScene) {
      targetScene.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Interactive buttons to glide forward to the next moment
  document.querySelectorAll('[data-goto-next]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const parentScene = e.target.closest('.scene');
      if (!parentScene) return;
      const index = parseInt(parentScene.getAttribute('data-scene-index'), 10);
      if (navigator.vibrate) navigator.vibrate(20);
      smoothScrollToScene(index + 1);
    });
  });

  // Reanimate scenes on scrolling up or down
  const observerOptions = {
    root: storyContainer,
    threshold: 0.55
  };

  const sceneObserver = new IntersectionObserver((entries) => {
    if (!isExperienceUnlocked) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-scene-index'), 10);
        if (!isNaN(index)) {
          activateScene(index);
        }
      }
    });
  }, observerOptions);

  scenes.forEach(scene => sceneObserver.observe(scene));

  /* ==========================================================================
     5. ROMANTIC INTERACTIONS & INCREASING VIBRATION
     ========================================================================== */

  // INTERACTION 1: Tap to call her light
  if (tapLightCue) {
    tapLightCue.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([25]);

      tapLightCue.style.pointerEvents = 'none';
      tapLightCue.querySelector('.cue-label').textContent = 'Her light heard you...';
      
      nodeA.style.transform = 'translate(-50%, -50%) translate3d(38vw, 26vh, 0)';

      setTimeout(() => {
        smoothScrollToScene(1);
      }, 1200);
    });
  }

  // INTERACTION 2: Press & Hold with Increasing Dynamic Vibration
  let holdTimer = null;
  let holdProgress = 0;
  const HOLD_DURATION = 2400; // 2.4s hold
  const CIRCLE_CIRCUMFERENCE = 113.1;

  function setMeterProgress(percent) {
    const offset = CIRCLE_CIRCUMFERENCE - (percent * CIRCLE_CIRCUMFERENCE);
    holdCircleMeter.style.strokeDashoffset = offset;
  }

  function startHold(e) {
    isUserInteracting = true;
    holdProgress = 0;
    const startTime = Date.now();
    holdCueLabel.textContent = "Holding our hearts together...";

    if (navigator.vibrate) navigator.vibrate(25);
    let lastVibeTime = Date.now();

    holdTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const pct = Math.min(1, elapsed / HOLD_DURATION);
      setMeterProgress(pct);

      // Accelerate pulse frequency & intensity: starts at 380ms interval down to 80ms
      const vibeIntervalTime = 380 - (pct * 300);
      const vibeDuration = Math.round(15 + (pct * 35));

      if (now - lastVibeTime >= vibeIntervalTime) {
        if (navigator.vibrate) navigator.vibrate(vibeDuration);
        lastVibeTime = now;
      }

      if (pct >= 1) {
        clearInterval(holdTimer);
        completeHoldInteraction();
      }
    }, 25);
  }

  function cancelHold() {
    if (holdProgress >= 1) return;
    clearInterval(holdTimer);
    setMeterProgress(0);
    holdCueLabel.textContent = "Press and hold our connection";
    isUserInteracting = false;
  }

  function completeHoldInteraction() {
    holdProgress = 1;
    // Heartbeat pattern on release
    if (navigator.vibrate) navigator.vibrate([60, 50, 90]);
    holdCueLabel.textContent = "Bound together.";
    holdCue.style.borderColor = "var(--rose-subtle)";

    setTimeout(() => {
      isUserInteracting = false;
      smoothScrollToScene(3);
    }, 1100);
  }

  if (holdCue) {
    holdCue.addEventListener('touchstart', startHold, { passive: true });
    holdCue.addEventListener('touchend', cancelHold, { passive: true });
    holdCue.addEventListener('touchcancel', cancelHold, { passive: true });
    holdCue.addEventListener('mousedown', startHold);
    holdCue.addEventListener('mouseup', cancelHold);
    holdCue.addEventListener('mouseleave', cancelHold);
  }

  // INTERACTION 3: Climax Convergence (V + A = VANA)
  if (mergeTriggerBtn) {
    mergeTriggerBtn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([40, 80, 40, 80, 120]);

      const preMergeVows = document.getElementById('preMergeVows');
      if (preMergeVows) {
        preMergeVows.style.transition = 'opacity 0.6s ease';
        preMergeVows.style.opacity = '0';
      }

      orbV.style.transform = 'translateX(50px) scale(1.15)';
      orbA.style.transform = 'translateX(-50px) scale(1.15)';
      finalInteractionUI.classList.add('hidden');

      setTimeout(() => {
        orbV.style.opacity = '0';
        orbA.style.opacity = '0';
        revelationCard.classList.add('revealed');
        revelationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        spawnClimaxStardust();
      }, 1100);
    });
  }

  function spawnClimaxStardust() {
    for (let i = 0; i < 40; i++) {
      const p = new StardustParticle();
      p.x = canvas.width * 0.5 + (Math.random() - 0.5) * 120;
      p.y = canvas.height * 0.5 + (Math.random() - 0.5) * 120;
      p.speedY = (Math.random() - 0.5) * 4;
      p.speedX = (Math.random() - 0.5) * 4;
      p.size = Math.random() * 3 + 1;
      particles.push(p);
    }
  }

  // Replay from beginning
  if (replayExperienceBtn) {
    replayExperienceBtn.addEventListener('click', () => {
      const preMergeVows = document.getElementById('preMergeVows');
      if (preMergeVows) preMergeVows.style.opacity = '1';

      revelationCard.classList.remove('revealed');
      finalInteractionUI.classList.remove('hidden');
      orbV.style.transform = '';
      orbV.style.opacity = '1';
      orbA.style.transform = '';
      orbA.style.opacity = '1';

      storyContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
