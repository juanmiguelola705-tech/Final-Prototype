(() => {
  "use strict";

  const KEYS = {
    users: "iskolar-marsu-users-v1",
    applications: "iskolar-marsu-applications-v1",
    session: "iskolar-marsu-session-v1",
  };
  const STAFF_EMAIL = "staff@marsu.edu.ph";
  const STAFF_PASSWORD = "MarsuStaff2026!";
  const app = document.getElementById("app");
  let selectedRole = "student";
  let authMode = "login";
  let toastTimer;

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Unable to read ${key} from local storage.`, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Unable to save ${key} to local storage.`, error);
      showToast("Your browser could not save this change. Check available storage and try again.");
      return false;
    }
  }

  function getUsers() { return read(KEYS.users, []); }
  function getApplications() { return read(KEYS.applications, []); }
  function getSession() { return read(KEYS.session, null); }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }
  function initials(value) {
    return String(value || "").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  }
  function showToast(message) {
    document.querySelector(".toast")?.remove();
    const node = document.createElement("div");
    node.className = "toast";
    node.setAttribute("role", "status");
    node.textContent = message;
    document.body.appendChild(node);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.remove(), 3500);
  }
  function notice(message, success) {
    const el = document.getElementById("auth-notice");
    if (!el) return;
    el.textContent = message;
    el.className = `notice show${success ? " success" : ""}`;
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  function statusBadge(status) {
    const normalized = ["Approved", "Rejected"].includes(status) ? status : "Pending";
    return `<span class="badge badge-${normalized.toLowerCase()}">${normalized}</span>`;
  }
  function wireBrandLogo() {
    app.querySelectorAll(".brand-mark img").forEach((image) => {
      image.addEventListener("error", () => {
        image.hidden = true;
        image.parentElement.querySelector("[aria-hidden='true']").style.visibility = "visible";
      }, { once: true });
    });
  }

  function renderAuth() {
    app.innerHTML = `
      <div class="shell">
        <header class="topbar">
          <a class="brand" href="#" aria-label="ISKOLAR MARSU home">
            <span class="brand-mark"><img src="https://marsu.edu.ph/wp-content/uploads/2026/04/MarSU-website-masthead.png" alt="Marinduque State University seal" /><span aria-hidden="true">M</span></span>
            <span><span class="brand-name">ISKOLAR MARSU</span><br><span class="brand-sub">Marinduque State University</span></span>
          </a>
          <div class="topbar-note">A brighter future starts <strong>with opportunity.</strong></div>
        </header>
        <main class="landing">
          <section class="hero">
            <p class="eyebrow">Scholarship portal</p>
            <h1>Make your next chapter <em>possible.</em></h1>
            <p class="hero-copy">Discover scholarship opportunities, submit your application, and follow every step of your journey—all in one place.</p>
            <div class="hero-stats">
              <div class="hero-stat"><strong>One portal</strong><span>for every application</span></div>
              <div class="hero-stat"><strong>Clear updates</strong><span>at every step</span></div>
              <div class="hero-stat"><strong>Your future</strong><span>starts here</span></div>
            </div>
            <div class="hero-art" aria-hidden="true"></div>
          </section>
          <section class="auth-card" aria-labelledby="auth-title">
            <p class="card-kicker">Welcome to ISKOLAR MARSU</p>
            <h2 id="auth-title">${authMode === "register" ? "Create your account" : "Sign in to continue"}</h2>
            <p class="auth-intro">${authMode === "register" ? "Set up your student account to apply for a scholarship." : "Choose your account type and enter your credentials."}</p>
            <div class="role-switch" aria-label="Choose account type">
              <button type="button" class="role-option" data-role="student" aria-pressed="${selectedRole === "student"}">Student</button>
              <button type="button" class="role-option" data-role="staff" aria-pressed="${selectedRole === "staff"}">Staff</button>
            </div>
            <div id="auth-notice" class="notice" role="alert"></div>
            <form id="auth-form" novalidate>
              ${authMode === "register" ? `
                <div class="field"><label for="register-name">Full name</label><input id="register-name" name="name" autocomplete="name" required maxlength="100" placeholder="e.g. Maria Dela Cruz"></div>
                <div class="field"><label for="register-id">Student ID</label><input id="register-id" name="studentId" required maxlength="30" placeholder="Your university ID number"></div>
              ` : ""}
              <div class="field"><label for="auth-email">University email</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="120" placeholder="you@example.com"></div>
              <div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" autocomplete="${authMode === "register" ? "new-password" : "current-password"}" required minlength="8" maxlength="128" placeholder="${authMode === "register" ? "At least 8 characters" : "Enter your password"}"></div>
              <button class="btn btn-primary btn-full" type="submit">${authMode === "register" ? "Create student account" : "Sign in"} <span aria-hidden="true">→</span></button>
            </form>
            ${selectedRole === "student" ? `
              <p class="auth-switch">${authMode === "register" ? "Already registered?" : "New to ISKOLAR MARSU?"}
                <button class="text-button" type="button" data-auth-mode="${authMode === "register" ? "login" : "register"}">${authMode === "register" ? "Sign in" : "Create an account"}</button>
              </p>
            ` : ""}
            ${selectedRole === "staff" ? `<div class="demo-note"><strong>Demo staff access</strong><br>Email: ${STAFF_EMAIL}<br>Password: ${STAFF_PASSWORD}<br>For demonstration only. Do not use real or sensitive data.</div>` : ""}
          </section>
        </main>
        <footer class="footer">ISKOLAR MARSU · Marinduque State University · Scholarship Services</footer>
      </div>`;

    wireBrandLogo();
    app.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => {
      selectedRole = button.dataset.role;
      authMode = "login";
      renderAuth();
    }));
    app.querySelector("[data-auth-mode]")?.addEventListener("click", (event) => {
      authMode = event.currentTarget.dataset.authMode;
      renderAuth();
    });
    document.getElementById("auth-form").addEventListener("submit", handleAuth);
  }

  function handleAuth(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const email = String(data.get("email")).trim().toLowerCase();
    const password = String(data.get("password"));
    if (selectedRole === "staff") {
      if (email !== STAFF_EMAIL || password !== STAFF_PASSWORD) {
        notice("The staff email or password is incorrect. Please try again.");
        return;
      }
      if (!write(KEYS.session, { role: "staff", email })) return;
      render();
      return;
    }
    if (authMode === "register") {
      const name = String(data.get("name")).trim();
      const studentId = String(data.get("studentId")).trim();
      if (!name || !studentId) {
        notice("Please enter your full name and student ID.");
        return;
      }
      const users = getUsers();
      if (users.some((user) => user.email === email)) {
        notice("An account already uses this email. Please sign in instead.");
        return;
      }
      if (users.some((user) => user.studentId.toLowerCase() === studentId.toLowerCase())) {
        notice("An account already uses this student ID. Please sign in or contact the portal administrator.");
        return;
      }
      users.push({ name, studentId, email, password });
      if (!write(KEYS.users, users)) return;
    } else {
      const user = getUsers().find((item) => item.email === email && item.password === password);
      if (!user) {
        notice("The student email or password is incorrect. Please try again.");
        return;
      }
    }
    if (!write(KEYS.session, { role: "student", email })) return;
    render();
  }

  function header(session, roleLabel) {
    const person = session.role === "student"
      ? getUsers().find((user) => user.email === session.email)
      : { name: "Scholarship Staff" };
    const name = person?.name || "Student";
    return `<header class="app-header">
      <a class="brand" href="#" aria-label="ISKOLAR MARSU home"><span class="brand-mark"><img src="https://marsu.edu.ph/wp-content/uploads/2026/04/MarSU-website-masthead.png" alt="Marinduque State University seal" /><span aria-hidden="true">M</span></span>
        <span><span class="brand-name">ISKOLAR MARSU</span><br><span class="brand-sub">Scholarship Portal</span></span>
      </a>
      <div class="header-user"><div class="avatar">${escapeHtml(initials(name))}</div>
        <div><div class="user-name">${escapeHtml(name)}</div><div class="user-role">${roleLabel}</div></div>
        <button type="button" class="btn btn-outline" id="logout-button">Sign out</button>
      </div>
    </header>`;
  }

  function renderStudent(session) {
    const user = getUsers().find((item) => item.email === session.email);
    if (!user) {
      write(KEYS.session, null);
      renderAuth();
      return;
    }
    const apps = getApplications().filter((item) => item.submittedBy === user.email).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const latest = apps[0];
    const status = latest?.status || "Not submitted";
    const isSubmitted = Boolean(latest);
    const steps = [
      { title: "Application submitted", desc: isSubmitted ? `Received ${formatDate(latest.createdAt)}` : "Complete and submit your application", complete: isSubmitted, active: !isSubmitted },
      { title: "Under review", desc: latest ? (latest.status === "Pending" ? "Your application is being reviewed" : "Review completed") : "The scholarship team will review your application", complete: Boolean(latest && latest.status !== "Pending"), active: Boolean(latest && latest.status === "Pending") },
      { title: "Decision", desc: latest?.status === "Approved" ? "Congratulations—your application is approved" : latest?.status === "Rejected" ? "Please contact the scholarship office for guidance" : "Your status will update when a decision is made", complete: Boolean(latest && latest.status !== "Pending"), active: Boolean(latest && latest.status !== "Pending") },
    ];
    app.innerHTML = `<div class="app-shell">
      ${header(session, "Student account")}
      <main class="dashboard">
        <div class="welcome-row"><div><p class="eyebrow">Student dashboard</p><h1>Welcome, ${escapeHtml(user.name.split(/\s+/)[0])}.</h1><p>Apply for support and stay up to date on your scholarship journey.</p></div></div>
        <div class="dash-grid">
          <section class="panel">
            <div class="panel-head"><div><h2>Scholarship application</h2><p class="panel-sub">Complete every field to submit your application for review.</p></div></div>
            <div id="student-notice" class="notice" role="status"></div>
            <form class="application-form" id="application-form">
              <p class="form-section-title">Student information</p>
              <div class="field"><label for="app-name">Full name</label><input id="app-name" name="fullName" required maxlength="100" value="${escapeHtml(user.name)}"></div>
              <div class="field-row">
                <div class="field"><label for="app-student-id">Student ID</label><input id="app-student-id" name="studentId" required maxlength="30" value="${escapeHtml(user.studentId)}"></div>
                <div class="field"><label for="app-course">Course / program</label><input id="app-course" name="course" required maxlength="100" placeholder="e.g. BS Marine Biology"></div>
              </div>
              <div class="field-row">
                <div class="field"><label for="app-year">Year level</label><select id="app-year" name="yearLevel" required><option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option></select></div>
                <div class="field"><label for="app-gwa">General Weighted Average (GWA)</label><input id="app-gwa" name="gwa" type="number" inputmode="decimal" min="1" max="5" step="0.01" required placeholder="e.g. 1.75"></div>
              </div>
              <p class="form-section-title">Contact & household</p>
              <div class="field-row">
                <div class="field"><label for="app-email">Email address</label><input id="app-email" name="email" type="email" required maxlength="120" value="${escapeHtml(user.email)}"></div>
                <div class="field"><label for="app-phone">Contact number</label><input id="app-phone" name="phone" type="tel" inputmode="tel" pattern="[0-9]{7,15}" title="Enter a phone number using 7 to 15 digits" required maxlength="15" placeholder="e.g. 09XX XXX XXXX"></div>
              </div>
              <div class="field-row">
                <div class="field"><label for="app-income">Monthly household income (PHP)</label><input id="app-income" name="income" type="number" min="0" max="10000000" step="0.01" required placeholder="e.g. 15000"></div>
                <div class="field"><label for="app-scholarship">Scholarship type</label><select id="app-scholarship" name="scholarshipType" required><option value="">Choose a scholarship</option><option>Academic Scholarship</option><option>Need-Based Scholarship</option><option>TES - Tertiary Education Subsidy</option><option>TDP - Tulong Dunong Program</option><option>CHED Scholarship</option><option>Athletic Scholarship</option><option>Other / Special Scholarship</option></select></div>
              </div>
              <button class="btn btn-primary" type="submit">Submit application <span aria-hidden="true">→</span></button>
            </form>
          </section>
          <aside class="side-panel">
            <section class="status-card">
              <p class="card-kicker">Application status</p>
              <h2>${escapeHtml(status)}</h2>
              <p>${latest ? `Last updated ${formatDate(latest.updatedAt || latest.createdAt)}` : "Your status will appear here after you apply."}</p>
              <div class="status-timeline">${steps.map((step) => `<div class="timeline-step${step.complete ? " complete" : ""}${step.active ? " active" : ""}"><span class="timeline-dot"></span><div class="timeline-copy"><strong>${step.title}</strong><span>${step.desc}</span></div></div>`).join("")}</div>
            </section>
            ${apps.length ? `<section class="panel"><div class="panel-head"><div><h2>My applications</h2><p class="panel-sub">${apps.length} submission${apps.length === 1 ? "" : "s"}</p></div></div><div class="history-list">${apps.map((item) => `<div class="history-item"><div class="history-item-top"><strong>${escapeHtml(item.scholarshipType)}</strong>${statusBadge(item.status)}</div><small>Submitted ${formatDate(item.createdAt)}</small></div>`).join("")}</div></section>` : ""}
            <section class="info-box"><h3>Need assistance?</h3><p>For questions about eligibility or required documents, please contact the Marinduque State University scholarship office.</p></section>
          </aside>
        </div>
      </main><footer class="footer">ISKOLAR MARSU · Your application information is saved in this browser.</footer>
    </div>`;
    wireBrandLogo();
    document.getElementById("application-form").addEventListener("submit", submitApplication);
    document.getElementById("logout-button").addEventListener("click", logout);
  }

  function submitApplication(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const record = Object.fromEntries(formData.entries());
    const session = getSession();
    const applications = getApplications();
    const now = new Date().toISOString();
    applications.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...record,
      email: String(record.email).trim().toLowerCase(),
      gwa: Number(record.gwa),
      income: Number(record.income),
      status: "Pending",
      createdAt: now,
      updatedAt: now,
      submittedBy: session?.email,
    });
    if (!write(KEYS.applications, applications)) return;
    render();
    showToast("Application submitted. You can track its status on this dashboard.");
  }

  function renderStaff(session) {
    const applications = getApplications().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const pending = applications.filter((item) => item.status === "Pending").length;
    const approved = applications.filter((item) => item.status === "Approved").length;
    const rejected = applications.filter((item) => item.status === "Rejected").length;
    app.innerHTML = `<div class="app-shell">
      ${header(session, "Staff dashboard")}
      <main class="dashboard">
        <div class="welcome-row"><div><p class="eyebrow">Scholarship administration</p><h1>Applicant review</h1><p>Search, review, and manage student scholarship applications.</p></div></div>
        <section class="staff-summary" aria-label="Application totals">
          <div class="summary-card"><span>Total applications</span><strong>${applications.length}</strong></div>
          <div class="summary-card"><span>Awaiting review</span><strong>${pending}</strong></div>
          <div class="summary-card"><span>Reviewed</span><strong>${approved + rejected}</strong></div>
        </section>
        <section class="panel">
          <div class="panel-head"><div><h2>All applicants</h2><p class="panel-sub">Select an applicant to review their full application and update its status.</p></div></div>
          <div class="table-tools">
            <input id="applicant-search" class="search-input" type="search" placeholder="Search name, student ID, email, or course…" aria-label="Search applicants">
            <select id="status-filter" class="filter-select" aria-label="Filter by status"><option value="">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select>
          </div>
          <div class="table-wrap"><table><thead><tr><th>Applicant</th><th>Program</th><th>Scholarship</th><th>Submitted</th><th>Status</th><th>Review</th></tr></thead><tbody id="applicant-rows"></tbody></table>
            <div id="empty-applicants" class="empty-state" hidden><strong>No applications found</strong>New student submissions will appear here.</div>
          </div>
        </section>
      </main><footer class="footer">ISKOLAR MARSU · Staff review workspace</footer>
    </div>`;
    wireBrandLogo();
    document.getElementById("logout-button").addEventListener("click", logout);
    document.getElementById("applicant-search").addEventListener("input", updateApplicantTable);
    document.getElementById("status-filter").addEventListener("change", updateApplicantTable);
    updateApplicantTable();
  }

  function updateApplicantTable() {
    const query = document.getElementById("applicant-search")?.value.trim().toLowerCase() || "";
    const filter = document.getElementById("status-filter")?.value || "";
    const rows = getApplications().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((item) => {
      const searchable = [item.fullName, item.studentId, item.email, item.course, item.scholarshipType].join(" ").toLowerCase();
      return searchable.includes(query) && (!filter || item.status === filter);
    });
    const tbody = document.getElementById("applicant-rows");
    if (!tbody) return;
    tbody.innerHTML = rows.map((item) => `<tr>
      <td><strong>${escapeHtml(item.fullName)}</strong><span class="table-sub">${escapeHtml(item.studentId)} · ${escapeHtml(item.email)}</span></td>
      <td>${escapeHtml(item.course)}<span class="table-sub">${escapeHtml(item.yearLevel)}</span></td>
      <td>${escapeHtml(item.scholarshipType)}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td>${statusBadge(item.status)}</td>
      <td><button class="table-action" type="button" data-review="${escapeHtml(item.id)}">View details →</button></td>
    </tr>`).join("");
    const empty = document.getElementById("empty-applicants");
    empty.hidden = rows.length > 0;
    empty.innerHTML = query || filter
      ? "<strong>No matching applications</strong>Try changing your search or status filter."
      : "<strong>No applications found</strong>New student submissions will appear here.";
    tbody.querySelectorAll("[data-review]").forEach((button) => button.addEventListener("click", () => openReview(button.dataset.review)));
  }

  function openReview(id) {
    const item = getApplications().find((application) => application.id === id);
    if (!item) {
      showToast("This application could not be found. Refresh the list and try again.");
      return;
    }
    document.querySelector(".modal-backdrop")?.remove();
    const details = [
      ["Full name", item.fullName], ["Student ID", item.studentId], ["Email address", item.email],
      ["Contact number", item.phone], ["Course / program", item.course], ["Year level", item.yearLevel],
      ["General Weighted Average", item.gwa], ["Monthly household income", `PHP ${Number(item.income).toLocaleString()}`],
      ["Scholarship type", item.scholarshipType], ["Submitted", formatDate(item.createdAt)],
    ];
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <div class="modal-head"><div><h2 id="review-title">${escapeHtml(item.fullName)}</h2><p>Application details · ${escapeHtml(item.studentId)}</p></div><button class="icon-button" type="button" data-close aria-label="Close dialog">×</button></div>
      <div style="padding-top:12px">${statusBadge(item.status)}</div>
      <div class="detail-grid">${details.map(([label, value]) => `<div class="detail-item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>
      <div class="modal-actions"><button class="btn btn-outline" type="button" data-close>Close</button>
        <button class="btn btn-danger" type="button" data-decision="Rejected" ${item.status === "Rejected" ? "disabled" : ""}>Reject</button>
        <button class="btn btn-primary" type="button" data-decision="Approved" ${item.status === "Approved" ? "disabled" : ""}>Approve</button>
      </div>
    </section>`;
    document.body.appendChild(backdrop);
    backdrop.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => backdrop.remove()));
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop) backdrop.remove(); });
    backdrop.querySelectorAll("[data-decision]").forEach((button) => button.addEventListener("click", () => updateDecision(item.id, button.dataset.decision)));
    backdrop.querySelector("[data-close]").focus();
    document.addEventListener("keydown", handleModalKey);
  }

  function handleModalKey(event) {
    if (event.key === "Escape") {
      document.querySelector(".modal-backdrop")?.remove();
      document.removeEventListener("keydown", handleModalKey);
    }
  }

  function updateDecision(id, status) {
    if (!["Approved", "Rejected"].includes(status)) return;
    const applications = getApplications();
    const application = applications.find((item) => item.id === id);
    if (!application) {
      showToast("This application could not be found. Refresh the list and try again.");
      return;
    }
    application.status = status;
    application.updatedAt = new Date().toISOString();
    if (!write(KEYS.applications, applications)) return;
    document.querySelector(".modal-backdrop")?.remove();
    document.removeEventListener("keydown", handleModalKey);
    render();
    showToast(`Application ${status.toLowerCase()}.`);
  }

  function logout() {
    if (!write(KEYS.session, null)) return;
    selectedRole = "student";
    authMode = "login";
    renderAuth();
  }

  function render() {
    const session = getSession();
    if (!session) {
      renderAuth();
    } else if (session.role === "staff" && session.email === STAFF_EMAIL) {
      renderStaff(session);
    } else if (session.role === "student") {
      renderStudent(session);
    } else {
      write(KEYS.session, null);
      renderAuth();
    }
  }

  window.addEventListener("storage", (event) => {
    if ([KEYS.applications, KEYS.session, KEYS.users].includes(event.key)) render();
  });
  render();
})();
