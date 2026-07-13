const menuToggle = document.querySelector("[data-menu-toggle]");
const pledgeList = document.querySelector("[data-pledge-list]");
const pledgeStatus = document.querySelector("[data-pledge-status]");
const pledgeCount = document.querySelector("[data-pledge-count]");

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

document.querySelector("[data-nav]").addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const createPledgeCard = (pledge, index) => {
  const article = document.createElement("article");
  article.className = "pledge-card";
  article.style.setProperty("--card-index", String(index));

  const quote = document.createElement("p");
  quote.className = "pledge-card-comment";
  quote.textContent = pledge.comment;

  const meta = document.createElement("div");
  meta.className = "pledge-card-meta";

  const name = document.createElement("span");
  name.textContent = pledge.displayName || "Anonymous supporter";

  const date = document.createElement("span");
  date.textContent = formatDate(pledge.submittedAt);

  const reference = document.createElement("span");
  reference.className = "pledge-card-reference";
  reference.textContent = pledge.referenceId || "Project TAWAG";

  meta.append(name, date);
  article.append(quote, meta, reference);

  return article;
};

const showEmptyState = () => {
  const empty = document.createElement("div");
  empty.className = "pledge-empty";

  const title = document.createElement("h3");
  title.textContent = "No public pledge comments yet.";

  const copy = document.createElement("p");
  copy.textContent =
    "Once someone signs the pledge and leaves a comment, it will appear here.";

  const link = document.createElement("a");
  link.className = "button button-primary";
  link.href = "/#pledge";
  link.textContent = "Be the first to sign";

  empty.append(title, copy, link);
  pledgeList.replaceChildren(empty);
};

const loadPledges = async () => {
  try {
    const response = await fetch("/api/pledges", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Unable to load pledge comments.");
    }

    const pledges = Array.isArray(result.pledges) ? result.pledges : [];
    pledgeCount.textContent = String(pledges.length);

    if (pledges.length === 0) {
      pledgeStatus.textContent = "Ready for the first pledge.";
      showEmptyState();
      return;
    }

    pledgeStatus.textContent = `${pledges.length} pledge comment${pledges.length === 1 ? "" : "s"} visible.`;
    pledgeList.replaceChildren(
      ...pledges.map((pledge, index) => createPledgeCard(pledge, index))
    );
  } catch (error) {
    pledgeStatus.textContent = error.message;
    pledgeStatus.classList.add("is-error");
    showEmptyState();
  }
};

loadPledges();
