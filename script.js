const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const pledgeStatus = document.querySelector("[data-pledge-status]");
const pledgeInputs = document.querySelectorAll(".pledge-panel input");
const petitionForm = document.querySelector("[data-petition-form]");
const petitionStatus = document.querySelector("[data-petition-status]");
const frameCopy = document.querySelector("[data-frame-copy]");
const frameButtons = document.querySelectorAll("[data-frame-button]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

const closeMenu = () => {
  document.body.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
};

menuToggle.addEventListener("click", () => {
  const willOpen = !document.body.classList.contains("nav-open");
  document.body.classList.toggle("nav-open", willOpen);
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((item) => {
  revealObserver.observe(item);
});

const updatePledgeStatus = () => {
  const count = [...pledgeInputs].filter((input) => input.checked).length;
  const message =
    count === 0
      ? "Choose one action to start the reframing."
      : count === 1
        ? "One concrete action selected."
        : `${count} concrete actions selected.`;

  pledgeStatus.textContent = message;
};

pledgeInputs.forEach((input) => {
  input.addEventListener("change", updatePledgeStatus);
});

const frameMessages = {
  old: "\"This is how you prove yourself\" hides the cost of unfair work.",
  new: "\"Growth needs fair support\" makes responsibility, pay, and voice visible.",
};

frameButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFrame = button.dataset.frameButton;
    frameButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    frameCopy.textContent = frameMessages[selectedFrame];
  });
});

petitionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(petitionForm);
  const name = String(formData.get("name") || "").trim();
  const firstName = name.split(/\s+/)[0] || "friend";

  petitionStatus.textContent =
    `Thank you for adding your voice, ${firstName}. Fair work starts when we stop treating exploitation as experience.`;
  petitionStatus.classList.add("is-confirmed");
  petitionForm.reset();
});
