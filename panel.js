/* Static storyboard only: fixture data, no network calls and no Webflow writes. */
(function () {
  const SITE = "Articles 3 @BRIX Templates Bla bla bla";
  const HOST = "articles-3.webflow.io";
  const initial = new URLSearchParams(location.search).get("state") || "page";
  const model = {
    screen: initial,
    previous: "page",
    selectedPage: initial.includes("review_page") ? "Styleguide" : "Home",
    cmsSelected: new Set(initial === "review_cms" ? ["cms-2", "cms-3"] : []),
    repeat: initial === "when_repeat",
    repeatRule: "Weekly",
    pagesOpen: true,
    cmsPagesOpen: true,
    utilityPagesOpen: true,
    pageCapability: initial === "page_restricted" ? "unavailable" : "available",
    menu: false,
  };

  const pages = ["Home", "Styleguide", "Page 1", "Page 2", "Page 3", "Page 4", "Page 5", "Page 6", "Page 7", "Page 8"];
  const cmsItems = [
    ["cms-1", "Discover the power of the Webflow CMS and Collections", "Draft", "draft"],
    ["cms-2", "Discover the power of the Webflow CMS and Collections", "Published", "published"],
    ["cms-3", "Discover the power of the Webflow CMS and Collections", "Queued to publish", "queued"],
    ["cms-4", "Discover the power of the Webflow CMS and Collections", "Archived", "archived"],
    ["cms-5", "Discover the power of the Webflow CMS and Collections", "Published", "published"],
    ["cms-6", "Discover the power of the Webflow CMS and Collections", "Published", "published"],
    ["cms-7", "Discover the power of the Webflow CMS and Collections", "Published", "published"],
    ["cms-8", "Discover the power of the Webflow CMS and Collections", "Published", "published"],
  ];

  const icon = (name, size = 16) => {
    const suppliedAssets = {
      app: "app-icon.svg",
      page: "page.svg",
      cms: "cms.svg",
      cmsTemplate: "cms-template.svg",
      site: "full-site.svg",
      dots: "dots-menu.svg",
      search: "search.svg",
      clock: "clock.svg",
      calendar: "calendar.svg",
      collapse: "minimize.svg",
      close: "close.svg",
      arrow: "arrow.svg",
      empty: "empty-container.svg",
      success: "success-container.svg",
      connect: "connect-webflow-site.svg",
      connectionLost: "connection-lost.svg",
    };
    if (suppliedAssets[name]) {
      return `<img class="asset-icon" src="./assets/${suppliedAssets[name]}" width="${size}" height="${size}" alt="" aria-hidden="true" />`;
    }
    const paths = {
      back: '<path d="m15 6-6 6 6 6"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      collapse: '<path d="m8 10 4 4 4-4"/>',
      home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      warning: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v4M12 17h.01"/>',
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.page}</svg>`;
  };

  function go(screen, previous) {
    model.previous = previous || model.screen;
    model.screen = screen;
    model.menu = false;
    render();
  }

  function topbar() {
    return `<div class="topbar">
      <span class="app-tile">${icon("app", 17)}</span>
      <span class="brand">BRIX Publish Scheduler</span>
      <button class="icon-button" type="button" aria-label="Collapse">${icon("collapse")}</button>
      <button class="icon-button" type="button" aria-label="Close">${icon("close")}</button>
    </div>`;
  }

  function sitebar(back, connectionState = "connected", showMenu = true) {
    const connection = {
      connected: ["Connected", ""],
      disconnected: ["Not connected", " disconnected"],
      lost: ["Connection lost", " lost"],
    }[connectionState] || ["Connected", ""];
    return `<div class="sitebar">
      ${back ? `<button class="icon-button" type="button" aria-label="Back" data-go="${back}">${icon("back")}</button>` : ""}
      <span class="site-name">${SITE}</span>
      <span class="connection${connection[1]}"><span class="dot"></span>${connection[0]}</span>
      ${showMenu ? `<button class="icon-button menu" type="button" aria-label="Open menu" data-menu>${icon("dots", 18)}</button>` : ""}
    </div>`;
  }

  function menu() {
    if (!model.menu) return "";
    return `<div class="menu-popover" role="menu">
      <button type="button" role="menuitem" data-go="activity">Scheduled activity</button>
      <button type="button" role="menuitem" data-go="account">Account</button>
    </div>`;
  }

  function tabs(active) {
    return `<nav class="tabs" aria-label="Publish target">
      <button class="tab${active === "site" ? " active" : ""}" type="button" data-go="fullsite">${icon("site", 20)}Full site</button>
      <button class="tab${active === "cms" ? " active" : ""}" type="button" data-go="cms">${icon("cms", 20)}CMS</button>
      <button class="tab${active === "page" ? " active" : ""}" type="button" data-go="page">${icon("page", 20)}Page</button>
    </nav>`;
  }

  function footer(label, next, disabled = false, secondary, disabledReason = "") {
    const primary = `<button class="primary" type="button" data-go="${next}"${disabled ? " disabled" : ""}>${label}</button>`;
    return `<footer class="footer">
      ${secondary ? `<button class="secondary" type="button" data-go="${secondary.go}">${secondary.label}</button>` : ""}
      ${disabledReason ? `<span class="action-with-tooltip" tabindex="0">${primary}<span class="action-tooltip" role="tooltip">${disabledReason}</span></span>` : primary}
    </footer>`;
  }

  function search(placeholder) {
    return `<div class="search">${icon("search")}<input type="search" aria-label="${placeholder}" placeholder="${placeholder}" /></div>`;
  }

  function pageRow(name, selected, kind = "page") {
    return `<button class="list-row${selected ? " selected" : ""}" type="button" data-page="${name}">
      <span class="row-icon">${icon(kind === "home" ? "home" : "page", 14)}</span><span class="name">${name}</span>
    </button>`;
  }

  function pageScreen() {
    return `${topbar()}${sitebar()}${tabs("page")}
      <main class="content">
        <div class="pad stack compact">
          ${search("Search pages")}
          <div class="list page-list">
            <button class="list-section" type="button" data-section="pages" aria-expanded="${model.pagesOpen}"><span>Pages</span><span>${model.pagesOpen ? "⌄" : "›"}</span></button>
            ${model.pagesOpen ? pages.map((name, index) => pageRow(name, model.selectedPage === name, index === 0 ? "home" : "page")).join("") : ""}
            <button class="list-section" type="button" data-section="cms" aria-expanded="${model.cmsPagesOpen}"><span>CMS collection pages</span><span>${model.cmsPagesOpen ? "⌄" : "›"}</span></button>
            ${model.cmsPagesOpen ? `
              <button class="list-row template" type="button">${icon("cmsTemplate", 16)}<span class="name">ScheduleFlow CMS Tests Template</span></button>
              <button class="list-row template" type="button">${icon("cmsTemplate", 16)}<span class="name">Tests Template</span></button>` : ""}
            <button class="list-section" type="button" data-section="utility" aria-expanded="${model.utilityPagesOpen}"><span>Utility pages</span><span>${model.utilityPagesOpen ? "⌄" : "›"}</span></button>
            ${model.utilityPagesOpen ? `
              <button class="list-row" type="button">${icon("page", 14)}<span class="name">Password</span></button>
              <button class="list-row" type="button">${icon("page", 14)}<span class="name">404</span></button>` : ""}
          </div>
        </div>
      </main>${footer(
        "Schedule a page",
        "when_page",
        model.pageCapability === "unavailable",
        undefined,
        model.pageCapability === "unavailable" ? "Your Webflow plan or site permissions don't allow individual page publishing." : "",
      )}${menu()}`;
  }

  function cmsRow([id, name, status, tone]) {
    const checked = model.cmsSelected.has(id);
    const statusIcon = tone === "published" ? '<span class="dot"></span>' : '<span class="status-glyph"></span>';
    return `<button class="list-row" type="button" data-cms="${id}">
      <span class="checkbox${checked ? " checked" : ""}" aria-hidden="true">${checked ? '<span class="checkbox-icon"></span>' : ""}</span>
      <span class="name">${name}</span>
      <span class="item-status ${tone}">${statusIcon}<span>${status}</span></span>
    </button>`;
  }

  function cmsScreen() {
    return `${topbar()}${sitebar()}${tabs("cms")}
      <main class="content">
        <div class="pad stack compact">
          <div class="field-grid">
            <label class="field"><span>CMS Collection</span><select><option>Blog Categories</option><option>Blog Posts</option></select></label>
            <label class="field"><span>Action</span><select><option>Publish</option><option>Republish</option><option>Move to Draft</option><option>Archive</option></select></label>
          </div>
          ${search("Search items")}
          <div class="list cms-list">${cmsItems.map(cmsRow).join("")}</div>
        </div>
      </main>${footer("Review", "review_cms")}${menu()}`;
  }

  function fullSiteScreen() {
    return `${topbar()}${sitebar()}${tabs("site")}
      <main class="content fullsite-content">
        <header class="destination-title"><h1>Choose publish destination</h1></header>
        <section class="destination-section" aria-labelledby="staging-label">
          <h2 id="staging-label">Staging</h2>
          <div class="destination-row">
            <span class="checkbox checked" role="checkbox" aria-checked="true"><span class="checkbox-icon"></span></span>
            <span class="destination-details">
              <span class="destination-domain">${HOST}</span>
              <span class="destination-arrow">${icon("arrow", 16)}</span>
            </span>
          </div>
        </section>
        <section class="destination-section" aria-labelledby="production-label">
          <h2 id="production-label">Production</h2>
          <div class="destination-row destination-disabled" aria-disabled="true" title="Custom domains are not available in this beta.">
            <span class="checkbox" aria-hidden="true"></span>
            <span class="destination-domain">Custom domain</span>
          </div>
        </section>
      </main>${footer("Schedule full site", "when_site")}${menu()}`;
  }

  function whenScreen(origin) {
    const activeTab = origin === "cms" ? "cms" : origin === "site" ? "site" : "page";
    const review = origin === "cms" ? "review_cms" : origin === "site" ? "review_site" : "review_page";
    return `${topbar()}${sitebar()}${tabs(activeTab)}
      <main class="content"><div class="pad stack">
        <div class="field-grid">
          <label class="time-card"><span>Tonight</span><span class="input-icon preset-time" data-picker><input type="time" aria-label="Tonight time" required />${icon("clock")}<span class="picker-placeholder">9:00 PM</span></span></label>
          <label class="time-card"><span>Tomorrow morning</span><span class="input-icon preset-time" data-picker><input type="time" aria-label="Tomorrow morning time" required />${icon("clock")}<span class="picker-placeholder">9:00 AM</span></span></label>
        </div>
        <label class="field"><span>Pick a moment</span>
          <span class="split-date">
            <span class="input-icon leading" data-picker>${icon("calendar")}<input type="date" aria-label="Date" required /><span class="picker-placeholder">MM/DD/YYYY</span></span>
            <span class="input-icon leading" data-picker>${icon("clock")}<input type="time" aria-label="Time" required /><span class="picker-placeholder">HH:MM AM</span></span>
          </span>
        </label>
        <label class="field"><span>Time zone</span><select aria-label="Time zone"><option>Bogota (GMT-5:00)</option><option>Madrid (GMT+2:00)</option><option>New York (GMT-4:00)</option></select></label>
        <div class="toggle-row"><button class="switch${model.repeat ? " on" : ""}" type="button" aria-label="Repeat" aria-pressed="${model.repeat}" data-repeat-toggle></button><span>Repeat</span></div>
        ${model.repeat ? `<div class="repeat-options">
          ${["Daily", "Weekly", "Monthly"].map((rule) => `<button class="repeat-option${model.repeatRule === rule ? " active" : ""}" type="button" data-rule="${rule}">${rule}</button>`).join("")}
        </div>` : ""}
      </div></main>${footer("Review", review)}${menu()}`;
  }

  function reviewScreen(kind) {
    const isCms = kind === "cms";
    const isSite = kind === "site";
    const back = isCms ? "cms" : isSite ? "when_site" : "when_page";
    const activeTab = isCms ? "cms" : isSite ? "site" : "page";
    const target = isCms ? `${model.cmsSelected.size} items · Blog Categories` : isSite ? "Whole site" : `${model.selectedPage} · /${model.selectedPage.toLowerCase()}`;
    const action = isCms ? "Publish CMS items" : isSite ? "Publish full site" : "Publish one page";
    return `${topbar()}${sitebar()}${tabs(activeTab)}
      <main class="content review-screen">
        <header class="destination-title"><h1>Check before scheduling</h1></header>
        <div class="pad stack review-content"><div class="review-card">
          <dl class="review-row"><dt>What</dt><dd>${target}</dd></dl>
          <dl class="review-row"><dt>Action</dt><dd>${action}</dd></dl>
          <dl class="review-row"><dt>When</dt><dd>Tomorrow, 9:00 AM</dd></dl>
          <dl class="review-row"><dt>Zone</dt><dd>Bogota (GMT-5:00)</dd></dl>
          <dl class="review-row"><dt>Repeat</dt><dd>${model.repeatRule}</dd></dl>
          <dl class="review-row"><dt>Destination</dt><dd>${HOST}</dd></dl>
        </div></div>
      </main>${footer("Schedule", "done", false, { label: "Edit", go: back })}${menu()}`;
  }

  function doneScreen() {
    return `${topbar()}${sitebar()}
      <main class="content activity-content">
        <div class="activity-empty-wrap">
          <div class="activity-empty-card success-card">
            ${icon("success", 64)}
            <h1>Schedule created</h1>
            <p>Your publish is scheduled for tomorrow at<br />9:00 AM in Bogota.</p>
          </div>
        </div>
      </main>${footer("View scheduled activity", "activity")}${menu()}`;
  }

  function activityScreen() {
    return `${topbar()}${sitebar()}
      <main class="content">
        <header class="destination-title"><h1>Scheduled activity</h1></header>
        <div class="pad stack">
          <article class="schedule-card">
            <div class="schedule-summary">
              <div class="schedule-target"><strong>Styleguide</strong></div>
              <p>Tomorrow, 9:00 AM</p>
            </div>
            <div class="schedule-actions">
              <button class="secondary compact-button" type="button" data-go="when_page">Reschedule</button>
              <button class="quiet-danger" type="button" data-go="cancel_schedule">Cancel</button>
            </div>
          </article>
        </div>
      </main>${footer("Schedule another", "fullsite")}${menu()}`;
  }

  function activityEmptyScreen() {
    return `${topbar()}${sitebar()}
      <main class="content activity-content">
        <div class="activity-empty-wrap">
          <div class="activity-empty-card">
            ${icon("empty", 64)}
            <h1>Nothing scheduled</h1>
            <p>Pick a moment for your next publish. It<br />runs even with Webflow closed.</p>
          </div>
        </div>
      </main>${footer("Schedule a publish", "fullsite")}${menu()}`;
  }

  function cancelScheduleScreen() {
    return `${topbar()}${sitebar()}
      <main class="content">
        <header class="destination-title"><h1>Cancel this schedule?</h1></header>
        <div class="pad stack">
          <div class="review-card">
            <dl class="review-row"><dt>What</dt><dd>Styleguide · /styleguide</dd></dl>
            <dl class="review-row"><dt>When</dt><dd>Tomorrow, 9:00 AM</dd></dl>
            <dl class="review-row"><dt>Destination</dt><dd>${HOST}</dd></dl>
          </div>
          <div class="notice warning">This cancels the waiting schedule only. It does not unpublish or change Webflow content.</div>
        </div>
      </main><footer class="footer">
        <button class="secondary" type="button" data-go="activity">Keep schedule</button>
        <button class="danger" type="button" data-go="activity_empty">Cancel schedule</button>
      </footer>${menu()}`;
  }

  function accountScreen(disconnect = false) {
    return `${topbar()}${sitebar("page")}
      <main class="content account-content">
        <header class="destination-title"><h1>Account</h1></header>
        <div class="account-about">
          <section class="account-product" aria-labelledby="about-title">
            <div class="account-product-card">
              <div class="account-product-art">${icon("connect", 64)}</div>
              <div class="account-product-copy">
                <strong id="about-title">BRIX Publish Scheduler</strong>
                <span>Version 1.0</span>
              </div>
            </div>
          </section>
          <section class="about-section">
            <span class="about-agency"><span class="brix-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><strong>BRIX Agency</strong></span>
            <p>BRIX Publish Scheduler was built by the team at BRIX Agency. Need a hand with your Webflow site? <a class="about-contact" href="https://brixtemplates.com/webflow-agency/" target="_blank" rel="noreferrer">Contact us</a>.</p>
          </section>
          ${disconnect ? `<div class="notice error account-disconnect-notice">Disconnecting revokes Webflow access and cancels all waiting schedules. Published work stays published.</div>` : ""}
          ${disconnect ? "" : `<div class="disconnect-action"><button class="text-button danger-link disconnect-link" type="button" data-go="disconnect">Disconnect this site</button></div>`}
        </div>
      </main>${disconnect ? footer("Disconnect", "connect", false, { label: "Keep connected", go: "account" }) : ""}${menu()}`;
  }

  function connectScreen() {
    return `${topbar()}${sitebar(undefined, "disconnected", false)}
      <main class="content activity-content">
        <div class="activity-empty-wrap">
          <div class="activity-empty-card connection-state-card">
            <div class="connection-state-art">${icon("connect", 64)}</div>
            <h1>Connect this Webflow site</h1>
            <p>Connect to start scheduling.</p>
          </div>
        </div>
      </main>${footer("Connect Webflow", "page")}`;
  }

  function connectionLostScreen() {
    return `${topbar()}${sitebar(undefined, "lost", false)}
      <main class="content activity-content">
        <div class="activity-empty-wrap">
          <div class="activity-empty-card connection-state-card">
            <div class="connection-state-art">${icon("connectionLost", 64)}</div>
            <h1>Connection lost</h1>
            <p>Reconnect to continue scheduling.</p>
          </div>
        </div>
      </main>${footer("Reconnect Webflow", "page")}`;
  }

  function restrictionScreen(type) {
    const copy = {
      plan: ["Single-page publishing unavailable", "This Webflow site plan does not include publishing one static page. Nothing else was published.", "Try again after changing plan", "page"],
      mode: ["Design or Build mode required", "Scheduling is unavailable in Preview or Comment mode. Switch modes and check again.", "Check again", "page"],
      offline: ["Backend unavailable", "The preflight check could not run, so no schedule was created and Webflow was not changed.", "Try again", "page"],
      mismatch: ["Another site is connected", "The authorization belongs to another Webflow site. Connect Articles 3 before scheduling here.", "Connect this site", "connect"],
    }[type] || ["Action unavailable", "Nothing was scheduled and nothing changed in Webflow.", "Back", "page"];
    return `${topbar()}${sitebar()}
      <main class="content"><div class="pad stack">
        <div class="notice error">${icon("warning", 18)}<strong>${copy[0]}</strong></div>
        <p class="body-copy">${copy[1]}</p>
      </div></main>${footer(copy[2], copy[3])}${menu()}`;
  }

  function screen() {
    switch (model.screen) {
      case "page": return pageScreen();
      case "page_restricted": return pageScreen();
      case "cms": return cmsScreen();
      case "fullsite": return fullSiteScreen();
      case "when_page": return whenScreen("page");
      case "when_cms": return whenScreen("cms");
      case "when_site": return whenScreen("site");
      case "when_repeat": return whenScreen("page");
      case "review_page": return reviewScreen("page");
      case "review_cms": return reviewScreen("cms");
      case "review_site": return reviewScreen("site");
      case "done": return doneScreen();
      case "activity": return activityScreen();
      case "activity_empty": return activityEmptyScreen();
      case "cancel_schedule": return cancelScheduleScreen();
      case "account": return accountScreen(false);
      case "disconnect": return accountScreen(true);
      case "connect": return connectScreen();
      case "connection_lost": return connectionLostScreen();
      case "restriction_plan": return restrictionScreen("plan");
      case "restriction_mode": return restrictionScreen("mode");
      case "restriction_offline": return restrictionScreen("offline");
      case "restriction_mismatch": return restrictionScreen("mismatch");
      default: return pageScreen();
    }
  }

  function render() {
    document.getElementById("root").innerHTML = `<div class="app-wrap"><div class="app">${screen()}<div class="scroll-fade" aria-hidden="true"></div></div></div>`;
    requestAnimationFrame(syncScrollFade);
  }

  function syncScrollFade() {
    const app = document.querySelector(".app");
    const content = document.querySelector(".content");
    if (!app || !content) return;
    const hasMoreBelow = content.scrollHeight - content.scrollTop - content.clientHeight > 1;
    app.classList.toggle("has-scroll-below", hasMoreBelow);
  }

  document.addEventListener("scroll", (event) => {
    if (event.target instanceof Element && event.target.classList.contains("content")) syncScrollFade();
  }, true);

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const menuButton = target.closest("[data-menu]");
    if (menuButton) { model.menu = !model.menu; render(); return; }
    const pageButton = target.closest("[data-page]");
    if (pageButton) { model.selectedPage = pageButton.getAttribute("data-page") || "Home"; render(); return; }
    const cmsButton = target.closest("[data-cms]");
    if (cmsButton) {
      const id = cmsButton.getAttribute("data-cms");
      if (id) model.cmsSelected.has(id) ? model.cmsSelected.delete(id) : model.cmsSelected.add(id);
      render();
      return;
    }
    const sectionButton = target.closest("[data-section]");
    if (sectionButton) {
      const section = sectionButton.getAttribute("data-section");
      if (section === "pages") model.pagesOpen = !model.pagesOpen;
      if (section === "cms") model.cmsPagesOpen = !model.cmsPagesOpen;
      if (section === "utility") model.utilityPagesOpen = !model.utilityPagesOpen;
      render();
      return;
    }
    const pickerField = target.closest("[data-picker]");
    if (pickerField) {
      const input = pickerField.querySelector('input[type="date"], input[type="time"]');
      if (input) {
        input.focus();
        input.dataset.pickerRequested = "true";
        if (typeof input.showPicker === "function") {
          try { input.showPicker(); } catch (_) { /* Native picker availability is browser-controlled. */ }
        }
      }
      return;
    }
    const rule = target.closest("[data-rule]");
    if (rule) { model.repeatRule = rule.getAttribute("data-rule") || "Weekly"; model.repeat = true; render(); return; }
    if (target.closest("[data-repeat-toggle]")) { model.repeat = !model.repeat; render(); return; }
    const goButton = target.closest("[data-go]");
    if (goButton && !(goButton instanceof HTMLButtonElement && goButton.disabled)) go(goButton.getAttribute("data-go") || "page");
  });

  render();
})();
