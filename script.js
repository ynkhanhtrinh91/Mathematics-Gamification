// 1. CẤU HÌNH FIREBASE CHUẨN
const firebaseConfig = {
    apiKey: "AIzaSyDdyJR5uRBXYNY0pwsn0Z9HjQLQfZ7pUYM",
    authDomain: "mathematics-gamification.firebaseapp.com",
    databaseURL: "https://mathematics-gamification-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mathematics-gamification",
    storageBucket: "mathematics-gamification.firebasestorage.app",
    messagingSenderId: "80715844517",
    appId: "1:80715844517:web:01e542c95c6373e097364c",
    measurementId: "G-J6P9F1PVF7"
};

// Khởi tạo Firebase
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.database() : null;

// 2. CẤU HÌNH RANK
const RANKS = [
    { id: "dong", name: "🥉 Rank Đồng (Tập Sự)", minXP: 0, maxXP: 19, benefit: "Mức khởi đầu học tập trong tháng.", bonusExam: 0 },
    { id: "bac", name: "🥈 Rank Bạc (Thợ Săn Dạng Toán)", minXP: 20, maxXP: 44, benefit: "Mở khóa 1 Thẻ Gợi Ý Bài Khó trong giờ học.", bonusExam: 0 },
    { id: "vang", name: "🥇 Rank Vàng (Chiến Binh)", minXP: 45, maxXP: 74, benefit: "Mở khóa Thẻ Gợi Ý + Thưởng phần quà nhỏ.", bonusExam: 0.25 },
    { id: "bachkim", name: "💎 Rank Bạch Kim (Cao Thủ)", minXP: 75, maxXP: 109, benefit: "Thẻ Miễn 1 bài BTVN + Tuyên dương gửi Phụ huynh.", bonusExam: 0.5 },
    { id: "kimcuong", name: "👑 Rank Kim Cương (Chiến tướng)", minXP: 110, maxXP: 9999, benefit: "Nhận Bằng Chứng Nhận + Nhận bộ LEGO (khi DTK >= 9.0).", bonusExam: 1.0 }
];

// 3. DỮ LIỆU BAN ĐẦU
const initialData = {
    accounts: {
        admin: { password: "123456", role: "teacher", name: "Trình Yến Khanh" },
        hung: { password: "123456", role: "student", name: "Hưng" },
        nhio: { password: "123456", role: "student", name: "Bạn Nhỏ" }
    },
    students: {
        hung: { name: "Hưng", xp: 0, streak: 0, testScore: 0, hintCard: 0, homeworkCard: 0, history: [], plannedSessions: 8, completedSessions: 0 },
        nhio: { name: "Bạn Nhỏ", xp: 0, streak: 0, testScore: 0, hintCard: 0, homeworkCard: 0, history: [], plannedSessions: 8, completedSessions: 0 }
    },
    homeworks: {},
    notifications: []
};

let appData = initialData;
let currentUser = null;
let selectedStudentKey = "hung";

// 4. LẮNG NGHE DỮ LIỆU REALTIME
if (db) {
    db.ref("app_data").on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appData = data;
            if (!appData.homeworks) appData.homeworks = {};
            if (!appData.notifications) appData.notifications = [];
            if (currentUser) {
                renderStudentData();
                renderHomeworks();
                renderTuitionAndCalendar();
                renderNotifications();
            }
        }
    });
}

// KHỞI TẠO CÁC SỰ KIỆN SAU KHI DOM TẢI XONG
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const studentSelector = document.getElementById("student-selector");
    const guideModal = document.getElementById("guide-modal");

    // ĐĂNG NHẬP
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const userVal = document.getElementById("username").value.trim();
            const passVal = document.getElementById("password").value.trim();

            const account = appData.accounts ? appData.accounts[userVal] : null;
            if (account && account.password === passVal) {
                currentUser = { username: userVal, ...account };
                if (loginError) loginError.textContent = "";
                initDashboard();
            } else {
                if (loginError) loginError.textContent = "Tài khoản hoặc mật khẩu không đúng!";
            }
        });
    }

    // ĐĂNG XUẤT
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            currentUser = null;
            const appScreen = document.getElementById("app-screen");
            const loginScreen = document.getElementById("login-screen");
            if (appScreen) {
                appScreen.style.display = "none";
                appScreen.classList.add("hidden");
            }
            if (loginScreen) loginScreen.classList.remove("hidden");
        });
    }

    // TAB NAV & SIDEBAR CONTROLS
    const sidebar = document.getElementById("sidebar");
    const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
    const navItems = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(n => n.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            item.classList.add("active");
            const targetTab = item.getAttribute("data-tab");
            const targetEl = document.getElementById(targetTab);
            if (targetEl) targetEl.classList.add("active");
        });
    });

    // CHUÔNG THÔNG BÁO DROPDOWN
    const notifBellBtn = document.getElementById("notif-bell-btn");
    const notifDropdown = document.getElementById("notif-dropdown");
    if (notifBellBtn && notifDropdown) {
        notifBellBtn.addEventListener("click", () => {
            notifDropdown.classList.toggle("hidden");
        });
    }

    // MODAL HƯỚNG DẪN RANK
    const guideBtn = document.getElementById("guide-btn");
    const closeModal = document.getElementById("close-modal");

    if (guideBtn && guideModal) {
        guideBtn.addEventListener("click", () => {
            renderRankGuideModal();
            guideModal.style.display = "flex";
            guideModal.classList.remove("hidden");
        });
    }
    if (closeModal && guideModal) {
        closeModal.addEventListener("click", () => {
            guideModal.style.display = "none";
            guideModal.classList.add("hidden");
        });
    }

    // CHỌN HỌC SINH (GIÁO VIÊN)
    if (studentSelector) {
        studentSelector.addEventListener("change", (e) => {
            selectedStudentKey = e.target.value;
            renderStudentData();
            renderHomeworks();
            renderTuitionAndCalendar();
        });
    }

    // FORM GIAO BÀI TẬP CÓ ĐÍNH KÈM FILE PDF TỪ GIÁO VIÊN
    const createHwForm = document.getElementById("create-hw-form");
    if (createHwForm) {
        createHwForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!currentUser || currentUser.role !== "teacher") return;

            const title = document.getElementById("hw-title").value.trim();
            const desc = document.getElementById("hw-desc").value.trim();
            const deadline = document.getElementById("hw-deadline").value;
            const teacherFileInput = document.getElementById("teacher-hw-file");

            let attachedFileName = "";
            if (teacherFileInput && teacherFileInput.files[0]) {
                attachedFileName = teacherFileInput.files[0].name;
            }

            const hwId = "hw_" + Date.now();
            if (!appData.homeworks) appData.homeworks = {};

            appData.homeworks[hwId] = {
                id: hwId,
                title,
                desc,
                deadline,
                teacherPdf: attachedFileName,
                createdAt: new Date().toISOString(),
                submissions: {}
            };

            saveToFirebase();
            createHwForm.reset();
            alert("Đã giao bài tập mới thành công!");
        });
    }

    // FORM THÔNG BÁO
    const createNotifForm = document.getElementById("create-notif-form");
    if (createNotifForm) {
        createNotifForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!currentUser || currentUser.role !== "teacher") return;

            const type = document.getElementById("notif-type").value;
            const content = document.getElementById("notif-content").value.trim();

            const now = new Date();
            const dateStr = `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

            if (!appData.notifications) appData.notifications = [];

            appData.notifications.push({
                type,
                content,
                date: dateStr,
                day: now.getDate()
            });

            saveToFirebase();
            createNotifForm.reset();
            alert("Đã gửi thông báo tới học sinh!");
        });
    }
});

function initDashboard() {
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");
    const teacherControls = document.getElementById("teacher-controls");
    const actionPanel = document.getElementById("action-panel");
    const studentSelector = document.getElementById("student-selector");

    if (loginScreen) loginScreen.classList.add("hidden");
    if (appScreen) {
        appScreen.style.display = "block";
        appScreen.classList.remove("hidden");
    }

    const userDisplay = document.getElementById("user-display");
    const roleBadge = document.getElementById("role-badge");
    if (userDisplay) userDisplay.textContent = currentUser.name;
    if (roleBadge) roleBadge.textContent = currentUser.role === "teacher" ? "Giáo Viên" : "Học Sinh";

    const teacherHwCard = document.getElementById("teacher-hw-create");
    const teacherNotifCard = document.getElementById("teacher-notif-control");

    if (currentUser.role === "teacher") {
        if (teacherControls) teacherControls.classList.remove("hidden");
        if (actionPanel) actionPanel.classList.remove("hidden");
        if (teacherHwCard) teacherHwCard.classList.remove("hidden");
        if (teacherNotifCard) teacherNotifCard.classList.remove("hidden");
        if (studentSelector) selectedStudentKey = studentSelector.value;
    } else {
        if (teacherControls) teacherControls.classList.add("hidden");
        if (actionPanel) actionPanel.classList.add("hidden");
        if (teacherHwCard) teacherHwCard.classList.add("hidden");
        if (teacherNotifCard) teacherNotifCard.classList.add("hidden");
        selectedStudentKey = currentUser.username;
    }

    renderStudentData();
    renderHomeworks();
    renderTuitionAndCalendar();
    renderNotifications();
}

// RENDER DỮ LIỆU TAB 1
function renderStudentData() {
    if (!appData.students || !appData.students[selectedStudentKey]) return;
    const student = appData.students[selectedStudentKey];

    const studentNameEl = document.getElementById("student-name");
    const currentXpEl = document.getElementById("current-xp");
    const streakCountEl = document.getElementById("streak-count");

    if (studentNameEl) studentNameEl.textContent = student.name;
    if (currentXpEl) currentXpEl.textContent = student.xp || 0;
    if (streakCountEl) streakCountEl.textContent = student.streak || 0;

    const hintEl = document.getElementById("card-hint-count");
    const hwEl = document.getElementById("card-homework-count");
    if (hintEl) hintEl.textContent = student.hintCard || 0;
    if (hwEl) hwEl.textContent = student.homeworkCard || 0;

    const teacherCardPanel = document.getElementById("teacher-card-control");
    if (teacherCardPanel) {
        if (currentUser && currentUser.role === "teacher") {
            teacherCardPanel.classList.remove("hidden");
        } else {
            teacherCardPanel.classList.add("hidden");
        }
    }

    const currentRank = RANKS.find(r => (student.xp || 0) >= r.minXP && (student.xp || 0) <= r.maxXP) || RANKS[0];
    const rankBadge = document.getElementById("rank-badge");
    const chartCurrentRank = document.getElementById("chart-current-rank");
    if (rankBadge) rankBadge.textContent = currentRank.name;
    if (chartCurrentRank) chartCurrentRank.textContent = currentRank.name;

    const nextRank = RANKS.find(r => r.minXP > (student.xp || 0));
    const nextRankText = document.getElementById("next-rank-text");
    const progressFill = document.getElementById("progress-fill");

    if (nextRank) {
        if (nextRankText) nextRankText.textContent = `Tiếp theo: ${nextRank.minXP} XP`;
        const percentage = Math.min(100, Math.max(0, (((student.xp || 0) - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100));
        if (progressFill) progressFill.style.width = `${percentage}%`;
    } else {
        if (nextRankText) nextRankText.textContent = "Đã đạt Rank Cao Thủ!";
        if (progressFill) progressFill.style.width = "100%";
    }

    document.querySelectorAll(".bar-group").forEach(el => el.classList.remove("active"));
    const activeBar = document.getElementById(`bar-${currentRank.id}`);
    if (activeBar) activeBar.classList.add("active");

    const testScore = student.testScore || 0;
    const testScoreInput = document.getElementById("test-score");
    if (testScoreInput) testScoreInput.value = testScore;

    const convertedXPScore = Math.min(10, parseFloat(((student.xp || 0) / 3).toFixed(1))); 
    const convertedXpScoreEl = document.getElementById("converted-xp-score");
    const rankBonusScoreEl = document.getElementById("rank-bonus-score");
    if (convertedXpScoreEl) convertedXpScoreEl.textContent = `${convertedXPScore} / 10`;
    if (rankBonusScoreEl) rankBonusScoreEl.textContent = `+${currentRank.bonusExam} điểm`;

    const finalScore = parseFloat((convertedXPScore * 0.3 + testScore * 0.7 + currentRank.bonusExam).toFixed(2));
    const finalScoreEl = document.getElementById("final-score");
    if (finalScoreEl) finalScoreEl.textContent = finalScore;

    const legoReward = document.getElementById("lego-reward");
    if (legoReward) {
        if (finalScore >= 9.0) {
            legoReward.classList.remove("hidden");
        } else {
            legoReward.classList.add("hidden");
        }
    }

    const historyList = document.getElementById("history-list");
    if (historyList) {
        historyList.innerHTML = "";
        if (student.history) {
            student.history.slice().reverse().forEach(item => {
                const li = document.createElement("li");
                const isPlus = item.amount > 0;
                li.innerHTML = `
                    <span>${item.reason} <small>(${item.date})</small></span>
                    <span class="${isPlus ? 'plus' : 'minus'}">${isPlus ? '+' : ''}${item.amount} XP</span>
                `;
                historyList.appendChild(li);
            });
        }
    }
}

function renderRankGuideModal() {
    const guideList = document.getElementById("rank-guide-list");
    if (!guideList) return;
    guideList.innerHTML = "";
    RANKS.forEach(rank => {
        const div = document.createElement("div");
        div.className = "rank-card-guide";
        div.innerHTML = `
            <h4>${rank.name} (${rank.minXP} - ${rank.maxXP === 9999 ? '∞' : rank.maxXP} XP)</h4>
            <p><b>🎁 Quyền lợi:</b> ${rank.benefit}</p>
            <p><b>📈 Điểm ưu tiên bài thi cuối tháng:</b> <code>+${rank.bonusExam} điểm</code></p>
        `;
        guideList.appendChild(div);
    });
}

function addXP(amount, reason) {
    if (!currentUser || currentUser.role !== "teacher") return;
    const student = appData.students[selectedStudentKey];
    student.xp = Math.max(0, (student.xp || 0) + amount);

    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${now.getMinutes()}`;
    
    if (!student.history) student.history = [];
    student.history.push({ amount, reason, date: dateStr });
    saveToFirebase();
}

function updateTestScore() {
    if (!currentUser || currentUser.role !== "teacher") return;
    const inputEl = document.getElementById("input-test-score");
    const val = parseFloat(inputEl.value);
    if (isNaN(val) || val < 0 || val > 10) {
        alert("Điểm thi phải từ 0 đến 10!");
        return;
    }
    appData.students[selectedStudentKey].testScore = val;
    saveToFirebase();
    inputEl.value = "";
}

function resetMonthlyRank() {
    if (!currentUser || currentUser.role !== "teacher") return;
    if (confirm("Bạn có chắc chắn muốn RESET điểm XP và số buổi tập trung về 0 để bắt đầu tháng mới?")) {
        const now = new Date();
        const dateStr = `Đầu tháng ${now.getMonth() + 1}`;

        Object.keys(appData.students).forEach(key => {
            appData.students[key].xp = 0;
            appData.students[key].streak = 0;
            appData.students[key].testScore = 0;
            if (!appData.students[key].history) appData.students[key].history = [];
            appData.students[key].history.push({
                amount: 0,
                reason: "🏆 Reset Rank & Số buổi đầu tháng mới",
                date: dateStr
            });
        });
        saveToFirebase();
        alert("Đã reset Rank thành công!");
    }
}

function redeemReward(cost, cardType, rewardName) {
    const student = appData.students[selectedStudentKey];
    if ((student.xp || 0) < cost) {
        alert("Rất tiếc! Em chưa đủ số điểm XP để đổi thẻ này.");
        return;
    }
    if (confirm(`Bạn có chắc muốn dùng ${cost} XP để đổi "${rewardName}"?`)) {
        student.xp -= cost;
        student[cardType] = (student[cardType] || 0) + 1;
        
        const now = new Date();
        if (!student.history) student.history = [];
        student.history.push({
            amount: -cost,
            reason: `🛒 Đổi quà: ${rewardName} (+1 thẻ)`,
            date: `${now.getDate()}/${now.getMonth() + 1}`
        });
        saveToFirebase();
        alert(`Đã đổi thành công 1 ${rewardName}!`);
    }
}

function useCard(cardType, amount, reason) {
    if (!currentUser || currentUser.role !== "teacher") return;
    const student = appData.students[selectedStudentKey];
    
    if ((student[cardType] || 0) <= 0 && amount < 0) {
        alert("Học sinh này hiện không còn thẻ này để sử dụng!");
        return;
    }

    if (confirm(`Xác nhận dùng 1 thẻ của học sinh?`)) {
        student[cardType] = Math.max(0, (student[cardType] || 0) + amount);
        
        const now = new Date();
        if (!student.history) student.history = [];
        student.history.push({
            amount: 0,
            reason: `🎫 ${reason}`,
            date: `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${now.getMinutes()}`
        });
        saveToFirebase();
    }
}

// BÀI TẬP VỀ NHÀ (TAB 2)
function renderHomeworks() {
    const hwListEl = document.getElementById("hw-list");
    if (!hwListEl) return;
    hwListEl.innerHTML = "";

    const hwKeys = Object.keys(appData.homeworks || {});
    if (hwKeys.length === 0) {
        hwListEl.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Chưa có bài tập nào được giao.</p>`;
        updateDonutChart(0, 0, 0);
        return;
    }

    let totalDone = 0;
    let totalPending = 0;
    let totalLate = 0;

    hwKeys.reverse().forEach(key => {
        const hw = appData.homeworks[key];
        const studentSub = (hw.submissions && hw.submissions[selectedStudentKey]) ? hw.submissions[selectedStudentKey] : null;

        const deadlineDate = new Date(hw.deadline);
        const now = new Date();

        let statusClass = "status-pending";
        let statusText = "Đang tới hạn";

        if (studentSub && studentSub.submittedAt) {
            statusClass = "status-done";
            statusText = "Đã nộp bài";
            totalDone++;
        } else if (now > deadlineDate) {
            statusClass = "status-late";
            statusText = "Quá hạn nộp";
            totalLate++;
        } else {
            totalPending++;
        }

        const div = document.createElement("div");
        div.className = `hw-card-item ${statusClass}`;

        const formattedDeadline = `${deadlineDate.getDate()}/${deadlineDate.getMonth() + 1}/${deadlineDate.getFullYear()} ${deadlineDate.getHours()}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`;

        div.innerHTML = `
            <div class="hw-header-row">
                <h4>${hw.title}</h4>
                <span class="hw-status-badge">${statusText}</span>
            </div>
            ${hw.desc ? `<p style="font-size: 0.88rem; color: var(--text-muted); margin: 0.3rem 0;">${hw.desc}</p>` : ''}
            <div class="hw-deadline-text"><i class="far fa-clock"></i> Hạn nộp: <b>${formattedDeadline}</b></div>
            
            ${hw.teacherPdf ? `<a href="#" onclick="alert('Đang mở file đề bài: ${hw.teacherPdf}'); return false;" class="btn-pdf-download"><i class="fas fa-file-pdf"></i> Tải / Xem Đề Bài PDF: <b>${hw.teacherPdf}</b></a>` : ''}

            ${renderSubmissionArea(hw.id, studentSub)}
        `;

        hwListEl.appendChild(div);
    });

    updateDonutChart(totalDone, totalPending, totalLate);
}

function renderSubmissionArea(hwId, studentSub) {
    if (currentUser && currentUser.role === "student") {
        if (studentSub && studentSub.submittedAt) {
            return `
                <div class="hw-file-upload-box" style="background: #f0fdf4;">
                    <p style="margin: 0; font-size: 0.85rem; color: #166534;">
                        <i class="fas fa-check-circle"></i> <b>File đã nộp:</b> ${studentSub.fileName || 'Bài_Tập.pdf'} 
                        <br><small>Nộp lúc: ${studentSub.submittedAt}</small>
                    </p>
                    ${studentSub.score !== undefined ? `<p style="margin: 0.4rem 0 0 0; font-size: 0.9rem; font-weight: 800; color: var(--primary);">💯 Điểm giáo viên chấm: ${studentSub.score}/10</p>` : '<p style="margin: 0.4rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Đang chờ giáo viên chấm điểm...</p>'}
                </div>
            `;
        } else {
            return `
                <div class="hw-file-upload-box">
                    <label style="display:block; font-size: 0.82rem; font-weight:800; margin-bottom: 0.4rem;">Upload file PDF bài làm để nộp:</label>
                    <input type="file" id="file-${hwId}" accept="application/pdf" style="font-size: 0.8rem; margin-bottom: 0.5rem;">
                    <button onclick="submitHomework('${hwId}')" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="fas fa-upload"></i> Nộp Bài PDF</button>
                </div>
            `;
        }
    } else {
        if (studentSub && studentSub.submittedAt) {
            return `
                <div class="hw-grading-box">
                    <p style="margin:0 0 0.4rem 0; font-size: 0.85rem;">📄 File bài làm của học sinh: <b>${studentSub.fileName}</b></p>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="number" id="grade-${hwId}" min="0" max="10" step="0.5" placeholder="Điểm (/10)" value="${studentSub.score !== undefined ? studentSub.score : ''}" style="width: 100px; padding: 0.4rem;">
                        <button onclick="gradeHomework('${hwId}')" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="fas fa-check"></i> Chấm Điểm</button>
                    </div>
                </div>
            `;
        } else {
            return `<p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem;">Học sinh chưa nộp bài tập này.</p>`;
        }
    }
}

function submitHomework(hwId) {
    const fileInput = document.getElementById(`file-${hwId}`);
    if (!fileInput || !fileInput.files[0]) {
        alert("Vui lòng chọn 1 file PDF để nộp!");
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== "application/pdf") {
        alert("Chỉ chấp nhận file định dạng PDF!");
        return;
    }

    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!appData.homeworks[hwId].submissions) appData.homeworks[hwId].submissions = {};

    appData.homeworks[hwId].submissions[currentUser.username] = {
        fileName: file.name,
        submittedAt: dateStr
    };

    saveToFirebase();
    alert("Nộp bài tập PDF thành công!");
}

function gradeHomework(hwId) {
    if (!currentUser || currentUser.role !== "teacher") return;
    const scoreVal = parseFloat(document.getElementById(`grade-${hwId}`).value);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
        alert("Điểm chấm phải từ 0 đến 10!");
        return;
    }

    const sub = appData.homeworks[hwId].submissions[selectedStudentKey];
    const prevScore = sub.score;
    sub.score = scoreVal;

    if (scoreVal > 9 && (prevScore === undefined || prevScore <= 9)) {
        addXP(1, `🎯 Thưởng BTVN Xuất Sắc (${scoreVal}đ)`);
        alert(`Đã chấm ${scoreVal} điểm! Tự động cộng +1 XP hoàn thành BTVN xuất sắc cho học sinh.`);
    } else {
        saveToFirebase();
        alert(`Đã lưu điểm ${scoreVal} cho bài tập!`);
    }
}

function updateDonutChart(done, pending, late) {
    const total = done + pending + late;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    const percentEl = document.getElementById("donut-percentage");
    if (percentEl) percentEl.textContent = `${percentage}%`;

    const donePath = document.getElementById("donut-done");
    const pendingPath = document.getElementById("donut-pending");
    const latePath = document.getElementById("donut-late");

    if (!donePath || total === 0) return;

    const doneP = (done / total) * 100;
    const pendingP = (pending / total) * 100;
    const lateP = (late / total) * 100;

    donePath.setAttribute("stroke-dasharray", `${doneP}, 100`);
    donePath.setAttribute("stroke-dashoffset", "0");

    pendingPath.setAttribute("stroke-dasharray", `${pendingP}, 100`);
    pendingPath.setAttribute("stroke-dashoffset", `-${doneP}`);

    latePath.setAttribute("stroke-dasharray", `${lateP}, 100`);
    latePath.setAttribute("stroke-dashoffset", `-${doneP + pendingP}`);
}

// HỌC PHÍ & LỊCH HỌC (TAB 3)
function renderTuitionAndCalendar() {
    const student = appData.students[selectedStudentKey];
    if (!student) return;

    const plannedInput = document.getElementById("planned-sessions-input");
    const completedInput = document.getElementById("completed-sessions-input");
    const tuitionDisplay = document.getElementById("total-tuition-display");

    if (plannedInput && completedInput) {
        plannedInput.value = student.plannedSessions || 8;
        completedInput.value = student.completedSessions || 0;

        const totalTuition = (student.plannedSessions || 8) * 150000;
        if (tuitionDisplay) tuitionDisplay.textContent = totalTuition.toLocaleString('vi-VN') + " VNĐ";

        if (currentUser && currentUser.role === "teacher") {
            plannedInput.disabled = false;
            completedInput.disabled = false;

            plannedInput.onchange = () => {
                student.plannedSessions = parseInt(plannedInput.value) || 0;
                saveToFirebase();
            };
            completedInput.onchange = () => {
                student.completedSessions = parseInt(completedInput.value) || 0;
                saveToFirebase();
            };
        } else {
            plannedInput.disabled = true;
            completedInput.disabled = true;
        }
    }

    renderVisualCalendar();
}

function renderVisualCalendar() {
    const calGrid = document.getElementById("calendar-days-grid");
    const monthDisplay = document.getElementById("current-month-display");
    if (!calGrid) return;

    calGrid.innerHTML = "";
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (monthDisplay) monthDisplay.textContent = `${currentMonth + 1}/${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "cal-day empty";
        emptyDiv.style.opacity = "0.2";
        calGrid.appendChild(emptyDiv);
    }

    const makeupDays = [];
    (appData.notifications || []).forEach(n => {
        if (n.type === "makeup" && n.day) {
            makeupDays.push(parseInt(n.day));
        }
    });

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(currentYear, currentMonth, day);
        const dayOfWeek = dateObj.getDay();

        const isFixedClass = (dayOfWeek === 2 || dayOfWeek === 5 || dayOfWeek === 6);
        const isMakeup = makeupDays.includes(day);
        const isToday = (day === now.getDate());

        const dayDiv = document.createElement("div");
        let dayClasses = "cal-day";
        if (isToday) dayClasses += " today";
        if (isFixedClass) dayClasses += " has-class";
        if (isMakeup) dayClasses += " makeup-class";

        dayDiv.className = dayClasses;
        dayDiv.innerHTML = `
            <span>${day}</span>
            ${(isFixedClass || isMakeup) ? '<span class="class-dot"></span>' : ''}
        `;

        calGrid.appendChild(dayDiv);
    }
}

// THÔNG BÁO & CHUÔNG
function renderNotifications() {
    const notifListEl = document.getElementById("notif-list");
    const notifBadgeEl = document.getElementById("notif-badge");
    if (!notifListEl) return;

    notifListEl.innerHTML = "";
    const list = appData.notifications || [];

    if (list.length === 0) {
        notifListEl.innerHTML = `<li class="empty-notif">Không có thông báo mới</li>`;
        if (notifBadgeEl) notifBadgeEl.classList.add("hidden");
        return;
    }

    if (notifBadgeEl) {
        notifBadgeEl.textContent = list.length;
        notifBadgeEl.classList.remove("hidden");
    }

    list.slice().reverse().forEach(item => {
        const li = document.createElement("li");
        li.className = "notif-item";
        li.innerHTML = `
            <b>${item.type === 'makeup' ? '📅 Lịch Học Bù' : '🔔 Nhắc Nhở'}:</b> ${item.content}
            <span class="notif-time">${item.date}</span>
        `;
        notifListEl.appendChild(li);
    });
}

function saveToFirebase() {
    if (db) db.ref("app_data").set(appData);
}
