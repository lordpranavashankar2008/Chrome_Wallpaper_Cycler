"use strict";
const $ = (id) => document.getElementById(id);

// ============ Wallpaper: images named 1..N in /images, any common extension ============
const WALLPAPER_COUNT = 5;
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif", "JPG", "JPEG", "PNG"];

const canLoad = (url) => new Promise((res) => {
  const img = new Image();
  img.onload = () => res(true);
  img.onerror = () => res(false);
  img.src = url;
});

async function showNextWallpaper() {
  let last = -1;
  try { const v = parseInt(localStorage.getItem("wallpaperIndex"), 10); if (!Number.isNaN(v)) last = v; } catch (e) {}
  for (let k = 1; k <= WALLPAPER_COUNT; k++) {
    const idx = (last + k) % WALLPAPER_COUNT;
    for (const ext of IMAGE_EXTENSIONS) {
      const url = `images/${idx + 1}.${ext}`;
      if (await canLoad(url)) {
        $("wallpaper").style.backgroundImage = `url("${url}")`;
        $("wallpaper").classList.add("on");
        try { localStorage.setItem("wallpaperIndex", String(idx)); } catch (e) {}
        return;
      }
    }
  }
}
showNextWallpaper();

// ============ Site icons (Google's favicon service, letter fallback) ============
function attachFavicon(container, pageUrl, size, letter, color) {
  let host = "";
  try { host = new URL(pageUrl).hostname; } catch (e) {}
  const sources = [
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(pageUrl)}&size=${size}`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`
  ];
  const img = document.createElement("img");
  img.alt = "";
  let i = 0;
  img.addEventListener("error", () => {
    i += 1;
    if (i < sources.length) { img.src = sources[i]; return; }
    img.remove();
    container.textContent = letter;
    container.style.background = color;
    container.style.color = "#fff";
  });
  img.src = sources[0];
  container.appendChild(img);
}

// ============ Search box (URLs go straight there, anything else to Google) ============
const TLDS = "com|org|net|edu|gov|io|in|co|dev|app|ai|me|tv|uk|us|ca|au|de|fr|jp|info|xyz";
const URL_LIKE = new RegExp(`^(www\\.)?[a-z0-9-]+(\\.[a-z0-9-]+)*\\.(${TLDS})(:\\d+)?(/\\S*)?$`, "i");
$("search-form").addEventListener("submit", (e) => {
  const q = $("q").value.trim();
  let dest = null;
  if (/^https?:\/\/\S+$/i.test(q)) dest = q;
  else if (URL_LIKE.test(q)) dest = "https://" + q;
  if (dest) { e.preventDefault(); window.location.href = dest; }
});
$("q").focus();

// ============ Google apps menu ============
const APPS = [
  ["Search", "https://www.google.com", "#4285F4"], ["Gmail", "https://mail.google.com", "#EA4335"],
  ["Drive", "https://drive.google.com", "#FBBC05"], ["YouTube", "https://www.youtube.com", "#FF0000"],
  ["Maps", "https://maps.google.com", "#34A853"], ["Calendar", "https://calendar.google.com", "#1A73E8"],
  ["Docs", "https://docs.google.com/document", "#4285F4"], ["Sheets", "https://docs.google.com/spreadsheets", "#34A853"],
  ["Slides", "https://docs.google.com/presentation", "#F9AB00"], ["Photos", "https://photos.google.com", "#EA4335"],
  ["Meet", "https://meet.google.com", "#00897B"], ["Translate", "https://translate.google.com", "#4285F4"],
  ["Keep", "https://keep.google.com", "#F9AB00"], ["News", "https://news.google.com", "#5F6368"],
  ["Gemini", "https://gemini.google.com", "#8E75F0"]
];
APPS.forEach(([name, url, color]) => {
  const a = document.createElement("a");
  a.className = "app";
  a.href = url;
  const icon = document.createElement("span");
  icon.className = "app-icon";
  attachFavicon(icon, url, 128, name[0], color);
  const label = document.createElement("span");
  label.textContent = name;
  a.append(icon, label);
  $("apps-grid").appendChild(a);
});
$("apps-btn").addEventListener("click", (e) => { e.stopPropagation(); $("apps-panel").hidden = !$("apps-panel").hidden; });

// ============ Shortcuts ============
const MAX_SHORTCUTS = 10;
let shortcuts = [];
let editingIndex = -1;
let menuIndex = -1;

const saveShortcuts = () => chrome.storage.local.set({ shortcuts });

function render() {
  const nav = $("shortcuts");
  nav.textContent = "";
  shortcuts.forEach((s, i) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    const link = document.createElement("a");
    link.className = "tile-link";
    link.href = s.url;
    const circle = document.createElement("span");
    circle.className = "circle";
    attachFavicon(circle, s.url, 64, (s.name || "?")[0].toUpperCase(), "#5f6368");
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = s.name;
    link.append(circle, label);
    const more = document.createElement("button");
    more.type = "button";
    more.className = "more";
    more.textContent = "\u22EE";
    more.setAttribute("aria-label", "Shortcut options");
    more.addEventListener("click", (e) => { e.stopPropagation(); openMenu(i, more); });
    tile.append(link, more);
    nav.appendChild(tile);
  });
  if (shortcuts.length < MAX_SHORTCUTS) {
    const tile = document.createElement("div");
    tile.className = "tile";
    const add = document.createElement("button");
    add.type = "button";
    add.className = "add-tile";
    add.style.width = "calc(100% - 8px)";
    const circle = document.createElement("span");
    circle.className = "circle";
    circle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="#5f6368"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "Add shortcut";
    add.append(circle, label);
    add.addEventListener("click", () => openDialog(-1));
    tile.appendChild(add);
    nav.appendChild(tile);
  }
}

function openMenu(i, anchor) {
  menuIndex = i;
  const menu = $("menu");
  menu.hidden = false;
  const r = anchor.getBoundingClientRect();
  menu.style.top = r.bottom + 4 + "px";
  menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8)) + "px";
}
$("menu-edit").addEventListener("click", () => { $("menu").hidden = true; openDialog(menuIndex); });
$("menu-remove").addEventListener("click", () => {
  $("menu").hidden = true;
  shortcuts.splice(menuIndex, 1);
  saveShortcuts();
  render();
});

function openDialog(index) {
  editingIndex = index;
  $("dialog-title").textContent = index >= 0 ? "Edit shortcut" : "Add shortcut";
  $("sc-name").value = index >= 0 ? shortcuts[index].name : "";
  $("sc-url").value = index >= 0 ? shortcuts[index].url : "";
  $("sc-error").hidden = true;
  $("backdrop").hidden = false;
  $("sc-name").focus();
}
const closeDialog = () => { $("backdrop").hidden = true; };
$("sc-cancel").addEventListener("click", closeDialog);
$("backdrop").addEventListener("mousedown", (e) => { if (e.target === $("backdrop")) closeDialog(); });

function normalizeUrl(input) {
  let s = input.trim();
  if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname ? u.href : null;
  } catch (e) { return null; }
}

$("dialog").addEventListener("submit", (e) => {
  e.preventDefault();
  const url = normalizeUrl($("sc-url").value);
  if (!url) {
    $("sc-error").textContent = "Enter a valid website address.";
    $("sc-error").hidden = false;
    return;
  }
  const name = $("sc-name").value.trim() || new URL(url).hostname.replace(/^www\./, "");
  if (editingIndex >= 0) shortcuts[editingIndex] = { name, url };
  else shortcuts.push({ name, url });
  saveShortcuts();
  render();
  closeDialog();
});

chrome.storage.local.get("shortcuts").then((res) => {
  shortcuts = Array.isArray(res.shortcuts) ? res.shortcuts : [];
  render();
});

// ============ Close popups ============
document.addEventListener("click", (e) => {
  if (!$("apps-panel").contains(e.target)) $("apps-panel").hidden = true;
  if (!$("menu").contains(e.target)) $("menu").hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { $("apps-panel").hidden = true; $("menu").hidden = true; closeDialog(); }
});
