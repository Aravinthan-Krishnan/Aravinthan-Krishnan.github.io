(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: background on scroll, mobile menu, active section ---------- */
  const nav = document.querySelector(".nav");
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));

  const linkFor = id => navLinks.querySelector(`a[href="#${id}"]`);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.querySelectorAll("a").forEach(a => a.classList.remove("active"));
        const l = linkFor(e.target.id);
        if (l) l.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(s => spy.observe(s));


  /* ---------- In-page links: scroll smoothly, keep the address clean (no #hero, #about…) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      if (id === "hero" || id === "top") window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      try { history.replaceState(null, "", location.pathname + location.search); } catch (_) {}
    });
  });
  // If someone opens an old link ending in #something, tidy the address after jumping there
  if (location.hash) {
    try { setTimeout(() => history.replaceState(null, "", location.pathname + location.search), 300); } catch (_) {}
  }

  /* ---------- Photo: gentle 3D tilt following the mouse ---------- */
  const photo = document.getElementById("heroPhoto");
  if (photo && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    const frame = photo.querySelector(".photo-frame");
    photo.addEventListener("mousemove", e => {
      const r = photo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      frame.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    photo.addEventListener("mouseleave", () => { frame.style.transform = ""; });
  }

  /* ---------- Case study: expand / collapse ---------- */
  const caseToggle = document.getElementById("caseToggle");
  const caseBody = document.getElementById("caseBody");
  if (caseToggle && caseBody) {
    let closeTimer;
    caseToggle.addEventListener("click", () => {
      const open = !caseBody.classList.contains("open");
      clearTimeout(closeTimer);
      if (open) {
        caseBody.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => caseBody.classList.add("open")));
      } else {
        caseBody.classList.remove("open");
        closeTimer = setTimeout(() => { caseBody.hidden = true; }, reduceMotion ? 0 : 450);
        caseToggle.closest(".project").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
      caseToggle.setAttribute("aria-expanded", String(open));
      caseToggle.querySelector(".case-toggle-text").textContent = open ? "Hide case study" : "View full case study";
    });
  }

  /* ---------- Case study tabs ---------- */
  const tabs = [...document.querySelectorAll(".tab")];
  const selectTab = t => {
    tabs.forEach(b => {
      const on = b === t;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(n); n.focus();
    });
  });

  /* ---------- Pipeline: steps light up in order ---------- */
  const steps = [...document.querySelectorAll(".pipeline li")];
  if (steps.length && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      steps.forEach((s, n) => s.classList.toggle("lit", n === i));
      i = (i + 1) % (steps.length + 1);
    }, 900);
  }

  /* ---------- Certificate filters ---------- */
  const filters = document.querySelectorAll(".filter");
  const certs = document.querySelectorAll("#certGrid .cert");
  filters.forEach(btn => btn.addEventListener("click", () => {
    filters.forEach(b => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    certs.forEach(c => c.classList.toggle("hide", f !== "all" && c.dataset.cat !== f));
  }));

  /* ---------- Certificate viewer ---------- */
  const CERTS = {
    isc2: [
      { src: "assets/certs/isc2-cc-d1.jpg", title: "ISC2 CC Domain 1: Security Principles" },
      { src: "assets/certs/isc2-cc-d2.jpg", title: "ISC2 CC Domain 2: Incident Response, BC & DR" },
      { src: "assets/certs/isc2-cc-d3.jpg", title: "ISC2 CC Domain 3: Access Control Concepts" },
      { src: "assets/certs/isc2-cc-d4.jpg", title: "ISC2 CC Domain 4: Network Security" },
      { src: "assets/certs/isc2-cc-d5.jpg", title: "ISC2 CC Domain 5: Security Operations" }
    ],
    citic: [{ src: "assets/certs/citic2026.jpg", title: "CITIC2026 Certificate of Presentation" }],
    redteam: [{ src: "assets/certs/red-teaming.jpg", title: "Red Teaming Level 0, 0day Academy" }],
    codenection: [{ src: "assets/certs/codenection.jpg", title: "CodeNection 2025, pre-event workshop" }],
    fyp: [
      { src: "assets/fyp/dashboard-upload.jpg", title: "Dashboard: upload and validate network traffic" },
      { src: "assets/fyp/dashboard-results.jpg", title: "Dashboard: detection results" },
      { src: "assets/fyp/dashboard-shap.jpg", title: "Dashboard: SHAP explanations" }
    ],
    deans: [
      { src: "assets/certs/deans-list-1.jpg", title: "Dean's List, March/April 2025 trimester" },
      { src: "assets/certs/deans-list-2.jpg", title: "Dean's List, October/November 2025 trimester" }
    ]
  };

  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbTitle = document.getElementById("lbTitle");
  const lbCount = document.getElementById("lbCount");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  let set = [], idx = 0, lastFocus = null;

  const render = () => {
    const c = set[idx];
    lbImg.src = c.src; lbImg.alt = c.title; lbTitle.textContent = c.title;
    lbCount.textContent = set.length > 1 ? `${idx + 1} / ${set.length}` : "";
    lbPrev.disabled = idx === 0; lbNext.disabled = idx === set.length - 1;
    lbPrev.style.visibility = lbNext.style.visibility = set.length > 1 ? "visible" : "hidden";
  };
  const openLb = (key, start = 0) => {
    if (!CERTS[key]) return;
    lastFocus = document.activeElement;
    set = CERTS[key]; idx = Math.min(start, set.length - 1); render();
    lb.hidden = false; document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  };
  const closeLb = () => {
    lb.hidden = true; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll("[data-cert]").forEach(el =>
    el.addEventListener("click", () => openLb(el.dataset.cert, Number(el.dataset.index || 0))));
  document.getElementById("lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  lbPrev.addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
  lbNext.addEventListener("click", () => { if (idx < set.length - 1) { idx++; render(); } });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") lbPrev.click();
    if (e.key === "ArrowRight") lbNext.click();
  });

  /* ---------- Copy email ---------- */
  const toast = document.getElementById("toast");
  const showToast = msg => {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove("show"), 2000);
  };
  document.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast("Email copied"); }
    catch { showToast(btn.dataset.copy); }
  }));

  /* ---------- Hero canvas: network with port scan detection ---------- */
  const canvas = document.getElementById("netCanvas");
  const ctx = canvas.getContext("2d");
  const AMBER = "245,181,68", RED = "255,95,87", LINE = "120,140,180";
  let W, H, DPR, nodes = [], scan = null, lastScan = 0;

  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.round(Math.min(70, Math.max(28, (W * H) / 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
      r: 1.2 + Math.random() * 1.6, flag: 0
    }));
    scan = null;
  };

  // Keep the "flagged" label away from the hero text and photo so it never sits on top of them
  const blocked = () => {
    const c = canvas.getBoundingClientRect();
    return [".hero-text", ".hero-photo"].map(sel => {
      const el = document.querySelector(sel); if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x1: r.left - c.left - 40, y1: r.top - c.top - 40, x2: r.right - c.left + 160, y2: r.bottom - c.top + 30 };
    }).filter(Boolean);
  };
  const isClear = (n, zones) => !zones.some(z => n.x > z.x1 && n.x < z.x2 && n.y > z.y1 && n.y < z.y2);

  const startScan = t => {
    const zones = blocked();
    const free = nodes.filter(n => isClear(n, zones));
    if (!free.length) return;
    const src = free[Math.floor(Math.random() * free.length)];
    const targets = nodes.filter(n => n !== src)
      .sort((a, b) => Math.hypot(a.x - src.x, a.y - src.y) - Math.hypot(b.x - src.x, b.y - src.y))
      .slice(0, 9);
    scan = { src, targets, start: t, probes: [] };
  };

  const draw = t => {
    ctx.clearRect(0, 0, W, H);

    // links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(${LINE},${(1 - d / 140) * .22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // scan: source probes many neighbours in quick succession, then gets flagged
    if (scan) {
      const age = t - scan.start;
      scan.targets.forEach((n, k) => {
        const p = (age - k * 140) / 600;
        if (p > 0 && p < 1) {
          const x = scan.src.x + (n.x - scan.src.x) * p, y = scan.src.y + (n.y - scan.src.y) * p;
          ctx.strokeStyle = `rgba(${RED},${.35 * (1 - p)})`;
          ctx.beginPath(); ctx.moveTo(scan.src.x, scan.src.y); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = `rgba(${RED},.9)`;
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        }
      });
      if (age > 900 && !scan.flagged) { scan.flagged = true; scan.src.flag = t; }
      if (age > 3200) scan = null;
    }

    // nodes
    nodes.forEach(n => {
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      const flagAge = n.flag ? t - n.flag : Infinity;
      if (flagAge < 2600) {
        const k = flagAge / 2600;
        ctx.strokeStyle = `rgba(${AMBER},${1 - k})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(n.x, n.y, 6 + k * 26, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(${AMBER},${1 - k * .6})`;
        ctx.font = "500 11px 'IBM Plex Mono', monospace";
        ctx.fillStyle = `rgb(${AMBER})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 1.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "rgba(200,210,230,.55)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    });

    if (!reduceMotion) {
      if (!scan && t - lastScan > 4200) { startScan(t); lastScan = t; }
      requestAnimationFrame(draw);
    }
  };

  resize();
  window.addEventListener("resize", () => { resize(); if (reduceMotion) draw(0); });
  if (reduceMotion) draw(0); else requestAnimationFrame(t => { lastScan = t - 3000; draw(t); });
})();
