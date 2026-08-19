/*
 * Storyboard panel renderer.
 *
 * This is NOT the production plugin. It reproduces the redesigned panel markup
 * (extension/src/index.tsx) as static fixtures so the whole flow can be viewed
 * outside Webflow. Class names and structure mirror the real component so the
 * production styles.css renders each screen faithfully.
 */

const HOST = "domestika-2026.webflow.io";
const SITE = "Domestika 2026";

const STATE_COLOR = {
  Published: "#63D489",
  Draft: "#F3C831",
  Archived: "#757575",
  Unpublished: "#B89EFF",
};

// Tabler: calendar
const appIcon = (size) => `
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M4 11h16" />
  </svg>`;

// Tabler: chevron-left
const backIcon = () => `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6l6 6" />
  </svg>`;

// Tabler: dots
const dotsIcon = () => `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>`;

const brixMark = () => `
  <svg class="brix-mark" width="14" height="14" viewBox="0 0 522 533" fill="none" aria-hidden="true">
    <circle cx="448.478" cy="73.566" r="73.6" fill="#FF2D33" />
    <circle cx="448.478" cy="266.582" r="73.6" fill="#D53D5C" />
    <circle cx="448.478" cy="459.593" r="73.6" fill="#815EAD" />
    <circle cx="261.052" cy="266.582" r="73.6" fill="#AB4D85" />
    <circle cx="261.052" cy="459.591" r="73.6" fill="#576ED6" />
    <circle cx="73.605" cy="459.593" r="73.6" fill="#2D7EFF" />
  </svg>`;

const aboutBlock = () => `
  <section class="about">
    <div class="about-head">
      <span class="app-tile" aria-hidden="true">${appIcon(16)}</span>
      <div class="about-copy"><strong>ScheduleFlow</strong><span>Version 1.0</span></div>
      <span class="attr-by">${brixMark()}<strong>BRIX Agency</strong></span>
    </div>
    <p class="about-note">ScheduleFlow was built by the team at BRIX Agency. Need a hand with your Webflow site? <a href="https://brixtemplates.com" target="_blank" rel="noreferrer">Contact us</a>.</p>
  </section>`;

const stateDot = (color) => `<span class="state-dot" aria-hidden="true" style="background:${color}"></span>`;

function statusRow(color, label) {
  return `<div class="status-row">${stateDot(color)}<span style="color:${color};font-size:11.5px;font-weight:600">${label}</span></div>`;
}

function job({ title, when, color, label, detail, action, border }) {
  return `
    <article class="job"${border ? ` style="border-color:${border}"` : ""}>
      <div class="job-head"><strong>${title}</strong><span>${when}</span></div>
      ${statusRow(color, label)}
      ${detail ? `<p class="muted">${detail}</p>` : ""}
      ${action ? `<button class="link" type="button">${action}</button>` : ""}
    </article>`;
}

function cmsRow(name, state, on) {
  return `
    <button type="button" class="cms-row${on ? " selected" : ""}" data-toggle>
      <span class="box">${on ? "✓" : ""}</span>
      <em>${name}</em>
      <span class="item-state">${stateDot(STATE_COLOR[state])}<span class="item-state-label" style="color:${STATE_COLOR[state]}">${state}</span></span>
    </button>`;
}

const header = ({ title, sub, dotOk = false, back = null, tile = true, accountGo = "account" }) => `
  <header class="header">
    ${back
      ? `<button class="icon-btn back" type="button" aria-label="Back" data-go="${back}">${backIcon()}</button>`
      : tile
        ? `<span class="app-glyph" aria-hidden="true">${appIcon(20)}</span>`
        : ""}
    <div class="header-copy">
      <h1>${title}</h1>
      <div class="header-sub"><span class="dot${dotOk ? " ok" : ""}"></span><span>${sub}</span></div>
    </div>
    <button class="icon-btn more" type="button" aria-label="Account" data-go="${accountGo}">${dotsIcon()}</button>
  </header>`;

const footer = ({ primary, primaryGo, primaryDisabled = false, secondary = null, secondaryGo }) => `
  <footer class="footer">
    <div class="footer-actions">
      <button class="primary"${primaryDisabled ? " disabled" : ""}${primaryGo ? ` data-go="${primaryGo}"` : ""}>${primary}</button>
      ${secondary ? `<button class="secondary" type="button"${secondaryGo ? ` data-go="${secondaryGo}"` : ""}>${secondary}</button>` : ""}
    </div>
  </footer>`;

const app = ({ head, body, foot }) => `
  <div class="app">
    ${header(head)}
    <div class="body-shell"><div class="body">${body}</div></div>
    ${footer(foot)}
  </div>`;

const STATES = {
  activity_empty: () => app({
    head: { title: SITE, sub: HOST, dotOk: true },
    body: `<div class="empty"><h2>Nothing scheduled</h2><p>Pick a moment for your next publish. It runs even with Webflow closed.</p></div>`,
    foot: { primary: "Schedule a publish", primaryGo: "what_site" },
  }),

  activity_jobs: () => app({
    head: { title: SITE, sub: HOST, dotOk: true },
    body: [
      job({ title: "Whole site", when: "Tonight 21:00", color: "#F3C831", label: "Waiting", action: "Cancel" }),
      job({ title: "Republish · 3 items", when: "Yesterday 18:00", color: "#63D489", label: "Live and verified" }),
    ].join(""),
    foot: { primary: "Schedule a publish", primaryGo: "what_site" },
  }),

  activity_statuses: () => app({
    head: { title: SITE, sub: HOST, dotOk: true },
    body: [
      job({ title: "Whole site", when: "Today 09:12", color: "#8AC2FF", label: "Checking the site" }),
      job({ title: "Publish · 1 item", when: "Today 08:40", color: "#EBA267", label: "Not confirmed yet", detail: "It ran, but reading the site back did not confirm it.", action: "Check now", border: "#DF640C" }),
      job({ title: "Whole site", when: "Today 07:30", color: "#FF8A8A", label: "Webflow said no", detail: "Webflow returned an error, so nothing was published.", action: "Schedule again", border: "#E42F3A" }),
    ].join(""),
    foot: { primary: "Schedule a publish", primaryGo: "what_site" },
  }),

  what_site: () => app({
    head: { title: "What to publish", sub: "Step 1 of 3", dotOk: true, back: "activity_jobs", tile: false },
    body: [
      `<button type="button" class="choice selected" data-go="what_site"><strong>Whole site</strong><span>Publishes every staged change to ${HOST}</span></button>`,
      `<button type="button" class="choice" data-go="what_cms"><strong>CMS items</strong></button>`,
    ].join(""),
    foot: { primary: "Choose when", primaryGo: "when" },
  }),

  what_cms: () => app({
    head: { title: "What to publish", sub: "Step 1 of 3", dotOk: true, back: "activity_jobs", tile: false },
    body: [
      `<button type="button" class="choice" data-go="what_site"><strong>Whole site</strong></button>`,
      `<button type="button" class="choice selected" data-go="what_cms"><strong>CMS items</strong><span>Publish, republish, draft or archive chosen items</span></button>`,
      `<div class="split">
        <select aria-label="Collection"><option>Blog Posts</option></select>
        <select aria-label="CMS action"><option>Publish</option></select>
      </div>`,
      `<input type="search" placeholder="Filter items" aria-label="Filter items" />`,
      cmsRow("Designing for accessibility", "Published", true),
      cmsRow("The 2026 color report", "Draft", true),
      cmsRow("Old announcement", "Archived", false),
      cmsRow("Untitled draft", "Unpublished", false),
    ].join(""),
    foot: { primary: "Choose when", primaryGo: "when" },
  }),

  when: () => app({
    head: { title: "When", sub: "Step 2 of 3", dotOk: true, back: "what_site", tile: false },
    body: [
      `<button type="button" class="preset selected" data-select="preset"><div>Tonight</div><span>21:00</span></button>`,
      `<button type="button" class="preset" data-select="preset"><div>Tomorrow morning</div><span>09:00</span></button>`,
      `<button type="button" class="preset" data-go="when_custom"><div>Pick a moment</div></button>`,
      `<div class="rule"></div>`,
      `<div class="row-between"><span>Time zone</span>
        <select class="zone" aria-label="Time zone"><option>Bogotá · GMT-5</option></select>
      </div>`,
    ].join(""),
    foot: { primary: "Review", primaryGo: "confirm" },
  }),

  when_custom: () => app({
    head: { title: "When", sub: "Step 2 of 3", dotOk: true, back: "what_site", tile: false },
    body: [
      `<button type="button" class="preset" data-go="when"><div>Tonight</div><span>21:00</span></button>`,
      `<button type="button" class="preset" data-go="when"><div>Tomorrow morning</div><span>09:00</span></button>`,
      `<button type="button" class="preset selected"><div>Pick a moment</div></button>`,
      `<div class="split"><input type="date" value="2026-08-22" aria-label="Date" /><input class="time" type="time" value="21:00" aria-label="Time" /></div>`,
      `<div class="rule"></div>`,
      `<div class="row-between"><span>Repeat</span><div class="chips">
        <button type="button" class="chip" data-select="repeat">Once</button>
        <button type="button" class="chip selected" data-select="repeat">Weekly</button>
        <button type="button" class="chip" data-select="repeat">Daily</button>
        <button type="button" class="chip" data-select="repeat">Monthly</button>
      </div></div>`,
      `<p class="quiet">The next run appears only after this one is verified.</p>`,
      `<div class="row-between"><span>Time zone</span>
        <select class="zone" aria-label="Time zone"><option>Bogotá · GMT-5</option></select>
      </div>`,
    ].join(""),
    foot: { primary: "Review", primaryGo: "confirm" },
  }),

  confirm: () => app({
    head: { title: "Review", sub: "Step 3 of 3", dotOk: true, back: "when", tile: false },
    body: [
      `<dl class="kv">
        <div class="kv-row"><dt>What</dt><dd>Whole site · ${HOST}</dd><button type="button" data-go="what_site">Edit</button></div>
        <div class="kv-row"><dt>When</dt><dd>Tonight 21:00 · Bogotá</dd><button type="button" data-go="when">Edit</button></div>
      </dl>`,
      `<p class="caution">Everything staged on the site goes live, not only your changes.</p>`,
      `<div class="expiry"><div class="expiry-track"><div class="expiry-fill" style="width:78%"></div></div><span>3:54</span></div>`,
      `<p class="quiet">Checked against Webflow just now. After it expires, we check again.</p>`,
    ].join(""),
    foot: { primary: "Schedule it", primaryGo: "done", secondary: "Change something", secondaryGo: "when" },
  }),

  done: () => app({
    head: { title: "Scheduled", sub: "Nothing to do now", dotOk: true },
    body: job({ title: "Whole site · Tonight 21:00", when: "", color: "#F3C831", label: "Waiting", detail: "Close Webflow if you want. We publish, then read the site back before calling it done." }),
    foot: { primary: "Done", primaryGo: "activity_jobs", secondary: "Schedule another", secondaryGo: "what_site" },
  }),

  account: () => app({
    head: { title: "Account", sub: "Owner · free", dotOk: true, back: "activity_jobs", tile: false, accountGo: "activity_jobs" },
    body: [
      `<dl class="kv">
        <div class="kv-row"><dt>Site</dt><dd>${HOST}</dd></div>
        <div class="kv-row"><dt>Role</dt><dd>Owner</dd></div>
        <div class="kv-row"><dt>Plan</dt><dd>Free</dd></div>
      </dl>`,
      `<button class="ghost" type="button">Log out</button>`,
      `<button class="danger-text" type="button" data-go="disconnect">Disconnect this site</button>`,
      aboutBlock(),
    ].join(""),
    foot: { primary: "Back to schedules", primaryGo: "activity_jobs" },
  }),

  disconnect: () => app({
    head: { title: "Account", sub: "Owner · free", dotOk: true, back: "activity_jobs", tile: false, accountGo: "activity_jobs" },
    body: [
      `<dl class="kv">
        <div class="kv-row"><dt>Site</dt><dd>${HOST}</dd></div>
        <div class="kv-row"><dt>Role</dt><dd>Owner</dd></div>
        <div class="kv-row"><dt>Plan</dt><dd>Free</dd></div>
      </dl>`,
      `<button class="ghost" type="button">Log out</button>`,
      `<div class="confirm-box">
        <p>Revokes Webflow and cancels 2 waiting schedules. Already published work stays published.</p>
        <button class="destructive" type="button" data-go="connect">Disconnect</button>
        <button class="link" type="button" style="align-self:center" data-go="account">Keep it connected</button>
      </div>`,
      aboutBlock(),
    ].join(""),
    foot: { primary: "Back to schedules", primaryGo: "activity_jobs" },
  }),

  connect: () => app({
    head: { title: SITE, sub: HOST },
    body: [
      `<div class="card" style="border-color:#007DF0">
        <p class="block-title" style="color:#8AC2FF">Connect this site</p>
        <p class="muted">Authorize ${HOST} once. The panel never stores your token.</p>
      </div>`,
      `<p class="quiet">Nothing was scheduled and nothing changed in Webflow.</p>`,
    ].join(""),
    foot: { primary: "Connect", primaryGo: "activity_empty" },
  }),

  block_mode: () => app({
    head: { title: SITE, sub: HOST },
    body: [
      `<div class="card" style="border-color:#D7A220">
        <p class="block-title" style="color:#F3C831">Design or Build only</p>
        <p class="muted">Scheduling is off in Preview and Comment. Switch modes and reopen the panel.</p>
      </div>`,
      `<p class="quiet">Nothing was scheduled and nothing changed in Webflow.</p>`,
    ].join(""),
    foot: { primary: "Check again", primaryGo: "activity_jobs" },
  }),

  block_othersite: () => app({
    head: { title: SITE, sub: HOST },
    body: [
      `<div class="card" style="border-color:#E42F3A">
        <p class="block-title" style="color:#FF8A8A">Another site is authorized</p>
        <p class="muted">This connection belongs to another site, not the site open here.</p>
      </div>`,
      `<p class="quiet">Nothing was scheduled and nothing changed in Webflow.</p>`,
    ].join(""),
    foot: { primary: "Authorize this site", primaryGo: "connect" },
  }),

  block_domain: () => app({
    head: { title: SITE, sub: HOST },
    body: [
      `<div class="card" style="border-color:#DF640C">
        <p class="block-title" style="color:#EBA267">Custom domain, not yet</p>
        <p class="muted">This beta only publishes to .webflow.io addresses.</p>
      </div>`,
      `<p class="quiet">Nothing was scheduled and nothing changed in Webflow.</p>`,
    ].join(""),
    foot: { primary: "Back", primaryGo: "activity_jobs" },
  }),

  block_backend: () => app({
    head: { title: SITE, sub: HOST },
    body: [
      `<div class="card" style="border-color:#E42F3A">
        <p class="block-title" style="color:#FF8A8A">We could not reach our backend</p>
        <p class="muted">The check before saving failed, so no schedule exists.</p>
      </div>`,
      `<p class="quiet">Nothing was scheduled and nothing changed in Webflow.</p>`,
    ].join(""),
    foot: { primary: "Try again", primaryGo: "activity_jobs" },
  }),
};

const root = document.getElementById("root");

function bindScrollFade() {
  const shell = root.querySelector(".body-shell");
  const bodyEl = root.querySelector(".body");
  if (!shell || !bodyEl) return;
  const update = () => {
    shell.classList.toggle("has-scroll-below", bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight > 1);
  };
  update();
  bodyEl.addEventListener("scroll", update, { passive: true });
  const resize = new ResizeObserver(update);
  resize.observe(bodyEl);
  Array.from(bodyEl.children).forEach((child) => resize.observe(child));
}

function go(state) {
  const render = STATES[state] || STATES.activity_empty;
  root.innerHTML = render();
  bindScrollFade();
}

root.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-go]");
  if (nav) {
    go(nav.getAttribute("data-go"));
    return;
  }
  const select = event.target.closest("[data-select]");
  if (select) {
    const group = select.getAttribute("data-select");
    root.querySelectorAll(`[data-select="${group}"]`).forEach((el) => el.classList.remove("selected"));
    select.classList.add("selected");
    return;
  }
  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    const on = toggle.classList.toggle("selected");
    const box = toggle.querySelector(".box");
    if (box) box.textContent = on ? "✓" : "";
  }
});

const params = new URLSearchParams(window.location.search);
go(params.get("state") || "activity_empty");
