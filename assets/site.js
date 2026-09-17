/* J@M — comportamenti comuni a tutte le pagine */
(function () {
  "use strict";
  var body = document.body; body.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, nx: 0, ny: 0, active: false };
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = e.clientX / window.innerWidth - 0.5; mouse.ny = e.clientY / window.innerHeight - 0.5; mouse.active = true;
  }, { passive: true });

  /* ---------- Header, menu, torna su ---------- */
  var top = document.getElementById("top"), totop = document.getElementById("totop");
  var burger = document.getElementById("burger"), menu = document.getElementById("menu"), menuClose = document.getElementById("menuClose");
  function setMenu(o) { menu.classList.toggle("open", o); burger.setAttribute("aria-expanded", o ? "true" : "false"); body.style.overflow = o ? "hidden" : ""; }
  if (burger) { burger.addEventListener("click", function () { setMenu(true); }); menuClose.addEventListener("click", function () { setMenu(false); }); menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); }); }
  if (totop) totop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
  var logo = document.querySelector(".top .logo img");

  /* ---------- Coriandoli e scintille sui bottoni ---------- */
  var COLS = ["#FF3FA4", "#FF2D4A", "#FF6A00", "#FFD400", "#3DF2FF", "#B36BFF", "#FFFFFF"];
  function confetti(x, y, n) {
    if (reduce) return;
    for (var i = 0; i < n; i++) {
      var star = Math.random() < 0.3;
      var s = document.createElement("span"); s.className = star ? "spark" : "confetti"; s.style.left = x + "px"; s.style.top = y + "px"; s.style.background = COLS[i % COLS.length];
      if (star) { s.style.width = s.style.height = (4 + Math.random() * 5) + "px"; }
      document.body.appendChild(s);
      var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 160, dur = 700 + Math.random() * 600, rot = (Math.random() - .5) * 720;
      s.animate([{ transform: "translate(-50%,-50%) rotate(0deg) scale(1)", opacity: 1 }, { transform: "translate(" + (Math.cos(ang) * dist) + "px," + (Math.sin(ang) * dist + 80) + "px) rotate(" + rot + "deg) scale(.4)", opacity: 0 }], { duration: dur, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = function () { this.effect.target.remove(); };
    }
  }
  document.querySelectorAll(".btn-primary, .btn-red, .btn-outline, .socials a, .totop").forEach(function (b) { b.addEventListener("click", function (e) { confetti(e.clientX, e.clientY, 40); }); });

  /* ---------- Scintille: stelline che brillano, scia del mouse e della ragazza ---------- */
  var sc = document.getElementById("sparkles"), sctx = sc && sc.getContext("2d"), stars = [], trail = [], SW = 0, SH = 0, sdpr = Math.min(window.devicePixelRatio || 1, 2);
  function starShape(x, y, r, rot) {
    sctx.beginPath();
    for (var i = 0; i < 8; i++) { var a = rot + i * Math.PI / 4, rr = i % 2 ? r * 0.38 : r; sctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    sctx.closePath(); sctx.fill();
  }
  function scResize() { if (!sc) return; SW = window.innerWidth; SH = window.innerHeight; sc.width = Math.round(SW * sdpr); sc.height = Math.round(SH * sdpr); sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0); }
  function scMake() { stars = []; var n = window.innerWidth < 700 ? 26 : 60; for (var i = 0; i < n; i++) stars.push({ x: Math.random() * SW, y: Math.random() * SH, r: 1.5 + Math.random() * 3.5, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.2, c: COLS[i % COLS.length], vy: 0.05 + Math.random() * 0.15 }); }
  if (sc && !reduce) { scResize(); scMake(); window.addEventListener("resize", function () { scResize(); scMake(); }); }
  function addTrail(x, y, big) { if (trail.length > 90) trail.shift(); trail.push({ x: x + (Math.random() - .5) * 14, y: y + (Math.random() - .5) * 14, r: (big ? 3 : 2) + Math.random() * 3, life: 1, c: COLS[(Math.random() * COLS.length) | 0], rot: Math.random() * 3 }); }
  var lastMx = 0, lastMy = 0;
  window.addEventListener("pointermove", function (e) { if (!sc || reduce || (e.pointerType && e.pointerType !== "mouse")) return; if (Math.abs(e.clientX - lastMx) + Math.abs(e.clientY - lastMy) > 14) { lastMx = e.clientX; lastMy = e.clientY; addTrail(e.clientX, e.clientY, false); } }, { passive: true });
  function drawSparkles(now, guideRect, vel) {
    if (!sc || reduce) return;
    sctx.clearRect(0, 0, SW, SH);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i]; var tw = 0.5 + 0.5 * Math.sin(now / 600 * st.sp + st.ph);
      st.y -= st.vy; if (st.y < -10) { st.y = SH + 10; st.x = Math.random() * SW; }
      sctx.globalAlpha = 0.25 + tw * 0.6; sctx.fillStyle = st.c; starShape(st.x, st.y, st.r * (0.6 + tw * 0.6), now / 3000 + st.ph);
    }
    if (guideRect && Math.abs(vel) > 4 && Math.random() < 0.5) addTrail(guideRect.left + guideRect.width * 0.5, guideRect.top + guideRect.height * 0.7, true);
    for (i = trail.length - 1; i >= 0; i--) {
      var t = trail[i]; t.life -= 0.03; t.y += 0.6; if (t.life <= 0) { trail.splice(i, 1); continue; }
      sctx.globalAlpha = t.life; sctx.fillStyle = t.c; starShape(t.x, t.y, t.r * t.life + 1, t.rot + now / 500);
    }
    sctx.globalAlpha = 1;
  }

  /* ---------- Reveal allo scroll ---------- */
  var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll("[data-reveal], [data-stagger]").forEach(function (el) { io.observe(el); });

  /* ---------- Schede: luce che segue il mouse ---------- */
  if (fine && !reduce) document.querySelectorAll(".feat, .card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%"); c.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%"); });
  });

  /* ---------- Frasi che si accendono parola per parola ---------- */
  var bigs = [].slice.call(document.querySelectorAll(".statement .big[data-light]"));
  bigs.forEach(function (big) {
    var hot = (big.dataset.light || "").toLowerCase().split("|").filter(Boolean);
    big.innerHTML = big.textContent.split(/\s+/).map(function (w) { var k = w.toLowerCase().replace(/[.,;:!?"“”«»]/g, ""); return "<span class=\"w" + (hot.indexOf(k) !== -1 ? " hot" : "") + "\">" + w + "</span>"; }).join(" ");
    big._words = big.querySelectorAll(".w");
    if (reduce) big._words.forEach(function (w) { w.classList.add("on"); });
  });

  /* ---------- Timeline ---------- */
  var tls = [].slice.call(document.querySelectorAll(".timeline"));

  /* ---------- Opere: parallasse, faro che segue il mouse, uscita allo scroll ---------- */
  var heroes = [].slice.call(document.querySelectorAll(".art-hero, .art-band"));
  heroes.forEach(function (h) {
    h._wrap = h.querySelector(".art-wrap"); h._ill = h.querySelector(".hero-ill"); h._mx = 50; h._my = 45; h._t = Math.random() * 100;
    h.addEventListener("pointermove", function (e) { if (e.pointerType && e.pointerType !== "mouse") return; var r = h.getBoundingClientRect(); h._tx = (e.clientX - r.left) / r.width * 100; h._ty = (e.clientY - r.top) / r.height * 100; h._hover = true; });
    h.addEventListener("pointerleave", function () { h._hover = false; });
  });

  /* ---------- Illustrazioni fluttuanti: parallasse leggero allo scroll ---------- */
  var floats = [].slice.call(document.querySelectorAll("[data-float]"));

  /* ---------- Parete del Museo (scroll orizzontale guidato da quello verticale) ---------- */
  var wall = document.querySelector(".wall-pin"), wallTrack = wall && wall.querySelector(".wall-track");
  function wallSize() { if (!wall || !wallTrack || window.innerWidth <= 1000) { if (wall) wall.style.height = ""; return; } wall.style.height = (wallTrack.scrollWidth - window.innerWidth + window.innerHeight + 200) + "px"; }
  wallSize(); window.addEventListener("resize", wallSize);
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
    document.querySelectorAll(".wall-track figure, .wall-grid figure").forEach(function (f) {
      f.querySelector("img").addEventListener("click", function () { lbImg.src = this.dataset.full || this.src; lbImg.alt = this.alt; lbCap.innerHTML = f.querySelector("figcaption") ? f.querySelector("figcaption").innerHTML : ""; lb.classList.add("open"); body.style.overflow = "hidden"; });
    });
    var closeLb = function () { lb.classList.remove("open"); body.style.overflow = ""; };
    lb.addEventListener("click", closeLb); document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---------- La ragazza guida: si muove con lo scroll e col mouse ---------- */
  var guide = document.getElementById("guide");
  var zones = [].slice.call(document.querySelectorAll(".art-hero, .art-band, .curtain, .museo, .wall-pin"));
  var g = { y: 0, rot: 0, flip: 1, bob: 0, lastY: window.scrollY, vel: 0 };
  if (guide && !reduce) setTimeout(function () { guide.classList.add("on"); }, 600);

  /* ---------- Loop unico ---------- */
  var lastScroll = -1;
  function frame(now) {
    requestAnimationFrame(frame);
    var y = window.scrollY, vh = window.innerHeight, vw = window.innerWidth;
    var docH = document.documentElement.scrollHeight - vh, prog = docH > 0 ? y / docH : 0;
    if (top) top.classList.toggle("solid", y > 30);
    if (totop) totop.classList.toggle("show", y > vh * 0.8);

    // Opere
    heroes.forEach(function (h) {
      var r = h.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      if (!reduce) {
        if (h._hover && fine) { h._mx = lerp(h._mx, h._tx, 0.08); h._my = lerp(h._my, h._ty, 0.08); }
        else { h._t += 0.004; h._mx = lerp(h._mx, 50 + Math.sin(h._t) * 28, 0.02); h._my = lerp(h._my, 45 + Math.cos(h._t * 0.8) * 18, 0.02); }
        h.style.setProperty("--mx", h._mx + "%"); h.style.setProperty("--my", h._my + "%");
        var px = fine ? mouse.nx : 0, py = fine ? mouse.ny : 0;
        var sy = clamp(-r.top / Math.max(1, r.height), 0, 1);  // quanto è scorsa la sezione
        if (h._wrap) h._wrap.style.transform = "translate3d(" + (-px * 22) + "px," + (-py * 14 + sy * 90) + "px,0) scale(" + (1 + sy * 0.08) + ")";
        if (h._ill) h._ill.style.transform = "translate3d(" + (px * 26) + "px," + (py * 18 - sy * 60 + Math.sin(now / 1100) * 8) + "px,0) rotate(" + (px * 3) + "deg)";
      }
    });
    // Illustrazioni fluttuanti
    if (!reduce) floats.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var c = (r.top + r.height / 2 - vh / 2) / vh;  // -0.5..0.5
      var sp = +(el.dataset.float || 40);
      el.style.transform = "translate3d(" + (fine ? mouse.nx * 12 : 0) + "px," + (-c * sp + Math.sin(now / 1300 + r.left) * 6) + "px,0) rotate(" + (-c * 2) + "deg)";
    });
    // Frasi
    bigs.forEach(function (big) {
      if (reduce) return; var r = big.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1), cnt = Math.round(p * big._words.length);
      for (var i = 0; i < big._words.length; i++) big._words[i].classList.toggle("on", i < cnt);
    });
    // Timeline
    tls.forEach(function (tl) {
      var r = tl.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var prg = tl.querySelector(".prog"); if (prg) prg.style.height = (clamp((vh * 0.7 - r.top) / r.height, 0, 1) * 100) + "%";
      tl.querySelectorAll(".tstep").forEach(function (s) { s.classList.toggle("on", s.getBoundingClientRect().top < vh * 0.72); });
    });
    // Parete del Museo
    if (wall && wallTrack && vw > 1000) {
      var wr = wall.getBoundingClientRect(), p2 = clamp(-wr.top / (wr.height - vh), 0, 1);
      wallTrack.style.transform = "translate3d(" + (-p2 * (wallTrack.scrollWidth - vw)) + "px,0,0)";
    }
    // Logo
    if (logo && fine && !reduce) logo.style.transform = "rotateY(" + (mouse.nx * 18) + "deg) rotateX(" + (-mouse.ny * 10) + "deg)";
    // Ragazza guida: cammina dentro i quadri mentre scorri, altrimenti scende lungo il bordo; se ti fermi si siede
    if (guide && !reduce) {
      g.vel = lerp(g.vel, y - g.lastY, 0.15); g.lastY = y;
      if (Math.abs(y - g.lastY) > 0.5 || Math.abs(g.vel) > 0.8) g.lastMove = now;
      var gw = guide.offsetWidth || 90, gh = guide.offsetHeight || 240;
      var zone = null, zr = null;
      for (var zi = 0; zi < zones.length; zi++) { var rr = zones[zi].getBoundingClientRect(); if (rr.bottom > vh * 0.25 && rr.top < vh * 0.75 && rr.height > 200) { zone = zones[zi]; zr = rr; break; } }
      var tx, ty, ts, hop = 0, facing = 1;
      if (zone) {
        var pz = clamp((vh * 0.6 - zr.top) / (zr.height + vh * 0.2), 0, 1);
        if (zone.classList.contains("wall-pin")) { tx = zr.left + 20 + pz * (vw - gw - 40); ty = Math.max(gh * 0.45, vh * 0.62 - gh); }
        else { tx = zr.left + zr.width * 0.06 + pz * (zr.width * 0.88 - gw); ty = clamp(zr.top + zr.height * 0.66 - gh, gh * 0.45, vh - gh - 8); }
        hop = -Math.abs(Math.sin(pz * Math.PI * 6)) * 26 * Math.min(1, Math.abs(g.vel) / 6);
        ts = vw < 700 ? 1.15 : 1.35; facing = g.vel >= -0.5 ? 1 : -1; g.inArt = true;
      } else {
        tx = vw - gw - Math.max(6, Math.min(30, vw * 0.02)); ty = vh * 0.14 + prog * vh * 0.66; ts = 1; g.inArt = false;
      }
      g.x = lerp(g.x === undefined ? tx : g.x, tx, 0.07); g.y = lerp(g.y === undefined ? ty : g.y, ty, 0.07); g.s = lerp(g.s || 1, ts, 0.06);
      var gx = g.x + gw / 2, gy = g.y + gh * 0.4;
      var want = fine && mouse.active && !g.inArt ? clamp((mouse.x - gx) * 0.035, -14, 14) : 0;
      g.rot = lerp(g.rot, want - clamp(g.vel, -30, 30) * 0.25, 0.08);
      var wantFlip = g.inArt ? facing : (fine && mouse.active && mouse.x < gx - 40 ? -1 : 1);
      g.flip = lerp(g.flip, wantFlip, 0.12);
      g.bob = Math.sin(now / 700) * 4 + Math.abs(g.vel) * 0.15 + hop;
      var lean = fine && mouse.active && !g.inArt ? clamp((mouse.y - gy) * 0.02, -6, 6) : 0;
      var idle = now - (g.lastMove || now) > 3500 && !g.inArt;
      if (idle && !g.sitting) { g.sitting = true; guide.src = guide.dataset.sit; }
      else if (!idle && g.sitting) { g.sitting = false; guide.src = guide.dataset.stand; }
      guide.style.transform = "translate3d(" + (g.x + lean * -1.5) + "px," + (g.y + g.bob) + "px,0) rotate(" + g.rot + "deg) scale(" + (g.s * g.flip) + "," + g.s + ")";
    }
    drawSparkles(now, guide ? guide.getBoundingClientRect() : null, g.vel);
    lastScroll = y;
  }
  requestAnimationFrame(frame);

  /* ---------- Modulo: apre la posta con la richiesta compilata ---------- */
  var CONTACT_EMAIL = "jam@jam-srl.it";
  document.querySelectorAll("form.panel").forEach(function (form) {
    var sent = form.querySelector(".sent");
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var ok = true;
      form.querySelectorAll("[required]").forEach(function (el) { var bad = !el.value.trim() || (el.type === "email" && el.value.indexOf("@") === -1); el.style.borderColor = bad ? "#D82E00" : ""; if (bad) ok = false; });
      if (!ok) { sent.textContent = "Controlla i campi evidenziati in rosso."; sent.classList.add("show"); return; }
      var NL = String.fromCharCode(10), lines = [];
      form.querySelectorAll("input, textarea, select").forEach(function (el) { if (el.type === "submit") return; var lab = form.querySelector("label[for='" + el.id + "']"); lines.push((lab ? lab.textContent.trim() : el.name) + ": " + (el.value.trim() || "-")); });
      var subject = form.dataset.subject || "Richiesta dal sito J@M";
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join(NL));
      sent.textContent = "Si apre la tua posta con la richiesta pronta: basta premere Invia. Se non si apre, scrivi a " + CONTACT_EMAIL + " o chiama lo 02 898094.";
      sent.classList.add("show");
    });
  });
})();
