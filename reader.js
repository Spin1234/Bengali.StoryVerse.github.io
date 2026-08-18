function calculateReadTime(paragraphs) {
    const text = paragraphs.join(" ");

    // Bengali and English word detection
    const words = text.match(/[\u0980-\u09FF]+|[A-Za-z0-9]+/g) || [];

    const wordCount = words.length;

    // Comfortable Bengali reading speed
    const WORDS_PER_MINUTE = 100;

    return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}


const $ = (s) => document.querySelector(s),
  id = new URLSearchParams(location.search).get("id"),
  saved = () => JSON.parse(localStorage.getItem("bsv_saved") || "[]");
function esc(x) {
  return String(x).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}
function updateSave() {
  $("#save").textContent = saved().includes(id) ? "♥" : "♡";
}
$("#save").onclick = () => {
  let a = saved();
  a = a.includes(id) ? a.filter((x) => x !== id) : [id, ...a];
  localStorage.setItem("bsv_saved", JSON.stringify(a));
  updateSave();
};
$("#settings").onclick = () => $("#panel").classList.toggle("open");
$("#x").onclick = () => $("#panel").classList.remove("open");
let size = Number(localStorage.getItem("bsv_size") || 100);
function fs() {
  document.documentElement.style.setProperty("--reader-scale", size / 100);
  $("#size").textContent = size + "%";
  localStorage.setItem("bsv_size", size);
  document.querySelector(".story-body").style.fontSize =
    (19 * size) / 100 + "px";
}
$("#minus").onclick = () => {
  size = Math.max(85, size - 5);
  fs();
};
$("#plus").onclick = () => {
  size = Math.min(125, size + 5);
  fs();
};
document.querySelectorAll("#panel [data-t]").forEach(
  (b) =>
    (b.onclick = () => {
      document.querySelector(".reader").dataset.theme = b.dataset.t;
      localStorage.setItem("bsv_reader_theme", b.dataset.t);
    })
);
$("#readerTheme").onclick = () => {
  let n =
    document.querySelector(".reader").dataset.theme === "dark"
      ? "light"
      : "dark";
  document.querySelector(".reader").dataset.theme = n;
  localStorage.setItem("bsv_reader_theme", n);
};
let rt = localStorage.getItem("bsv_reader_theme") || "light";
document.querySelector(".reader").dataset.theme = rt;
async function init() {
  let meta = await fetch("data/stories.json").then((r) => r.json()),
    s = meta.find((x) => x.id === id);
  if (!s) {
    location.href = "index.html";
    return;
  }
  let body = await fetch(s.story).then((r) => r.json());
  const readTime = calculateReadTime(body.paragraphs);
  document.title = s.title + " — Bengali StoryVerse";
  $("#meta").textContent =
    s.category + " • " + readTime + " মিনিট পড়তে সময়";
  $("#title").textContent = s.title;
  $("#subtitle").textContent = s.subtitle;
  $("#date").textContent = s.date;
  $("#body").innerHTML = body.paragraphs
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  updateSave();
  fs();
}
window.onscroll = () => {
  let d = document.documentElement,
    p = d.scrollTop / (d.scrollHeight - d.clientHeight);
  $("#bar").style.width = p * 100 + "%";
};
init();
