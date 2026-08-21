/* Local storyboard only. No network, secrets, or Webflow writes. */
(function () {
  const siteName = "Domestika 2026";
  const staging = "domestika-2026.webflow.io";
  const cmsActions = [
    { id: "cms_publish", label: "Publish" },
    { id: "cms_republish", label: "Republish" },
    { id: "cms_draft", label: "Move to Draft" },
    { id: "cms_archive", label: "Archive" },
  ];
  const repeatOptions = [
    { id: "none", label: "Once" },
    { id: "daily", label: "Every day" },
    { id: "weekly", label: "Every week" },
    { id: "monthly", label: "Every month" },
  ];
  const timezones = ["America/Bogota", "America/Mexico_City", "America/New_York", "Europe/Madrid", "UTC"];
  const collections = [
    { id: "tests", name: "Tests" },
    { id: "sf-tests", name: "ScheduleFlow CMS Tests" },
  ];
  const itemsByCollection = {
    tests: [
      { id: "i1", name: "The Future of Content Management Systems", isDraft: false, isArchived: false, lastPublished: "2026-08-18T12:00:00.000Z" },
      { id: "i2", name: "Security Tips for Content Management Systems", isDraft: false, isArchived: false, lastPublished: "2026-08-19T12:00:00.000Z" },
      { id: "i3", name: "Best Practices for Using a CMS", isDraft: true, isArchived: false, lastPublished: null },
      { id: "i5", name: "Editorial Workflow Notes", isDraft: false, isArchived: false, lastPublished: null },
      { id: "i6", name: "Migrating Legacy Content", isDraft: false, isArchived: true, lastPublished: "2026-07-12T12:00:00.000Z" },
    ],
    "sf-tests": [
      { id: "i4", name: "ScheduleFlow Draft Item", isDraft: true, isArchived: false, lastPublished: null },
    ],
  };

  const waiting = new Set(["scheduled"]);
  const checking = new Set(["enqueued", "executing", "queued_unverified"]);
  const statusLabels = {
    scheduled: "Waiting",
    enqueued: "Starting",
    executing: "Running",
    queued_unverified: "Checking live site",
    verified: "Published and verified",
    manual_verification_required: "Needs a live check",
    failed_before_write: "Not started",
    request_rejected: "Webflow rejected this",
    authorization_required: "Reconnect Webflow",
    ambiguous_result: "Unclear",
    cancelled: "Cancelled",
  };

  const state = {
    screen: "compose",
    origin: "compose",
    connected: true,
    restriction: null,
    message: null,
    busy: false,
    date: "2026-08-20",
    time: "09:00",
    timezone: "America/Bogota",
    recurrence: "none",
    showMore: false,
    cmsAction: "cms_publish",
    collectionId: "tests",
    itemIds: [],
    itemQuery: "",
    confirmId: null,
    confirmDisconnect: false,
    connectWait: false,
    reviewCopy: "",
    jobs: defaultJobs(),
  };

  function defaultJobs() {
    return [
      {
        id: "j-wait",
        actionLabel: "Publish CMS",
        action: "cms_publish",
        summary: "Security Tips for Content Management Systems",
        executeAt: "2026-08-18T20:20:00.000Z",
        status: "scheduled",
        recurrenceRule: "none",
      },
      {
        id: "j-ok",
        actionLabel: "Publish CMS",
        action: "cms_publish",
        summary: "Security Tips for Content Management Systems",
        executeAt: "2026-08-19T17:50:00.000Z",
        status: "verified",
        recurrenceRule: "none",
      },
    ];
  }

  const hash = location.hash.replace("#", "");
  if (hash === "connect") {
    state.connected = false;
    state.screen = "connect";
  } else if (hash === "connect-wait") {
    state.connected = false;
    state.connectWait = true;
    state.screen = "connect";
  } else if (hash === "preview") {
    state.restriction = "preview";
    state.screen = "restriction";
  } else if (hash === "mismatch") {
    state.restriction = "mismatch";
    state.screen = "restriction";
  } else if (hash === "custom-domain") {
    state.restriction = "custom-domain";
    state.screen = "restriction";
  } else if (hash === "offline") {
    state.restriction = "offline";
    state.screen = "restriction";
  } else if (hash === "cms" || hash === "account" || hash === "done") {
    state.screen = hash;
  } else if (hash === "disconnect") {
    state.screen = "account";
    state.confirmDisconnect = true;
  } else if (hash === "more-options") {
    state.showMore = true;
    state.recurrence = "monthly";
    state.date = "2026-08-31";
  } else if (hash === "review-site") {
    state.screen = "review";
    state.origin = "compose";
    state.reviewCopy = `Publish the whole site to ${staging}. Other staged changes may be included.`;
  } else if (hash === "review-cms") {
    state.screen = "review";
    state.origin = "cms";
    state.cmsAction = "cms_archive";
    state.itemIds = ["i2", "i5"];
    state.recurrence = "weekly";
    state.reviewCopy = "Archive 2 items in Tests: Security Tips for Content Management Systems, Editorial Workflow Notes.";
  } else if (hash === "checking") {
    state.jobs = [
      { id: "j-check", actionLabel: "Publish site", action: "site_publish", summary: staging, executeAt: "2026-08-20T14:00:00.000Z", status: "queued_unverified", recurrenceRule: "none" },
      { id: "j-unclear", actionLabel: "Publish CMS", action: "cms_publish", summary: "Best Practices for Using a CMS", executeAt: "2026-08-20T03:00:00.000Z", status: "ambiguous_result", recurrenceRule: "none" },
    ];
  } else if (hash === "needs-check") {
    state.jobs = [
      { id: "j-need", actionLabel: "Publish site", action: "site_publish", summary: staging, executeAt: "2026-08-20T14:00:00.000Z", status: "manual_verification_required", recurrenceRule: "none" },
      { id: "j-skip", actionLabel: "Republish CMS", action: "cms_republish", summary: "The Future of Content Management Systems", executeAt: "2026-08-22T12:30:00.000Z", status: "failed_before_write", recurrenceRule: "none" },
    ];
  } else if (hash === "rejected") {
    state.jobs = [
      { id: "j-rej", actionLabel: "Publish site", action: "site_publish", summary: staging, executeAt: "2026-08-20T14:00:00.000Z", status: "request_rejected", recurrenceRule: "none" },
      { id: "j-auth", actionLabel: "Publish CMS", action: "cms_publish", summary: "Security Tips for Content Management Systems", executeAt: "2026-08-21T14:00:00.000Z", status: "authorization_required", recurrenceRule: "none" },
    ];
  }

  function el(html) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function offsetLabel(timeZone) {
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value || "";
    } catch {
      return "";
    }
  }

  function timezoneLabel(timeZone) {
    const offset = offsetLabel(timeZone);
    return offset ? `${timeZone} (${offset})` : timeZone;
  }

  function timezoneHelp(timeZone) {
    return `${timezoneLabel(timeZone)} · same time after clock changes`;
  }

  function statusKind(status) {
    if (status === "verified") return "ok";
    if (status === "scheduled") return "wait";
    if (checking.has(status)) return "check";
    if (status === "manual_verification_required") return "warn";
    if (status === "ambiguous_result") return "unclear";
    if (status === "cancelled" || status === "failed_before_write") return "muted";
    return "error";
  }

  function itemTone(status) {
    if (checking.has(status)) return "check";
    if (status === "manual_verification_required") return "warn";
    if (status === "ambiguous_result") return "unclear";
    if (status === "request_rejected" || status === "authorization_required") return "error";
    return "";
  }

  function formatWhen(iso, prefix) {
    try {
      const value = new Intl.DateTimeFormat("en-GB", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: state.timezone,
      }).format(new Date(iso));
      return prefix ? `${prefix} ${value}` : value;
    } catch {
      return iso;
    }
  }

  function formatLocalWhen() {
    const stamp = new Date(`${state.date}T${state.time}`);
    try {
      return `${new Intl.DateTimeFormat("en-GB", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
      }).format(stamp)} · ${state.timezone}`;
    } catch {
      return `${state.date} ${state.time} · ${state.timezone}`;
    }
  }

  function formatPublished(value, staged) {
    if (!value) return staged ? "Staged" : "Never published";
    const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
    return staged ? `Staged since ${date}` : date;
  }

  function cmsItemState(item) {
    if (item.isArchived) return { label: "Archived", kind: "muted" };
    if (item.isDraft) return { label: "Draft", kind: "wait" };
    if (item.lastPublished) return { label: "Published", kind: "ok" };
    return { label: "Staged", kind: "unclear" };
  }

  function recurrenceCopy() {
    const day = Number(state.date.split("-")[2] || "0");
    if (state.recurrence === "none") return "Runs once. Nothing repeats.";
    if (state.recurrence === "monthly") {
      return `Repeats every month. The next run is created only after this one is verified.${day >= 29 ? ` Months without a ${day}th are skipped.` : ""}`;
    }
    return `Repeats ${state.recurrence === "daily" ? "every day" : "every week"}. The next run is created only after this one is verified.`;
  }

  function jobNote(job) {
    if (job.status === "scheduled") return "Saved by ScheduleFlow. Webflow has not changed yet.";
    if (checking.has(job.status)) return "Webflow accepted the queue. Not verified until the live read matches.";
    if (job.status === "manual_verification_required") return "The run finished but the live read did not confirm it. Nothing is marked verified.";
    if (job.status === "failed_before_write") return "Waits for the previous run to be verified before it is created.";
    if (job.status === "ambiguous_result") return "The live read was inconclusive. Another live check is queued.";
    if (job.status === "request_rejected") return "Webflow returned an error. Nothing was published and no repeat was created.";
    if (job.status === "authorization_required") return "Authorization expired before the run. Reconnect to keep this schedule.";
    return "";
  }

  function jobWhen(job) {
    if (job.status === "scheduled") return formatWhen(job.executeAt);
    if (job.status === "failed_before_write" || job.status === "authorization_required") return formatWhen(job.executeAt, "Due");
    if (job.status === "verified") return formatWhen(job.executeAt);
    return formatWhen(job.executeAt, "Ran");
  }

  function waitingJobs() {
    return state.jobs.filter((job) => waiting.has(job.status));
  }

  function items() {
    const list = itemsByCollection[state.collectionId] || [];
    const query = state.itemQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter((item) => item.name.toLowerCase().includes(query));
  }

  function whenFields() {
    return `<div class="when">
      <div class="row">
        <label for="date">Date</label>
        <input id="date" type="date" value="${state.date}" />
      </div>
      <div class="row">
        <label for="time">Time</label>
        <input id="time" type="time" value="${state.time}" />
      </div>
    </div>`;
  }

  function moreOptions() {
    const extra = state.showMore
      ? `<div class="stack">
          <div class="row">
            <label for="tz">Time zone</label>
            <select id="tz">${timezones.map((zone) => `<option ${zone === state.timezone ? "selected" : ""}>${escapeHtml(timezoneLabel(zone))}</option>`).join("")}</select>
          </div>
          <div class="row">
            <span id="repeat-label">Repeat</span>
            <div class="chips" role="group" aria-labelledby="repeat-label">
              ${repeatOptions.map((option) => `<button type="button" class="chip${state.recurrence === option.id ? " selected" : ""}" data-repeat="${option.id}">${option.label}</button>`).join("")}
            </div>
          </div>
          ${state.recurrence === "monthly" ? `<p class="notice">The next monthly run is created only after this one is verified. Months without a ${Number(state.date.split("-")[2])}th are skipped.</p>` : ""}
          <p class="muted">${escapeHtml(timezoneHelp(state.timezone))}</p>
        </div>`
      : `<p class="muted">${escapeHtml(
        state.recurrence === "none"
          ? timezoneHelp(state.timezone)
          : `${timezoneLabel(state.timezone)} · ${repeatOptions.find((option) => option.id === state.recurrence).label.toLowerCase()}, next run created only after this one is verified`,
      )}</p>`;
    return `<div class="row">
      <button type="button" class="tertiary" data-more>${state.showMore ? "Fewer options" : "More options"}</button>
      ${extra}
    </div>`;
  }

  function jobCard(job) {
    const note = jobNote(job);
    const tone = itemTone(job.status);
    const cancel = job.status !== "scheduled" ? "" : state.confirmId === job.id
      ? `<div class="stack">
          <p class="notice">Cancel this waiting publish? Webflow will not change.</p>
          <button class="destructive" type="button" data-confirm-cancel="${job.id}">Yes, cancel</button>
          <button class="tertiary" type="button" data-keep>Keep it</button>
        </div>`
      : `<button class="tertiary" type="button" data-ask-cancel="${job.id}">Cancel</button>`;
    const extra = job.status === "manual_verification_required"
      ? `<button class="tertiary" type="button" data-check>Check the live site now</button>`
      : job.status === "request_rejected"
        ? `<button class="tertiary" type="button" data-again="${job.action}">Schedule it again</button>`
        : "";
    return `<article class="item${tone ? ` ${tone}` : ""}">
      <div class="item-head">
        <strong>${escapeHtml(job.actionLabel)}</strong>
        <span class="pill ${statusKind(job.status)}">${escapeHtml(statusLabels[job.status] || job.status)}</span>
      </div>
      ${job.summary ? `<p>${escapeHtml(job.summary)}</p>` : ""}
      <p class="muted">${escapeHtml(jobWhen(job))}</p>
      ${note ? `<p class="muted">${escapeHtml(note)}</p>` : ""}
      ${cancel}${extra}
    </article>`;
  }

  function jobList() {
    const next = waitingJobs();
    const needsReconnect = state.jobs.some((job) => job.status === "authorization_required");
    const body = state.jobs.length === 0
      ? `<p class="empty">No schedules yet. Site publishes appear here after you review them.</p>`
      : `${state.jobs.map(jobCard).join("")}${next.length ? `<p class="muted">Cancelling does not change Webflow. It only removes the waiting job.</p>` : ""}${needsReconnect ? `<button class="primary" type="button" data-reconnect>Reconnect Webflow</button>` : ""}`;
    return `<section class="stack">
      <div class="section-head">
        <h2>Your schedules</h2>
        <span class="count">${next.length} waiting</span>
      </div>
      ${body}
    </section>`;
  }

  function headerStatus() {
    if (state.restriction === "mismatch") return "Authorized site · another Webflow site";
    return state.connected ? `Connected · ${staging}` : `Not connected · ${staging}`;
  }

  function bindShared(root) {
    const date = root.querySelector("#date");
    const time = root.querySelector("#time");
    const tz = root.querySelector("#tz");
    if (date) date.addEventListener("change", () => { state.date = date.value; draw(); });
    if (time) time.addEventListener("change", () => { state.time = time.value; });
    if (tz) tz.addEventListener("change", () => { state.timezone = timezones[tz.selectedIndex] || state.timezone; draw(); });
    root.querySelectorAll("[data-repeat]").forEach((button) => {
      button.addEventListener("click", () => { state.recurrence = button.getAttribute("data-repeat"); draw(); });
    });
    const more = root.querySelector("[data-more]");
    if (more) more.addEventListener("click", () => { state.showMore = !state.showMore; draw(); });
    root.querySelectorAll("[data-ask-cancel]").forEach((button) => {
      button.addEventListener("click", () => { state.confirmId = button.getAttribute("data-ask-cancel"); draw(); });
    });
    root.querySelectorAll("[data-confirm-cancel]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-confirm-cancel");
        state.jobs = state.jobs.map((job) => job.id === id ? { ...job, status: "cancelled" } : job);
        state.confirmId = null;
        draw();
      });
    });
    const keep = root.querySelector("[data-keep]");
    if (keep) keep.addEventListener("click", () => { state.confirmId = null; draw(); });
    const check = root.querySelector("[data-check]");
    if (check) check.addEventListener("click", () => { state.message = "Refreshed from the backend. Still not verified."; draw(); });
    root.querySelectorAll("[data-again]").forEach((button) => {
      button.addEventListener("click", () => {
        state.screen = button.getAttribute("data-again") === "site_publish" ? "compose" : "cms";
        state.message = null;
        draw();
      });
    });
  }

  function goReview(origin) {
    if (origin === "cms" && state.itemIds.length === 0) {
      state.message = "Select at least one CMS item.";
      draw();
      return;
    }
    state.origin = origin;
    state.busy = true;
    state.message = null;
    draw();
    window.setTimeout(() => {
      state.busy = false;
      if (origin === "cms") {
        const selected = (itemsByCollection[state.collectionId] || []).filter((item) => state.itemIds.includes(item.id));
        const verb = cmsActions.find((item) => item.id === state.cmsAction)?.label || "Publish";
        const names = selected.map((item) => item.name).join(", ");
        state.reviewCopy = `${verb} ${selected.length} item${selected.length === 1 ? "" : "s"} in Tests: ${names}.`;
      } else {
        state.reviewCopy = `Publish the whole site to ${staging}. Other staged changes may be included.`;
      }
      state.screen = "review";
      draw();
    }, 280);
  }

  function draw() {
    const frame = document.getElementById("frame");
    const navActive = state.screen === "cms" || ((state.screen === "review" || state.screen === "done") && state.origin === "cms")
      ? "cms"
      : state.screen === "account"
        ? "account"
        : "compose";
    const cmsDisabled = !state.connected || state.restriction === "preview" || state.restriction === "mismatch" || state.restriction === "custom-domain";
    const accountDisabled = !state.connected || state.restriction === "preview";
    let body = "";

    if (state.message) body += `<p class="notice error" role="alert">${escapeHtml(state.message)}</p>`;

    if (state.screen === "restriction" && state.restriction === "preview") {
      body += `<div class="stack">
        <h2>Switch to Design or Build</h2>
        <p class="notice">You are in Preview or Comment mode. Scheduling is disabled here.</p>
        <p class="muted">Switch the Designer to Design or Build and open the panel again. Existing schedules keep running.</p>
        <button class="secondary" data-clear-restriction>Check again</button>
      </div>`;
    } else if (state.screen === "restriction" && state.restriction === "mismatch") {
      body += `<div class="stack">
        <h2>This is not the authorized site</h2>
        <p class="notice error">The connection belongs to another site, not to the site open in the Designer.</p>
        <p class="muted">Authorize ${staging} to schedule from this panel. Schedules on the other site are unaffected.</p>
        <button class="primary" data-connect>Authorize this site</button>
      </div>`;
    } else if (state.screen === "restriction" && state.restriction === "custom-domain") {
      body += `<div class="stack">
        <h2>Custom domain not supported</h2>
        <p class="notice orange">This site publishes to a custom domain. This beta only publishes to .webflow.io.</p>
        <p class="muted">Nothing was scheduled. CMS actions are also unavailable while a custom domain is attached.</p>
        <button class="secondary" data-go="compose">Back to Schedules</button>
      </div>`;
    } else if (state.screen === "restriction" && state.restriction === "offline") {
      body += `<div class="stack">
        <h2>Backend not responding</h2>
        <p class="notice error">The preflight could not reach the backend, so no job was saved.</p>
        <p class="muted">Nothing was scheduled and nothing changed in Webflow. Jobs already waiting are unaffected.</p>
        <button class="primary" data-retry>Retry preflight</button>
        <button class="tertiary" data-go="compose">Back to Schedules</button>
      </div>`;
    } else if (state.screen === "connect") {
      body += state.connectWait
        ? `<div class="stack">
            <h2>Finish in the other tab</h2>
            <p class="notice info">Authorize ${staging} in the Webflow tab, then come back here.</p>
            <button class="primary" data-connected>I already connected it</button>
            <button class="secondary" data-connect>Open the connection again</button>
            <p class="muted">Nothing is scheduled until this site is authorized.</p>
          </div>`
        : `<div class="stack">
            <h2>Connect this site</h2>
            <p class="muted">ScheduleFlow needs authorization for this site. You stay in the Designer; the connection opens in a new tab.</p>
            <div class="card"><p class="muted">The panel does not store your token. Scheduled work runs on the backend with its own credentials.</p></div>
            <button class="primary" data-connect>Connect this site</button>
          </div>`;
    } else if (state.screen === "compose") {
      body += `<form class="stack" id="site-form">
        <h2>Site publish</h2>
        <p class="notice">This publishes the whole site to ${staging}. Other staged changes may be included.</p>
        ${whenFields()}
        ${moreOptions()}
        <button class="primary" ${state.busy ? "disabled" : ""}>${state.busy ? "Checking Webflow…" : "Review schedule"}</button>
        ${jobList()}
      </form>`;
    } else if (state.screen === "cms") {
      const visible = items();
      const itemRows = visible.length === 0
        ? `<p class="empty">No items in this collection.</p>`
        : visible.map((item) => {
          const itemState = cmsItemState(item);
          const selected = state.itemIds.includes(item.id);
          return `<label class="cms-row${selected ? " selected" : ""}">
            <input type="checkbox" data-item="${item.id}" ${selected ? "checked" : ""} />
            <span>
              <strong>${escapeHtml(item.name)}</strong>
              <span class="muted">${escapeHtml(formatPublished(item.lastPublished, itemState.label === "Staged"))}</span>
            </span>
            <span class="pill ${itemState.kind}">${itemState.label}</span>
          </label>`;
        }).join("");
      body += `<form class="stack" id="cms-form">
        <h2>CMS</h2>
        <div class="row">
          <label for="collection">Collection</label>
          <select id="collection">${collections.map((item) => `<option value="${item.id}" ${item.id === state.collectionId ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select>
        </div>
        <div class="row">
          <label for="cms-action">Action</label>
          <select id="cms-action">${cmsActions.map((item) => `<option value="${item.id}" ${item.id === state.cmsAction ? "selected" : ""}>${item.label}</option>`).join("")}</select>
        </div>
        <div class="row">
          <label for="item-search">Items ${state.itemIds.length ? `(${state.itemIds.length} selected)` : ""}</label>
          <input id="item-search" type="search" value="${escapeHtml(state.itemQuery)}" placeholder="Search by name" />
        </div>
        ${itemRows}
        ${whenFields()}
        ${moreOptions()}
        <button class="primary" ${state.busy || state.itemIds.length === 0 ? "disabled" : ""}>${
          state.busy ? "Checking Webflow…" : state.itemIds.length === 0 ? "Select at least one CMS item" : "Review schedule"
        }</button>
      </form>`;
    } else if (state.screen === "review") {
      body += `<div class="stack">
        <h2>Review this schedule</h2>
        <div class="card">
          <p>${escapeHtml(state.reviewCopy)}</p>
          <p class="muted">${escapeHtml(formatLocalWhen())}</p>
          <p class="muted">${escapeHtml(recurrenceCopy())}</p>
        </div>
        <p class="notice">This review is a fresh preflight and expires in 5 minutes. After that, review again.</p>
        <button class="primary" ${state.busy ? "disabled" : ""} data-confirm>${state.busy ? "Checking Webflow…" : "Schedule"}</button>
        <button class="secondary" type="button" data-edit>Edit</button>
      </div>`;
    } else if (state.screen === "done") {
      body += `<div class="stack">
        <h2>Done</h2>
        <p class="notice ok">Scheduled for ${escapeHtml(formatLocalWhen().replace(` · ${state.timezone}`, ""))}. You can close Webflow — the job runs on the backend.</p>
        <p class="muted">This is not a verified publish yet. ScheduleFlow re-reads Webflow after the run and only then marks it verified.</p>
        <button class="primary" data-go="compose">See schedules</button>
        <button class="secondary" data-edit>Schedule another</button>
      </div>`;
    } else if (state.screen === "account") {
      const waitingCount = waitingJobs().length;
      body += state.confirmDisconnect
        ? `<div class="stack">
            <h2>Disconnect this site</h2>
            <div class="card confirm notice error">
              <p>This revokes Webflow, deletes stored credentials and cancels ${waitingCount} waiting schedule${waitingCount === 1 ? "" : "s"}. It does not undo anything already published.</p>
              <button class="destructive" data-disconnect>Yes, disconnect</button>
              <button class="tertiary" data-keep-connected>Keep this site connected</button>
            </div>
            <p class="muted">After disconnecting, the panel returns to Connect this site.</p>
          </div>`
        : `<div class="stack">
            <h2>Account</h2>
            <p class="muted">You are the site owner on this connection. Inviting teammates is not available yet.</p>
            <p class="muted">Role: Owner</p>
            <p class="muted">Log out ends the panel session. Disconnect revokes Webflow and cancels waiting schedules.</p>
            <button class="secondary" data-logout>Log out</button>
            <button class="destructive" data-ask-disconnect>Disconnect this site</button>
            <p class="muted free">ScheduleFlow is free.</p>
          </div>`;
    }

    frame.replaceChildren();
    frame.appendChild(el(`<div class="app">
      <header class="header">
        <p class="kicker">ScheduleFlow</p>
        <h1>${escapeHtml(siteName)}</h1>
        <p class="muted">${escapeHtml(headerStatus())}</p>
      </header>
      <div class="body">${body}</div>
      <nav class="footer nav" aria-label="ScheduleFlow">
        <button class="${navActive === "compose" ? "active" : ""}" type="button" data-go="compose">Schedules</button>
        <button class="${navActive === "cms" ? "active" : ""}" type="button" data-go="cms" ${cmsDisabled ? "disabled" : ""}>CMS</button>
        <button class="${navActive === "account" ? "active" : ""}" type="button" data-go="account" ${accountDisabled ? "disabled" : ""}>Account</button>
      </nav>
    </div>`));

    const siteForm = frame.querySelector("#site-form");
    if (siteForm) siteForm.addEventListener("submit", (event) => { event.preventDefault(); goReview("compose"); });
    const cmsForm = frame.querySelector("#cms-form");
    if (cmsForm) cmsForm.addEventListener("submit", (event) => { event.preventDefault(); goReview("cms"); });
    const collection = frame.querySelector("#collection");
    if (collection) collection.addEventListener("change", () => { state.collectionId = collection.value; state.itemIds = []; draw(); });
    const cmsAction = frame.querySelector("#cms-action");
    if (cmsAction) cmsAction.addEventListener("change", () => { state.cmsAction = cmsAction.value; });
    const search = frame.querySelector("#item-search");
    if (search) {
      search.addEventListener("input", () => {
        const cursor = search.selectionStart;
        state.itemQuery = search.value;
        draw();
        const next = document.getElementById("item-search");
        if (next) {
          next.focus();
          next.setSelectionRange(cursor, cursor);
        }
      });
    }
    frame.querySelectorAll("[data-item]").forEach((box) => {
      box.addEventListener("change", () => {
        const id = box.getAttribute("data-item");
        if (box.checked) state.itemIds = [...state.itemIds, id];
        else state.itemIds = state.itemIds.filter((value) => value !== id);
        draw();
      });
    });
    bindShared(frame);
    frame.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.getAttribute("data-go");
        state.message = null;
        state.confirmDisconnect = false;
        if (!state.connected) {
          state.screen = "connect";
          draw();
          return;
        }
        if (state.restriction === "preview" || state.restriction === "mismatch") {
          draw();
          return;
        }
        if (next === "compose" || next === "cms" || next === "account") state.restriction = null;
        state.screen = next;
        draw();
      });
    });
    const edit = frame.querySelector("[data-edit]");
    if (edit) edit.addEventListener("click", () => { state.screen = state.origin; draw(); });
    const confirm = frame.querySelector("[data-confirm]");
    if (confirm) {
      confirm.addEventListener("click", () => {
        state.busy = true;
        draw();
        window.setTimeout(() => {
          const cms = state.origin === "cms";
          const selected = (itemsByCollection[state.collectionId] || []).filter((item) => state.itemIds.includes(item.id));
          const cmsLabel = cmsActions.find((item) => item.id === state.cmsAction)?.label;
          state.jobs.unshift({
            id: `j-${Date.now()}`,
            action: cms ? state.cmsAction : "site_publish",
            actionLabel: cms ? (cmsLabel === "Publish" ? "Publish CMS" : cmsLabel) : "Publish site",
            summary: cms ? selected.map((item) => item.name).join(", ") : staging,
            executeAt: new Date(`${state.date}T${state.time}`).toISOString(),
            status: "scheduled",
            recurrenceRule: state.recurrence,
          });
          state.busy = false;
          state.screen = "done";
          draw();
        }, 280);
      });
    }
    const connect = frame.querySelector("[data-connect]");
    if (connect) connect.addEventListener("click", () => { state.connectWait = true; state.screen = "connect"; state.restriction = null; draw(); });
    const connected = frame.querySelector("[data-connected]");
    if (connected) connected.addEventListener("click", () => { state.connected = true; state.connectWait = false; state.restriction = null; state.screen = "compose"; draw(); });
    const reconnect = frame.querySelector("[data-reconnect]");
    if (reconnect) reconnect.addEventListener("click", () => { state.connectWait = true; state.connected = false; state.screen = "connect"; draw(); });
    const logout = frame.querySelector("[data-logout]");
    if (logout) logout.addEventListener("click", () => { state.connected = false; state.connectWait = false; state.screen = "connect"; draw(); });
    const askDisconnect = frame.querySelector("[data-ask-disconnect]");
    if (askDisconnect) askDisconnect.addEventListener("click", () => { state.confirmDisconnect = true; draw(); });
    const keepConnected = frame.querySelector("[data-keep-connected]");
    if (keepConnected) keepConnected.addEventListener("click", () => { state.confirmDisconnect = false; draw(); });
    const disconnect = frame.querySelector("[data-disconnect]");
    if (disconnect) {
      disconnect.addEventListener("click", () => {
        state.connected = false;
        state.jobs = state.jobs.map((job) => waiting.has(job.status) ? { ...job, status: "cancelled" } : job);
        state.confirmDisconnect = false;
        state.connectWait = false;
        state.screen = "connect";
        draw();
      });
    }
    const clearRestriction = frame.querySelector("[data-clear-restriction]");
    if (clearRestriction) clearRestriction.addEventListener("click", () => { state.restriction = null; state.screen = "compose"; draw(); });
    const retry = frame.querySelector("[data-retry]");
    if (retry) retry.addEventListener("click", () => { state.restriction = null; goReview(state.origin || "compose"); });
  }

  draw();
})();
