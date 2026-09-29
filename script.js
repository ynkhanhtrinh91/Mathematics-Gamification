/* =====================================================
   HỆ THỐNG TÍCH ĐIỂM & RANK LỚP TOÁN - script.js
   ===================================================== */

// ---------- CẤU HÌNH FIREBASE (TÙY CHỌN) ----------
// Để trống apiKey => dữ liệu lưu trong trình duyệt (localStorage).
// Điền đủ thông tin => tự đồng bộ Firebase Realtime Database.
const firebaseConfig = {
    apiKey: "AIzaSyDdyJR5uRBXYNY0pwsn0Z9HjQLQfZ7pUYM",
    authDomain: "mathematics-gamification.firebaseapp.com",
    databaseURL: "https://mathematics-gamification-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mathematics-gamification",
    storageBucket: "mathematics-gamification.appspot.com",
    messagingSenderId: "80715844517",
    appId: "1:80715844517:web:01e542c95c6373e097364c",
    measurementId: "G-J6P9F1PVF7"
};

// ---------- DỮ LIỆU MẶC ĐỊNH ----------
// !!! ĐỔI TÀI KHOẢN / MẬT KHẨU Ở ĐÂY !!!
const initialData = {
    accounts: {
        teacher: { password: "teacher123", role: "teacher", name: "Trình Yến Khanh" },
        hung: { password: "hung123", role: "student", name: "Hưng" },
        nhio: { password: "nhio123", role: "student", name: "Bạn Nhỏ" }
    },
    students: {
        hung: { name: "Hưng", xp: 0, streak: 0, lastStreakDate: "", testScore: null, history: [], cards: { hintCard: 0, homeworkCard: 0 } },
        nhio: { name: "Bạn Nhỏ", xp: 0, streak: 0, lastStreakDate: "", testScore: null, history: [], cards: { hintCard: 0, homeworkCard: 0 } }
    },
    homeworks: [],
    notifications: [],
    schedule: { planned: 8, completed: 0 }
};

const STORAGE_KEY = "mathClassData_v1";
const TUITION_PER_SESSION = 150000;
const RANKS = [
    { id: "bar-dong", name: "Rank Đồng", icon: "🥉", min: 0, bonus: 0, perk: "Bắt đầu hành trình, tích XP mỗi buổi học." },
    { id: "bar-bac", name: "Rank Bạc", icon: "🥈", min: 20, bonus: 0.25, perk: "Mở khóa đổi Thẻ Gợi Ý Bài Khó. +0.25 điểm ưu tiên." },
    { id: "bar-vang", name: "Rank Vàng", icon: "🥇", min: 45, bonus: 0.5, perk: "+0.5 điểm ưu tiên khi tổng kết tháng." },
    { id: "bar-bachkim", name: "Rank Bạch Kim", icon: "💎", min: 75, bonus: 0.75, perk: "+0.75 điểm ưu tiên khi tổng kết tháng." },
    { id: "bar-kimcuong", name: "Rank Kim Cương", icon: "👑", min: 110, bonus: 1, perk: "+1 điểm ưu tiên khi tổng kết tháng." }
];

// ---------- BIẾN TOÀN CỤC ----------
let currentUser = null;
let selectedStudentKey = "hung";
let db = null;
let storageRef = null;
let appData = loadLocal() || JSON.parse(JSON.stringify(initialData));
normalizeData();

// ---------- KHỞI TẠO FIREBASE ----------
try {
    if (typeof firebase !== "undefined" && firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        if (firebase.storage && firebaseConfig.storageBucket) storageRef = firebase.storage().ref();
        db.ref("appData").on("value", snap => {
            const val = snap.val();
            if (val) {
                appData = val;
                normalizeData();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
                if (currentUser) renderAll();
            } else {
                saveData();
            }
        });
    }
} catch (err) {
    console.warn("Không kết nối được Firebase, dùng localStorage:", err);
    db = null;
}

// ---------- LƯU / TẢI DỮ LIỆU ----------
function loadLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function saveData() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch (e) { console.warn("Không lưu được localStorage:", e); }
    if (db) db.ref("appData").set(appData).catch(e => console.warn("Lỗi lưu Firebase:", e));
}

function normalizeData() {
    if (!appData.accounts || Object.keys(appData.accounts).length === 0) appData.accounts = JSON.parse(JSON.stringify(initialData.accounts));
    if (!appData.students) appData.students = JSON.parse(JSON.stringify(initialData.students));
    Object.keys(appData.students).forEach(k => {
        const s = appData.students[k];
        s.xp = s.xp || 0;
        s.streak = s.streak || 0;
        s.history = s.history || [];
        s.cards = s.cards || {};
        s.cards.hintCard = s.cards.hintCard || 0;
        s.cards.homeworkCard = s.cards.homeworkCard || 0;
        if (s.testScore === undefined) s.testScore = null;
    });
    appData.homeworks = appData.homeworks || [];
    appData.notifications = appData.notifications || [];
    appData.schedule = appData.schedule || { planned: 8, completed: 0 };
}

// ---------- TIỆN ÍCH ----------
function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function fmtDateTime(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function isTeacher() { return currentUser && currentUser.role === "teacher"; }
function getStudent() { return appData.students[selectedStudentKey]; }
function getRankIndex(xp) {
    let idx = 0;
    RANKS.forEach((r, i) => { if (xp >= r.min) idx = i; });
    return idx;
}
function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 1.5 * 1024 * 1024) { reject(new Error("File quá lớn (>1.5MB) khi chưa dùng được Firebase Storage.")); return; }
        const fr = new FileReader();
        fr.onload = () => resolve({ name: file.name, url: fr.result });
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}
function readFile(file) {
    if (!storageRef) return readAsDataURL(file);
    const ref = storageRef.child("pdf/" + Date.now() + "_" + file.name);
    return ref.put(file).then(() => ref.getDownloadURL()).then(url => ({ name: file.name, url }))
        .catch(err => { console.warn("Storage lỗi, chuyển sang lưu trực tiếp:", err); return readAsDataURL(file); });
}

// ---------- ĐĂNG NHẬP ----------
function handleLogin() {
    const userEl = document.getElementById("username");
    const passEl = document.getElementById("password");
    const userVal = userEl ? userEl.value.trim() : "";
    const passVal = passEl ? passEl.value.trim() : "";
    const loginError = document.getElementById("login-error");

    const accounts = (appData && appData.accounts && Object.keys(appData.accounts).length > 0)
        ? appData.accounts
        : initialData.accounts;

    const account = accounts ? accounts[userVal] : null;

    if (account && account.password === passVal) {
        currentUser = { username: userVal, ...account };
        if (loginError) loginError.textContent = "";

        // Mở Dashboard
        initDashboard();
    } else {
        if (loginError) loginError.textContent = "Tài khoản hoặc mật khẩu không đúng!";
    }
}

function handleLogout() {
    currentUser = null;
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");
    if (appScreen) { appScreen.style.cssText = "display: none !important;"; appScreen.classList.add("hidden"); }
    if (loginScreen) { loginScreen.style.cssText = ""; loginScreen.classList.remove("hidden"); }
    const p = document.getElementById("password");
    if (p) p.value = "";
}

function initDashboard() {
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");
    const teacherControls = document.getElementById("teacher-controls");
    const actionPanel = document.getElementById("action-panel");
    const studentSelector = document.getElementById("student-selector");
    const studentRules = document.getElementById("student-rules-panel");

    // 1. Ẩn màn hình đăng nhập
    if (loginScreen) {
        loginScreen.style.cssText = "display: none !important;";
        loginScreen.classList.add("hidden");
    }

    // 2. Hiện Dashboard chính
    if (appScreen) {
        appScreen.style.cssText = "display: block !important;";
        appScreen.classList.remove("hidden");
    }

    if (!appData || !appData.students) {
        appData = initialData;
    }

    // 3. Cập nhật thông tin Header
    const userDisplay = document.getElementById("user-display");
    const roleBadge = document.getElementById("role-badge");
    if (userDisplay) userDisplay.textContent = currentUser.name || currentUser.username;
    if (roleBadge) roleBadge.textContent = currentUser.role === "teacher" ? "Giáo Viên" : "Học Sinh";

    const teacherHwCard = document.getElementById("teacher-hw-create");
    const teacherNotifCard = document.getElementById("teacher-notif-control");

    // 4. Phân quyền Giáo viên / Học sinh
    if (currentUser.role === "teacher") {
        if (teacherControls) teacherControls.classList.remove("hidden");
        if (actionPanel) actionPanel.classList.remove("hidden");
        if (teacherHwCard) teacherHwCard.classList.remove("hidden");
        if (teacherNotifCard) teacherNotifCard.classList.remove("hidden");
        if (studentSelector) selectedStudentKey = studentSelector.value;
        if (studentRules) studentRules.classList.add("hidden");
    } else {
        if (teacherControls) teacherControls.classList.add("hidden");
        if (actionPanel) actionPanel.classList.add("hidden");
        if (teacherHwCard) teacherHwCard.classList.add("hidden");
        if (teacherNotifCard) teacherNotifCard.classList.add("hidden");
        selectedStudentKey = currentUser.username;
        if (studentRules) studentRules.classList.remove("hidden");
    }

    // 5. Render toàn bộ dữ liệu các Tab
    try {
        renderAll();
    } catch (err) {
        console.warn("Lỗi render dữ liệu:", err);
    }
}

// Tự động trừ 10 XP nếu quá hạn mà chưa nộp BTVN (chỉ áp dụng cho bài tạo sau khi có tính năng này)
function applyHomeworkPenalties() {
    let changed = false;
    const now = Date.now();
    appData.homeworks.forEach(hw => {
        if (!hw.penalty || now <= new Date(hw.deadline).getTime()) return;
        hw.penalized = hw.penalized || {};
        Object.keys(appData.students).forEach(key => {
            const sub = hw.submissions && hw.submissions[key];
            if (sub || hw.penalized[key]) return;
            const st = appData.students[key];
            st.xp = Math.max(0, st.xp - 10);
            pushHistory(st, -10, "Không làm BTVN: " + hw.title);
            hw.penalized[key] = true;
            changed = true;
        });
    });
    if (changed) saveData();
    return changed;
}

function renderAll() {
    applyHomeworkPenalties();
    renderStudentData();
    renderHomeworks();
    renderTuitionAndCalendar();
    renderNotifications();
}

// ---------- TAB 1: RANK & XP ----------
function renderStudentData() {
    const s = getStudent();
    if (!s) return;
    const xp = s.xp;
    const ri = getRankIndex(xp);
    const rank = RANKS[ri];
    const next = RANKS[ri + 1];

    document.getElementById("student-name").textContent = s.name;
    document.getElementById("rank-badge").textContent = rank.name;
    document.getElementById("chart-current-rank").textContent = rank.name;
    document.getElementById("current-xp").textContent = xp;
    document.getElementById("streak-count").textContent = s.streak;

    const nextText = document.getElementById("next-rank-text");
    const fill = document.getElementById("progress-fill");
    if (next) {
        nextText.textContent = "Tiếp theo: " + next.min + " XP";
        const pct = Math.max(0, Math.min(100, ((xp - rank.min) / (next.min - rank.min)) * 100));
        fill.style.width = pct + "%";
    } else {
        nextText.textContent = "Đã đạt Rank cao nhất!";
        fill.style.width = "100%";
    }

    RANKS.forEach((r, i) => {
        const el = document.getElementById(r.id);
        if (el) el.classList.toggle("active", i === ri);
    });

    // Điểm thi cuối tháng
    const testInput = document.getElementById("test-score");
    if (testInput) testInput.value = s.testScore == null ? "" : s.testScore;
    const test = s.testScore == null ? 0 : Number(s.testScore);
    const xpScore = Math.min(10, (xp / 110) * 10);
    const bonus = rank.bonus;
    const final = Math.min(10, test * 0.7 + xpScore * 0.3 + bonus);
    document.getElementById("converted-xp-score").textContent = xpScore.toFixed(1) + " / 10";
    document.getElementById("rank-bonus-score").textContent = "+" + bonus + " điểm";
    document.getElementById("final-score").textContent = final.toFixed(1);
    document.getElementById("lego-reward").classList.toggle("hidden", !(s.testScore != null && final >= 9.0));

    // Lịch sử
    const list = document.getElementById("history-list");
    const items = s.history.slice().reverse();
    list.innerHTML = items.length === 0
        ? '<li style="color:#94a3b8;">Chưa có lịch sử tích điểm.</li>'
        : items.map(h => {
            const cls = h.xp > 0 ? "plus" : (h.xp < 0 ? "minus" : "");
            const txt = h.xp > 0 ? "+" + h.xp + " XP" : (h.xp < 0 ? h.xp + " XP" : "Thẻ");
            return `<li><span>${esc(h.reason)} <small style="color:#94a3b8;font-weight:500;">(${fmtDateTime(h.time)})</small></span><span class="${cls}">${txt}</span></li>`;
        }).join("");

    // Kho thẻ
    document.getElementById("card-hint-count").textContent = s.cards.hintCard;
    document.getElementById("card-homework-count").textContent = s.cards.homeworkCard;
    const tcc = document.getElementById("teacher-card-control");
    if (tcc) tcc.classList.toggle("hidden", !isTeacher());

    renderRankGuide();
}

function renderRankGuide() {
    const box = document.getElementById("rank-guide-list");
    if (!box) return;
    box.innerHTML = RANKS.map((r, i) => {
        const range = RANKS[i + 1] ? r.min + " - " + (RANKS[i + 1].min - 1) + " XP" : r.min + "+ XP";
        return `<div class="rank-card-guide"><h4>${r.icon} ${r.name} (${range})</h4><p>${r.perk}</p></div>`;
    }).join("");
}

function pushHistory(s, xp, reason) {
    s.history.push({ xp, reason, time: Date.now() });
}

function addXP(amount, reason) {
    if (!isTeacher()) return;
    const s = getStudent();
    if (!s) return;
    s.xp = Math.max(0, s.xp + amount);
    pushHistory(s, amount, reason);

    // Streak: buổi có điểm cộng => +1, điểm trừ => reset
    const today = todayStr();
    if (amount < 0) {
        s.streak = 0;
    } else if (s.lastStreakDate !== today) {
        s.lastStreakDate = today;
        s.streak += 1;
        if (s.streak > 0 && s.streak % 3 === 0) {
            s.xp += 1;
            pushHistory(s, 1, "Bonus chuỗi tập trung " + s.streak + " buổi");
        }
    }
    saveData();
    renderStudentData();
}

function updateTestScore() {
    if (!isTeacher()) return;
    const input = document.getElementById("input-test-score");
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 0 || val > 10) { alert("Vui lòng nhập điểm từ 0 đến 10."); return; }
    getStudent().testScore = val;
    input.value = "";
    saveData();
    renderStudentData();
}

function redeemReward(cost, cardKey, cardName) {
    const s = getStudent();
    if (!s) return;
    if (cardKey === "hintCard" && getRankIndex(s.xp) < 1) { alert("Cần từ Rank Bạc để đổi thẻ này."); return; }
    if (s.xp < cost) { alert("Không đủ XP để đổi thẻ (cần " + cost + " XP)."); return; }
    s.xp -= cost;
    s.cards[cardKey] += 1;
    pushHistory(s, -cost, "Đổi " + cardName);
    saveData();
    renderStudentData();
}

function useCard(cardKey, delta, reason) {
    if (!isTeacher()) return;
    const s = getStudent();
    if (!s) return;
    if (s.cards[cardKey] + delta < 0) { alert("Học sinh không còn thẻ này!"); return; }
    s.cards[cardKey] += delta;
    pushHistory(s, 0, reason);
    saveData();
    renderStudentData();
}

function resetMonthlyRank() {
    if (!isTeacher()) return;
    if (!confirm("Reset XP, chuỗi, điểm thi và lịch sử của TẤT CẢ học sinh cho tháng mới?")) return;
    Object.keys(appData.students).forEach(k => {
        const s = appData.students[k];
        s.xp = 0; s.streak = 0; s.lastStreakDate = ""; s.testScore = null; s.history = [];
    });
    appData.schedule.completed = 0;
    saveData();
    renderAll();
}

// ---------- TAB 2: BÀI TẬP VỀ NHÀ ----------
function hwStatus(hw, key) {
    const sub = hw.submissions && hw.submissions[key];
    const deadline = new Date(hw.deadline).getTime();
    if (sub) return sub.time > deadline ? "late" : "done";
    return Date.now() > deadline ? "late" : "pending";
}

function renderHomeworks() {
    const box = document.getElementById("hw-list");
    if (!box) return;
    const list = appData.homeworks.slice().reverse();
    const counts = { done: 0, pending: 0, late: 0 };

    box.innerHTML = list.length === 0
        ? '<p style="color:#94a3b8;text-align:center;">Chưa có bài tập nào.</p>'
        : list.map(hw => {
            const st = hwStatus(hw, selectedStudentKey);
            counts[st]++;
            const sub = hw.submissions && hw.submissions[selectedStudentKey];
            const label = { done: "Đã nộp", pending: "Đang tới hạn", late: sub ? "Nộp trễ" : "Quá hạn" }[st];
            let html = `<div class="hw-card-item status-${st}">
                <div class="hw-header-row"><div><h4>${esc(hw.title)}</h4>${hw.desc ? `<p style="margin:0 0 .4rem;font-size:.85rem;">${esc(hw.desc)}</p>` : ""}</div>
                <div style="display:flex;gap:.5rem;align-items:center;"><span class="hw-status-badge">${label}</span>${isTeacher() ? `<button class="btn-danger" onclick="deleteHomework('${hw.id}')" title="Xóa bài tập"><i class="fas fa-trash"></i> Xóa</button>` : ""}</div></div>
                <div class="hw-deadline-text"><i class="fas fa-clock"></i> Hạn nộp: ${fmtDateTime(hw.deadline)}</div>`;
            if (hw.fileUrl) html += `<a class="btn-pdf-download" href="${hw.fileUrl}" download="${esc(hw.fileName || "de-bai.pdf")}" target="_blank"><i class="fas fa-file-pdf"></i> Tải đề bài PDF</a>`;

            if (!isTeacher()) {
                html += `<div class="hw-file-upload-box"><label style="font-size:.82rem;font-weight:700;">${sub ? "Bài đã nộp: " + esc(sub.fileName) + " — nộp lại:" : "Nộp bài (PDF):"}</label>
                    <input type="file" id="sub-file-${hw.id}" accept="application/pdf" style="font-size:.85rem;display:block;margin:.4rem 0;">
                    <button class="btn-primary" onclick="submitHomework('${hw.id}')">Nộp bài</button></div>`;
                if (sub && sub.score != null) html += `<div class="hw-grading-box"><b>Điểm: ${sub.score}/10</b>${sub.score >= 9.5 ? " 🎉 (+2 XP thưởng)" : ""}</div>`;
            } else if (sub) {
                html += `<div class="hw-grading-box"><a class="btn-pdf-download" href="${sub.fileUrl}" download="${esc(sub.fileName)}" target="_blank"><i class="fas fa-file-pdf"></i> Bài nộp: ${esc(sub.fileName)}</a><br>
                    <input type="number" id="grade-${hw.id}" min="0" max="10" step="0.25" placeholder="Chấm điểm..." value="${sub.score == null ? "" : sub.score}" style="width:110px;">
                    <button class="btn-primary" onclick="gradeHomework('${hw.id}')">Lưu điểm</button>
                    <small style="display:block;margin-top:.3rem;">Điểm ≥ 9.5 sẽ tự động được thưởng +2 XP (một lần).</small></div>`;
            } else {
                html += `<small style="color:#94a3b8;">Học sinh chưa nộp bài.</small>`;
            }
            return html + "</div>";
        }).join("");

    const total = counts.done + counts.pending + counts.late;
    const pDone = total ? (counts.done / total) * 100 : 0;
    const pPend = total ? (counts.pending / total) * 100 : 0;
    const pLate = total ? (counts.late / total) * 100 : 0;
    const setArc = (id, len, offset) => {
        const el = document.getElementById(id);
        if (el) { el.setAttribute("stroke-dasharray", len.toFixed(1) + ", 100"); el.setAttribute("stroke-dashoffset", (-offset).toFixed(1)); }
    };
    setArc("donut-done", pDone, 0);
    setArc("donut-pending", pPend, pDone);
    setArc("donut-late", pLate, pDone + pPend);
    document.getElementById("donut-percentage").textContent = Math.round(pDone) + "%";
}

function submitHomework(id) {
    const input = document.getElementById("sub-file-" + id);
    const hw = appData.homeworks.find(h => h.id === id);
    if (!hw || !input || !input.files[0]) { alert("Vui lòng chọn file PDF để nộp."); return; }
    readFile(input.files[0]).then(f => {
        hw.submissions = hw.submissions || {};
        hw.submissions[selectedStudentKey] = { fileName: f.name, fileUrl: f.url, time: Date.now(), score: null };
        saveData();
        renderHomeworks();
    }).catch(err => alert("Lỗi nộp bài: " + err.message));
}

function gradeHomework(id) {
    if (!isTeacher()) return;
    const hw = appData.homeworks.find(h => h.id === id);
    const sub = hw && hw.submissions && hw.submissions[selectedStudentKey];
    const val = parseFloat(document.getElementById("grade-" + id).value);
    if (!sub || isNaN(val) || val < 0 || val > 10) { alert("Vui lòng nhập điểm từ 0 đến 10."); return; }
    sub.score = val;
    if (val >= 9.5 && !sub.rewarded) {
        sub.rewarded = true;
        const s = getStudent();
        s.xp += 2;
        pushHistory(s, 2, "BTVN đạt " + val + " điểm: " + hw.title);
    }
    saveData();
    renderHomeworks();
    renderStudentData();
}

function deleteHomework(id) {
    if (!isTeacher()) return;
    const hw = appData.homeworks.find(h => h.id === id);
    if (!hw) return;
    if (!confirm("Xóa bài tập \"" + hw.title + "\"? Bài nộp và điểm của học sinh cho bài này cũng sẽ bị xóa.")) return;
    appData.homeworks = appData.homeworks.filter(h => h.id !== id);
    saveData();
    renderHomeworks();
}

function handleCreateHomework(e) {
    e.preventDefault();
    if (!isTeacher()) return;
    const title = document.getElementById("hw-title").value.trim();
    const desc = document.getElementById("hw-desc").value.trim();
    const deadline = document.getElementById("hw-deadline").value;
    const fileInput = document.getElementById("teacher-hw-file");
    if (!title || !deadline) return;

    const finish = f => {
        appData.homeworks.push({
            id: "hw" + Date.now(), title, desc, deadline, penalty: true, penalized: {},
            fileName: f ? f.name : "", fileUrl: f ? f.url : "", submissions: {}
        });
        saveData();
        document.getElementById("create-hw-form").reset();
        renderHomeworks();
    };
    if (fileInput.files[0]) readFile(fileInput.files[0]).then(finish).catch(err => alert("Lỗi tải file: " + err.message));
    else finish(null);
}

// ---------- TAB 3: HỌC PHÍ & LỊCH ----------
function getMakeupDays() {
    const now = new Date();
    const days = [];
    appData.notifications.forEach(n => {
        if (n.type !== "makeup") return;
        const m = String(n.content).match(/(\d{1,2})[\/\-.](\d{1,2})/);
        if (m && parseInt(m[2], 10) === now.getMonth() + 1) days.push(parseInt(m[1], 10));
    });
    return days;
}

function renderTuitionAndCalendar() {
    const now = new Date();
    const planned = document.getElementById("planned-sessions-input");
    const completed = document.getElementById("completed-sessions-input");
    if (planned) planned.value = appData.schedule.planned;
    if (completed) completed.value = appData.schedule.completed;
    document.getElementById("total-tuition-display").textContent =
        (appData.schedule.planned * TUITION_PER_SESSION).toLocaleString("vi-VN") + " VNĐ";
    document.getElementById("current-month-display").textContent =
        String(now.getMonth() + 1).padStart(2, "0") + "/" + now.getFullYear();

    const grid = document.getElementById("calendar-days-grid");
    const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const makeup = getMakeupDays();
    let html = "";
    for (let i = 0; i < first; i++) html += "<div></div>";
    for (let d = 1; d <= total; d++) {
        const dow = new Date(now.getFullYear(), now.getMonth(), d).getDay();
        let cls = "cal-day";
        if (d === now.getDate()) cls += " today";
        if (makeup.includes(d)) cls += " makeup-class";
        else if ([2, 5, 6].includes(dow)) cls += " has-class";
        const dot = cls.includes("class") ? '<span class="class-dot"></span>' : "";
        html += `<div class="${cls}">${d}${dot}</div>`;
    }
    grid.innerHTML = html;
}

function handleSessionInputs() {
    const p = parseInt(document.getElementById("planned-sessions-input").value, 10);
    const c = parseInt(document.getElementById("completed-sessions-input").value, 10);
    appData.schedule.planned = isNaN(p) ? 0 : p;
    appData.schedule.completed = isNaN(c) ? 0 : c;
    saveData();
    renderTuitionAndCalendar();
}

// ---------- THÔNG BÁO ----------
function renderNotifications() {
    const list = document.getElementById("notif-list");
    const badge = document.getElementById("notif-badge");
    const items = appData.notifications.slice().reverse();
    list.innerHTML = items.length === 0
        ? '<li class="empty-notif">Không có thông báo mới</li>'
        : items.map(n => `<li class="notif-item">${n.type === "makeup" ? "📅" : "🔔"} ${esc(n.content)}<span class="notif-time">${fmtDateTime(n.time)}</span></li>`).join("");

    const seenKey = "notifSeen_" + (currentUser ? currentUser.username : "");
    const seen = parseInt(localStorage.getItem(seenKey) || "0", 10);
    const unread = appData.notifications.filter(n => n.time > seen).length;
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
}

function handleCreateNotif(e) {
    e.preventDefault();
    if (!isTeacher()) return;
    const content = document.getElementById("notif-content").value.trim();
    if (!content) return;
    appData.notifications.push({
        id: "n" + Date.now(),
        type: document.getElementById("notif-type").value,
        content, time: Date.now()
    });
    saveData();
    document.getElementById("create-notif-form").reset();
    renderNotifications();
    renderTuitionAndCalendar();
}

// ---------- GẮN SỰ KIỆN GIAO DIỆN ----------
function bindUI() {
    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };

    on("logout-btn", "click", handleLogout);
    on("student-selector", "change", e => { selectedStudentKey = e.target.value; renderAll(); });
    on("create-hw-form", "submit", handleCreateHomework);
    on("create-notif-form", "submit", handleCreateNotif);
    on("planned-sessions-input", "change", handleSessionInputs);
    on("completed-sessions-input", "change", handleSessionInputs);

    // Sidebar thu gọn
    on("sidebar-toggle-btn", "click", () => document.getElementById("sidebar").classList.toggle("collapsed"));

    // Chuyển tab
    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            const tab = document.getElementById(btn.dataset.tab);
            if (tab) tab.classList.add("active");
        });
    });

    // Chuông thông báo
    on("notif-bell-btn", "click", e => {
        e.stopPropagation();
        const dd = document.getElementById("notif-dropdown");
        dd.classList.toggle("hidden");
        if (!dd.classList.contains("hidden") && currentUser) {
            localStorage.setItem("notifSeen_" + currentUser.username, String(Date.now()));
            document.getElementById("notif-badge").classList.add("hidden");
        }
    });
    document.addEventListener("click", e => {
        const dd = document.getElementById("notif-dropdown");
        if (dd && !dd.contains(e.target)) dd.classList.add("hidden");
    });

    // Modal cẩm nang rank
    const modal = document.getElementById("guide-modal");
    const openModal = () => { renderRankGuide(); modal.classList.remove("hidden"); modal.style.display = "flex"; };
    const closeModal = () => { modal.classList.add("hidden"); modal.style.display = "none"; };
    on("guide-btn", "click", openModal);
    on("close-modal", "click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
}

bindUI();
// Kiểm tra quá hạn BTVN mỗi phút khi đang đăng nhập
setInterval(() => { if (currentUser && applyHomeworkPenalties()) renderAll(); }, 60000);
