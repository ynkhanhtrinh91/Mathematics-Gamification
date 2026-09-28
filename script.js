// 1. CẤU HÌNH FIREBASE CHUẨN CHO DỰ ÁN
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

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
        hung: { name: "Hưng", xp: 0, streak: 0, testScore: 0, history: [] },
        nhio: { name: "Bạn Nhỏ", xp: 0, streak: 0, testScore: 0, history: [] }
    }
};

let appData = initialData;
let currentUser = null;
let selectedStudentKey = "hung";

// 4. LẮNG NGHE DỮ LIỆU ĐỒNG BỘ REALTIME TỪ FIREBASE (KHÔNG RESET ĐIỂM CŨ)
db.ref("app_data").on("value", (snapshot) => {
    const data = snapshot.val();
    if (data && data.students) {
        appData = data;
        if (currentUser) {
            renderStudentData();
        }
    }
});

// DOM ELEMENTS
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const teacherControls = document.getElementById("teacher-controls");
const studentSelector = document.getElementById("student-selector");
const actionPanel = document.getElementById("action-panel");
const guideModal = document.getElementById("guide-modal");

// ĐĂNG NHẬP
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("username").value.trim();
    const passVal = document.getElementById("password").value.trim();

    const account = appData.accounts ? appData.accounts[userVal] : null;
    if (account && account.password === passVal) {
        currentUser = { username: userVal, ...account };
        loginError.textContent = "";
        initDashboard();
    } else {
        loginError.textContent = "Tài khoản hoặc mật khẩu không đúng!";
    }
});

// ĐĂNG XUẤT
document.getElementById("logout-btn").addEventListener("click", () => {
    currentUser = null;
    appScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
});

// MODAL HƯỚNG DẪN RANK
document.getElementById("guide-btn").addEventListener("click", () => {
    renderRankGuideModal();
    guideModal.classList.remove("hidden");
});
document.getElementById("close-modal").addEventListener("click", () => {
    guideModal.classList.add("hidden");
});

function initDashboard() {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    document.getElementById("user-display").textContent = currentUser.name;
    document.getElementById("role-badge").textContent = currentUser.role === "teacher" ? "Giáo Viên" : "Học Sinh";

    if (currentUser.role === "teacher") {
        teacherControls.classList.remove("hidden");
        actionPanel.classList.remove("hidden");
        selectedStudentKey = studentSelector.value;
    } else {
        teacherControls.classList.add("hidden");
        actionPanel.classList.add("hidden");
        selectedStudentKey = currentUser.username;
    }

    renderStudentData();
}

studentSelector.addEventListener("change", (e) => {
    selectedStudentKey = e.target.value;
    renderStudentData();
});

// RENDER DỮ LIỆU
function renderStudentData() {
    if (!appData.students || !appData.students[selectedStudentKey]) return;
    const student = appData.students[selectedStudentKey];

    document.getElementById("student-name").textContent = student.name;
    document.getElementById("current-xp").textContent = student.xp || 0;
    document.getElementById("streak-count").textContent = student.streak || 0;

    // HIỂN THỊ SỐ THẺ ĐẶC QUYỀN SỞ HỮU
    const hintEl = document.getElementById("card-hint-count");
    const hwEl = document.getElementById("card-homework-count");
    if (hintEl) hintEl.textContent = student.hintCard || 0;
    if (hwEl) hwEl.textContent = student.homeworkCard || 0;

    // ẨN / HIỆN BẢNG DUYỆT THẺ DÀNH CHO GIÁO VIÊN
    const teacherCardPanel = document.getElementById("teacher-card-control");
    if (teacherCardPanel) {
        if (currentUser.role === "teacher") {
            teacherCardPanel.classList.remove("hidden");
        } else {
            teacherCardPanel.classList.add("hidden");
        }
    }

    const currentRank = RANKS.find(r => (student.xp || 0) >= r.minXP && (student.xp || 0) <= r.maxXP) || RANKS[0];
    document.getElementById("rank-badge").textContent = currentRank.name;
    document.getElementById("chart-current-rank").textContent = currentRank.name;

    const nextRank = RANKS.find(r => r.minXP > (student.xp || 0));
    if (nextRank) {
        document.getElementById("next-rank-text").textContent = `Tiếp theo: ${nextRank.minXP} XP`;
        const percentage = Math.min(100, Math.max(0, (((student.xp || 0) - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100));
        document.getElementById("progress-fill").style.width = `${percentage}%`;
    } else {
        document.getElementById("next-rank-text").textContent = "Đã đạt Rank Cao Thủ!";
        document.getElementById("progress-fill").style.width = "100%";
    }

    document.querySelectorAll(".bar-group").forEach(el => el.classList.remove("active"));
    const activeBar = document.getElementById(`bar-${currentRank.id}`);
    if (activeBar) activeBar.classList.add("active");

    const testScore = student.testScore || 0;
    document.getElementById("test-score").value = testScore;

    const convertedXPScore = Math.min(10, parseFloat(((student.xp || 0) / 3).toFixed(1))); 
    document.getElementById("converted-xp-score").textContent = `${convertedXPScore} / 10`;
    document.getElementById("rank-bonus-score").textContent = `+${currentRank.bonusExam} điểm`;

    const finalScore = parseFloat((convertedXPScore * 0.3 + testScore * 0.7 + currentRank.bonusExam).toFixed(2));
    document.getElementById("final-score").textContent = finalScore;

    const legoReward = document.getElementById("lego-reward");
    if (finalScore >= 9.0) {
        legoReward.classList.remove("hidden");
    } else {
        legoReward.classList.add("hidden");
    }

    const historyList = document.getElementById("history-list");
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

function renderRankGuideModal() {
    const guideList = document.getElementById("rank-guide-list");
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
    if (currentUser.role !== "teacher") return;
    const student = appData.students[selectedStudentKey];
    student.xp = Math.max(0, (student.xp || 0) + amount);

    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1} ${now.getHours()}:${now.getMinutes()}`;
    
    if (!student.history) student.history = [];
    student.history.push({ amount, reason, date: dateStr });
    saveToFirebase();
}

function updateTestScore() {
    if (currentUser.role !== "teacher") return;
    const val = parseFloat(document.getElementById("input-test-score").value);
    if (isNaN(val) || val < 0 || val > 10) {
        alert("Điểm thi phải từ 0 đến 10!");
        return;
    }
    appData.students[selectedStudentKey].testScore = val;
    saveToFirebase();
    document.getElementById("input-test-score").value = "";
}

function resetMonthlyRank() {
    if (currentUser.role !== "teacher") return;
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

// ĐỔI THẺ BẰNG XP (+1 THẺ VÀO KHO)
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

// GIÁO VIÊN DUYỆT TRỪ THẺ KHI HỌC SINH SỬ DỤNG
function useCard(cardType, amount, reason) {
    if (currentUser.role !== "teacher") return;
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
// LƯU DỮ LIỆU TRỰC TIẾP LÊN FIREBASE CLOUD
function saveToFirebase() {
    db.ref("app_data").set(appData);
}
