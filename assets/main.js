/* ============================================================
   陆世松 · 个人主页交互
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 自定义光标 ---------- */
  if (finePointer && !reduceMotion) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("a, button, .card, .tags li").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  /* ---------- 磁吸元素 ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------- 卡片 3D 倾斜 + 高光跟随 ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rotY = (px - 0.5) * 6;
        const rotX = (py - 0.5) * -6;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  /* ---------- 顶部进度条 ---------- */
  const progress = document.querySelector(".progress-bar");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = (scrolled * 100) + "%";
  }, { passive: true });

  /* ---------- Hero 光晕视差 ---------- */
  if (finePointer && !reduceMotion) {
    const glow = document.querySelector(".hero-glow");
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 60;
      const y = (e.clientY / window.innerHeight - 0.5) * 60;
      if (glow) glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
  }

  /* ---------- 文字轮换 ---------- */
  const swap = document.querySelector(".swap");
  if (swap) {
    const words = (swap.dataset.words || "").split(",").filter(Boolean);
    let i = 0;
    if (words.length > 1) {
      setInterval(() => {
        i = (i + 1) % words.length;
        swap.style.opacity = "0";
        swap.style.transform = "translateY(8px)";
        setTimeout(() => {
          swap.textContent = words[i];
          swap.style.opacity = "1";
          swap.style.transform = "translateY(0)";
        }, 240);
      }, 2600);
      swap.style.transition = "opacity .24s, transform .24s";
    }
  }

  /* ---------- 滚动渐显 ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in-view");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- 技能条动画 ---------- */
  const fills = document.querySelectorAll(".bar-fill");
  const fillIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.style.width = en.target.dataset.val + "%";
        fillIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  fills.forEach((el) => fillIO.observe(el));

  /* ---------- 数字滚动 ---------- */
  const counters = document.querySelectorAll(".stat-num[data-count]");
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const dur = 1200;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countIO.observe(el));

  /* ---------- 导航高亮 ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    sections.forEach((s) => navIO.observe(s));
  }
})();
