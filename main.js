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
  // Motion v11 animate() returns thenable playback controls
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

  // Parallax images (data-parallax="px shift")
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

  // Marquee — constant drift
  const track = document.getElementById("marqueeTrack");
  if (track) {
    animate(
      track,
      { transform: ["translateX(0%)", "translateX(-50%)"] },
      { duration: 28, repeat: Infinity, ease: "linear" }
    );
  }
}

/* ───────────── NAV ───────────── */
const nav = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => nav.classList.toggle("is-scrolled", window.scrollY > 60),
  { passive: true }
);

// Highlight the current page in nav + mobile menu
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("#")[0];
  if (href && href === currentPage) a.classList.add("is-active");
});

const burger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => {
  burger.classList.toggle("is-open");
  mobileMenu.classList.toggle("is-open");
});
mobileMenu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
  })
);

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

  document.querySelectorAll("a, button, .dish-card, .g-item, .pillar-card, .room-card, .venue-card").forEach((el) => {
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
    quotes.forEach((q, j) => q.classList.toggle("active", j === i));
    quoteDots.forEach((d, j) => d.classList.toggle("active", j === i));
  };
  const autoRotate = () => {
    quoteTimer = setInterval(() => showQuote((quoteIndex + 1) % quotes.length), 5200);
  };
  quoteDots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      clearInterval(quoteTimer);
      showQuote(i);
      autoRotate();
    })
  );
  autoRotate();
}

/* ───────────── ENQUIRY / RESERVATION FORMS ───────────── */
document.querySelectorAll("form[data-enquiry]").forEach((form) => {
  const note = form.querySelector(".reserve-note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('input[type="text"]');
    const name = (nameInput && nameInput.value.trim()) || "Guest";
    if (note) {
      note.textContent = `Dhanyavaad, ${name} — your request has been received. Our team will confirm by phone or email within the hour.`;
      animate(note, { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] }, { duration: 0.6, ease: EASE });
    }
    form.reset();
  });
});

// Reservations page: toggle field groups by enquiry type
const enquiryType = document.getElementById("enquiryType");
if (enquiryType) {
  const applyType = () => {
    const type = enquiryType.value;
    document.querySelectorAll("[data-enquiry-fields]").forEach((group) => {
      group.style.display = group.dataset.enquiryFields === type ? "" : "none";
    });
  };
  enquiryType.addEventListener("change", applyType);
  applyType();
}

/* ───────────── SMOOTH ANCHOR OFFSET (nav height) ───────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  });
});
