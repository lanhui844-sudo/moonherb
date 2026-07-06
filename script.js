const defaultHeroImage = "./assets/hero-herbs.png";

function parseTags(value) {
  return value
    .split(/[,、/，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function parseLines(value) {
  return value
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function createCustomRecipe({ title, intent, ingredients, note, imageUrl }) {
  const cleanTitle = title.trim() || "未命名草药配方";
  const cleanIntent = intent.trim() || "日常整理";
  const tags = parseTags(ingredients);
  const safeTags = tags.length ? tags : ["自定义"];
  const cleanNote = note.trim() || "记录这份配方的气味、使用场景和你的个人感受。";

  return {
    title: cleanTitle,
    rating: "5.00",
    use: `为“${cleanIntent}”准备的个人草药手记。`,
    meter: "100%",
    tags: safeTags,
    detail: cleanNote,
    imageUrl,
    isCustom: true,
    steps: [`目标：${cleanIntent}`, `材料：${safeTags.join("、")}`, cleanNote],
  };
}

function createCustomHerb({ title, usage, note, sourceList = [] }) {
  const cleanTitle = title.trim() || "未命名草药";
  const cleanUsage = usage.trim() || "自定义用途";
  const cleanNote = note.trim() || "记录这味草药的气味、用途、禁忌或个人观察。";

  return {
    title: cleanTitle,
    text: cleanUsage,
    detail: cleanNote,
    color: "custom",
    sources: sourceList.slice(),
    isCustom: true,
  };
}

function createSource({ title, type, link }) {
  return {
    title: title.trim() || "未命名来源",
    type: type.trim() || "个人笔记",
    link: link.trim(),
  };
}

function formatMoonLock(date = new Date()) {
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const dateText = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 · ${weekdays[date.getDay()]}`;
  const synodicMonth = 29.530588853;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const currentUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0);
  const daysSinceKnownNewMoon = (currentUtc - knownNewMoon) / 86400000;
  const moonAge = ((daysSinceKnownNewMoon % synodicMonth) + synodicMonth) % synodicMonth;
  const moonDay = Math.max(1, Math.round(moonAge) + 1);
  const daysToNewMoon = Math.max(0, Math.round(synodicMonth - moonAge));
  const phases = [
    { limit: 1.5, label: "新月" },
    { limit: 6.5, label: "娥眉月" },
    { limit: 8.5, label: "上弦月" },
    { limit: 13.5, label: "盈凸月" },
    { limit: 16.5, label: "满月" },
    { limit: 21.5, label: "亏凸月" },
    { limit: 23.5, label: "下弦月" },
    { limit: 28.5, label: "残月" },
    { limit: synodicMonth, label: "新月前夜" },
  ];
  const phase = phases.find((item) => moonAge < item.limit)?.label || "月相转换";

  return {
    dateText,
    phaseText: `${phase} · 第${moonDay}日`,
    nextNewMoonText: daysToNewMoon === 0 ? "今日近新月" : `距新月约${daysToNewMoon}天`,
  };
}

function createCustomRitual({ title, timing, intention, tools, steps }) {
  const cleanTitle = title.trim() || "未命名仪式";
  const cleanTiming = timing.trim() || "自选时间";
  const cleanIntention = intention.trim() || "整理当下状态";
  const parsedTools = parseTags(tools);
  const safeTools = parsedTools.length ? parsedTools : ["纸笔"];
  const parsedSteps = parseLines(steps);

  return {
    title: cleanTitle,
    timing: cleanTiming,
    intention: cleanIntention,
    tools: safeTools,
    steps: parsedSteps.length ? parsedSteps : ["安静坐下 1 分钟。", "写下你的意图。", "完成后记录身体感受。"],
    isCustom: true,
  };
}

function findRecipeIndexByIntent(recipes, query) {
  if (!query.trim()) return 0;
  const normalized = query.trim();
  const matchedIndex = recipes.findIndex((recipe) => {
    const haystack = [recipe.title, recipe.use, recipe.detail, ...recipe.tags].join(" ");
    return haystack.includes(normalized);
  });

  if (matchedIndex >= 0) return matchedIndex;
  if (normalized.includes("睡") || normalized.includes("梦")) return 2;
  if (normalized.includes("边") || normalized.includes("护") || normalized.includes("界")) return 1;
  return 0;
}

function toggleValue(value) {
  return !value;
}

function removeAt(items, index) {
  if (index < 0 || index >= items.length) return items;
  return items.filter((_, itemIndex) => itemIndex !== index);
}

const recipes = [
  {
    title: "月窗净场香囊",
    rating: "4.86",
    use: "空间清理后，用来把气味和心绪慢慢收拢。",
    meter: "82%",
    tags: ["艾草", "迷迭香", "薰衣草", "月桂叶"],
    detail: "把艾草、迷迭香、薰衣草和一片月桂叶装入棉布袋，放在窗边过一夜。它适合在打扫、换季或重新布置房间之后使用。",
    steps: ["先写一句这次想清理掉的状态。", "按从浓到淡的气味顺序加入草药。", "放在门口、书桌或床头，保留 3 晚即可。"],
  },
  {
    title: "边界盐罐",
    rating: "4.74",
    use: "适合放在入口、工作台或随身包里，提醒自己保留边界。",
    meter: "74%",
    tags: ["粗盐", "迷迭香", "黑胡椒", "鼠尾草"],
    detail: "用粗盐打底，加入迷迭香、黑胡椒和少量鼠尾草，装进小玻璃罐。它不是神秘道具，更像一个可以看见的心理边界提示。",
    steps: ["清洁玻璃罐并完全干燥。", "每加入一味材料，就默念一句边界声明。", "放在入口附近，每周轻轻摇动一次。"],
  },
  {
    title: "晚安梦袋",
    rating: "4.91",
    use: "适合睡前、冥想后，或想把夜晚变得更安静的时候。",
    meter: "91%",
    tags: ["薰衣草", "洋甘菊", "玫瑰", "薄荷"],
    detail: "这是一份以香气为主的非饮用式香囊配方。放在床头或笔记本旁，让睡前的几分钟从刷屏切换成整理梦境。",
    steps: ["轻轻揉开花草，让香气释放出来。", "装入透气布袋并系紧。", "睡前写下一句想带进梦里的问题。"],
  },
];

const rituals = [
  {
    title: "新月净场",
    timing: "新月前后 3 日",
    intention: "清理旧状态，给空间重新定调。",
    tools: ["艾草", "盐碗", "开窗"],
    steps: ["打开一扇窗。", "把净场香囊放在房间中央。", "从门口开始顺时针整理一圈。"],
  },
  {
    title: "睡前梦记",
    timing: "睡前 15 分钟",
    intention: "把一天收起来，给梦境留一点位置。",
    tools: ["晚安梦袋", "笔记本", "温水"],
    steps: ["把手机放远。", "闻一闻梦袋，写下一个问题。", "醒来后记录第一个画面。"],
  },
  {
    title: "出门边界",
    timing: "出门前",
    intention: "提醒自己今天的精力边界。",
    tools: ["边界盐罐", "外套", "一句声明"],
    steps: ["轻轻摇动盐罐。", "说出今天不想被打扰的边界。", "把盐罐放回入口处。"],
  },
];

let herbs = [
  { title: "迷迭香", text: "清场、提神、边界感", color: "sage" },
  { title: "薰衣草", text: "放松、睡眠、柔化情绪", color: "violet" },
  { title: "月桂叶", text: "愿望书写、祝福、收尾", color: "gold" },
  { title: "艾草", text: "净场、直觉、换季整理", color: "blue" },
];

let currentRecipe = 0;
let uploadedImageUrl = "";
let latestCustomRecipe = null;
let bookmarked = false;
let toastTimer = 0;
let sources = [
  { title: "个人草药观察笔记", type: "个人笔记", link: "2026 春夏记录" },
  { title: "常见芳香草本资料", type: "资料库", link: "内部整理" },
];

const heroImage = document.querySelector(".feature-card img");
const recipeIndex = document.querySelector("#recipeIndex");
const recipeRating = document.querySelector("#recipeRating");
const recipeUse = document.querySelector("#recipeUse");
const detailTitle = document.querySelector("#detailTitle");
const detailText = document.querySelector("#detailText");
const tagRow = document.querySelector("#tagRow");
const stepsList = document.querySelector("#stepsList");
const energyMeter = document.querySelector("#energyMeter");
const intentInput = document.querySelector("#intentInput");
const recipeImage = document.querySelector("#recipeImage");
const uploadFileName = document.querySelector("#uploadFileName");
const customRecipeForm = document.querySelector("#customRecipeForm");
const customPreview = document.querySelector("#customPreview");
const customPreviewImage = document.querySelector("#customPreviewImage");
const customPreviewTitle = document.querySelector("#customPreviewTitle");
const customPreviewText = document.querySelector("#customPreviewText");
const customPreviewSource = document.querySelector("#customPreviewSource");
const useCustomRecipe = document.querySelector("#useCustomRecipe");
const menuButton = document.querySelector("#menuButton");
const commandPanel = document.querySelector("#commandPanel");
const bookmarkButton = document.querySelector("#bookmarkButton");
const expandSearchButton = document.querySelector("#expandSearchButton");
const statusToast = document.querySelector("#statusToast");
const ritualList = document.querySelector("#ritualList");
const customHerbForm = document.querySelector("#customHerbForm");
const customRitualForm = document.querySelector("#customRitualForm");
const newHerbButton = document.querySelector("#newHerbButton");
const newRitualButton = document.querySelector("#newRitualButton");
const homeButton = document.querySelector("#homeButton");
const todayButton = document.querySelector("#todayButton");
const pageViews = document.querySelectorAll(".page-view");
const herbList = document.querySelector(".herb-list");
const customTabs = document.querySelectorAll("[data-custom-tab]");
const customPanels = document.querySelectorAll("[data-custom-panel]");
const deleteRecipeButton = document.querySelector("#deleteRecipeButton");
const sourceTitle = document.querySelector("#sourceTitle");
const sourceType = document.querySelector("#sourceType");
const sourceLink = document.querySelector("#sourceLink");
const addSourceButton = document.querySelector("#addSourceButton");
const sourceList = document.querySelector("#sourceList");
const moonDateText = document.querySelector("#moonDateText");
const moonPhaseText = document.querySelector("#moonPhaseText");
const moonNextText = document.querySelector("#moonNextText");

function showToast(message) {
  statusToast.textContent = message;
  statusToast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    statusToast.hidden = true;
  }, 2600);
}

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateTopNav(pageName) {
  const activePage = pageName === "overview" ? "home" : pageName;
  document.querySelectorAll("[data-nav-view]").forEach((entry) => {
    const isActive = entry.dataset.navView === activePage;
    entry.classList.toggle("active", isActive);
  });
}

function showPage(pageName) {
  if (document.body.classList.contains("read-only") && pageName === "upload") {
    showToast("公开浏览版仅开放查看。");
    pageName = "home";
  }
  updateTopNav(pageName);
  pageViews.forEach((view) => {
    view.hidden = view.dataset.page !== pageName;
  });
  commandPanel.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateMoonLock(date = new Date()) {
  const moonInfo = formatMoonLock(date);
  moonDateText.textContent = moonInfo.dateText;
  moonPhaseText.textContent = moonInfo.phaseText;
  moonNextText.textContent = moonInfo.nextNewMoonText;
}

function applyReadOnlyMode() {
  const hostname = location.hostname;
  const isLocalPreview = hostname === "" || hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocalPreview) return;

  document.body.classList.add("read-only");
  document.querySelectorAll('[data-view="upload"]').forEach((item) => {
    item.hidden = true;
  });
  document.querySelectorAll("#newHerbButton, #newRitualButton, #deleteRecipeButton").forEach((item) => {
    item.hidden = true;
  });
}

function applyManagedContent(content) {
  if (!content || typeof content !== "object") return;
  if (Array.isArray(content.recipes) && content.recipes.length) {
    recipes.splice(0, recipes.length, ...content.recipes);
  }
  if (Array.isArray(content.rituals) && content.rituals.length) {
    rituals.splice(0, rituals.length, ...content.rituals);
  }
  if (Array.isArray(content.herbs) && content.herbs.length) {
    herbs = content.herbs;
  }
  if (Array.isArray(content.sources) && content.sources.length) {
    sources = content.sources;
  }
}

async function loadManagedContent() {
  try {
    const response = await fetch("./data/content.json", { cache: "no-store" });
    if (!response.ok) return;
    const content = await response.json();
    applyManagedContent(content);
  } catch (error) {
    console.info("Using built-in content because managed content is unavailable.");
  }
}

function renderRecipe(index) {
  if (!recipes.length) {
    detailTitle.textContent = "还没有配方";
    detailText.textContent = "你可以去自定义页面添加第一份草药配方。";
    recipeIndex.textContent = "00";
    recipeRating.textContent = "0.00";
    recipeUse.textContent = "暂无配方";
    energyMeter.style.width = "0%";
    tagRow.innerHTML = "";
    stepsList.innerHTML = "";
    heroImage.src = defaultHeroImage;
    return;
  }
  currentRecipe = Math.max(0, Math.min(index, recipes.length - 1));
  const recipe = recipes[currentRecipe];
  recipeIndex.textContent = String(currentRecipe + 1).padStart(2, "0");
  recipeRating.textContent = recipe.rating;
  recipeUse.textContent = recipe.use;
  detailTitle.textContent = recipe.title;
  detailText.textContent = recipe.detail;
  energyMeter.style.width = recipe.meter;
  tagRow.innerHTML = recipe.tags.map((tag) => `<span>${tag}</span>`).join("");
  stepsList.innerHTML = recipe.steps.map((step) => `<li>${step}</li>`).join("");
  if (recipe.sources?.length) {
    stepsList.innerHTML += `<li>资料来源：${recipe.sources.map((source) => source.title).join("、")}</li>`;
  }
  heroImage.src = recipe.imageUrl || defaultHeroImage;
  heroImage.alt = recipe.isCustom ? `${recipe.title}的自定义配方照片` : "草药、玻璃瓶、月相纸张和仪式器皿组成的现代草药工作台";
}

function renderSources() {
  sourceList.innerHTML = sources
    .map(
      (source, index) => `
        <article class="source-item">
          <strong>${source.title}</strong>
          <span>${source.type}</span>
          <small>${source.link || "未填写链接或页码"}</small>
          <button class="delete-button" type="button" data-delete-source="${index}">删除来源</button>
        </article>
      `,
    )
    .join("");
}

function renderHerbs() {
  herbList.innerHTML = herbs
    .map(
      (herb, index) => `
        <article>
          <span class="herb-dot ${herb.color}"></span>
          <h3>${herb.title}</h3>
          <p>${herb.text}</p>
          ${herb.detail ? `<small>${herb.detail}</small>` : ""}
          ${herb.sources?.length ? `<small>来源：${herb.sources.map((source) => source.title).join("、")}</small>` : ""}
          <div class="card-actions">
            <button class="delete-button" type="button" data-delete-herb="${index}">删除</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderRituals() {
  ritualList.innerHTML = rituals
    .map(
      (ritual, index) => `
        <article class="ritual-card ${ritual.isCustom ? "custom-ritual" : ""}">
          <div class="ritual-card-top">
            <span>${ritual.timing}</span>
            <button type="button" data-ritual-index="${index}">查看步骤</button>
          </div>
          <h3>${ritual.title}</h3>
          <p>${ritual.intention}</p>
          ${ritual.sources?.length ? `<small>来源：${ritual.sources.map((source) => source.title).join("、")}</small>` : ""}
          <div class="ritual-tools">${ritual.tools.map((tool) => `<span>${tool}</span>`).join("")}</div>
          <ol>${ritual.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
          <div class="card-actions">
            <button class="delete-button" type="button" data-delete-ritual="${index}">删除</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function addCustomRecipe(recipe) {
  const existingIndex = recipes.findIndex((item) => item.isCustom && item.title === recipe.title);
  if (existingIndex >= 0) {
    recipes[existingIndex] = recipe;
    return existingIndex;
  }
  recipes.push(recipe);
  return recipes.length - 1;
}

document.querySelectorAll("[data-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const step = Number(button.dataset.step);
    currentRecipe = (currentRecipe + step + recipes.length) % recipes.length;
    renderRecipe(currentRecipe);
  });
});

addSourceButton.addEventListener("click", () => {
  const source = createSource({
    title: sourceTitle.value,
    type: sourceType.value,
    link: sourceLink.value,
  });
  sources.push(source);
  sourceTitle.value = "";
  sourceType.value = "";
  sourceLink.value = "";
  renderSources();
  showToast(`已添加来源「${source.title}」。`);
});

sourceList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-source]");
  if (!button) return;
  sources = removeAt(sources, Number(button.dataset.deleteSource));
  renderSources();
  showToast("已删除来源。");
});

deleteRecipeButton.addEventListener("click", () => {
  if (!recipes.length) return;
  const deletedTitle = recipes[currentRecipe].title;
  recipes.splice(currentRecipe, 1);
  currentRecipe = Math.min(currentRecipe, Math.max(0, recipes.length - 1));
  renderRecipe(currentRecipe);
  showToast(`已删除配方「${deletedTitle}」。`);
});

herbList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-herb]");
  if (!button) return;
  herbs = removeAt(herbs, Number(button.dataset.deleteHerb));
  renderHerbs();
  showToast("已删除草药条目。");
});

document.querySelectorAll("[data-intent]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-intent]").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    intentInput.value = button.dataset.intent;
  });
});

document.querySelector("#searchButton").addEventListener("click", () => {
  currentRecipe = findRecipeIndexByIntent(recipes, intentInput.value);
  renderRecipe(currentRecipe);
  showPage("recipes");
});

document.querySelector("#exploreButton").addEventListener("click", () => {
  showPage("overview");
});

homeButton.addEventListener("click", () => showPage("home"));
todayButton.addEventListener("click", () => showPage("home"));

menuButton.addEventListener("click", () => {
  const isOpen = commandPanel.hidden;
  commandPanel.hidden = !isOpen;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  showToast(isOpen ? "目录已展开。" : "目录已收起。");
});

commandPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  showPage(button.dataset.view);
});

document.querySelectorAll("[data-view]").forEach((entry) => {
  entry.addEventListener("click", () => {
    showPage(entry.dataset.view);
  });
});

bookmarkButton.addEventListener("click", () => {
  bookmarked = toggleValue(bookmarked);
  bookmarkButton.classList.toggle("is-active", bookmarked);
  bookmarkButton.setAttribute("aria-pressed", String(bookmarked));
  showToast(bookmarked ? `已收藏「${recipes[currentRecipe].title}」。` : "已取消收藏。");
});

expandSearchButton.addEventListener("click", () => {
  showPage("upload");
  showToast("已跳到上传区，你可以添加自己的草药配方。");
});

newHerbButton.addEventListener("click", () => {
  showPage("upload");
  document.querySelector('[data-custom-tab="herbProfile"]').click();
  customHerbForm.scrollIntoView({ behavior: "smooth", block: "center" });
  document.querySelector("#herbTitle").focus();
});

recipeImage.addEventListener("change", () => {
  const file = recipeImage.files && recipeImage.files[0];
  if (!file) return;

  if (uploadedImageUrl && uploadedImageUrl.startsWith("blob:")) URL.revokeObjectURL(uploadedImageUrl);
  uploadedImageUrl = URL.createObjectURL(file);
  uploadFileName.textContent = file.name;
});

customHerbForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const herb = createCustomHerb({
    title: document.querySelector("#herbTitle").value,
    usage: document.querySelector("#herbUsage").value,
    note: document.querySelector("#herbNote").value,
    sourceList: sources,
  });
  herbs.unshift(herb);
  renderHerbs();
  customHerbForm.reset();
  showPage("library");
  showToast(`已将「${herb.title}」加入草药档案。`);
});

customRecipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  latestCustomRecipe = createCustomRecipe({
    title: document.querySelector("#customTitle").value,
    intent: document.querySelector("#customIntent").value,
    ingredients: document.querySelector("#customIngredients").value,
    note: document.querySelector("#customNote").value,
    imageUrl: uploadedImageUrl || defaultHeroImage,
  });
  latestCustomRecipe.sources = sources.slice();

  customPreview.hidden = false;
  customPreviewImage.src = latestCustomRecipe.imageUrl;
  customPreviewTitle.textContent = latestCustomRecipe.title;
  customPreviewText.textContent = latestCustomRecipe.use;
  customPreviewSource.textContent = latestCustomRecipe.sources.length
    ? `资料来源：${latestCustomRecipe.sources.map((source) => source.title).join("、")}`
    : "";
  showToast("个人配方卡已生成，可以设为首页展示。");
});

customTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeTab = tab.dataset.customTab;
    customTabs.forEach((item) => {
      const isActive = item.dataset.customTab === activeTab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    customPanels.forEach((panel) => {
      panel.hidden = panel.dataset.customPanel !== activeTab;
    });
  });
});

useCustomRecipe.addEventListener("click", () => {
  if (!latestCustomRecipe) return;
  currentRecipe = addCustomRecipe(latestCustomRecipe);
  renderRecipe(currentRecipe);
  showPage("recipes");
  showToast(`已将「${latestCustomRecipe.title}」加入配方手记。`);
});

ritualList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-ritual]");
  if (deleteButton) {
    rituals.splice(Number(deleteButton.dataset.deleteRitual), 1);
    renderRituals();
    showToast("已删除仪式。");
    return;
  }

  const button = event.target.closest("[data-ritual-index]");
  if (!button) return;
  const card = button.closest(".ritual-card");
  const steps = card.querySelector("ol");
  const isOpen = steps.classList.toggle("is-open");
  button.textContent = isOpen ? "收起步骤" : "查看步骤";
});

newRitualButton.addEventListener("click", () => {
  showPage("upload");
  document.querySelector('[data-custom-tab="ritual"]').click();
  customRitualForm.scrollIntoView({ behavior: "smooth", block: "center" });
  document.querySelector("#ritualTitle").focus();
});

customRitualForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const ritual = createCustomRitual({
    title: document.querySelector("#ritualTitle").value,
    timing: document.querySelector("#ritualTiming").value,
    intention: document.querySelector("#ritualIntention").value,
    tools: document.querySelector("#ritualTools").value,
    steps: document.querySelector("#ritualSteps").value,
  });
  ritual.sources = sources.slice();

  rituals.unshift(ritual);
  renderRituals();
  customRitualForm.reset();
  showToast(`已添加仪式「${ritual.title}」。`);
});

async function initializeApp() {
  await loadManagedContent();
  renderRecipe(currentRecipe);
  renderHerbs();
  renderRituals();
  renderSources();
  updateMoonLock();
  applyReadOnlyMode();
}

initializeApp();
