/**
 * VANA — A Cinematic Interactive Story for Ana & Vashu
 * Mobile-first, manual pace, animated V & A lights across the entire site,
 * Heart-shaped star merge, increasing vibration & Scene 3 connection lock
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

  // Lights Nodes (Both V and A)
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
  const heartStarVessel = document.getElementById('heartStarVessel');
  const replayExperienceBtn = document.getElementById('replayExperienceBtn');

  // State Management
  let currentSceneIndex = 0;
  let isExperienceUnlocked = false;
  let isUserInteracting = false;
  let hasCompletedHold = false; // Restricts forward scroll past Scene 3 on first pass

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
     3. LIGHTS CHOREOGRAPHY (BOTH V & A FLOAT AND TRAVEL EVERYWHERE)
     ========================================================================== */
  function updateCelestialLights(index) {
    if (!nodeV || !nodeA) return;

    switch(index) {
      case 0: // Scene 1: Prologue - distant cosmic wanderers
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(20vw, 24vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(76vw, 36vh, 0)';
        nodeV.style.opacity = '1';
        nodeA.style.opacity = '1';
        break;
      case 1: // Scene 2: Photo 1 - gracefully hovering framing the first memory
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(22vw, 17vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(74vw, 21vh, 0)';
        nodeV.style.opacity = '1';
        nodeA.style.opacity = '1';
        break;
      case 2: // Scene 3: Photo 2 - drawing into a close, intimate orbit
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(32vw, 18vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(68vw, 22vh, 0)';
        nodeV.style.opacity = '1';
        nodeA.style.opacity = '1';
        break;
      case 3: // Scene 4: Photo 3 - side-by-side alignment with the promise
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(38vw, 15vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(62vw, 17vh, 0)';
        nodeV.style.opacity = '1';
        nodeA.style.opacity = '1';
        break;
      case 4: // Scene 5: Confluence - hovering directly above the heart star stage
        nodeV.style.transform = 'translate(-50%, -50%) translate3d(45vw, 26vh, 0)';
        nodeA.style.transform = 'translate(-50%, -50%) translate3d(55vw, 26vh, 0)';
        break;
    }
  }

  /* ==========================================================================
     4. SCENE CONTROLLER & SCROLL LOCK FOR FIRST-TIME HOLD
     ========================================================================== */
  function activateScene(index) {
    if (index < 0 || index >= scenes.length) return;
    currentSceneIndex = index;

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

  // --- STRICT FIRST-PASS FORWARD SCROLL LOCK AT SCENE 3 ---
  let touchStartY = 0;

  storyContainer.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  storyContainer.addEventListener('touchmove', (e) => {
    if (!hasCompletedHold && currentSceneIndex === 2) {
      const touchCurrentY = e.touches[0].clientY;
      const isSwipingUpwardToMoveDown = touchStartY - touchCurrentY > 15;

      if (isSwipingUpwardToMoveDown) {
        if (holdCue) {
          holdCue.style.transform = 'scale(1.05)';
          holdCue.style.borderColor = 'var(--gold-warm)';
          setTimeout(() => { 
            holdCue.style.transform = 'scale(1)'; 
            holdCue.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }, 250);
        }
        e.preventDefault(); // Lock forward scroll until hold completes
      }
    }
  }, { passive: false });

  // Handle desktop trackpad / mousewheel boundary
  storyContainer.addEventListener('wheel', (e) => {
    if (!hasCompletedHold && currentSceneIndex === 2 && e.deltaY > 0) {
      e.preventDefault();
      if (holdCue) {
        holdCue.style.transform = 'scale(1.05)';
        setTimeout(() => { holdCue.style.transform = 'scale(1)'; }, 250);
      }
    }
  }, { passive: false });

  // Handle Next step buttons (Scenes 2 and 4)
  document.querySelectorAll('[data-goto-next]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const parentScene = e.target.closest('.scene');
      if (!parentScene) return;
      const index = parseInt(parentScene.getAttribute('data-scene-index'), 10);
      if (navigator.vibrate) navigator.vibrate(20);
      smoothScrollToScene(index + 1);
    });
  });

  // Re-animate scenes on scrolling back or forth
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
          if (!hasCompletedHold && index > 2) {
            smoothScrollToScene(2);
            return;
          }
          activateScene(index);
        }
      }
    });
  }, observerOptions);

  scenes.forEach(scene => sceneObserver.observe(scene));

  /* ==========================================================================
     5. ROMANTIC INTERACTIONS & HEART-STAR MERGE
     ========================================================================== */

  // INTERACTION 1: Tap to call her light (Scene 1 single transition action)
  if (tapLightCue) {
    tapLightCue.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([25]);

      tapLightCue.style.pointerEvents = 'none';
      tapLightCue.querySelector('.cue-label').textContent = 'Her light heard you...';
      
      // Both lights resonate toward each other
      nodeV.style.transform = 'translate(-50%, -50%) translate3d(32vw, 24vh, 0)';
      nodeA.style.transform = 'translate(-50%, -50%) translate3d(48vw, 25vh, 0)';

      setTimeout(() => {
        smoothScrollToScene(1);
      }, 1200);
    });
  }

  // INTERACTION 2: Press & Hold with Increasing Dynamic Vibration (Scene 3)
  let holdTimer = null;
  let holdProgress = 0;
  const HOLD_DURATION = 2400; // 2.4s
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
    holdCueLabel.textContent = "Press and hold our connection to proceed";
    isUserInteracting = false;
  }

  function completeHoldInteraction() {
    holdProgress = 1;
    hasCompletedHold = true; // PERMANENTLY UNLOCKS FORWARD SCROLLING

    if (navigator.vibrate) navigator.vibrate([60, 50, 90]);
    holdCueLabel.textContent = "Bound together forever.";
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

  // INTERACTION 3: Climax Convergence (V & A Enter Inside Heart-Shaped Star)
  if (mergeTriggerBtn) {
    mergeTriggerBtn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([40, 80, 40, 80, 160]);

      const preMergeVows = document.getElementById('preMergeVows');
      if (preMergeVows) {
        preMergeVows.style.transition = 'opacity 0.6s ease';
        preMergeVows.style.opacity = '0';
      }

      // V and A slide smoothly inside the Heart-Shaped Star at the center
      orbV.style.transform = 'translateX(72px) scale(1.2)';
      orbA.style.transform = 'translateX(-72px) scale(1.2)';
      finalInteractionUI.classList.add('hidden');

      // Heart-star ignites and expands
      if (heartStarVessel) {
        heartStarVessel.classList.add('ignited');
        heartStarVessel.style.transform = 'scale(1.35)';
      }

      setTimeout(() => {
        orbV.style.opacity = '0';
        orbA.style.opacity = '0';

        // Unveil VANA revelation card
        revelationCard.classList.add('revealed');
        revelationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        spawnClimaxStardust();
      }, 1200);
    });
  }

  function spawnClimaxStardust() {
    for (let i = 0; i < 46; i++) {
      const p = new StardustParticle();
      p.x = canvas.width * 0.5 + (Math.random() - 0.5) * 130;
      p.y = canvas.height * 0.5 + (Math.random() - 0.5) * 130;
      p.speedY = (Math.random() - 0.5) * 5;
      p.speedX = (Math.random() - 0.5) * 5;
      p.size = Math.random() * 3.4 + 1.2;
      particles.push(p);
    }
  }

  // Replay from beginning
  if (replayExperienceBtn) {
    replayExperienceBtn.addEventListener('click', () => {
      const preMergeVows = document.getElementById('preMergeVows');
      if (preMergeVows) preMergeVows.style.opacity = '1';

      if (heartStarVessel) {
        heartStarVessel.classList.remove('ignited');
        heartStarVessel.style.transform = 'scale(1)';
      }

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
