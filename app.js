const state = {
  points: 1250,
  availability: false,
  activeTab: "home",
  selectedItemTab: "lost",
  selectedCategory: "All",
  searchTerm: "",
  selectedSport: "all",
  appliedTasks: new Set(),
  joinedMatches: new Set(),
};

const volunteerTasks = [
  { id: 1, title: "Event Setup — Autumn Ball", description: "Help prepare the hall before the school’s biggest evening event.", group: "Parliament", kind: "parliament", priority: "High priority", icon: "✦", time: "Today · 15:30", points: 50 },
  { id: 2, title: "Library Book Sorting", description: "Organize new arrivals and return shelves to order after classes.", group: "Library team", kind: "teacher", priority: "Teacher request", icon: "▤", time: "Tomorrow · 14:45", points: 30 },
  { id: 3, title: "Peer Tutoring: Algebra", description: "Support Grade 8 students before their upcoming math assessment.", group: "Mathematics dept.", kind: "teacher", priority: "Teacher request", icon: "∑", time: "Fri · 16:10", points: 40 },
  { id: 4, title: "Campus Clean-up", description: "Join the Eco Club for a quick schoolyard refresh before the weekend.", group: "Eco Club", kind: "club", priority: "Student club", icon: "♧", time: "Fri · 15:40", points: 25 },
  { id: 5, title: "New Student Welcome", description: "Show incoming students around the campus and answer their questions.", group: "School Council", kind: "parliament", priority: "Council request", icon: "⌂", time: "Mon · 13:20", points: 35 },
];

let matches = [
  { id: 1, sport: "Football", emoji: "⚽", time: "Today · 16:00", location: "Football Pitch", current: 3, total: 5, detail: "Need 2 players for a friendly 5v5 game." },
  { id: 2, sport: "Basketball", emoji: "🏀", time: "Today · 15:40", location: "Main Gym", current: 4, total: 5, detail: "One more player to start a quick full-court game." },
  { id: 3, sport: "Volleyball", emoji: "🏐", time: "Tomorrow · 14:55", location: "Main Gym", current: 6, total: 8, detail: "Casual game for all skill levels. Join our team!" },
  { id: 4, sport: "Chess", emoji: "♟", time: "Tomorrow · 13:30", location: "Study Hall", current: 1, total: 2, detail: "Looking for a focused opponent for a rapid game." },
  { id: 5, sport: "Football", emoji: "⚽", time: "Fri · 15:10", location: "Football Pitch", current: 7, total: 10, detail: "A relaxed Friday match. Three places are still open." },
  { id: 6, sport: "Basketball", emoji: "🏀", time: "Fri · 16:05", location: "Main Gym", current: 2, total: 4, detail: "2v2 practice game. Bring your best moves." },
];

let items = [
  { id: 1, type: "lost", title: "Blue Water Bottle", category: "Supplies", location: "Main Gym", date: "Today", status: "Active", icon: "🧴" },
  { id: 2, type: "lost", title: "Physics Notebook", category: "Books", location: "Room 203", date: "Yesterday", status: "Active", icon: "📓" },
  { id: 3, type: "lost", title: "Black Backpack", category: "Clothing", location: "Cafeteria", date: "Oct 20", status: "Active", icon: "🎒" },
  { id: 4, type: "lost", title: "Wireless Earbuds", category: "Electronics", location: "Library", date: "Oct 19", status: "Claimed", icon: "🎧" },
  { id: 5, type: "found", title: "Silver Calculator", category: "Electronics", location: "Room 118", date: "Today", status: "Active", icon: "🖩" },
  { id: 6, type: "found", title: "BIL Hoodie", category: "Clothing", location: "Main Gym", date: "Yesterday", status: "Active", icon: "🧥" },
  { id: 7, type: "found", title: "English Workbook", category: "Books", location: "Study Hall", date: "Oct 21", status: "Active", icon: "📘" },
  { id: 8, type: "found", title: "Pencil Case", category: "Supplies", location: "Cafeteria", date: "Oct 20", status: "Claimed", icon: "✏️" },
];

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function formatPoints(points) {
  return points.toLocaleString("en-US");
}

function showToast(title, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">✓</span><span><strong>${title}</strong><br>${message}</span>`;
  $("#toast-stack").append(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(16px)";
    toast.style.transition = "all .2s";
    window.setTimeout(() => toast.remove(), 220);
  }, 3500);
}

function updatePoints(amount) {
  state.points += amount;
  $("#point-count").textContent = formatPoints(state.points);
}

function taskMarkup(task, compact = false) {
  const applied = state.appliedTasks.has(task.id);
  if (compact) {
    return `<article class="request-card">
      <div class="request-card-top"><span class="tag ${task.kind}">${task.priority}</span><span class="points-reward">+${task.points} pts</span></div>
      <h3>${task.title}</h3><p>${task.description}</p>
      <div class="request-card-bottom"><span class="meta-text">${task.time}</span><button class="small-action ${applied ? "applied" : ""}" data-apply-task="${task.id}" ${applied ? "disabled" : ""}>${applied ? "Applied ✓" : "Apply"}</button></div>
    </article>`;
  }
  return `<article class="volunteer-row">
    <span class="request-icon">${task.icon}</span>
    <div class="request-info"><h3>${task.title}</h3><p>${task.description}</p></div>
    <div class="row-detail">${task.group}<span>${task.time}</span></div>
    <div class="reward-column">+${task.points} Points</div>
    <button class="small-action ${applied ? "applied" : ""}" data-apply-task="${task.id}" ${applied ? "disabled" : ""}>${applied ? "Applied ✓" : "Apply"}</button>
  </article>`;
}

function renderVolunteer() {
  $("#home-volunteer-list").innerHTML = volunteerTasks.slice(0, 3).map((task) => taskMarkup(task, true)).join("");
  $("#volunteer-list").innerHTML = volunteerTasks.map((task) => taskMarkup(task)).join("");
  $("#applied-total").textContent = state.appliedTasks.size;
}

function matchMarkup(match, mini = false) {
  const joined = state.joinedMatches.has(match.id);
  const full = match.current >= match.total;
  if (mini) {
    return `<article class="mini-match"><span class="sport-badge ${match.sport.toLowerCase()}">${match.emoji}</span><div class="mini-match-copy"><strong>${match.sport} · ${match.time}</strong><span>${match.location} · ${match.current}/${match.total} players</span></div><button class="mini-join" data-join-match="${match.id}" ${joined || full ? "disabled" : ""}>${joined ? "Joined" : full ? "Full" : "Join"}</button></article>`;
  }
  return `<article class="match-card" data-sport="${match.sport}">
    <div class="match-top"><span class="sport-card-icon">${match.emoji}</span><span class="time-badge">${match.time}</span></div>
    <h3>${match.sport} match</h3><p>${match.detail}</p>
    <div class="match-details"><span>⌖ <b>${match.location}</b></span><span>♟ <b>${match.current}/${match.total} players</b></span></div>
    <div class="match-card-bottom"><span class="player-count"><strong>${Math.max(match.total - match.current, 0)}</strong> place${match.total - match.current === 1 ? "" : "s"} left</span><button class="join-button ${joined ? "joined" : ""}" data-join-match="${match.id}" ${joined || full ? "disabled" : ""}>${joined ? "Joined ✓" : full ? "Match full" : "Join match"}</button></div>
  </article>`;
}

function renderSports() {
  const filteredMatches = state.selectedSport === "all" ? matches : matches.filter((match) => match.sport === state.selectedSport);
  $("#sports-list").innerHTML = filteredMatches.map((match) => matchMarkup(match)).join("") || '<div class="empty-state"><span>◉</span>No matches found for this sport yet.</div>';
  $("#home-sports-list").innerHTML = matches.slice(0, 3).map((match) => matchMarkup(match, true)).join("");
}

function visualClass(category) {
  return category.toLowerCase();
}

function itemMarkup(item) {
  const claimed = item.status === "Claimed";
  return `<article class="item-card">
    <div class="item-visual ${visualClass(item.category)}"><span class="item-symbol">${item.icon}</span></div>
    <div class="item-card-body"><span class="item-status ${claimed ? "claimed" : ""}">${item.status}</span><h3 title="${item.title}">${item.title}</h3><div class="item-meta"><span>⌖ ${item.location}</span><span>◷ ${item.date}</span></div><div class="item-card-footer"><span>${item.category}</span>${claimed ? "<span>Resolved</span>" : `<button class="claim-link" data-claim-item="${item.id}">${item.type === "found" ? "Claim item" : "I found this"}</button>`}</div></div>
  </article>`;
}

function renderItems() {
  const countFor = (type) => items.filter((item) => item.type === type).length;
  $("#lost-count").textContent = countFor("lost");
  $("#found-count").textContent = countFor("found");
  const filtered = items.filter((item) => item.type === state.selectedItemTab)
    .filter((item) => state.selectedCategory === "All" || item.category === state.selectedCategory)
    .filter((item) => `${item.title} ${item.location} ${item.category}`.toLowerCase().includes(state.searchTerm.toLowerCase()));
  $("#items-list").innerHTML = filtered.length ? filtered.map(itemMarkup).join("") : '<div class="empty-state"><span>⌕</span>No items match your search. Try another category.</div>';
}

function setActiveTab(tab) {
  state.activeTab = tab;
  $$("[data-view]").forEach((view) => view.classList.toggle("active", view.dataset.view === tab));
  $$('[data-tab]').forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setModal(modal, open) {
  modal.classList.toggle("open", open);
  modal.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  if (open) window.setTimeout(() => $("input, select, textarea", modal)?.focus(), 50);
}

function applyForTask(id) {
  const task = volunteerTasks.find((item) => item.id === Number(id));
  if (!task || state.appliedTasks.has(task.id)) return;
  state.appliedTasks.add(task.id);
  updatePoints(task.points);
  renderVolunteer();
  showToast("Application confirmed", `You earned +${task.points} points for ${task.title}.`);
}

function joinMatch(id) {
  const match = matches.find((item) => item.id === Number(id));
  if (!match || state.joinedMatches.has(match.id) || match.current >= match.total) return;
  state.joinedMatches.add(match.id);
  match.current += 1;
  renderSports();
  showToast("Spot reserved", `You joined the ${match.sport.toLowerCase()} match at ${match.location}.`);
}

function setupInteractions() {
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (tab) { event.preventDefault(); setActiveTab(tab.dataset.tab); return; }
    const apply = event.target.closest("[data-apply-task]");
    if (apply) { applyForTask(apply.dataset.applyTask); return; }
    const join = event.target.closest("[data-join-match]");
    if (join) { joinMatch(join.dataset.joinMatch); return; }
    const itemTab = event.target.closest("[data-item-tab]");
    if (itemTab) {
      state.selectedItemTab = itemTab.dataset.itemTab;
      $$("[data-item-tab]").forEach((button) => { const active = button === itemTab; button.classList.toggle("active", active); button.setAttribute("aria-selected", String(active)); });
      renderItems(); return;
    }
    const category = event.target.closest("[data-category]");
    if (category) { state.selectedCategory = category.dataset.category; $$("[data-category]").forEach((button) => button.classList.toggle("active", button === category)); renderItems(); return; }
    const sport = event.target.closest("[data-sport]");
    if (sport) { state.selectedSport = sport.dataset.sport; $$("[data-sport]").forEach((button) => button.classList.toggle("active", button === sport)); renderSports(); return; }
    const claim = event.target.closest("[data-claim-item]");
    if (claim) {
      const item = items.find((entry) => entry.id === Number(claim.dataset.claimItem));
      if (!item) return;
      item.status = "Claimed"; renderItems(); showToast("Request sent", `The bureau has been notified about ${item.title}.`); return;
    }
  });

  $("#availability-switch").addEventListener("change", (event) => {
    state.availability = event.target.checked;
    $("#availability-title").textContent = state.availability ? "You are ready to help!" : "Ready to make a difference?";
    $("#availability-note").textContent = state.availability ? "Organizers can now invite you to suitable requests." : "Turn this on to let organizers know you can help.";
    showToast(state.availability ? "You are available" : "Status updated", state.availability ? "Volunteer organizers can see your availability." : "Your availability has been turned off.");
  });

  $("#item-search").addEventListener("input", (event) => { state.searchTerm = event.target.value; renderItems(); });

  const itemModal = $("#item-modal");
  const matchModal = $("#match-modal");
  $("#report-item-button").addEventListener("click", () => setModal(itemModal, true));
  $("#close-modal").addEventListener("click", () => setModal(itemModal, false));
  $("#create-match-button").addEventListener("click", () => setModal(matchModal, true));
  $("[data-close-match]").addEventListener("click", () => setModal(matchModal, false));
  [itemModal, matchModal].forEach((modal) => modal.addEventListener("click", (event) => { if (event.target === modal) setModal(modal, false); }));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { setModal(itemModal, false); setModal(matchModal, false); } });

  $("#report-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = form.get("reportType");
    const category = form.get("category");
    const icons = { Electronics: "🎧", Clothing: "🧥", Supplies: "✏️", Books: "📚" };
    items.unshift({ id: Date.now(), type, title: form.get("title"), category, location: form.get("location"), date: "Just now", status: "Active", icon: icons[category] });
    state.selectedItemTab = type;
    $$("[data-item-tab]").forEach((button) => { const active = button.dataset.itemTab === type; button.classList.toggle("active", active); button.setAttribute("aria-selected", String(active)); });
    renderItems(); event.currentTarget.reset(); setModal(itemModal, false); showToast("Item report submitted", "Your report is now visible in the BIL Bureau.");
  });

  $("#match-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sport = form.get("sport");
    const icons = { Football: "⚽", Basketball: "🏀", Volleyball: "🏐", Chess: "♟" };
    const players = Number(form.get("players"));
    matches.unshift({ id: Date.now(), sport, emoji: icons[sport], time: `Today · ${form.get("time")}`, location: form.get("location"), current: 1, total: players + 1, detail: `Looking for ${players} player${players === 1 ? "" : "s"} to join this new ${sport.toLowerCase()} game.` });
    state.selectedSport = "all"; $$("[data-sport]").forEach((button) => button.classList.toggle("active", button.dataset.sport === "all"));
    renderSports(); event.currentTarget.reset(); setModal(matchModal, false); showToast("Match posted", "Your classmates can now reserve their spots.");
  });
}

function initialize() {
  renderVolunteer();
  renderSports();
  renderItems();
  setupInteractions();
}

initialize();
