/* ============================================================
   FOR MARWA — a birthday experience
   Vanilla JS — no dependencies
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     Starfield
     ---------------------------------------------------------- */
  var canvas = document.getElementById("stars");
  var ctx = canvas.getContext("2d");
  var stars = [];
  var W = 0, H = 0, DPR = 1;

  function buildStars() {
    var count = Math.min(220, Math.floor((W * H) / 9000));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        base: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,
        hue: Math.random() < 0.35 ? "rgba(255,143,199," : Math.random() < 0.45 ? "rgba(185,140,255," : "rgba(255,255,255,"
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars();
  }

  var px = W / 2, py = H / 2;

  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    var parallaxX = (px - W / 2) / (W / 2) * 14;
    var parallaxY = (py - H / 2) / (H / 2) * 10;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = Math.sin(t * s.speed + s.base);
      var alpha = 0.25 + (tw + 1) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.hue + "1)";
      ctx.beginPath();
      ctx.arc(s.x + parallaxX * (0.4 + s.r * 0.4), s.y + parallaxY * (0.4 + s.r * 0.4), s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(ts) {
    drawStars(ts / 1000);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (e) {
    px = e.clientX;
    py = e.clientY;
  }, { passive: true });

  resize();
  if (!reduceMotion) {
    requestAnimationFrame(frame);
  } else {
    drawStars(0);
  }

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */
  function $(id) { return document.getElementById(id); }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var HEARTS_EMOJI = ["❤", "💖", "💗", "💞", "💕"];
  var HEART_COLORS = ["#ff5fb0", "#ff8fc7", "#b98cff", "#ffb3d9"];

  function spawnAmbientHeart() {
    var layer = $("hearts-layer");
    var el = document.createElement("span");
    el.textContent = pick(HEARTS_EMOJI);
    el.style.left = rand(0, 100) + "vw";
    el.style.fontSize = rand(12, 26) + "px";
    el.style.setProperty("--h-op", rand(0.25, 0.55).toFixed(2));
    el.style.setProperty("--h-drift", rand(-60, 60).toFixed(0) + "px");
    el.style.setProperty("--h-rot", rand(-40, 40).toFixed(0) + "deg");
    el.style.animationDuration = rand(9, 16) + "s";
    layer.appendChild(el);
    setTimeout(function () { el.remove(); }, 17000);
  }

  function burstHearts(count) {
    var layer = $("hearts-layer");
    for (var i = 0; i < count; i++) {
      (function (delay) {
        setTimeout(function () {
          var el = document.createElement("span");
          el.textContent = pick(HEARTS_EMOJI);
          el.style.left = rand(0, 100) + "vw";
          el.style.fontSize = rand(13, 30) + "px";
          el.style.setProperty("--h-op", rand(0.6, 0.95).toFixed(2));
          el.style.setProperty("--h-drift", rand(-90, 90).toFixed(0) + "px");
          el.style.setProperty("--h-rot", rand(-90, 90).toFixed(0) + "deg");
          el.style.animationDuration = rand(2.4, 4.2) + "s";
          layer.appendChild(el);
          setTimeout(function () { el.remove(); }, 5200);
        }, delay);
      })(i * rand(20, 90));
    }
  }

  var CONFETTI_COLORS = ["#ff5fb0", "#ff8fc7", "#b98cff", "#ffffff", "#ffd166", "#c9a8ff"];

  function confetti(count) {
    var layer = $("confetti-layer");
    for (var i = 0; i < count; i++) {
      (function (delay) {
        setTimeout(function () {
          var el = document.createElement("span");
          var w = rand(5, 9);
          var h = rand(10, 16);
          el.style.width = w + "px";
          el.style.height = h + "px";
          el.style.left = rand(0, 100) + "vw";
          el.style.background = pick(CONFETTI_COLORS);
          el.style.setProperty("--h-drift", rand(-120, 120).toFixed(0) + "px");
          el.style.setProperty("--h-rot", rand(160, 720).toFixed(0) + "deg");
          el.style.animationDuration = rand(2.6, 4.6) + "s";
          layer.appendChild(el);
          setTimeout(function () { el.remove(); }, 5400);
        }, delay);
      })(i * rand(15, 60));
    }
  }

  function flashGlow(strength) {
    var overlay = $("glow-overlay");
    overlay.style.opacity = strength;
    setTimeout(function () { overlay.style.opacity = 0; }, 1800);
  }

  /* ----------------------------------------------------------
     Music
     Uses the single <audio id="bgMusic"> element from index.html.
     Autoplay is attempted on load; if the browser blocks it,
     the first user interaction starts the music.
     ---------------------------------------------------------- */
  var audio = document.getElementById("bgMusic");
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.4;
  audio.muted = false;

  var playing = false;
  var fadeTimer = null;
  var autoplayBlocked = false;
  var userInteracted = false;

  function setVolume(v) { audio.volume = Math.max(0, Math.min(1, v)); }

  function fadeUp() {
    clearInterval(fadeTimer);
    var v = 0.001;
    setVolume(v);
    fadeTimer = setInterval(function () {
      v += 0.04;
      if (v >= 0.4) { clearInterval(fadeTimer); setVolume(0.4); }
      else { setVolume(v); }
    }, 90);
  }

  function playMusic() {
    if (playing && !audio.paused) return;
    var p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(function () {
        playing = true;
        autoplayBlocked = false;
        $("music-btn").classList.add("playing");
        $("music-hint").classList.remove("show");
        fadeUp();
      }).catch(function () {
        playing = false;
        $("music-btn").classList.remove("playing");
        $("music-btn").classList.add("visible");
        autoplayBlocked = true;
        $("music-hint").classList.add("show");
      });
    }
  }

  function fadeOut() {
    if (!playing && audio.paused) return;
    clearInterval(fadeTimer);
    var v = audio.volume;
    fadeTimer = setInterval(function () {
      v -= 0.04;
      if (v <= 0) {
        clearInterval(fadeTimer);
        audio.pause();
        playing = false;
        $("music-btn").classList.remove("playing");
      } else {
        setVolume(v);
      }
    }, 90);
  }

  function toggleMusic() {
    if (playing && !audio.paused) {
      fadeOut();
    } else {
      playMusic();
    }
  }

  /* If the file cannot be loaded, keep the UI honest and tell the
     user how to fix it instead of leaving a silent broken state. */
  audio.addEventListener("error", function () {
    playing = false;
    $("music-btn").classList.remove("playing");
    $("music-hint").classList.add("show");
    if (!autoplayBlocked) {
      console.warn("Music not playing: music/birthday.mp3 is missing or unreadable. Place the audio file at music/birthday.mp3 next to index.html.");
    }
    autoplayBlocked = true;
  });

  var musicBtn = $("music-btn");
  musicBtn.addEventListener("click", toggleMusic);
  musicBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMusic(); }
  });

  function unlockOnFirstInteraction() {
    userInteracted = true;
    if (autoplayBlocked || (!playing && audio.paused)) {
      playMusic();
    }
  }

  /* Attempt autoplay immediately (this script sits at the end of
     <body>, so the DOM is already ready) and once more after the
     page has fully loaded, as a second chance on slower devices. */
  playMusic();
  window.addEventListener("load", function () {
    if (!playing && !userInteracted) playMusic();
  });

  /* If autoplay is blocked, the very first touch/click/key press
     anywhere on the page starts the music. Listeners stay active
     until playback actually starts. */
  ["pointerdown", "touchstart", "click", "keydown"].forEach(function (evt) {
    window.addEventListener(evt, unlockOnFirstInteraction, { passive: true });
  });

  /* ----------------------------------------------------------
     Scene manager
     ---------------------------------------------------------- */
  var scenes = document.querySelectorAll(".scene");
  var currentScene = null;
  var busy = false;

  function showScene(id) {
    var next = $(id);
    var prev = currentScene;

    if (prev && prev === next) return;

    if (prev) {
      prev.classList.remove("active");
    }

    // Scroll to top of the new scene (in case it was scrolled on mobile)
    next.scrollTop = 0;
    next.classList.add("active");
    currentScene = next;
  }

  function reveal(el) {
    if (el && !el.classList.contains("show")) {
      el.classList.add("show");
    }
  }

  /* ----------------------------------------------------------
     Opening scene choreography
     ---------------------------------------------------------- */
  var line1 = $("opening-line-1");
  var line2 = $("opening-line-2");
  var btnSurprise = $("btn-surprise");

  function playOpening() {
    setTimeout(function () {
      line1.style.opacity = 0;
      line1.classList.add("glow");
      line1.style.transition = "opacity 1.8s ease, transform 1.8s cubic-bezier(0.22,1,0.36,1)";
      line1.style.transform = "translateY(0)";
      requestAnimationFrame(function () {
        line1.style.opacity = 1;
      });
    }, 400);

    setTimeout(function () {
      line2.classList.add("glow");
      line2.style.transition = "opacity 1.8s ease, transform 1.8s cubic-bezier(0.22,1,0.36,1)";
      line2.style.transform = "translateY(0)";
      requestAnimationFrame(function () {
        line2.style.opacity = 1;
      });
    }, 2400);

    setTimeout(function () {
      reveal(btnSurprise);
    }, 5200);

    // Gentle ambient hearts in the opening scene
    if (!reduceMotion) {
      var ambientTimer = setInterval(function () {
        if (currentScene && currentScene.id !== "scene-opening") {
          clearInterval(ambientTimer);
          return;
        }
        spawnAmbientHeart();
      }, 3400);
    }
  }

  btnSurprise.addEventListener("click", function () {
    if (busy) return;
    if (!playing) playMusic();
    busy = true;
    $("music-btn").classList.add("visible");

    confetti(50);
    burstHearts(14);
    flashGlow(0.85);
    showScene("scene-birthday");

    var rings = document.querySelector(".burst");
    setTimeout(function () { rings.classList.add("go"); }, 150);

    setTimeout(function () {
      var title = document.querySelector("#scene-birthday .title");
      title.classList.add("show");
    }, 500);

    setTimeout(function () {
      reveal($("btn-more"));
    }, 1900);

    setTimeout(function () {
      busy = false;
      // ambient hearts pick up again for this scene
    }, 2200);
  });

  /* ----------------------------------------------------------
     Gift scene
     ---------------------------------------------------------- */
  var btnMore = $("btn-more");
  var giftWrap = $("gift-wrap");
  var gift = $("gift");

  btnMore.addEventListener("click", function () {
    if (busy) return;
    busy = true;
    showScene("scene-gift");
    setTimeout(function () {
      reveal($("scene-gift .hint"));
      busy = false;
    }, 900);
  });

  function openGift() {
    if (busy) return;
    if (gift.classList.contains("opening")) return;
    busy = true;

    gift.classList.add("opening");
    confetti(60);
    burstHearts(20);
    flashGlow(0.95);

    setTimeout(function () {
      var hint = $("scene-gift .hint");
      hint.style.transition = "opacity 0.6s ease";
      hint.style.opacity = 0;
    }, 400);

    setTimeout(function () {
      typeMessage(
        $("gift-message"),
        "Today is your day, Marwa. I hope this new year of your life brings you happiness, beautiful memories, and everything you truly deserve. ❤️"
      );
    }, 1400);

    setTimeout(function () {
      reveal($("btn-gift-next"));
      busy = false;
    }, 9000);
  }

  giftWrap.addEventListener("click", openGift);
  giftWrap.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGift(); }
  });

  /* Word-by-word reveal of the personal message */
  function typeMessage(el, text) {
    el.classList.add("show");
    el.classList.remove("reveal-hidden");
    el.textContent = "";
    var words = text.split(" ");
    var frag = document.createDocumentFragment();
    for (var i = 0; i < words.length; i++) {
      var span = document.createElement("span");
      span.textContent = words[i];
      span.style.opacity = 0;
      span.style.transition = "opacity 0.6s ease";
      frag.appendChild(span);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(" "));
    }
    el.appendChild(frag);
    var spans = el.querySelectorAll("span");
    words.forEach(function (_, i) {
      setTimeout(function () {
        spans[i].style.opacity = 1;
      }, 250 * i);
    });
  }

  /* ----------------------------------------------------------
     Cake scene
     ---------------------------------------------------------- */
  var btnGiftNext = $("btn-gift-next");

  btnGiftNext.addEventListener("click", function () {
    if (busy) return;
    busy = true;
    showScene("scene-cake");
    setTimeout(function () {
      reveal($("btn-wish"));
      busy = false;
    }, 1000);
  });

  var btnWish = $("btn-wish");

  btnWish.addEventListener("click", function () {
    if (busy) return;
    busy = true;
    btnWish.style.opacity = 0;
    btnWish.style.transform = "translateY(16px)";
    btnWish.style.transition = "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)";

    var candles = document.querySelectorAll(".candle");
    setTimeout(function () {
      candles.forEach(function (c, i) {
        setTimeout(function () { c.classList.add("out"); }, i * 260);
      });
    }, 300);

    setTimeout(function () {
      var cake = $("cake");
      cake.classList.add("magic");
      confetti(70);
      burstHearts(24);
      flashGlow(1);
    }, 1300);

    setTimeout(function () {
      $("wish-message").classList.add("show");
    }, 2400);

    setTimeout(function () {
      reveal($("btn-cake-next"));
      busy = false;
    }, 4200);
  });

  /* ----------------------------------------------------------
     Final scene
     ---------------------------------------------------------- */
  var btnCakeNext = $("btn-cake-next");

  btnCakeNext.addEventListener("click", function () {
    if (busy) return;
    busy = true;
    showScene("scene-final");

    setTimeout(function () {
      document.querySelector("#scene-final .title").classList.add("show");
    }, 350);

    setTimeout(function () {
      var sub = document.querySelector(".final-sub");
      sub.style.transition = "opacity 1.4s ease, transform 1.4s cubic-bezier(0.22,1,0.36,1)";
      sub.style.transform = "translateY(0)";
      requestAnimationFrame(function () { sub.style.opacity = 1; });
    }, 1800);

    setTimeout(function () {
      var sig = document.querySelector(".final-signature");
      sig.style.transition = "opacity 1.4s ease, transform 1.4s cubic-bezier(0.22,1,0.36,1)";
      sig.style.transform = "translateY(0)";
      requestAnimationFrame(function () { sig.style.opacity = 1; });
    }, 3000);

    setTimeout(function () {
      confetti(40);
      burstHearts(14);
      flashGlow(0.8);
      busy = false;
    }, 2600);
  });

  /* ----------------------------------------------------------
     Final scene ambient text reset (start hidden via inline styles)
     ---------------------------------------------------------- */
  var subEl = document.querySelector(".final-sub");
  var sigEl = document.querySelector(".final-signature");
  subEl.style.opacity = 0;
  subEl.style.transform = "translateY(14px)";
  sigEl.style.opacity = 0;
  sigEl.style.transform = "translateY(14px)";

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  line1.style.opacity = 0;
  line2.style.opacity = 0;
  line1.style.transform = "translateY(14px)";
  line2.style.transform = "translateY(14px)";

  showScene("scene-opening");
  playOpening();

  // Show the music control shortly after load (subtle, top-right)
  setTimeout(function () {
    $("music-btn").classList.add("visible");
  }, 6000);

  /* Continuous gentle hearts on later scenes */
  if (!reduceMotion) {
    setInterval(function () {
      if (!currentScene) return;
      if (["scene-gift", "scene-cake", "scene-final"].indexOf(currentScene.id) !== -1) {
        spawnAmbientHeart();
      }
    }, 4200);
  }
})();