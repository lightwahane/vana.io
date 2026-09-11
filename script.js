/**
 * VANA — A Cinematic Interactive Story for Ana & Vashu
 * Mobile-first, bi-directional auto-progression & gestural interactions
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
  let autoProgressTimeout = null;
  let isUserInteracting = false;

  // Scene pacing parameters (giving generous time to read, absorb & view)
  const SCENE_PACING = [
    { readingDelay: 7500, requiresAction: false },  // Scene 1: Prologue
    { readingDelay: 9500, requiresAction: false },  // Scene 2: Photo 1
    { readingDelay: 11000, requiresAction: true },  // Scene 3: Depth & Hold Interaction
    { readingDelay: 10000, requiresAction: false }, // Scene 4: Photo 3 & Honest Promise
    { readingDelay: 0, requiresAction: true }       // Scene 5: Confluence & Big Reveal
  ];

  /* ==========================================================================
     1. AMBIENT STARDUST ENGINE (Lightweight Canvas)
     ========================================================================== */
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 38; // Battery-optimized for 60fps on mobile

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
     2. MUSIC GATE CONTROLLER (Strict Unlock Verification)
     ========================================================================== */
  gateStartBtn.addEventListener('click', async () => {
    gateError.style.display = 'none';
    try {
      // Audio play initiated strictly by explicit user gesture
      await bgMusic.play();
      
      // Music confirmed playing: start romantic cinematic entrance
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
    
    // Activate Scene 1
    activateScene(0);
  }

  /* ==========================================================================
     3. LIGHTS CHOREOGRAPHY (V & A Position Modulation per Scene)
     ========================================================================== */
  function updateCelestialLights(index) {
    if (!nodeV || !nodeA) return;

    switch(index) {
      case 0: // Prologue: separated, drifting
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(20vw, 25vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(75vw, 40vh, 0)';
        break;
      case 1: // Photo 1: Drawing closer around the photo frame
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(25vw, 18vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(72vw, 22vh, 0)';
        break;
      case 2: // Photo 2: Intimate orbit
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(35vw, 20vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(65vw, 24vh, 0)';
        break;
      case 3: // Photo 3: Close alignment
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(40vw, 16vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(60vw, 18vh, 0)';
        break;
      case 4: // Confluence: Prepared to merge in center
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(46vw, 28vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(54vw, 28vh, 0)';
        break;
    }
  }

  /* ==========================================================================
     4. SCENE CONTROLLER (Manual Scroll / No Forced Auto-Scroll)
     ========================================================================== */
  function activateScene(index) {
    if (index < 0 || index >= scenes.length) return;
    currentSceneIndex = index;

    // Toggle active class across scenes (re-animates on scroll up & down)
    scenes.forEach((scene, i) => {
      if (i === index) {
        scene.classList.add('active-scene');
      } else {
        scene.classList.remove('active-scene');
      }
    });

    // Move wandering celestial lights (V & A) to match current scene
    updateCelestialLights(index);
  }

  /* ==========================================================================
     5. ROMANTIC INTERACTIONS
     ========================================================================== */

  // INTERACTION 1: Tap to bring V & A into resonance
  if (tapLightCue) {
    tapLightCue.addEventListener('click', () => {
      // Gentle vibration feedback on supported phones
      if (navigator.vibrate) navigator.vibrate([25]);

      tapLightCue.style.pointerEvents = 'none';
      tapLightCue.querySelector('.cue-label').textContent = 'Her light heard you...';
      
      // Node A moves towards V
      nodeA.style.transform = 'translate(-50%, -50%) translate3d(38vw, 26vh, 0)';

      // Auto advance to Photo 1 after ripple
      setTimeout(() => {
        smoothScrollToScene(1);
      }, 1200);
    });
  }

  // INTERACTION 2: Press and Hold connection (Circular Meter Fill)
  let holdTimer = null;
  let holdProgress = 0;
  const HOLD_DURATION = 2200; // 2.2 seconds hold
  const CIRCLE_CIRCUMFERENCE = 113.1;

  function setMeterProgress(percent) {
    const offset = CIRCLE_CIRCUMFERENCE - (percent * CIRCLE_CIRCUMFERENCE);
    holdCircleMeter.style.strokeDashoffset = offset;
  }

  function startHold(e) {
    isUserInteracting = true;
    holdProgress = 0;
    const startTime = Date.now();

    if (navigator.vibrate) navigator.vibrate(15);
    holdCueLabel.textContent = "Holding together...";

    holdTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(1, elapsed / HOLD_DURATION);
      setMeterProgress(pct);

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
    if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
    holdCueLabel.textContent = "Bound together.";
    holdCue.style.borderColor = "var(--rose-subtle)";

    setTimeout(() => {
      isUserInteracting = false;
      smoothScrollToScene(3);
    }, 1200);
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
      // Trigger heart-rate haptic on mobile
      if (navigator.vibrate) navigator.vibrate([40, 80, 40, 80, 120]);

      // Animate the two orbs to meet in the exact center
      orbV.style.transform = 'translateX(50px) scale(1.15)';
      orbA.style.transform = 'translateX(-50px) scale(1.15)';

      finalInteractionUI.classList.add('hidden');

      // Spark flash & reveal
      setTimeout(() => {
        orbV.style.opacity = '0';
        orbA.style.opacity = '0';

        // Unveil final VANA card
        revelationCard.classList.add('revealed');
        revelationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Confetti stardust burst
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
