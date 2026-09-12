/* ═══════════════════════════════════════════
   Patram Haveli — interactions & motion
   Powered by Motion (Framer Motion vanilla)
   Shared across all pages — every section-
   specific block guards for its elements.
   ═══════════════════════════════════════════ */

document.documentElement.classList.add("js");

const { animate, scroll, inView, stagger } = window.Motion || {};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = [0.22, 1, 0.36, 1];

/* ───────────── PRELOADER (home only, once per session) ───────────── */
const preloader = document.getElementById("preloader");

if (preloader && !sessionStorage.getItem("phSeen")) {
  sessionStorage.setItem("phSeen", "1");
  const preloaderFill = document.getElementById("preloaderFill");
  const preloaderCount = document.getElementById("preloaderCount");

  let progress = 0;
  const loadTimer = setInterval(() => {
    progress = Math.min(progress + Math.random() * 16 + 6, 100);
    preloaderFill.style.width = progress + "%";
    preloaderCount.textContent = Math.round(progress) + "%";
    if (progress >= 100) {
      clearInterval(loadTimer);
      finishLoading();
    }
  }, 140);
} else {
  if (preloader) preloader.style.display = "none";
  heroIntro();
}

function finishLoading() {
  Promise.resolve(
    animate(
      preloader,
      { opacity: [1, 0], y: [0, -40] },
      { duration: 0.9, ease: EASE }
    )
  ).then(() => {
    preloader.style.display = "none";
    heroIntro();
  });
}

/* ───────────── HERO / PAGE-HERO INTRO ───────────── */
function heroIntro() {
  if (reduceMotion) return;

  const lines = document.querySelectorAll("[data-line]");
  if (lines.length) {
    animate(
      lines,
      { transform: ["translateY(110%)", "translateY(0%)"] },
      { duration: 1.1, delay: stagger(0.14), ease: EASE }
    );
  }

  const reveals = document.querySelectorAll(".hero [data-reveal], .page-hero [data-reveal]");
  if (reveals.length) {
    animate(
      reveals,
      { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"] },
      { duration: 0.9, delay: stagger(0.12, { startDelay: 0.5 }), ease: EASE }
    );
  }
}

/* ───────────── SCROLL REVEALS ───────────── */
if (!reduceMotion && inView) {
  // Generic fade-up reveals (outside heroes — heroes handle their own)
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.closest(".hero") || el.closest(".page-hero")) return;
    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], transform: ["translateY(36px)", "translateY(0px)"] },
          { duration: 0.9, ease: EASE }
        );
      },
      { margin: "0px 0px -12% 0px" }
    );
  });

  // Cards: scale + fade with slight stagger feel via per-card delay
  document.querySelectorAll("[data-reveal-card]").forEach((el, i) => {
    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], transform: ["translateY(44px) scale(0.97)", "translateY(0px) scale(1)"] },
          { duration: 1, delay: (i % 3) * 0.1, ease: EASE }
        );
      },
      { margin: "0px 0px -10% 0px" }
    );
  });
} else {
  // Fallback: show everything
  document.querySelectorAll("[data-reveal], [data-reveal-card]").forEach((el) => {
    el.style.opacity = 1;
  });
  document.querySelectorAll(".line-mask .line").forEach((el) => {
    el.style.transform = "none";
  });
}

/* ───────────── HERO SCROLL PARALLAX / ZOOM ───────────── */
if (!reduceMotion && scroll) {
  const heroSection = document.querySelector(".hero, .page-hero");
  const heroMedia = document.querySelector(".hero-video, .page-hero-img");
  const heroContent = document.querySelector(".hero-content, .page-hero-content");

  if (heroSection && heroMedia && heroContent) {
    scroll(
      (p) => {
        heroMedia.style.transform = `scale(${1.08 + p * 0.18}) translateY(${p * 60}px)`;
        heroContent.style.opacity = 1 - p * 1.4;
        heroContent.style.transform = `translateY(${p * -80}px)`;
      },
      { target: heroSection, offset: ["start start", "end start"] }
    );
  }

  // Parallax images (data-parallax="px shift") — only animate when in view
  document.querySelectorAll("[data-parallax]").forEach((el) => {
    const shift = parseFloat(el.dataset.parallax) || 40;
    scroll(
      (p) => {
        el.style.transform = `translateY(${(p - 0.5) * 2 * shift}px)`;
      },
      { target: el, offset: ["start end", "end start"] }
    );
  });

  // Full-bleed break background parallax
  document.querySelectorAll("[data-parallax-bg]").forEach((el) => {
    scroll(
      (p) => {
        el.style.transform = `translateY(${(p - 0.5) * 120}px)`;
      },
      { target: el.parentElement, offset: ["start end", "end start"] }
    );
  });

  // Marquee — constant drift (pause when offscreen for perf)
  const track = document.getElementById("marqueeTrack");
  if (track) {
    const marqueeAnim = animate(
      track,
      { transform: ["translateX(0%)", "translateX(-50%)"] },
      { duration: 28, repeat: Infinity, ease: "linear" }
    );
    if (marqueeAnim && marqueeAnim.pause) {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) marqueeAnim.play?.();
          else marqueeAnim.pause?.();
        }),
        { rootMargin: "100px" }
      );
      const marqueeWrap = track.closest(".marquee");
      if (marqueeWrap) observer.observe(marqueeWrap);
    }
  }
}

/* ───────────── NAV ───────────── */
const nav = document.getElementById("nav");
const getNavHeight = () => (nav ? nav.offsetHeight : 70);

window.addEventListener(
  "scroll",
  () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 60),
  { passive: true }
);

// Highlight the current page in nav + mobile menu, and set aria-current
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("#")[0];
  if (href && href === currentPage) {
    a.classList.add("is-active");
    a.setAttribute("aria-current", "page");
  }
});

const burger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");
const setMenuOpen = (open) => {
  if (!burger || !mobileMenu) return;
  burger.classList.toggle("is-open", open);
  mobileMenu.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.setAttribute("aria-hidden", String(!open));
  document.documentElement.style.overflow = open ? "hidden" : "";
  if (open) {
    const first = mobileMenu.querySelector("a");
    first && first.focus({ preventScroll: true });
  }
};

if (burger && mobileMenu) {
  burger.addEventListener("click", () =>
    setMenuOpen(!mobileMenu.classList.contains("is-open"))
  );
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenuOpen(false))
  );
  // ESC closes the menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      setMenuOpen(false);
      burger.focus({ preventScroll: true });
    }
  });
  // Close if window grows past mobile breakpoint
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && mobileMenu.classList.contains("is-open")) {
      setMenuOpen(false);
    }
  }, { passive: true });
}

/* ───────────── ANIMATED COUNTERS ───────────── */
if (inView) {
  document.querySelectorAll("[data-count]").forEach((el) => {
    inView(el, () => {
      const target = parseInt(el.dataset.count, 10);
      const startTime = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const t = Math.min((now - startTime) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });
}

/* ───────────── CUSTOM CURSOR ───────────── */
const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (fine && !reduceMotion && cursor && cursorDot) {
  let cx = -100, cy = -100, tx = -100, ty = -100;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cursorDot.style.left = tx + "px";
    cursorDot.style.top = ty + "px";
  });
  (function loop() {
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll("a, button, .dish-card, .g-item, .pillar-card, .room-card, .venue-card, .whatsapp-fab, .back-to-top").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

/* ───────────── MAGNETIC BUTTONS ───────────── */
if (fine && !reduceMotion) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("mouseleave", () => {
      animate(
        el,
        { transform: "translate(0px, 0px)" },
        { duration: 0.6, ease: EASE }
      );
    });
  });
}

/* ───────────── TESTIMONIAL ROTATOR ───────────── */
const quotes = [...document.querySelectorAll("[data-quote]")];
const quoteDots = [...document.querySelectorAll("[data-quote-dot]")];

if (quotes.length) {
  let quoteIndex = 0;
  let quoteTimer;

  const showQuote = (i) => {
    quoteIndex = i;
    quotes.forEach((q, j) => {
      const on = j === i;
      q.classList.toggle("active", on);
      q.setAttribute("aria-hidden", String(!on));
    });
    quoteDots.forEach((d, j) => {
      const on = j === i;
      d.classList.toggle("active", on);
      d.setAttribute("aria-selected", String(on));
      d.setAttribute("tabindex", on ? "0" : "-1");
    });
  };
  const autoRotate = () => {
    clearInterval(quoteTimer);
    quoteTimer = setInterval(() => showQuote((quoteIndex + 1) % quotes.length), 5200);
  };
  quoteDots.forEach((dot, i) => {
    dot.addEventListener("click", () => { showQuote(i); autoRotate(); });
    dot.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        showQuote((i + 1) % quotes.length);
        autoRotate();
        quoteDots[(i + 1) % quotes.length].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showQuote((i - 1 + quotes.length) % quotes.length);
        autoRotate();
        quoteDots[(i - 1 + quotes.length) % quotes.length].focus();
      }
    });
  });
  showQuote(0);
  autoRotate();
}

/* ───────────── ENQUIRY / RESERVATION FORMS ───────────── */
const showToast = (title, body) => {
  // Remove any existing toast
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.innerHTML = `<strong>${title}</strong>${body}`;
  document.body.appendChild(toast);
  // Trigger transition
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 400);
  }, 6000);
};

document.querySelectorAll("form[data-enquiry]").forEach((form) => {
  const note = form.querySelector(".reserve-note");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.textContent : "";

  // Inline validation on blur
  form.querySelectorAll("input[required], select[required], textarea[required]").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-field")?.classList.contains("invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("input[required], select[required], textarea[required]").forEach((field) => {
      if (!validateField(field)) valid = false;
    });
    if (!valid) {
      showToast("Almost there", "Please fill in the highlighted fields before sending.");
      const firstInvalid = form.querySelector(".form-field.invalid input, .form-field.invalid select, .form-field.invalid textarea");
      if (firstInvalid) firstInvalid.focus({ preventScroll: false });
      return;
    }

    const nameInput = form.querySelector('input[type="text"]');
    const name = (nameInput && nameInput.value.trim()) || "Guest";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    // Simulated send (replace with real endpoint as needed)
    setTimeout(() => {
      if (note) {
        note.textContent = `Dhanyavaad, ${name} — your request has been received. Our team will confirm by phone or email within the hour.`;
        if (!reduceMotion && animate) {
          animate(note, { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] }, { duration: 0.6, ease: EASE });
        } else {
          note.style.opacity = 1;
        }
      }
      showToast(`Dhanyavaad, ${name}`, "Your request has been received. We'll confirm within the hour.");
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }, 600);
  });
});

function validateField(field) {
  const wrap = field.closest(".form-field");
  if (!wrap) return true;
  let msg = "";
  const v = (field.value || "").trim();
  if (field.required && !v) msg = "This field is required.";
  else if (field.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Please enter a valid email.";
  else if (field.type === "tel" && v && !/^[+\d\s()-]{7,}$/.test(v)) msg = "Please enter a valid phone number.";
  let err = wrap.querySelector(".form-error");
  if (!err && msg) {
    err = document.createElement("span");
    err.className = "form-error";
    err.setAttribute("role", "alert");
    wrap.appendChild(err);
  }
  if (err) err.textContent = msg;
  wrap.classList.toggle("invalid", !!msg);
  field.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}

// Reservations page: toggle field groups by enquiry type
const enquiryType = document.getElementById("enquiryType");
if (enquiryType) {
  const applyType = () => {
    const type = enquiryType.value;
    document.querySelectorAll("[data-enquiry-fields]").forEach((group) => {
      const show = group.dataset.enquiryFields === type;
      group.style.display = show ? "" : "none";
      // Toggle required on hidden inputs so HTML5 validation matches
      group.querySelectorAll("input, select").forEach((f) => {
        if (f.dataset.requiredWhen) return; // opt-out
      });
    });
  };
  enquiryType.addEventListener("change", applyType);
  applyType();
}

/* ───────────── SMOOTH ANCHOR OFFSET (nav height) ───────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - getNavHeight() - 12;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  });
});

/* ───────────── READING PROGRESS BAR ───────────── */
const progressBar = document.getElementById("progressBar");
if (progressBar) {
  let ticking = false;
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    progressBar.style.width = Math.min(100, Math.max(0, pct)) + "%";
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();
}

/* ───────────── BACK TO TOP ───────────── */
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  backToTop.hidden = false;
  let ticking = false;
  const syncBtn = () => {
    const visible = window.scrollY > 600;
    backToTop.classList.toggle("is-visible", visible);
    backToTop.setAttribute("aria-hidden", String(!visible));
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(syncBtn);
      ticking = true;
    }
  }, { passive: true });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  syncBtn();
}
