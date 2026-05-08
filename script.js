// Shared client-side interactions:
// 1) Mobile navigation toggle
// 2) Header style on scroll
// 3) Services category filter
// 4) Scroll reveal animations

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupStickyHeader();
  setupServiceFilters();
  setupScrollReveal();
});

function setupMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when a navigation item is clicked on mobile.
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll);
}

function setupServiceFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const serviceCards = document.querySelectorAll(".service-card");

  // Exit silently for pages other than services page.
  if (!filterButtons.length || !serviceCards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      serviceCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const shouldShow = selected === "all" || selected === cardCategory;
        card.classList.toggle("hidden", !shouldShow);
      });
    });
  });
}

function setupScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  // Fallback for very old browsers.
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => observer.observe(element));
}
