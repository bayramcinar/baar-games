const filters = document.querySelector(".filters");
const buttons = filters.querySelectorAll("button");
const games = document.querySelectorAll(".game-card");
const status = document.querySelector("#filter-status");
const isTurkish = document.documentElement.lang === "tr";
let visibleGameCount = games.length;

function announceGameCount() {
  status.textContent = isTurkish
    ? `${visibleGameCount} oyun gösteriliyor.`
    : `${visibleGameCount} ${visibleGameCount === 1 ? "game" : "games"} shown.`;
}

function showGames(platform) {
  visibleGameCount = 0;

  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button.dataset.platform === platform));
  }

  for (const game of games) {
    const platforms = game.dataset.platforms.split(" ");
    game.hidden = platform !== "all" && !platforms.includes(platform);
    if (!game.hidden) visibleGameCount++;
  }

  announceGameCount();
}

for (const button of buttons) {
  button.addEventListener("click", () => showGames(button.dataset.platform));
}

document.querySelector("[data-show-all]").addEventListener("click", () => showGames("all"));
filters.hidden = false;

for (const placeholder of document.querySelectorAll("[data-social-url]")) {
  const url = placeholder.dataset.socialUrl.trim();
  if (!url.startsWith("https://")) continue;

  const link = document.createElement("a");
  link.className = placeholder.className;
  const platform = placeholder.textContent.trim();
  link.append(...placeholder.childNodes);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  const title = placeholder.closest(".game-card").querySelector("h3").textContent;
  link.setAttribute("aria-label", isTurkish ? `${platform} | ${title}` : `${title} on ${platform}`);
  placeholder.replaceWith(link);
}

if (window.location.protocol === "file:") {
  for (const link of document.querySelectorAll("[data-file-href]")) {
    link.href = link.dataset.fileHref;
  }
}

const gallery = document.querySelector(".gallery");

if (typeof gallery.showModal === "function") {
  const galleryTitle = gallery.querySelector("#gallery-title");
  const pictureFrame = gallery.querySelector(".gallery-image");
  const thumbnails = gallery.querySelector(".gallery-thumbnails");
  const position = gallery.querySelector(".gallery-position");
  let screenshots = [];
  let activeThumbnail = null;
  let current = 0;

  function showScreenshot(index) {
    current = (index + screenshots.length) % screenshots.length;
    const screenshot = screenshots[current];
    pictureFrame.replaceChildren(screenshot.cloneNode());
    position.textContent = `${current + 1} / ${screenshots.length} · ${screenshot.dataset.store}`;

    activeThumbnail?.removeAttribute("aria-current");
    activeThumbnail = thumbnails.children[current];
    activeThumbnail.setAttribute("aria-current", "true");
    const center = activeThumbnail.offsetLeft + activeThumbnail.offsetWidth / 2;
    thumbnails.scrollLeft = center - thumbnails.clientWidth / 2;
  }

  function buildThumbnails() {
    return screenshots.map((shot, index) => {
      const button = document.createElement("button");
      button.className = "gallery-thumbnail";
      button.type = "button";
      const label = isTurkish ? "Ekran görüntüsü" : "Screenshot";
      button.setAttribute("aria-label", `${label} ${index + 1}: ${shot.alt}, ${shot.dataset.store}`);

      const preview = shot.cloneNode();
      preview.alt = "";
      preview.decoding = "async";
      button.append(preview);
      button.addEventListener("click", () => showScreenshot(index));
      return button;
    });
  }

  for (const link of document.querySelectorAll(".game-art")) {
    link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      const card = link.closest(".game-card");
      screenshots = Array.from(card.querySelector(".store-screens").content.querySelectorAll("img"));
      galleryTitle.textContent = card.querySelector("h3").textContent;
      thumbnails.replaceChildren(...buildThumbnails());
      activeThumbnail = null;
      gallery.showModal();
      showScreenshot(0);
    });
    link.setAttribute("aria-haspopup", "dialog");
  }

  for (const button of gallery.querySelectorAll("[data-direction]")) {
    button.addEventListener("click", () => showScreenshot(current + Number(button.dataset.direction)));
  }

  gallery.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const fromThumbnail = event.target.classList.contains("gallery-thumbnail");
      showScreenshot(current + (event.key === "ArrowLeft" ? -1 : 1));
      if (fromThumbnail) activeThumbnail.focus({ preventScroll: true });
    }
  });

  gallery.addEventListener("close", () => {
    pictureFrame.replaceChildren();
    thumbnails.replaceChildren();
    activeThumbnail = null;
  });
}
