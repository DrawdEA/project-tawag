const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const pledgeStatus = document.querySelector("[data-pledge-status]");
const pledgeInputs = document.querySelectorAll(".pledge-panel input");
const campaignPledgeForm = document.querySelector("[data-campaign-pledge-form]");
const campaignPledgeStatus = document.querySelector("[data-campaign-pledge-status]");
const campaignPledgeButton = campaignPledgeForm.querySelector("button[type='submit']");
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

campaignPledgeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(campaignPledgeForm);
  const name = String(formData.get("name") || "").trim();
  const payload = {
    name,
    contact: String(formData.get("contact") || "").trim(),
    comment: String(formData.get("comment") || "").trim(),
    support: formData.has("support"),
  };

  campaignPledgeButton.disabled = true;
  campaignPledgeStatus.textContent = "Sending your pledge...";
  campaignPledgeStatus.classList.remove("is-confirmed", "is-error");

  try {
    const response = await fetch("/api/pledge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Unable to send pledge right now.");
    }

    campaignPledgeStatus.textContent =
      `${result.message} Reference: ${result.referenceId}.`;
    campaignPledgeStatus.classList.add("is-confirmed");
    campaignPledgeForm.reset();
  } catch (error) {
    campaignPledgeStatus.textContent = error.message;
    campaignPledgeStatus.classList.add("is-error");
  } finally {
    campaignPledgeButton.disabled = false;
  }
});
