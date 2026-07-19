/* ============================================================
   Grace — interactions, canvas charts, feline effects
   ============================================================ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----------------------------------------------------------
     Nav: scrolled state + mobile burger
  ---------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("nav-burger");
  var navLinks = document.getElementById("nav-links");

  window.addEventListener(
    "scroll",
    function () {
      nav.classList.toggle("scrolled", window.scrollY > 30);
    },
    { passive: true }
  );

  burger.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });

  /* ----------------------------------------------------------
     Ticker tape (with paw icons)
  ---------------------------------------------------------- */
  var tickerData = [
    ["GRACE", "+420.69%", true],
    ["$GRACE", "+69.42%", true],
    ["MEOW/USD", "+128.80%", true],
    ["TUNA", "-3.21%", false],
    ["WHISKER", "+55.10%", true],
    ["NAPTIME", "+9.99%", true],
    ["LASERPTR", "-1.05%", false],
    ["CATNIP", "+312.07%", true],
    ["SCRATCH", "+24.63%", true],
    ["HAIRBALL", "-0.42%", false],
  ];

  var track = document.getElementById("ticker-track");
  var tickerHTML = "";
  for (var r = 0; r < 2; r++) {
    tickerData.forEach(function (t) {
      tickerHTML +=
        '<span><i class="ticker-paw"></i>' +
        t[0] +
        ' <b class="' +
        (t[2] ? "up" : "down") +
        '">' +
        t[1] +
        "</b></span>";
    });
  }
  track.innerHTML = tickerHTML;

  /* ----------------------------------------------------------
     Ambient floating paws in background
  ---------------------------------------------------------- */
  (function ambientPaws() {
    var field = document.getElementById("paw-field");
    if (!field || prefersReducedMotion) return;
    var count = window.innerWidth < 800 ? 8 : 14;
    for (var i = 0; i < count; i++) {
      var paw = document.createElement("span");
      paw.className = "ambient-paw";
      var size = 18 + Math.random() * 28;
      paw.style.setProperty("--size", size + "px");
      paw.style.setProperty("--dur", 14 + Math.random() * 16 + "s");
      paw.style.setProperty("--delay", -Math.random() * 20 + "s");
      paw.style.setProperty("--rot", Math.random() * 60 - 30 + "deg");
      paw.style.setProperty("--op", (0.06 + Math.random() * 0.1).toFixed(2));
      paw.style.left = Math.random() * 100 + "%";
      field.appendChild(paw);
    }
  })();

  /* ----------------------------------------------------------
     Cursor paw trail
  ---------------------------------------------------------- */
  (function pawTrail() {
    var trail = document.getElementById("paw-trail");
    if (
      !trail ||
      prefersReducedMotion ||
      !matchMedia("(pointer: fine)").matches
    )
      return;

    var last = 0;
    var toggle = false;
    window.addEventListener(
      "mousemove",
      function (e) {
        var now = performance.now();
        if (now - last < 70) return;
        last = now;
        toggle = !toggle;

        var paw = document.createElement("span");
        paw.className = "trail-paw";
        paw.style.left = e.clientX + (toggle ? -10 : 10) + "px";
        paw.style.top = e.clientY + 6 + "px";
        paw.style.setProperty("--r", (Math.random() * 40 - 20).toFixed(1) + "deg");
        trail.appendChild(paw);
        setTimeout(function () {
          paw.remove();
        }, 950);
      },
      { passive: true }
    );
  })();

  /* ----------------------------------------------------------
     Scroll reveal
  ---------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach(function (el) {
    io.observe(el);
  });

  /* ----------------------------------------------------------
     Cursor glow follows the mouse
  ---------------------------------------------------------- */
  var glow = document.getElementById("cursor-glow");
  if (!prefersReducedMotion && matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "mousemove",
      function (e) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      },
      { passive: true }
    );
  } else {
    glow.style.display = "none";
  }

  /* ----------------------------------------------------------
     Background: slow ambient candlestick field
  ---------------------------------------------------------- */
  (function bgChart() {
    var canvas = document.getElementById("candle-bg");
    var ctx = canvas.getContext("2d");
    var candles = [];
    var slot = 26;
    var count = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      count = Math.ceil(canvas.width / slot) + 2;
      candles = [];
      var base = canvas.height * 0.62;
      for (var i = 0; i < count; i++) {
        base += (Math.random() - 0.47) * 26;
        base = Math.min(
          canvas.height * 0.9,
          Math.max(canvas.height * 0.3, base)
        );
        candles.push(makeCandle(base));
      }
    }

    function makeCandle(base) {
      var up = Math.random() > 0.42;
      return {
        base: base,
        body: 14 + Math.random() * 46,
        wick: 8 + Math.random() * 22,
        up: up,
        alpha: 0.04 + Math.random() * 0.08,
      };
    }

    var offset = 0;
    var speed = prefersReducedMotion ? 0 : 0.25;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < candles.length; i++) {
        var c = candles[i];
        var x = i * slot - offset;
        var color = c.up ? "245,184,66" : "232,90,58";

        ctx.strokeStyle = "rgba(" + color + "," + c.alpha * 0.9 + ")";
        ctx.beginPath();
        ctx.moveTo(x, c.base - c.body - c.wick);
        ctx.lineTo(x, c.base + c.wick);
        ctx.stroke();

        ctx.fillStyle = "rgba(" + color + "," + c.alpha + ")";
        ctx.fillRect(x - 6, c.base - c.body, 12, c.body);
      }

      offset += speed;
      if (offset >= slot) {
        offset = 0;
        candles.shift();
        var last = candles[candles.length - 1];
        var base = last.base + (Math.random() - 0.47) * 26;
        base = Math.min(
          canvas.height * 0.9,
          Math.max(canvas.height * 0.3, base)
        );
        candles.push(makeCandle(base));
      }
      if (speed > 0) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  })();

  /* ----------------------------------------------------------
     Paw burst helper
  ---------------------------------------------------------- */
  function spawnPawBurst(x, y) {
    if (prefersReducedMotion) return;
    var burst = document.getElementById("paw-burst");
    if (!burst) return;
    for (var i = 0; i < 10; i++) {
      var paw = document.createElement("span");
      paw.className = "burst-paw";
      var angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      var dist = 40 + Math.random() * 70;
      paw.style.left = x + "px";
      paw.style.top = y + "px";
      paw.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      paw.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      paw.style.setProperty("--dr", Math.random() * 120 - 60 + "deg");
      burst.appendChild(paw);
      (function (el) {
        setTimeout(function () {
          el.remove();
        }, 950);
      })(paw);
    }
  }

  /* ----------------------------------------------------------
     Contract address copy + paw burst
  ---------------------------------------------------------- */
  var copyBtn = document.getElementById("copy-ca");
  var caEl = document.getElementById("contract-address");
  copyBtn.addEventListener("click", function (e) {
    var text = caEl.textContent.trim();
    navigator.clipboard.writeText(text).then(function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = "COPIED ✓";
      spawnPawBurst(e.clientX, e.clientY);
      setTimeout(function () {
        copyBtn.textContent = original;
      }, 1600);
    });
  });

  /* ----------------------------------------------------------
     Dexscreener links: single place to update once pair is live.
  ---------------------------------------------------------- */
  var PAIR_URL = "";

  if (PAIR_URL) {
    ["hero-chart-link", "chart-outlink", "social-dex", "footer-dex"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el) el.href = PAIR_URL;
      }
    );
    var embed = document.getElementById("dexscreener-embed");
    if (embed) embed.src = PAIR_URL + "?embed=1&theme=dark&trades=0&info=0";
  }
})();
