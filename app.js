const $ = (s) => document.querySelector(s),
  saved = () => JSON.parse(localStorage.getItem("bsv_saved") || "[]");
let stories = [],
  cats = [];

  const STORIES_PER_PAGE = 12;

  let currentStories = [];
  let visibleStories = STORIES_PER_PAGE;
  let currentCategory = null;

const esc = (x) =>
  String(x || "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );

function normalizeSearch(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// function showCategory(categoryId) {
//   const category = normalizeSearch(categoryId);

//   const filtered = stories.filter(
//     (s) => normalizeSearch(s.category) === category
//   );

//   const grid = $("#latestGrid");

//   if (!filtered.length) {
//     grid.innerHTML = `
//       <div class="no-results">
//         <h3>কোনো গল্প পাওয়া যায়নি</h3>
//         <p>এই বিভাগে এখনো কোনো গল্প নেই।</p>
//       </div>
//     `;
//     return;
//   }

//   grid.innerHTML = filtered
//     .sort((a, b) => new Date(b.date) - new Date(a.date))
//     .map(card)
//     .join("");
// }

function showCategory(categoryId) {
  currentCategory = categoryId;

  currentStories = stories
    .filter(
      (s) =>
        normalizeSearch(s.category) ===
        normalizeSearch(categoryId)
    )
    .sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

  visibleStories = STORIES_PER_PAGE;

  renderStoryGrid();

  history.replaceState(
    null,
    "",
    "#category=" + encodeURIComponent(categoryId)
  );

  $("#latestGrid").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function save(id) {
  let a = saved();
  a = a.includes(id) ? a.filter((x) => x !== id) : [id, ...a];
  localStorage.setItem("bsv_saved", JSON.stringify(a));
  render();
}
function card(s) {
  let yes = saved().includes(s.id);
  return `<article class="card"><button class="save-card" onclick="event.preventDefault();save('${
    s.id
  }')">${yes ? "♥" : "♡"}</button><a href="story.html?id=${s.id}"><img src="${
    s.thumbnail
  }" alt="${esc(
    s.title
  )}" loading="lazy"><div class="card-body"><div class="cat">${esc(
    s.category
  )}</div><h3>${esc(s.title)}</h3><p>${esc(
    s.description
  )}</p><div class="card-meta"><span>${
    s.date
  }</span></div></div></a></article>`;
}

// function render() {
//   let sorted = [...stories].sort((a, b) => b.date.localeCompare(a.date));
//   $("#latestGrid").innerHTML = sorted.map(card).join("");
//   $("#savedGrid").innerHTML = stories
//     .filter((s) => saved().includes(s.id))
//     .map(card)
//     .join("");
//   $("#empty").style.display = saved().length ? "none" : "block";
//   // $("#catGrid").innerHTML = cats
//   //   .map(
//   //     (c) =>
//   //       `<a class="cat-card" href="#${encodeURIComponent(
//   //         c.id
//   //       )}"><div class="icon">${c.icon}</div><h3>${esc(c.name)}</h3><p>${esc(
//   //         c.description
//   //       )}</p></a>`
//   //   )
//   //   .join("");
//   $("#catGrid").innerHTML = cats
//   .map(
//     (c) =>
//       `<button class="cat-card" data-category="${esc(c.id)}">
//         <div class="icon">${esc(c.icon)}</div>
//         <h3>${esc(c.name)}</h3>
//         <p>${esc(c.description)}</p>
//       </button>`
//   )
//   .join("");

//   document.querySelectorAll(".cat-card").forEach((button) => {
//     button.onclick = () => {
//       const category = button.dataset.category;
  
//       showCategory(category);
  
//       history.replaceState(
//         null,
//         "",
//         "#category=" + encodeURIComponent(category)
//       );
  
//       document
//         .querySelector("#latestGrid")
//         .scrollIntoView({
//           behavior: "smooth",
//           block: "start"
//         });
//     };
//   });

//   let f = stories.find((x) => x.featured) || sorted[0];
//   if (f) {
//     $("#heroTitle").textContent = f.title;
//     $("#heroSub").textContent = f.subtitle;
//     $("#heroMeta").textContent = `${f.category}`;
//   }
// }


function render() {
  const sorted = [...stories].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  currentCategory = null;
  currentStories = sorted;
  visibleStories = STORIES_PER_PAGE;

  renderStoryGrid();

  $("#savedGrid").innerHTML = stories
    .filter((s) => saved().includes(s.id))
    .map(card)
    .join("");

  $("#empty").style.display = saved().length ? "none" : "block";

  $("#catGrid").innerHTML = cats
    .map(
      (c) =>
        `<button class="cat-card" data-category="${esc(c.id)}">
          <div class="icon">${esc(c.icon)}</div>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.description)}</p>
        </button>`
    )
    .join("");

  document.querySelectorAll(".cat-card").forEach((button) => {
    button.onclick = () => {
      showCategory(button.dataset.category);
    };
  });

  // Latest story becomes hero
  const f = sorted[0];

  if (f) {
    $("#heroTitle").textContent = f.title;
    $("#heroSub").textContent = f.subtitle;
    $("#heroMeta").textContent = f.category;
  }
}

// function renderStoryGrid() {
//   const grid = $("#latestGrid");

//   const visible = currentStories.slice(0, visibleStories);

//   grid.innerHTML = visible.map(card).join("");

//   let loadMore = document.querySelector("#loadMoreStories");

//   if (!loadMore) {
//     loadMore = document.createElement("button");
//     loadMore.id = "loadMoreStories";
//     loadMore.className = "load-more";
//     loadMore.textContent = "আরও গল্প দেখুন";
//     grid.parentElement.appendChild(loadMore);

//     loadMore.onclick = () => {
//       visibleStories += STORIES_PER_PAGE;
//       renderStoryGrid();
//     };
//   }

//   loadMore.style.display =
//     visibleStories < currentStories.length
//       ? "block"
//       : "none";
// }

function renderStoryGrid() {
  const visible = currentStories.slice(0, visibleStories);

  $("#latestGrid").innerHTML = visible
    .map(card)
    .join("");

  const button = $("#loadMoreStories");

  button.style.display =
    visibleStories < currentStories.length
      ? "block"
      : "none";

  button.textContent =
    visibleStories < currentStories.length
      ? "আরও গল্প দেখুন"
      : "";
}

$("#loadMoreStories").onclick = () => {
  visibleStories += STORIES_PER_PAGE;
  renderStoryGrid();
};

async function init() {
  [stories, cats] = await Promise.all([
    fetch("data/stories.json").then((r) => r.json()),
    fetch("data/categories.json").then((r) => r.json()),
  ]);
  render();
}
$("#featured").onclick = () =>
  (location.href =
    "story.html?id=" + (stories.find((x) => x.featured) || stories[0]).id);
$("#random").onclick = () =>
  (location.href =
    "story.html?id=" + stories[Math.floor(Math.random() * stories.length)].id);
$("#theme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "bsv_theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};
if (localStorage.getItem("bsv_theme") === "dark")
  document.body.classList.add("dark");
$("#searchOpen").onclick = () => $("#overlay").classList.add("open");
$("#close").onclick = () => $("#overlay").classList.remove("open");
// $("#search").oninput = (e) => {
// //   let q = e.target.value.trim().toLowerCase();
// //   let r = stories.filter((s) =>
// //     (s.title + " " + s.category + " " + s.description + " " + s.tags.join(" "))
// //       .toLowerCase()
// //       .includes(q)
// //   );

//     //const q=e.target.value.trim().toLowerCase();

//     let q=normalizeSearch(e.target.value);
//     let r=q
//         ? stories.filter(s => {
//             let searchable = normalizeSearch([
//                 s.title,
//                 s.subtitle,
//                 s.category,
//                 s.description,
//                 ...(s.tags || []),
//                 ...(s.searchTerms || [])
//             ].join(" "));

//             return searchable.includes(q);
//         }).slice(0,8)
//         : [];
//   $("#results").innerHTML = q
//     ? r
//         .map(
//           (s) =>
//             `<a class="result" href="story.html?id=${s.id}"><img src="${
//               s.thumbnail
//             }"><div><h3>${esc(s.title)}</h3><p>${esc(s.category)} · ${
//               s.readTime
//             } মিনিট</p></div></a>`
//         )
//         .join("")
//     : "";
// };

$("#search").oninput = (e) => {
    const q = normalizeSearch(e.target.value);
  
    if (!q) {
      $("#results").innerHTML = "";
      return;
    }
  
    // 1. Find matching categories
    const matchedCategories = cats.filter((c) => {
      const categorySearchText = normalizeSearch([
        c.id,
        c.name,
        c.description,
        ...(c.searchTerms || [])
      ].join(" "));
  
      return categorySearchText.includes(q);
    });
  
    // 2. Get category IDs/names
    const matchedCategoryIds = new Set(
      matchedCategories.flatMap((c) => [
        normalizeSearch(c.id),
        normalizeSearch(c.name)
      ])
    );
  
    // 3. Find stories matching:
    //    - title
    //    - subtitle
    //    - category
    //    - description
    //    - tags
    //    - story searchTerms
    //    - matched categories
    const results = stories.filter((s) => {
      const storySearchText = normalizeSearch([
        s.title,
        s.subtitle,
        s.category,
        s.description,
        ...(s.tags || []),
        ...(s.searchTerms || [])
      ].join(" "));
  
      const storyCategory = normalizeSearch(s.category);
  
      return (
        storySearchText.includes(q) ||
        matchedCategoryIds.has(storyCategory)
      );
    });
  
    $("#results").innerHTML = results
      .slice(0, 8)
      .map(
        (s) => `
          <a class="result" href="story.html?id=${s.id}">
            <img src="${s.thumbnail}" alt="${esc(s.title)}">
            <div>
              <h3>${esc(s.title)}</h3>
              <p>${esc(s.category)}</p>
            </div>
          </a>
        `
      )
      .join("");
  };

init();
