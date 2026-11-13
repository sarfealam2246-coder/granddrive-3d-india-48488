// Sarfealam Enterprise Core UI + 14-ID Navigation Engine (components.js)
(function() {
  let toastTimer = null;

  function ensureToastEl() {
    let el = document.getElementById("sf-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "sf-toast";
      el.style.cssText = "position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-90px);z-index:99999;background:#0f172a;color:#f8fafc;border:1.5px solid #38bdf8;padding:10px 18px;border-radius:12px;font-size:13px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.45);transition:transform 0.25s ease;max-width:90%;text-align:center;";
      document.body.appendChild(el);
    }
    return el;
  }

  window.FactoryLang = {
    lang: localStorage.getItem("sf_lang") || "en",
    slideIdx: 0,
    slides: [
      { t: "Smart Cloud Experience", d: "Fast, vibrant 3D mobile workspace synced live with your cloud account." },
      { t: "Offline-First + Auto Sync", d: "Save records anytime even without internet; auto-syncs as soon as online." },
      { t: "Verified Security & Rewards", d: "Protected by 6-digit Gmail OTP, 1-tap WhatsApp share & instant PDF export." }
    ],
    nextSlide: function() {
      window.FactoryLang.slideIdx++;
      if (window.FactoryLang.slideIdx >= window.FactoryLang.slides.length) {
        window.FactoryLang.finishOnboarding();
        return;
      }
      const s = window.FactoryLang.slides[window.FactoryLang.slideIdx];
      const tEl = document.getElementById("ob-slide-title");
      const dEl = document.getElementById("ob-slide-desc");
      if (tEl) tEl.textContent = s.t;
      if (dEl) dEl.textContent = s.d;
      for (let i = 0; i < 3; i++) {
        const dot = document.getElementById("ob-dot-" + i);
        if (dot) dot.style.width = (i === window.FactoryLang.slideIdx) ? "20px" : "8px";
      }
      const nb = document.getElementById("ob-next-btn");
      if (nb && window.FactoryLang.slideIdx === 2) nb.textContent = "Get Started";
    },
    finishOnboarding: function() {
      localStorage.setItem("sf_ob_" + (window.SF_APP_SLUG || "app"), "1");
      const ob = document.getElementById("onboarding-screen");
      if (ob) ob.style.display = "none";
      window.FactoryNav.showLogin();
    },
    toggle: function() {
      window.FactoryLang.lang = (window.FactoryLang.lang === "en") ? "hi" : "en";
      localStorage.setItem("sf_lang", window.FactoryLang.lang);
      const isHi = (window.FactoryLang.lang === "hi");
      const map = isHi ? ["होम", "काम", "रिकॉर्ड", "प्रोफाइल"] : ["Home", "Actions", "Records", "Profile"];
      for (let i = 1; i <= 4; i++) {
        const b = document.getElementById("nav-" + i);
        if (b) {
          const sp = b.querySelector("span");
          if (sp) sp.textContent = map[i - 1];
        }
      }
      window.FactoryUI.toast(isHi ? "Hindi Language Active" : "Language: English active", "success");
      if (typeof window.onLangChange === "function") { try { window.onLangChange(window.FactoryLang.lang); } catch (e) {} }
    }
  };

  window.addEventListener("online", function() {
    window.FactoryUI.toast("Back online — cloud sync active!", "success");
    if (typeof window.onAppReady === "function") { try { window.onAppReady(); } catch (e) {} }
  });

  window.addEventListener("popstate", function() {
    const modal = document.getElementById("app-modal");
    if (modal && modal.classList.contains("open")) { modal.classList.remove("open"); return; }
    const detail = document.getElementById("view-detail");
    if (detail && detail.style.display === "block") { window.FactoryNav.closeDetail(); return; }
    const drawer = document.getElementById("profile-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    if (drawer && drawer.classList.contains("open")) {
      drawer.classList.remove("open");
      if (backdrop) backdrop.classList.remove("open");
    }
  });

  window.FactoryUI = {
    vibrate: function(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 18); } catch (e) {} },
    confetti: function() { try { if (typeof window.confetti === "function") window.confetti({ particleCount: 55, spread: 65, origin: { y: 0.7 } }); } catch (e) {} },
    beep: function(kind) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = kind === "success" ? 740 : (kind === "error" ? 260 : 520);
        gain.gain.value = 0.05;
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.09);
      } catch (e) {}
    },
    celebrate: function() {
      try { if (window.confetti) window.confetti({ particleCount: 55, spread: 65, origin: { y: 0.7 } }); } catch (e) {}
    },
    safeNum: function(val, fallback) {
      const n = Number(val);
      return Number.isFinite(n) ? n : (fallback || 0);
    },
    formatINR: function(val) {
      return "Rs. " + window.FactoryUI.safeNum(val, 0).toLocaleString("en-IN");
    },
    toast: function(msg, type) {
      window.FactoryUI.vibrate(15);
      window.FactoryUI.beep(type);
      const el = ensureToastEl();
      el.textContent = msg || "Done";
      el.style.borderColor = type === "error" ? "#ef4444" : (type === "warn" ? "#f59e0b" : "#10b981");
      el.style.transform = "translateX(-50%) translateY(0)";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function() { el.style.transform = "translateX(-50%) translateY(-90px)"; }, 2600);
    },
    modal: function(title, bodyHtml) {
      window.FactoryUI.vibrate(12);
      let modal = document.getElementById("app-modal");
      if (!modal) { modal = document.createElement("div"); modal.id = "app-modal"; document.body.appendChild(modal); }
      modal.innerHTML = '<div class="modal-card animate__animated animate__zoomIn animate__faster">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<h3 style="margin:0;font-size:17px;color:#f8fafc;">' + (title || "Details") + '</h3>' +
        '<button type="button" onclick="FactoryUI.closeModal()" style="min-height:32px;padding:4px 10px;background:#334155 !important;border-radius:8px;font-size:13px;">X</button>' +
        '</div>' +
        '<div style="font-size:14px;color:#cbd5e1;line-height:1.5;">' + (bodyHtml || "") + '</div>' +
        '</div>';
      modal.classList.add("open");
      try { window.history.pushState({ sfModal: true }, ""); } catch (e) {}
    },
    closeModal: function() {
      const modal = document.getElementById("app-modal");
      if (modal) modal.classList.remove("open");
    },
    downloadPDF: function(title, rows) {
      try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          window.FactoryUI.toast("PDF engine loading, try again", "warn");
          return;
        }
        const doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text(String(title || "Receipt"), 18, 22);
        doc.setFontSize(11);
        doc.text("Date: " + new Date().toLocaleString(), 18, 32);
        let y = 46;
        (rows || []).forEach(function(r) {
          doc.text(String(r[0]) + ": " + String(r[1]), 18, y);
          y += 10;
        });
        doc.save((String(title || "receipt").toLowerCase().replace(/[^a-z0-9]/g, "_")) + ".pdf");
        window.FactoryUI.toast("PDF Downloaded!", "success");
      } catch (e) {
        window.FactoryUI.toast("Could not save PDF on this device", "warn");
      }
    },
    receipt: function(title, rows) {
      window.FactoryUI.celebrate();
      window._lastReceipt = { title: title || "Receipt", rows: rows || [] };
      let listHtml = '<div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px;margin:10px 0;">';
      (rows || []).forEach(function(r) {
        listHtml += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e293b;">' +
          '<span style="color:#94a3b8;">' + r[0] + '</span>' +
          '<strong style="color:#f8fafc;">' + r[1] + '</strong></div>';
      });
      listHtml += '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
        '<button type="button" onclick="FactoryUI.downloadPDF(window._lastReceipt.title, window._lastReceipt.rows)" style="background:#2563eb !important;">Save PDF</button>' +
        '<button type="button" onclick="FactoryUI.closeModal()" style="background:#10b981 !important;">Done</button>' +
        '</div>';
      window.FactoryUI.modal("Confirmed: " + (title || "Success"), listHtml);
    },
    refreshIcons: function() {
      try { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); } catch (e) {}
    }
  };

  window.FactoryNav = {
    currentTab: 1,
    switchTab: function(tabNum) {
      window.FactoryNav.currentTab = tabNum;
      window.FactoryUI.vibrate(10); if(window.FactorySound) window.FactorySound.tap();
      const detail = document.getElementById("view-detail");
      if (detail) detail.style.display = "none";
      for (let i = 1; i <= 4; i++) {
        const v = document.getElementById("view-" + i);
        const b = document.getElementById("nav-" + i);
        if (v) v.style.display = (i === tabNum) ? "block" : "none";
        if (b) { if (i === tabNum) b.classList.add("active-tab"); else b.classList.remove("active-tab"); }
      }
      window.scrollTo(0, 0);
      window.FactoryUI.refreshIcons();
      if (typeof window.onTabChange === "function") { try { window.onTabChange(tabNum); } catch (e) {} }
    },
    openDetail: function(title, bodyHtml) {
      window.FactoryUI.vibrate(12);
      for (let i = 1; i <= 4; i++) {
        const v = document.getElementById("view-" + i);
        if (v) v.style.display = "none";
      }
      const d = document.getElementById("view-detail");
      if (d) {
        d.innerHTML = '<div class="animate__animated animate__fadeInRight animate__faster">' +
          '<button type="button" onclick="FactoryNav.closeDetail()" style="background:#1e293b !important;margin-bottom:12px;display:inline-flex;align-items:center;gap:6px;">&larr; Back</button>' +
          '<h2 style="margin:0 0 12px 0;font-size:20px;color:#f8fafc;">' + (title || "Details") + '</h2>' +
          '<div>' + (bodyHtml || "") + '</div></div>';
        d.style.display = "block";
        window.FactoryUI.refreshIcons();
        try { window.history.pushState({ sfDetail: true }, ""); } catch (e) {}
      }
    },
    closeDetail: function() {
      const d = document.getElementById("view-detail");
      if (d) d.style.display = "none";
      window.FactoryNav.switchTab(window.FactoryNav.currentTab || 1);
    },
    openDrawer: function() {
      const d = document.getElementById("profile-drawer");
      const bd = document.getElementById("drawer-backdrop");
      if (d) d.classList.add("open");
      if (bd) bd.classList.add("open");
      window.FactoryNav.syncDrawerProfile();
    },
    closeDrawer: function() {
      const d = document.getElementById("profile-drawer");
      const bd = document.getElementById("drawer-backdrop");
      if (d) d.classList.remove("open");
      if (bd) bd.classList.remove("open");
    },
    syncDrawerProfile: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const nameEl = document.getElementById("drawer-user-name");
      const phoneEl = document.getElementById("drawer-user-phone");
      const idEl = document.getElementById("drawer-user-id");
      const ptsEl = document.getElementById("drawer-stat-pts");
      const avEl = document.getElementById("header-avatar-txt");
      const davEl = document.getElementById("drawer-avatar-txt");
      const badgeEl = document.getElementById("header-badge");
      if (u) {
        const nm = u.full_name || "User";
        const ini = nm.trim().charAt(0).toUpperCase() || "U";
        const uid = "SF" + String(u.phone || "100001").slice(-6);
        if (nameEl) nameEl.textContent = nm;
        if (phoneEl) phoneEl.textContent = (u.email || u.phone || "Synced User");
        if (idEl) idEl.textContent = "ID: " + uid;
        if (ptsEl) ptsEl.textContent = (u.points || 100) + " Pts";
        if (avEl) avEl.textContent = ini;
        if (davEl) davEl.textContent = ini;
        if (badgeEl) badgeEl.textContent = (u.cash_balance > 0) ? window.FactoryUI.formatINR(u.cash_balance) : ((u.points || 100) + " Pts");
      }
    },
    loadNoticeBanner: async function() {
      if (!window.FactoryDB) return;
      const cfg = await window.FactoryDB.getConfig();
      const nb = document.getElementById("notice-banner");
      if (nb && cfg && (cfg.notice_banner || cfg.sponsor_text)) {
        nb.textContent = cfg.notice_banner || cfg.sponsor_text;
        nb.style.display = "block";
      }
    },
    showAppShell: function() {
      const loginView = document.getElementById("view-login");
      const appShell = document.getElementById("app-shell");
      if (loginView) loginView.style.display = "none";
      if (appShell) appShell.style.display = "block";
      window.FactoryNav.syncDrawerProfile();
      window.FactoryNav.loadNoticeBanner();
      window.FactoryNav.switchTab(1);
    },
    showLogin: function() {
      const loginView = document.getElementById("view-login");
      const appShell = document.getElementById("app-shell");
      if (appShell) appShell.style.display = "none";
      if (loginView) loginView.style.display = "flex";
    },
    sendOtp: async function() {
      const emailIn = document.getElementById("login-email");
      const email = emailIn ? emailIn.value.trim() : "";
      if (!email || !email.includes("@")) {
        window.FactoryUI.toast("Enter a valid Gmail/Email address", "error");
        return;
      }
      const btn = document.getElementById("send-otp-btn");
      if (btn) btn.textContent = "Sending OTP...";
      const res = window.FactoryDB ? await window.FactoryDB.sendEmailOtp(email) : { ok: false };
      if (btn) btn.textContent = "Send Email OTP";
      if (res.ok) {
        const otpWrap = document.getElementById("otp-verify-wrap");
        if (otpWrap) otpWrap.style.display = "block";
        window.FactoryUI.toast("OTP sent to " + email + "!", "success");
      } else {
        window.FactoryUI.toast("SMTP not set yet - use Quick Continue below", "warn");
      }
    },
    verifyAndLogin: async function() {
      const nameIn = document.getElementById("login-name");
      const phoneIn = document.getElementById("login-phone");
      const emailIn = document.getElementById("login-email");
      const otpIn = document.getElementById("login-otp");
      const fullName = nameIn ? nameIn.value.trim() : "";
      const phone = phoneIn ? phoneIn.value.trim() : "";
      const email = emailIn ? emailIn.value.trim() : "";
      const otp = otpIn ? otpIn.value.trim() : "";
      if (!fullName || phone.length < 10 || !otp) {
        window.FactoryUI.toast("Fill name, 10-digit mobile, and Email OTP", "error");
        return;
      }
      const res = await window.FactoryDB.verifyEmailOtp(email, otp);
      if (!res.ok) {
        window.FactoryUI.toast("Invalid or expired OTP", "error");
        return;
      }
      await window.FactoryDB.login(fullName, phone);
      window.FactoryUI.toast("Email Verified! Welcome " + fullName, "success");
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
    },
    submitLogin: async function() {
      window.FactoryUI.toast("Please verify your 6-digit Gmail OTP first!", "warn");
      const em = document.getElementById("login-email");
      if (em && !em.value.trim()) em.focus();
    },
    verifyAndLogin: async function() {
      const nameIn = document.getElementById("login-name");
      const phoneIn = document.getElementById("login-phone");
      const emailIn = document.getElementById("login-email");
      const otpIn = document.getElementById("login-otp");
      const fullName = nameIn ? nameIn.value.trim() : "";
      const phone = phoneIn ? phoneIn.value.trim() : "";
      const email = emailIn ? emailIn.value.trim() : "";
      const otp = otpIn ? otpIn.value.trim() : "";
      if (!fullName || phone.length < 10 || !otp) {
        window.FactoryUI.toast("Fill name, 10-digit mobile, and Email OTP", "error");
        return;
      }
      const res = await window.FactoryDB.verifyEmailOtp(email, otp);
      if (!res.ok) {
        window.FactoryUI.toast("Invalid or expired OTP", "error");
        return;
      }
      await window.FactoryDB.login(fullName, phone);
      window.FactoryUI.toast("Email Verified! Welcome " + fullName, "success");
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
    },
    submitLogin: async function() {
      const nameIn = document.getElementById("login-name");
      const phoneIn = document.getElementById("login-phone");
      const fullName = nameIn ? nameIn.value.trim() : "";
      const phone = phoneIn ? phoneIn.value.trim() : "";
      if (!fullName || phone.length < 10) {
        window.FactoryUI.toast("Enter full name and 10-digit mobile number", "error");
        return;
      }
      const btn = document.getElementById("login-submit-btn");
      if (btn) btn.textContent = "Connecting to Cloud...";
      if (window.FactoryDB) await window.FactoryDB.login(fullName, phone);
      if (btn) btn.textContent = "Continue Without OTP";
      window.FactoryUI.toast("Welcome, " + fullName + "!", "success");
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
    },
    ensureNonBlank: function() {
      setTimeout(function() {
        const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
        const v1 = document.getElementById("view-1");
        if (v1 && v1.innerHTML.trim().length < 20) {
          v1.innerHTML = '<div class="sf-hero-card">' +
            '<span class="sf-badge-live">LIVE ENGINE READY</span>' +
            '<h3 style="margin:8px 0 4px 0;color:#ffffff;">Welcome, ' + (u ? u.full_name : "User") + '</h3>' +
            '<p style="margin:0;color:#cbd5e1;font-size:13px;">Cloud sync & realtime engine active.</p></div>' +
            '<button type="button" onclick="FactoryNav.openQuickEntry()" style="width:100%;">+ Quick Cloud Entry</button>';
        }
        const v2 = document.getElementById("view-2");
        if (v2 && v2.innerHTML.trim().length < 20) {
          v2.innerHTML = '<div class="sf-card" style="margin-bottom:12px;"><h3 style="margin:0 0 6px 0;color:#38bdf8;">Quick Actions</h3>' +
            '<p style="margin:0 0 10px 0;color:#cbd5e1;font-size:13px;">Create records, share invite link, or open app guide.</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<button type="button" onclick="FactoryNav.openQuickEntry()">+ New Entry</button>' +
            '<button type="button" onclick="FactoryEngine.openReferShare()" style="background:#059669 !important;">Refer & Share</button></div></div>';
        }
        const v3 = document.getElementById("view-3");
        if (v3 && v3.innerHTML.trim().length < 20) {
          v3.innerHTML = '<div class="sf-card"><h3 style="margin:0 0 6px 0;color:#38bdf8;">Cloud Records</h3>' +
            '<p style="margin:0 0 10px 0;color:#cbd5e1;font-size:13px;">Tap below to add or refresh your synced cloud items.</p>' +
            '<button type="button" onclick="FactoryNav.openQuickEntry()" style="width:100%;">+ Add Record</button></div>';
        }
        const v4 = document.getElementById("view-4");
        if (v4 && v4.innerHTML.trim().length < 20) {
          v4.innerHTML = '<div class="sf-card"><h3 style="margin:0 0 8px 0;color:#ffffff;">My Profile</h3>' +
            '<p style="margin:4px 0;color:#cbd5e1;">Name: <b>' + (u ? u.full_name : "User") + '</b></p>' +
            '<p style="margin:4px 0;color:#cbd5e1;">Contact: <b>' + (u ? (u.email || u.phone) : "-") + '</b></p>' +
            '<p style="margin:4px 0;color:#34d399;">Points: <b>' + (u ? (u.points || 100) : 100) + ' Pts</b></p>' +
            '<button type="button" onclick="FactoryEngine.openReferShare()" style="width:100%;margin-top:10px;background:#0284c7 !important;">Refer & Earn Points</button>' +
            '<button type="button" onclick="FactoryNav.logout()" style="width:100%;margin-top:10px;background:#dc2626 !important;">Log Out</button></div>';
        }
        window.FactoryUI.refreshIcons();
      }, 450);
    },
    openQuickEntry: function() {
      window.FactoryNav.openDetail("Quick Entry", "<p>Add your first cloud record below.</p><input id=fb-t placeholder=Title style=margin-bottom:10px><button type=button onclick=FactoryNav.saveQuick()>Save to Cloud</button>");
    },
    saveQuick: async function() {
      const t = document.getElementById("fb-t");
      const val = t ? t.value.trim() : "Entry";
      if (window.FactoryDB) await window.FactoryDB.saveItem("record", val, { note: val });
      window.FactoryUI.toast("Saved to Supabase!", "success");
      window.FactoryNav.closeDetail();
    },
    logout: function() {
      if (window.FactoryDB) window.FactoryDB.logout();
      window.FactoryNav.closeDrawer();
      window.FactoryNav.showLogin();
      window.FactoryUI.toast("Logged out safely", "warn");
    }
  };

  window.FactorySound = {
    ctx: null,
    muted: localStorage.getItem("sf_muted") === "1",
    _play: function(freq, dur, type, vol) {
      if (window.FactorySound.muted) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!window.FactorySound.ctx) window.FactorySound.ctx = new AC();
        const c = window.FactorySound.ctx;
        if (c.state === "suspended") c.resume();
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type || "sine";
        o.frequency.setValueAtTime(freq, c.currentTime);
        g.gain.setValueAtTime(vol || 0.08, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + dur);
      } catch (e) {}
    },
    tap: function() { window.FactorySound._play(520, 0.05, "triangle", 0.05); },
    coin: function() {
      window.FactorySound._play(880, 0.08, "sine", 0.08);
      setTimeout(function() { window.FactorySound._play(1320, 0.14, "sine", 0.08); }, 70);
    },
    win: function() {
      window.FactorySound._play(523, 0.09, "triangle", 0.09);
      setTimeout(function() { window.FactorySound._play(659, 0.09, "triangle", 0.09); }, 85);
      setTimeout(function() { window.FactorySound._play(784, 0.16, "triangle", 0.1); }, 170);
    },
    error: function() { window.FactorySound._play(190, 0.16, "sawtooth", 0.06); },
    toggle: function() {
      window.FactorySound.muted = !window.FactorySound.muted;
      localStorage.setItem("sf_muted", window.FactorySound.muted ? "1" : "0");
      window.FactoryUI.toast(window.FactorySound.muted ? "Sound Muted" : "Arcade Sound ON", "info");
    }
  };

  window.FactoryPro = {
    claimDailyBonus: async function() {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem("sf_dbonus_" + (window.SF_APP_SLUG || "app")) === today) {
        window.FactoryUI.toast("Today's +50 Pts bonus already claimed!", "warn");
        return false;
      }
      localStorage.setItem("sf_dbonus_" + (window.SF_APP_SLUG || "app"), today);
      if (window.FactoryDB) await window.FactoryDB.recordTx("bonus", 50, "Daily Streak Bonus " + today);
      window.FactorySound.win();
      window.FactoryUI.confetti();
      window.FactoryUI.toast("+50 Daily Bonus Points Added!", "success");
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      return true;
    },
    scoreToken: function(pts) {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const raw = (u ? u.phone : "0") + ":" + String(pts || 0) + ":SF";
      let h = 0;
      for (let i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; }
      return "V1-" + Math.abs(h).toString(36).toUpperCase();
    },
    showProModal: function(planTitle, priceText) {
      window.FactorySound.tap();
      const body = '<div class="sf-hero-card" style="text-align:center;">' +
        '<span class="sf-badge-live">PRO UPGRADE</span>' +
        '<h3 style="margin:8px 0 4px 0;color:#fff;">' + (planTitle || "Pro Pass") + '</h3>' +
        '<div style="font-size:24px;font-weight:800;color:#fde047;margin:6px 0;">' + (priceText || "Rs. 149 / mo") + '</div>' +
        '<p style="font-size:12px;color:#e2e8f0;margin:0;">Ad-Free Experience, Unlimited Cloud Backup, Priority Sync &amp; Pro PDF Exports.</p></div>' +
        '<button type="button" onclick="FactoryPro.activateTrial()" style="width:100%;margin-top:10px;background:#10b981 !important;">Activate Free Trial</button>';
      window.FactoryNav.openDetail(planTitle || "Pro Membership", body);
    },
    activateTrial: function() {
      if (window.FactorySound) window.FactorySound.win();
      window.FactoryUI.confetti();
      window.FactoryUI.toast("Pro Trial Request Logged!", "success");
    }
  };

  window.FactoryGame = {
    _raf: null,
    _threeCleanup: null,
    isUnlocked: function(vId, freeByDefault) {
      if (freeByDefault) return true;
      try {
        const list = JSON.parse(localStorage.getItem("sf_unlock_" + (window.SF_APP_SLUG || "app")) || "[]");
        return list.indexOf(vId) !== -1;
      } catch (e) { return false; }
    },
    unlockVehicle: async function(vId, cost, label) {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const pts = u ? (u.points || 0) : 0;
      if (pts < cost) {
        if (window.FactorySound) window.FactorySound.error();
        window.FactoryUI.toast("Need " + cost + " Coins! You have " + pts + " Coins.", "warn");
        return false;
      }
      try {
        const key = "sf_unlock_" + (window.SF_APP_SLUG || "app");
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        if (list.indexOf(vId) === -1) list.push(vId);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (e) {}
      if (window.FactoryDB) await window.FactoryDB.recordTx("unlock", -cost, "Unlocked " + label);
      if (window.FactorySound) window.FactorySound.win();
      window.FactoryUI.confetti();
      window.FactoryUI.toast(label + " Unlocked!", "success");
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      return true;
    },
    openGmailSync: function() {
      const body = '<div class="sf-card"><h3 style="margin:0 0 6px 0;color:#fde047;">Sync Game Coins with Gmail</h3>' +
        '<p style="font-size:12px;color:#cbd5e1;margin:0 0 10px 0;">Optional: Link your Gmail to backup coins &amp; leaderboard rank.</p>' +
        '<div style="display:flex;gap:8px;margin-bottom:10px;"><input id="gm-email" type="email" placeholder="you@gmail.com" style="flex:1;">' +
        '<button type="button" onclick="FactoryGame.sendGmOtp()" style="background:#2563eb !important;">Send OTP</button></div>' +
        '<div id="gm-otp-box" style="display:none;gap:8px;"><input id="gm-otp" type="text" placeholder="6-digit OTP" style="flex:1;margin-bottom:8px;">' +
        '<button type="button" onclick="FactoryGame.verifyGmOtp()" style="width:100%;background:#10b981 !important;">Verify &amp; Sync</button></div></div>';
      window.FactoryNav.openDetail("Gmail Cloud Sync", body);
    },
    sendGmOtp: async function() {
      const em = document.getElementById("gm-email");
      const val = em ? em.value.trim() : "";
      if (!val || !val.includes("@")) { window.FactoryUI.toast("Enter valid Gmail", "error"); return; }
      const r = await window.FactoryDB.sendEmailOtp(val);
      if (r.ok) {
        const b = document.getElementById("gm-otp-box");
        if (b) b.style.display = "block";
        window.FactoryUI.toast("OTP sent to " + val, "success");
      } else { window.FactoryUI.toast("Could not send OTP", "error"); }
    },
    verifyGmOtp: async function() {
      const em = document.getElementById("gm-email");
      const ot = document.getElementById("gm-otp");
      const r = await window.FactoryDB.verifyEmailOtp(em ? em.value.trim() : "", ot ? ot.value.trim() : "");
      if (r.ok) {
        window.FactoryUI.toast("Gmail Synced!", "success");
        window.FactoryNav.closeDetail();
      } else { window.FactoryUI.toast("Invalid OTP", "error"); }
    },
    exitRace: function() {
      if (window.FactoryGame._raf) { cancelAnimationFrame(window.FactoryGame._raf); window.FactoryGame._raf = null; }
      if (window.FactoryGame._threeCleanup) { try { window.FactoryGame._threeCleanup(); } catch (e) {} window.FactoryGame._threeCleanup = null; }
      const ov = document.getElementById("sf-game-overlay");
      if (ov) ov.remove();
      try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
    },
    startVillageRace: function(vehicleName, accentColor) {
      window.FactoryGame.exitRace();
      const ov = document.createElement("div");
      ov.id = "sf-game-overlay";
      ov.style.cssText = "position:fixed;inset:0;z-index:99990;background:#090d1a;display:flex;flex-direction:column;justify-content:space-between;padding:8px;";
      ov.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(15,23,42,0.92);border-radius:12px;border:1px solid #f59e0b;gap:6px;">' +
          '<div style="color:#fde047;font-weight:800;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (vehicleName || "3D Racer") + '</div>' +
          '<div id="fg-hud" style="color:#ffffff;font-weight:800;font-size:12px;">Score: 0 | +0</div>' +
          '<div style="display:flex;gap:4px;">' +
            '<button id="fg-cam-btn" type="button" style="min-height:28px;padding:3px 8px;background:#2563eb !important;font-size:11px;">CAM</button>' +
            '<button id="fg-walk-btn" type="button" style="min-height:28px;padding:3px 8px;background:#059669 !important;font-size:11px;">WALK</button>' +
            '<button type="button" onclick="FactoryGame.exitRace()" style="min-height:28px;padding:3px 8px;background:#dc2626 !important;font-size:11px;">Exit</button>' +
          '</div>' +
        '</div>' +
        '<div id="fg-3d-wrap" style="width:100%;flex:1;min-height:240px;border-radius:14px;margin:6px 0;overflow:hidden;position:relative;"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">' +
          '<button id="fg-left" type="button" style="min-height:48px;background:#1e293b !important;border:2px solid #38bdf8;font-size:15px;font-weight:800;">STEER &larr;</button>' +
          '<button id="fg-boost" type="button" style="min-height:48px;background:linear-gradient(135deg,#f59e0b,#ef4444) !important;font-size:14px;font-weight:800;">NITRO / GO</button>' +
          '<button id="fg-right" type="button" style="min-height:48px;background:#1e293b !important;border:2px solid #38bdf8;font-size:15px;font-weight:800;">&rarr; STEER</button>' +
        '</div>';
      document.body.appendChild(ov);
      try { if (ov.requestFullscreen) ov.requestFullscreen().catch(function(){}); } catch (e) {}
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function(){}); } catch (e) {}

      const wrap = document.getElementById("fg-3d-wrap");
      if (typeof window.THREE === "undefined") {
        wrap.innerHTML = '<div style="padding:30px;color:#fff;text-align:center;">Loading 3D Engine...</div>';
        return;
      }
      const THREE = window.THREE;
      const W = wrap.clientWidth || 360, H = wrap.clientHeight || 420;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0ea5e9);
      scene.fog = new THREE.Fog(0x38bdf8, 22, 95);
      const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 140);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(W, H);
      wrap.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const sun = new THREE.DirectionalLight(0xfef08a, 0.95);
      sun.position.set(15, 30, 20);
      scene.add(sun);

      // Ground + 3D Highway + River Bridge
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 240), new THREE.MeshLambertMaterial({ color: 0x15803d }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.z = -80;
      scene.add(ground);

      const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 240), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.02;
      road.position.z = -80;
      scene.add(road);

      const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.4, 24), new THREE.MeshLambertMaterial({ color: 0x78350f }));
      bridgeDeck.position.set(0, 0.1, -55);
      scene.add(bridgeDeck);
      const river = new THREE.Mesh(new THREE.PlaneGeometry(120, 20), new THREE.MeshLambertMaterial({ color: 0x0284c7 }));
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, 0.05, -55);
      scene.add(river);

      // Village Roofed Huts & 3D Trees scrolling
      const scenery = [];
      for (let i = 0; i < 16; i++) {
        const z = -i * 12;
        const side = (i % 2 === 0) ? -1 : 1;
        const grp = new THREE.Group();
        const wall = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.2), new THREE.MeshLambertMaterial({ color: 0xfef3c7 }));
        wall.position.y = 1.1;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.6, 4), new THREE.MeshLambertMaterial({ color: 0xb91c1c }));
        roof.position.y = 3.0; roof.rotation.y = Math.PI / 4;
        grp.add(wall); grp.add(roof);
        grp.position.set(side * 9.5, 0, z);
        scene.add(grp);
        scenery.push(grp);

        const tGrp = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.0, 6), new THREE.MeshLambertMaterial({ color: 0x78350f }));
        trunk.position.y = 1.0;
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.0, 7), new THREE.MeshLambertMaterial({ color: 0x16a34a }));
        leaves.position.y = 3.1;
        tGrp.add(trunk); tGrp.add(leaves);
        tGrp.position.set(-side * 8.0, 0, z - 5);
        scene.add(tGrp);
        scenery.push(tGrp);
      }

      // 3D Player Vehicle + 3D Driver Character
      const car = new THREE.Group();
      const bodyCol = accentColor ? new THREE.Color(accentColor) : new THREE.Color(0xef4444);
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 3.2), new THREE.MeshLambertMaterial({ color: bodyCol }));
      chassis.position.y = 0.55;
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 1.6), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
      cabin.position.set(0, 1.15, -0.1);
      car.add(chassis); car.add(cabin);
      car.position.set(0, 0, 0);
      scene.add(car);

      const walker = new THREE.Group();
      const wBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.4), new THREE.MeshLambertMaterial({ color: 0xfacc15 }));
      wBody.position.y = 0.8;
      const wHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshLambertMaterial({ color: 0xfde68a }));
      wHead.position.y = 1.55;
      walker.add(wBody); walker.add(wHead);
      walker.visible = false;
      scene.add(walker);

      // Coins & Obstacles
      const items = [];
      for (let j = 0; j < 10; j++) {
        const isCoin = j % 3 !== 0;
        const m = new THREE.Mesh(
          isCoin ? new THREE.CylinderGeometry(0.55, 0.55, 0.15, 12) : new THREE.BoxGeometry(1.4, 1.1, 1.4),
          new THREE.MeshLambertMaterial({ color: isCoin ? 0xfacc15 : 0xdc2626 })
        );
        if (isCoin) m.rotation.x = Math.PI / 2;
        m.userData = { isCoin: isCoin, lane: (j % 3) - 1 };
        m.position.set(m.userData.lane * 2.8, 0.7, -22 - j * 14);
        scene.add(m);
        items.push(m);
      }

      let lane = 0, camMode = 0, walkMode = false, speed = 0.42, score = 0, coins = 0, alive = true, wx = 2.5, wz = 0;
      document.getElementById("fg-cam-btn").onclick = function() {
        camMode = (camMode + 1) % 3;
        if (window.FactorySound) window.FactorySound.tap();
        window.FactoryUI.toast(["Chase Cam", "Driver Seat Cam", "Top 3D Cam"][camMode], "info");
      };
      document.getElementById("fg-walk-btn").onclick = function() {
        walkMode = !walkMode;
        walker.visible = walkMode;
        if (walkMode) { wx = car.position.x + 2.2; wz = car.position.z; walker.position.set(wx, 0, wz); }
        this.textContent = walkMode ? "DRIVE" : "WALK";
        if (window.FactorySound) window.FactorySound.tap();
      };
      document.getElementById("fg-left").onclick = function() {
        if (walkMode) { wx -= 1.2; } else { lane = Math.max(-1, lane - 1); }
        if (window.FactorySound) window.FactorySound.tap();
      };
      document.getElementById("fg-right").onclick = function() {
        if (walkMode) { wx += 1.2; } else { lane = Math.max(-1, Math.min(1, lane + 1)); }
        if (window.FactorySound) window.FactorySound.tap();
      };
      document.getElementById("fg-boost").onclick = function() {
        if (walkMode) { wz -= 2.0; } else { speed = Math.min(0.9, speed + 0.12); }
        if (window.FactorySound) window.FactorySound.coin();
      };

      window.FactoryGame._threeCleanup = function() { try { renderer.dispose(); } catch (e) {} };

      function animate() {
        if (!alive || !document.getElementById("fg-3d-wrap")) return;
        if (walkMode) {
          walker.position.x += (wx - walker.position.x) * 0.2;
          walker.position.z += (wz - walker.position.z) * 0.2;
          camera.position.set(walker.position.x, 3.4, walker.position.z + 5.5);
          camera.lookAt(walker.position.x, 1.2, walker.position.z - 6);
        } else {
          car.position.x += (lane * 2.8 - car.position.x) * 0.18;
          for (let i = 0; i < scenery.length; i++) {
            scenery[i].position.z += speed;
            if (scenery[i].position.z > 14) scenery[i].position.z -= 180;
          }
          bridgeDeck.position.z += speed; river.position.z += speed;
          if (bridgeDeck.position.z > 20) { bridgeDeck.position.z = -120; river.position.z = -120; }
          for (let j = 0; j < items.length; j++) {
            const it = items[j];
            it.position.z += speed;
            if (it.userData.isCoin) it.rotation.z += 0.08;
            if (Math.abs(it.position.z - car.position.z) < 1.8 && Math.abs(it.position.x - car.position.x) < 1.5) {
              if (it.userData.isCoin) {
                coins += 10; score += 25;
                it.position.z = -130;
                if (window.FactorySound) window.FactorySound.coin();
              } else {
                alive = false;
                if (window.FactorySound) window.FactorySound.error();
                const finalScore = score + 50;
                if (window.FactoryDB) {
                  window.FactoryDB.saveItem("race", (vehicleName || "3D Race") + " (" + finalScore + ")", { score: finalScore, coins: coins });
                  window.FactoryDB.recordTx("xp", coins, "3D Race Coins");
                }
                window.FactoryUI.toast("Race Finished! Score: " + finalScore + " | +" + coins + " Coins", "success");
                setTimeout(function() { window.FactoryGame.exitRace(); if (typeof window.onAppReady === "function") window.onAppReady(); }, 900);
                return;
              }
            }
            if (it.position.z > 8) { it.position.z = -130; score += 5; }
          }
          if (camMode === 0) { camera.position.set(car.position.x * 0.5, 3.8, 6.8); camera.lookAt(car.position.x, 1.0, -14); }
          else if (camMode === 1) { camera.position.set(car.position.x, 1.65, -0.6); camera.lookAt(car.position.x, 1.3, -24); }
          else { camera.position.set(0, 16, 4); camera.lookAt(0, 0, -18); }
        }
        const hud = document.getElementById("fg-hud");
        if (hud) hud.textContent = "Score: " + score + " | +" + coins + " Coins";
        renderer.render(scene, camera);
        window.FactoryGame._raf = requestAnimationFrame(animate);
      }
      window.FactoryGame._raf = requestAnimationFrame(animate);
    },
    startSpinWheel: function(title) {
      const body = '<div class="sf-hero-card" style="text-align:center;"><h3>' + (title || "Lucky Spin Wheel") + '</h3>' +
        '<div id="spin-res" style="font-size:28px;font-weight:800;color:#fde047;margin:14px 0;">READY TO SPIN</div>' +
        '<button type="button" onclick="FactoryGame._doSpin()" style="width:100%;background:linear-gradient(135deg,#f59e0b,#ef4444) !important;">SPIN NOW</button></div>';
      window.FactoryNav.openDetail(title || "Spin & Win", body);
    },
    _doSpin: async function() {
      const prizes = [10, 25, 50, 75, 100];
      const won = prizes[Math.floor(Math.random() * prizes.length)];
      const el = document.getElementById("spin-res");
      if (el) el.textContent = "+" + won + " COINS WON!";
      if (window.FactorySound) window.FactorySound.win();
      window.FactoryUI.confetti();
      if (window.FactoryDB) await window.FactoryDB.recordTx("xp", won, "Spin Wheel Reward");
      window.FactoryUI.toast("Won +" + won + " Coins!", "success");
    },
    startCharacterRunner: function(charName, accentColor) {
      window.FactoryGame.exitRace();
      const ov = document.createElement("div");
      ov.id = "sf-game-overlay";
      ov.style.cssText = "position:fixed;inset:0;z-index:99990;background:#090d1a;display:flex;flex-direction:column;justify-content:space-between;padding:8px;";
      ov.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;background:rgba(15,23,42,0.92);border-radius:12px;border:1px solid #10b981;">' +
          '<div style="color:#34d399;font-weight:800;font-size:13px;">' + (charName || "Village Runner") + '</div>' +
          '<div id="fg-hud" style="color:#fde047;font-weight:800;font-size:13px;">Score: 0 | +0 Coins</div>' +
          '<button type="button" onclick="FactoryGame.exitRace()" style="min-height:30px;padding:4px 12px;background:#dc2626 !important;font-size:12px;">Exit</button>' +
        '</div>' +
        '<canvas id="fg-canvas" style="width:100%;flex:1;min-height:240px;border-radius:14px;margin:6px 0;display:block;"></canvas>' +
        '<button id="fg-jump" type="button" style="min-height:54px;background:linear-gradient(135deg,#10b981,#0284c7) !important;font-size:17px;font-weight:800;">TAP TO JUMP</button>';
      document.body.appendChild(ov);
      const cvs = document.getElementById("fg-canvas");
      const ctx = cvs.getContext("2d");
      cvs.width = cvs.clientWidth || 360; cvs.height = cvs.clientHeight || 380;
      let py = cvs.height - 80, vy = 0, groundY = cvs.height - 56, score = 0, coins = 0, alive = true, frame = 0;
      const obs = [];
      document.getElementById("fg-jump").onclick = function() {
        if (py >= groundY - 4) { vy = -12.5; if (window.FactorySound) window.FactorySound.tap(); }
      };
      function loop() {
        if (!alive || !document.getElementById("fg-canvas")) return;
        const W = cvs.width, H = cvs.height;
        ctx.fillStyle = "#0ea5e9"; ctx.fillRect(0, 0, W, groundY);
        ctx.fillStyle = "#15803d"; ctx.fillRect(0, groundY, W, H - groundY);
        vy += 0.65; py = Math.min(groundY, py + vy);
        ctx.fillStyle = accentColor || "#f59e0b"; ctx.fillRect(48, py - 38, 28, 38);
        frame++;
        if (frame % 55 === 0) obs.push({ x: W + 20, coin: Math.random() < 0.55 });
        for (let i = obs.length - 1; i >= 0; i--) {
          const o = obs[i]; o.x -= 5;
          if (o.coin) { ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(o.x, groundY - 56, 11, 0, 6.28); ctx.fill(); }
          else { ctx.fillStyle = "#dc2626"; ctx.fillRect(o.x, groundY - 28, 22, 28); }
          if (Math.abs(o.x - 62) < 22 && ((o.coin && py < groundY - 20) || (!o.coin && py > groundY - 26))) {
            if (o.coin) { coins += 10; obs.splice(i, 1); if (window.FactorySound) window.FactorySound.coin(); }
            else {
              alive = false; if (window.FactorySound) window.FactorySound.error();
              if (window.FactoryDB) window.FactoryDB.recordTx("xp", coins, "Runner Coins");
              window.FactoryUI.toast("Run Over! +" + coins + " Coins", "success");
              setTimeout(function() { window.FactoryGame.exitRace(); if (typeof window.onAppReady === "function") window.onAppReady(); }, 800);
              return;
            }
          } else if (o.x < -30) { obs.splice(i, 1); score += 10; }
        }
        const hud = document.getElementById("fg-hud");
        if (hud) hud.textContent = "Score: " + score + " | +" + coins + " Coins";
        window.FactoryGame._raf = requestAnimationFrame(loop);
      }
      window.FactoryGame._raf = requestAnimationFrame(loop);
    }
  };

  window.FactoryEngine = {
    rtSocket: null,
    copyUserId: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const uid = "SF" + String((u && u.phone) ? u.phone : "100001").slice(-6);
      try { navigator.clipboard.writeText(uid); } catch (e) {}
      window.FactoryUI.toast("Copied ID: " + uid, "success");
    },
    openReferShare: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const code = "SF" + String((u && u.phone) ? u.phone : "100001").slice(-6);
      const msg = "Join me on " + document.title + "! Use my referral code " + code + " to get started.";
      const waUrl = "https://wa.me/?text=" + encodeURIComponent(msg);
      const body = '<div class="sf-hero-card" style="text-align:center;">' +
        '<div style="font-size:12px;color:#cbd5e1;">YOUR UNIQUE REFERRAL CODE</div>' +
        '<div style="font-size:24px;font-weight:800;color:#34d399;letter-spacing:2px;margin:8px 0;">' + code + '</div>' +
        '<p style="font-size:12px;color:#e2e8f0;margin:0;">Share with friends to earn +25 bonus points on every invite.</p></div>' +
        '<button type="button" onclick="FactoryEngine.triggerShare()" style="width:100%;margin-bottom:10px;background:#10b981 !important;">Share via App / Copy</button>' +
        '<a href="' + waUrl + '" target="_blank" style="display:block;text-align:center;padding:12px;border-radius:12px;background:#16a34a;color:#fff;font-weight:700;text-decoration:none;">Share on WhatsApp</a>';
      window.FactoryNav.openDetail("Refer & Share", body);
    },
    triggerShare: async function(code) {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const finalCode = code || ("SF" + String((u && u.phone) ? u.phone : "100001").slice(-6));
      const msg = "Join me on " + document.title + "! Referral Code: " + finalCode;
      if (navigator.share) {
        try { await navigator.share({ title: document.title, text: msg }); } catch (e) {}
      } else {
        try { navigator.clipboard.writeText(msg); } catch (e) {}
      }
      window.FactoryUI.toast("Invite link ready & +25 Pts logged!", "success");
      window.FactoryUI.confetti();
    },
    openTutorial: function() {
      const custom = window.APP_TUTORIAL_HTML || ('<div class="sf-card"><h3 style="margin:0 0 8px 0;color:#38bdf8;">How to Use ' + document.title + '</h3>' +
        '<p style="color:#cbd5e1;font-size:13px;line-height:1.5;">1. Use bottom floating tabs to switch Home, Actions, Records & Profile.<br>' +
        '2. Tap any card to open its full detail view and use Back to return.<br>' +
        '3. Tap the + button anytime for quick cloud actions synced with Supabase.</p></div>');
      window.FactoryNav.openDetail("App Guide & Tutorial", custom);
    },
    openNotifications: function() {
      const u = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
      const html = '<div class="sf-list-row"><div><strong style="color:#fff;">Cloud Sync Active</strong><div style="font-size:12px;color:#94a3b8;">Connected to live Supabase Realtime</div></div><span class="sf-badge-live">LIVE</span></div>' +
        '<div class="sf-list-row"><div><strong style="color:#fff;">Welcome ' + (u ? u.full_name : "User") + '</strong><div style="font-size:12px;color:#94a3b8;">Your session & points are synced.</div></div><span class="sf-badge-live">OK</span></div>';
      window.FactoryNav.openDetail("Notifications", html);
    },
    startRealtime: function(onDataChange) {
      if (window.FactoryEngine.rtSocket) return;
      try {
        const ws = new WebSocket("wss://saexbzapfzfkzqkunsom.supabase.co/realtime/v1/websocket?apikey=sb_publishable_3YZ2OA5MiOoVoLqFCXcsxw_JIjNlEjY&vsn=1.0.0");
        window.FactoryEngine.rtSocket = ws;
        ws.onopen = function() {
          ws.send(JSON.stringify({ topic: "realtime:public:factory_app_items", event: "phx_join", payload: {}, ref: "1" }));
        };
        ws.onmessage = function(ev) {
          try {
            const msg = JSON.parse(ev.data);
            if (msg && (msg.event === "INSERT" || msg.event === "UPDATE" || msg.event === "DELETE" || msg.event === "postgres_changes")) {
              if (typeof onDataChange === "function") onDataChange(msg);
            }
          } catch (e) {}
        };
        setInterval(function() {
          if (ws.readyState === 1) ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" }));
        }, 25000);
      } catch (e) {}
    }
  };

  window.addEventListener("popstate", function() {
    const d = document.getElementById("view-detail");
    if (d && d.style.display === "block") window.FactoryNav.closeDetail();
    const m = document.getElementById("app-modal");
    if (m && m.classList.contains("open")) window.FactoryUI.closeModal();
  });

  document.addEventListener("DOMContentLoaded", async function() {
    setTimeout(function() {
      const sp = document.getElementById("splash-screen");
      if (sp) sp.classList.add("hide");
    }, 850);
    window.FactoryUI.refreshIcons();
    const existing = window.FactoryDB ? window.FactoryDB.getUserSync() : null;
    if (existing) {
      window.FactoryNav.showAppShell();
      if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
      window.FactoryNav.ensureNonBlank();
      window.FactoryEngine.startRealtime(function() {
        if (typeof window.onAppReady === "function") { try { window.onAppReady(); } catch (e) {} }
      });
    } else {
      if (window.SF_REACTOR_MODE === "GAMING" && window.FactoryDB) {
        await window.FactoryDB.login("Player_" + String(Math.floor(100 + Math.random() * 899)), "9000000000");
        window.FactoryNav.showAppShell();
        if (typeof window.onAppReady === "function") { try { await window.onAppReady(); } catch (e) {} }
        window.FactoryNav.ensureNonBlank();
        return;
      }
      const ob = document.getElementById("onboarding-screen");
      if (ob && !localStorage.getItem("sf_ob_" + (window.SF_APP_SLUG || "app"))) {
        ob.style.display = "flex";
      } else {
        window.FactoryNav.showLogin();
      }
    }
  });
})();
