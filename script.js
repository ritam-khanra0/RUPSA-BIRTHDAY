/* =====================================================================
   RUPSA'S BIRTHDAY — SCRIPT
   All interactivity, animation, and content injection lives here.
   Personalize the site by editing window.GIFT_CONFIG at the top of index.html.
===================================================================== */

(() => {
  "use strict";

  const CONFIG = window.GIFT_CONFIG || {};

  /* ===================================================================
     0. INJECT CONFIG INTO THE PAGE
  =================================================================== */
  function injectConfig() {
    const name = CONFIG.recipientName || "Rupsa";
    const age = CONFIG.age ?? 22;
    const from = CONFIG.fromName || "Ritam";

    document.title = `Happy Birthday, ${name} 🎂`;
    setText("lock-name", name);
    setText("age-num", age);
    setText("letter-from", from);
    setText("signature-name", from);

    // Build gallery tiles
    const grid = document.getElementById("gallery-grid");
    const photos = Array.isArray(CONFIG.photos) ? CONFIG.photos : [];
    grid.innerHTML = "";
    photos.forEach((src, i) => {
      const tile = document.createElement("div");
      tile.className = "gallery-tile reveal-on-scroll";
      tile.dataset.index = i;

      const isPlaceholder = !src || /_HERE$/i.test(src.trim());
      if (isPlaceholder) {
        tile.innerHTML = `<div class="tile-placeholder">Photo ${i + 1}<br/>${escapeHtml(src || "PHOTO_" + (i + 1) + "_HERE")}</div>`;
      } else {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Memory ${i + 1} with ${name}`;
        img.loading = "lazy";
        tile.appendChild(img);
      }
      tile.addEventListener("click", () => openLightbox(i));
      grid.appendChild(tile);
    });

    // Letter message
    const rawMessage = (CONFIG.letterMessage || "").trim();
    const isMsgPlaceholder = !rawMessage || rawMessage === "WRITE_YOUR_MESSAGE_HERE";
    const message = isMsgPlaceholder
      ? `Happy Birthday, ${name}!\n\nWrite your real message here by editing letterMessage in GIFT_CONFIG at the top of index.html.`
      : rawMessage;
    letterState.fullText = message;

    // Music
    const audioEl = document.getElementById("bg-audio");
    const toggleBtn = document.getElementById("music-toggle");
    const music = (CONFIG.backgroundMusic || "").trim();
    if (music && music !== "BACKGROUND_MUSIC_HERE") {
      audioEl.src = music;
      toggleBtn.hidden = false;
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ===================================================================
     1. STAR FIELD CANVAS (twinkling stars + slow-drifting glow)
  =================================================================== */
  function initStarfield() {
    const canvas = document.getElementById("star-canvas");
    const ctx = canvas.getContext("2d");
    let stars = [];
    let width, height;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = document.body.scrollHeight;
      buildStars();
    }

    function buildStars() {
      const count = Math.floor((width * height) / 9000);
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      t += 1;
      for (const s of stars) {
        const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.3;
        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 240, 226, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    window.addEventListener("resize", debounce(resize, 200));
    resize();
    draw();
    if (reduceMotion) draw(); // draw once, static
  }

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  /* ===================================================================
     2. FLOATING HEARTS (ambient, continuous, subtle)
  =================================================================== */
  function initFloatingHearts() {
    const container = document.getElementById("floating-hearts");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    function spawnHeart() {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = Math.random() > 0.5 ? "❤️" : "💛";
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      heart.style.animationDuration = 9 + Math.random() * 8 + "s";
      heart.style.fontSize = 12 + Math.random() * 14 + "px";
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 18000);
    }

    setInterval(spawnHeart, 2200);
    spawnHeart();
  }

  /* ===================================================================
     3. SCENE NAV DOTS — active section tracking + click to scroll
  =================================================================== */
  function initSceneNav() {
    const dots = document.querySelectorAll(".dot");
    const scenes = Array.from(document.querySelectorAll(".scene"));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = scenes.indexOf(entry.target);
            dots.forEach((d) => d.classList.remove("active"));
            if (dots[idx]) dots[idx].classList.add("active");
          }
        });
      },
      { threshold: 0.5 }
    );
    scenes.forEach((s) => observer.observe(s));
  }

  /* ===================================================================
     4. SCROLL REVEAL — fade/slide elements into view
  =================================================================== */
  function initScrollReveal() {
    const els = document.querySelectorAll(".reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => observer.observe(el));
  }

  /* ===================================================================
     5. SCENE 1 — LOCK SCREEN: ripple button + open gift trigger
  =================================================================== */
  function initLockScreen() {
    const btn = document.getElementById("open-gift-btn");
    btn.addEventListener("click", (e) => {
      spawnRipple(btn, e);
      setTimeout(() => {
        document.getElementById("scene-2").scrollIntoView({ behavior: "smooth" });
      }, 250);
    });
  }

  function spawnRipple(btn, e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  /* ===================================================================
     6. SCENE 2 — GIFT BOX: open, confetti, hearts, sparkles, reveal title
  =================================================================== */
  function initGiftBox() {
    const scene = document.getElementById("scene-2");
    const box = document.getElementById("gift-box");
    const sparkleField = document.getElementById("gift-sparkles");
    let opened = false;

    function openGift() {
      if (opened) return;
      opened = true;
      scene.classList.add("opened");
      burstSparkles(sparkleField, 26);
      launchConfetti(60);
      burstHeartsFrom(box);
    }

    box.addEventListener("click", openGift);
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGift(); }
    });
  }

  function burstSparkles(field, count) {
    const rect = field.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "sparkle";
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 140;
      s.style.setProperty("--sx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--sy", Math.sin(angle) * dist + "px");
      s.style.left = rect.width / 2 + "px";
      s.style.top = rect.height / 2 + "px";
      s.style.animationDelay = Math.random() * 0.3 + "s";
      field.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  function launchConfetti(count) {
    const colors = ["#e8b95b", "#ff8aa3", "#f6efe2", "#f4d998", "#ffb3c6"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      piece.style.animationDuration = 2.5 + Math.random() * 2 + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 5000);
    }
  }

  function burstHeartsFrom(el) {
    const container = document.getElementById("floating-hearts");
    for (let i = 0; i < 14; i++) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = "❤️";
      heart.style.left = 44 + Math.random() * 12 + "vw";
      heart.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
      heart.style.animationDuration = 4 + Math.random() * 3 + "s";
      heart.style.fontSize = 14 + Math.random() * 16 + "px";
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 8000);
    }
  }

  /* ===================================================================
     7. SCENE 3 — GALLERY LIGHTBOX with swipe support
  =================================================================== */
  let lightboxIndex = 0;
  function openLightbox(index) {
    const photos = (CONFIG.photos || []).filter((p) => p && !/_HERE$/i.test(p.trim()));
    if (photos.length === 0) return; // nothing real to preview yet
    lightboxIndex = Math.min(index, photos.length - 1);
    updateLightboxImage(photos);
    document.getElementById("lightbox").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow = "";
  }

  function updateLightboxImage(photos) {
    const img = document.getElementById("lightbox-img");
    img.src = photos[lightboxIndex];
    img.alt = `Memory ${lightboxIndex + 1}`;
  }

  function initLightbox() {
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    const lightbox = document.getElementById("lightbox");
    const stage = document.querySelector(".lightbox-stage");

    function getRealPhotos() {
      return (CONFIG.photos || []).filter((p) => p && !/_HERE$/i.test(p.trim()));
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    prevBtn.addEventListener("click", () => {
      const photos = getRealPhotos();
      lightboxIndex = (lightboxIndex - 1 + photos.length) % photos.length;
      updateLightboxImage(photos);
    });
    nextBtn.addEventListener("click", () => {
      const photos = getRealPhotos();
      lightboxIndex = (lightboxIndex + 1) % photos.length;
      updateLightboxImage(photos);
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
    });

    // Swipe support
    let touchStartX = 0;
    stage.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx > 0) prevBtn.click(); else nextBtn.click();
      }
    }, { passive: true });
  }

  /* ===================================================================
     8. SCENE 4 — LETTER TYPING ANIMATION (triggers on scroll into view)
  =================================================================== */
  const letterState = { fullText: "", typed: false };

  function initLetter() {
    const target = document.querySelector(".letter-paper");
    const body = document.getElementById("letter-body");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !letterState.typed) {
          letterState.typed = true;
          typeLetter(body, letterState.fullText);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    if (target) observer.observe(target);
  }

  function typeLetter(el, text) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) { el.textContent = text; return; }

    el.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    el.appendChild(cursor);

    let i = 0;
    const speed = 28;
    function step() {
      if (i < text.length) {
        cursor.insertAdjacentText("beforebegin", text[i]);
        i++;
        setTimeout(step, speed);
      } else {
        cursor.remove();
      }
    }
    step();
  }

  /* ===================================================================
     9. SCENE 5 — WISH CARDS: touch animation for mobile
  =================================================================== */
  function initWishCards() {
    document.querySelectorAll(".wish-card").forEach((card) => {
      card.addEventListener("touchstart", () => card.classList.add("touch-active"), { passive: true });
      card.addEventListener("touchend", () => {
        setTimeout(() => card.classList.remove("touch-active"), 350);
      }, { passive: true });
    });
  }

  /* ===================================================================
     10. SCENE 6 — CAKE: blow out candles, confetti + fireworks, wish text
  =================================================================== */
  function initCake() {
    const cake = document.getElementById("cake");
    const heading = document.getElementById("cake-heading");
    const hint = document.getElementById("cake-hint");
    let blown = false;

    function blow() {
      if (blown) return;
      blown = true;
      cake.classList.add("blown");
      heading.textContent = "Wish Made ✨";
      hint.textContent = "here's to another beautiful year";
      launchConfetti(50);
      launchFireworks(4);
    }

    cake.addEventListener("click", blow);
    cake.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(); }
    });
  }

  function launchFireworks(bursts) {
    const field = document.getElementById("fireworks-field");
    const colors = ["#e8b95b", "#ff8aa3", "#f6efe2", "#ffd76b", "#ff9a3c"];

    for (let b = 0; b < bursts; b++) {
      setTimeout(() => {
        const originX = 20 + Math.random() * 60;
        const originY = 20 + Math.random() * 40;
        const count = 22;
        for (let i = 0; i < count; i++) {
          const p = document.createElement("div");
          p.className = "firework-particle";
          const angle = (Math.PI * 2 * i) / count;
          const dist = 60 + Math.random() * 70;
          p.style.setProperty("--fx", Math.cos(angle) * dist + "px");
          p.style.setProperty("--fy", Math.sin(angle) * dist + "px");
          p.style.left = originX + "vw";
          p.style.top = originY + "vh";
          p.style.background = colors[Math.floor(Math.random() * colors.length)];
          p.style.boxShadow = `0 0 8px 2px ${colors[Math.floor(Math.random() * colors.length)]}`;
          field.appendChild(p);
          setTimeout(() => p.remove(), 1200);
        }
      }, b * 450);
    }
  }

  /* ===================================================================
     11. MUSIC TOGGLE
  =================================================================== */
  function initMusic() {
    const btn = document.getElementById("music-toggle");
    const audio = document.getElementById("bg-audio");

    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        btn.classList.add("playing");
      } else {
        audio.pause();
        btn.classList.remove("playing");
      }
    });
  }

  /* ===================================================================
     INIT
  =================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    injectConfig();
    initStarfield();
    initFloatingHearts();
    initSceneNav();
    initScrollReveal();
    initLockScreen();
    initGiftBox();
    initLightbox();
    initLetter();
    initWishCards();
    initCake();
    initMusic();
  });
})();
