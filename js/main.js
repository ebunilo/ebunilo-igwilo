// ===== Mobile Navigation Toggle =====
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking on a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// ===== Navbar Scroll Effect =====
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(10, 10, 15, 0.95)";
    navbar.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.3)";
  } else {
    navbar.style.background = "rgba(10, 10, 15, 0.9)";
    navbar.style.boxShadow = "none";
  }
});

// ===== Typing Effect =====
const typedTextElement = document.querySelector(".typed-text");

if (typedTextElement) {
  const texts = [
    "Senior DevOps Engineer",
    "AI Engineer",
    "Backend Developer",
    "Cloud Architect",
  ];

  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeText() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      typedTextElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedTextElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typingSpeed = 500; // Pause before new word
    }

    setTimeout(typeText, typingSpeed);
  }

  // Start typing effect
  setTimeout(typeText, 1000);
}

// ===== Smooth Scroll for Internal Links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ===== Form Submission Handler =====
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Show feedback (since there's no backend)
    alert(
      "Thank you for your message! Since this is a static site, please use the email or WhatsApp links to contact me directly.",
    );

    // Reset form
    this.reset();
  });
}

// ===== Scroll Reveal Animation =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Apply to cards and sections
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".expertise-card, .skill-category, .skill-box, .detail-card, " +
      ".metric-card, .competency-card, .cert-card, .timeline-item, " +
      ".contact-item, .strength-item",
  );

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
});

// ===== Active Navigation Highlight =====
function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll(".dropdown-menu a").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      // Also highlight parent dropdown
      link
        .closest(".dropdown")
        .querySelector(".dropdown-toggle")
        .classList.add("active");
    }
  });
}

setActiveNavLink();

// ===== Console Easter Egg =====
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   👋 Hi there! I'm Calistus Igwilo                       ║
║                                                           ║
║   DevOps Engineer | AI Engineer | Backend Developer       ║
║                                                           ║
║   📧 ebuniloigwilo@gmail.com                             ║
║   💼 linkedin.com/in/calistus-igwilo                     ║
║                                                           ║
║   Thanks for checking out my portfolio!                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
