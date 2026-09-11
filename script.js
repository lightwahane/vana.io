/* ==========================================================
   UTILITIES
   ========================================================== */
const prefersReducedMotion = window.matchMedia("(prefers-reduce-motion: reduce), (prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const vibrate = (pattern) => {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { /* silently ignore */ }
  }
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ==========================================================
   AMBIENT STARFIELD (persistent background)
   ========================================================== */
function initStarfield() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let width, height, stars;

  function resize() {
    width = canvas.width = window.innerWidth * devicePixelRatio;
    height = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = Math.round((window.innerWidth * window.innerHeight) / 9000);
    stars = Array.from({ length: clamp(count, 40, 110) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: (Math.random() * 1.1 + 0.3) * devicePixelRatio,
      baseAlpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0006 + 0.0002,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f4ede2";
    for (const s of stars) {
      const twinkle = prefersReducedMotion ? s.baseAlpha : s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.2;
      ctx.globalAlpha = clamp(twinkle, 0, 1);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(draw);
}

/* ==========================================================
   FINALE PARTICLE BURST (one-shot, lightweight)
   ========================================================== */
function burstFinaleParticles() {
  const canvas = document.getElementById("finale-particles");
  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth * devicePixelRatio);
  const height = (canvas.height = window.innerHeight * devicePixelRatio);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  if (prefersReducedMotion) return;

  const cx = width / 2;
  const cy = height * 0.42;
  const count = 70;
  const particles = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 1.6 + 0.4) * devicePixelRatio;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.4 * devicePixelRatio,
      life: 1,
      decay: Math.random() * 0.008 + 0.006,
      r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
      hue: Math.random() > 0.5 ? "244,237,226" : "205,165,108",
    };
  });

  function frame() {
    ctx.clearRect(0, 0, width, height);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.004 * devicePixelRatio;
      p.life -= p.decay;
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = `rgba(${p.hue},1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ==========================================================
   TEXT REVEAL HELPER
   ========================================================== */
function revealLines(scope, selector = "[data-line]", stagger = 550, startDelay = 250) {
  const nodes = scope.querySelectorAll(selector);
  nodes.forEach((node, i) => {
    setTimeout(() => node.classList.add("is-visible"), startDelay + i * stagger);
  });
  return startDelay + nodes.length * stagger + 900; // approx time until fully settled
}

function revealPrompt(scope, delay = 300) {
  const p = scope.querySelector("[data-prompt]");
  if (p) setTimeout(() => p.classList.add("is-visible"), delay);
}

/* ==========================================================
   MUSIC GATE
   ========================================================== */
function initGate(onUnlocked) {
  const gate = document.getElementById("gate");
  const btn = document.getElementById("gate-btn");
  const audio = document.getElementById("theme-audio");
  let unlocking = false;

  btn.addEventListener("click", async () => {
    if (unlocking) return;
    unlocking = true;
    try {
      await audio.play();
      gate.classList.add("is-leaving");
      vibrate(12);
      setTimeout(() => {
        gate.setAttribute("hidden", "");
        onUnlocked();
      }, 1350);
    } catch (err) {
      // Autoplay/play rejected — let her try again.
      unlocking = false;
      btn.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
        { duration: 260 }
      );
    }
  });
}

/* ==========================================================
   INTERACTION: HOLD THE EMBER (long-press)
   ========================================================== */
function setupEmberHold(scene, onComplete) {
  const spark = scene.querySelector("#spark");
  const gesture = scene.querySelector("#gesture-hold");
  const label = scene.querySelector("#hold-label");
  const HOLD_MS = 1500;
  let pressTimer = null;
  let startedOnce = false;
  let done = false;

  function startHold() {
    if (done) return;
    startedOnce = true;
    spark.classList.add("is-charging");
    gesture.classList.add("is-hidden");
    pressTimer = setTimeout(finish, HOLD_MS);
  }
  function cancelHold() {
    if (done) return;
    spark.classList.remove("is-charging");
    clearTimeout(pressTimer);
  }
  function finish() {
    if (done) return;
    done = true;
    spark.classList.remove("is-charging");
    spark.classList.add("is-lit");
    vibrate(18);
    setTimeout(onComplete, 1400);
  }

  spark.addEventListener("pointerdown", (e) => { e.preventDefault(); startHold(); });
  spark.addEventListener("pointerup", cancelHold);
  spark.addEventListener("pointerleave", cancelHold);
  spark.addEventListener("pointercancel", cancelHold);
  spark.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); startHold(); }
  });
  spark.addEventListener("keyup", (e) => {
    if (e.key === " " || e.key === "Enter") cancelHold();
  });

  // gentle nudge + fallback so she's never stuck
  setTimeout(() => { if (!startedOnce && !done) label.textContent = "whenever you're ready..."; }, 7000);
  setTimeout(() => { if (!done) finish(); }, 22000);
}

/* ==========================================================
   INTERACTION: SWIPE THE STARS AWAY
   ========================================================== */
function setupSwipeReveal(scene, onComplete) {
  const veil = scene.querySelector("#star-veil");
  const gesture = scene.querySelector("#gesture-swipe");
  const label = scene.querySelector("#swipe-label");
  const THRESHOLD = 70;
  let startX = 0;
  let dx = 0;
  let dragging = false;
  let done = false;
  let startedOnce = false;

  function onDown(e) {
    if (done) return;
    dragging = true;
    startedOnce = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    gesture.classList.add("is-hidden");
  }
  function onMove(e) {
    if (!dragging || done) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = x - startX;
    veil.style.transform = `translateX(${clamp(dx, -260, 40)}px)`;
    veil.style.opacity = String(clamp(1 - Math.abs(dx) / 260, 0.15, 1));
  }
  function onUp() {
    if (!dragging || done) return;
    dragging = false;
    if (dx < -THRESHOLD) {
      finish();
    } else {
      veil.style.transform = "";
      veil.style.opacity = "";
    }
    dx = 0;
  }
  function finish() {
    if (done) return;
    done = true;
    veil.style.transform = "";
    veil.style.opacity = "";
    veil.classList.add("is-cleared");
    vibrate(14);
    setTimeout(() => {
      const caption = scene.querySelector(".caption");
      if (caption) caption.classList.add("is-visible");
      setTimeout(onComplete, 1600);
    }, 500);
  }

  veil.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  setTimeout(() => { if (!startedOnce && !done) label.textContent = "whenever you're ready..."; }, 7000);
  setTimeout(() => { if (!done) finish(); }, 22000);
}

/* ==========================================================
   INTERACTION: DRAG THE LIGHT AWAY
   ========================================================== */
function setupDragReveal(scene, onComplete) {
  const cover = scene.querySelector("#drag-cover");
  const orb = scene.querySelector("#drag-orb");
  const THRESHOLD = 90;
  let ox = 0, oy = 0, dragging = false, done = false, startedOnce = false;

  function onDown(e) {
    if (done) return;
    dragging = true;
    startedOnce = true;
    orb.classList.add("is-active");
    orb.setPointerCapture && e.pointerId != null && orb.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (!dragging || done) return;
    ox += e.movementX || 0;
    oy += e.movementY || 0;
    orb.style.transform = `translate(${ox}px, ${oy}px)`;
    const dist = Math.hypot(ox, oy);
    if (dist > THRESHOLD) finish();
  }
  function onUp() {
    if (!dragging || done) return;
    dragging = false;
    orb.classList.remove("is-active");
    if (Math.hypot(ox, oy) <= THRESHOLD) {
      ox = 0; oy = 0;
      orb.style.transform = "";
    }
  }
  function finish() {
    if (done) return;
    done = true;
    cover.classList.add("is-cleared");
    vibrate(14);
    setTimeout(() => {
      const caption = scene.querySelector("#drag-caption");
      if (caption) caption.classList.add("is-visible");
      setTimeout(onComplete, 1800);
    }, 500);
  }

  orb.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  setTimeout(() => { if (!done) finish(); }, 22000);
}

/* ==========================================================
   INTERACTION: FINAL HOLD — TWO LIGHTS BECOME ONE
   ========================================================== */
function setupFinalHold(scene, onComplete) {
  const wrap = scene.querySelector("#merge-wrap");
  const label = scene.querySelector("#merge-label");
  const HOLD_MS = 2000;
  let pressTimer = null;
  let done = false;
  let startedOnce = false;

  function start() {
    if (done) return;
    startedOnce = true;
    wrap.classList.add("is-holding");
    pressTimer = setTimeout(finish, HOLD_MS);
  }
  function cancel() {
    if (done) return;
    wrap.classList.remove("is-holding");
    clearTimeout(pressTimer);
  }
  function finish() {
    if (done) return;
    done = true;
    wrap.classList.remove("is-holding");
    wrap.classList.add("is-merged");
    vibrate([16, 40, 24]);
    setTimeout(onComplete, 1500);
  }

  wrap.addEventListener("pointerdown", (e) => { e.preventDefault(); start(); });
  wrap.addEventListener("pointerup", cancel);
  wrap.addEventListener("pointerleave", cancel);
  wrap.addEventListener("pointercancel", cancel);

  setTimeout(() => { if (!startedOnce && !done) label.textContent = "whenever you're ready..."; }, 7000);
  setTimeout(() => { if (!done) finish(); }, 24000);
}

/* ==========================================================
   FINALE SCENE
   ========================================================== */
function runFinale(scene) {
  const settleTime = revealLines(scene, ".line--finale", 900, 500);
  const btn = scene.querySelector("#finale-btn");
  const closing = scene.querySelector("#closing-line");

  setTimeout(() => {
    btn.hidden = false;
    requestAnimationFrame(() => btn.classList.add("is-visible"));
  }, settleTime);

  btn.addEventListener("click", () => {
    burstFinaleParticles();
    vibrate([10, 30, 10, 30, 40]);
    btn.classList.remove("is-visible");
    setTimeout(() => {
      btn.hidden = true;
      closing.hidden = false;
      requestAnimationFrame(() => closing.classList.add("is-visible"));
    }, 500);
  }, { once: true });
}

/* ==========================================================
   SCENE CONTROLLER
   ========================================================== */
const SCENE_CONFIG = {
  "opening": { type: "auto", holdAfter: 1600 },
  "hold-ember": { type: "interaction", setup: setupEmberHold },
  "photo-1": { type: "auto", holdAfter: 2600, revealCaption: true },
  "memory": { type: "auto", holdAfter: 1800 },
  "swipe-reveal": { type: "interaction", setup: setupSwipeReveal },
  "quiet": { type: "auto", holdAfter: 2800 },
  "drag-reveal": { type: "interaction", setup: setupDragReveal },
  "anticipation": { type: "auto", holdAfter: 1500 },
  "final-hold": { type: "interaction", setup: setupFinalHold },
  "finale": { type: "finale" },
};

function initSceneController() {
  const scenes = Array.from(document.querySelectorAll(".scene"));
  const entered = new Set();

  function scrollToIndex(i) {
    if (i >= scenes.length) return;
    scenes[i].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function enterScene(scene) {
    const id = scene.dataset.scene;
    if (entered.has(id)) return;
    entered.add(id);
    scene.classList.add("is-active");

    const config = SCENE_CONFIG[id];
    const index = scenes.indexOf(scene);

    revealPrompt(scene);

    if (config.type === "auto") {
      const settle = revealLines(scene, "[data-line]");
      if (config.revealCaption) {
        const caption = scene.querySelector(".caption");
        if (caption) setTimeout(() => caption.classList.add("is-visible"), settle);
      }
      setTimeout(() => scrollToIndex(index + 1), settle + config.holdAfter);
    } else if (config.type === "interaction") {
      config.setup(scene, () => scrollToIndex(index + 1));
    } else if (config.type === "finale") {
      runFinale(scene);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          enterScene(entry.target);
        }
      });
    },
    { threshold: [0, 0.5, 0.75] }
  );

  scenes.forEach((s) => observer.observe(s));
}

/* ==========================================================
   BOOT
   ========================================================== */
initStarfield();
initGate(() => {
  document.getElementById("experience").hidden = false;
  requestAnimationFrame(() => initSceneController());
});
