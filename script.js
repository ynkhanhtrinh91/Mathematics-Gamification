// CẤU HÌNH FIREBASE
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// RANKS
const RANKS = [
    { id: "dong", name: "🥉 Rank Đồng (Tập Sự)", minXP: 0, maxXP: 19, bonusExam: 0 },
    { id: "bac", name: "🥈 Rank Bạc (Thợ Săn Dạng Toán)", minXP: 20, maxXP: 44, bonusExam: 0 },
    { id: "vang", name: "🥇 Rank Vàng (Chiến Binh)", minXP: 45, maxXP: 74, bonusExam: 0.25 },
    { id: "bachkim", name: "💎 Rank Bạch Kim", minXP: 75, maxXP: 109, bonusExam: 0.5 },
    { id: "kimcuong", name: "👑 Rank Kim Cương", minXP: 110, maxXP: 9999, bonusExam: 1.0 }
];

const initialData = {
    accounts: {
        admin: { password: "123456", role: "teacher", name: "Trình Yến Khanh" },
        hung: { password: "123456", role: "student", name: "Hưng" },
        nhio: { password: "123456", role: "student", name: "Bạn Nhỏ" }
    },
    students: {
        hung: { name: "Hưng", xp: 0, streak: 0, testScore: 0, hintCard: 0, homeworkCard: 0, history: [], homeworks: [], tuition: { learned: 0, planned: 8 }, notification: "" },
        nhio: { name: "Bạn Nhỏ", xp: 0, streak: 0, testScore: 0, hintCard: 0, homeworkCard: 0, history: [], homeworks: [], tuition: { learned: 0, planned: 8 }, notification: "" }
    }
};

let appData = initialData;
let currentUser = null;
let selectedStudentKey = "hung";

// LẮNG NGHE REALTIME
db.ref("app_data").on("value", (snapshot) => {
    const data = snapshot.val();
    if (data && data.students) {
        appData = data;
        if (currentUser) renderStudentData();
    }
});

// TAB CHUYỂN TRANG AN TOÀN
function switchTab(tabId, btnElement) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".sidebar .nav-tab").forEach(el => el.classList.remove("active"));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add("active");

    if (btnElement) btnElement.classList.add("active");

    if (tabId === "tab-homework") {
        setTimeout(() => { renderDonutChart(); }, 100);
    }
}

// LOGIN / LOGOUT
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app-screen");
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("username").value.trim();
    const passVal = document.getElementById("password").value.trim();

    const account = appData.accounts ? appData.accounts[userVal] : null;
    if (account && account.password === passVal) {
        currentUser = { username: userVal, ...account };
        initDashboard();
    } else {
        document.getElementById("login-error").textContent = "Tài khoản hoặc mật khẩu không đúng!";
    }
});

document.getElementById("logout-btn").addEventListener("click", () => {
    currentUser = null;
    appScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
});

document.getElementById("guide-btn").addEventListener("click", () => {
    renderRankGuideModal();
    document.getElementById("guide-modal").classList.remove("hidden");
});
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("guide-modal").classList.add("hidden");
});

function initDashboard() {
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    document.getElementById("user-display").textContent = currentUser.name;
    document.getElementById("role-badge").textContent = currentUser.role === "teacher" ? "Giáo Viên" : "Học Sinh";

    if (currentUser.role === "teacher") {
        document.getElementById("teacher-controls").classList.remove("hidden");
        document.getElementById("action-panel").classList.remove("hidden");
        document.getElementById("teacher-card-control").classList.remove("hidden");
        document.getElementById("assign-hw-panel").classList.remove("hidden");
        document.getElementById("teacher-tuition-control").classList.remove("hidden");
        document.getElementById("teacher-schedule-control").classList.remove("hidden");
        selectedStudentKey = document.getElementById("student-selector").value;
    } else {
        document.getElementById("teacher-controls").classList.add("hidden");
        document.getElementById("action-panel").classList.add("hidden");
        document.getElementById("teacher-card-control").classList.add("hidden");
        document.getElementById("assign-hw-panel").classList.add("hidden");
        document.getElementById("teacher-tuition-control").classList.add("hidden");
        document.getElementById("teacher-schedule-control").classList.add("hidden");
        selectedStudentKey = currentUser.username;
    }

    renderStudentData();
}

document.getElementById("student-selector").addEventListener("change", (e) => {
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
    document.getElementById("card-hint-count").textContent = student.hintCard || 0;
    document.getElementById("card-homework-count").textContent = student.homeworkCard || 0;

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

    if (finalScore >= 9.0) document.getElementById("lego-reward").classList.remove("hidden");
    else document.getElementById("lego-reward").classList.add("hidden");

    // LỊCH SỬ ĐIỂM
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";
    if (student.history) {
        student.history.slice().reverse().forEach(item => {
            const li = document.createElement("li");
            const isPlus = item.amount > 0;
            li.innerHTML = `<span>${item.reason} <small>(${item.date})</small></span><span class="${isPlus ? 'plus' : 'minus'}">${isPlus ? '+' : ''}${item.amount} XP</span>`;
            historyList.appendChild(li);
        });
    }

    // THÔNG BÁO TỪ GIÁO VIÊN
    const notiBox = document.getElementById("notification-box");
    if (student.notification) {
        notiBox.classList.remove("hidden");
        document.getElementById("notification-text").textContent = student.notification;
    } else {
        notiBox.classList.add("hidden");
    }

    // HỌC PHÍ DATA
    const tuition = student.tuition || { learned: 0, planned: 8 };
    document.getElementById("sessions-learned").textContent = `${tuition.learned || 0} buổi`;
    document.getElementById("sessions-planned").textContent = `${tuition.planned || 8} buổi`;
    const totalTuition = (tuition.planned || 8) * 150000;
    document.getElementById("total-tuition-fee").textContent = `${totalTuition.toLocaleString('vi-VN')} VNĐ`;

    document.getElementById("input-learned").value = tuition.learned || 0;
    document.getElementById("input-planned").value = tuition.planned || 8;

    renderHomeworkList();
    renderDonutChart();
}

// BÀI TẬP VỀ NHÀ (CHO PHÉP NỘP CẢ PDF & ẢNH)
function renderHomeworkList() {
    const student = appData.students[selectedStudentKey];
    const container = document.getElementById("hw-container");
    container.innerHTML = "";

    const homeworks = student.homeworks || [];
    if (homeworks.length === 0) {
        container.innerHTML = "<p style='color: var(--text-muted); text-align: center;'>Chưa có bài tập nào được giao.</p>";
        return;
    }

    const now = new Date().getTime();

    homeworks.forEach((hw, index) => {
        const deadlineTime = new Date(hw.deadline).getTime();
        const isOverdue = now > deadlineTime && !hw.submitted;

        let statusTag = '<span class="status-tag tag-pending">Chưa làm / Còn hạn</span>';
        if (hw.graded) statusTag = `<span class="status-tag tag-done">Đã chấm: ${hw.score} điểm</span>`;
        else if (hw.submitted) statusTag = '<span class="status-tag tag-pending" style="background:#e0e7ff; color:#3730a3;">Đã nộp - Chờ chấm</span>';
        else if (isOverdue) statusTag = '<span class="status-tag tag-overdue">Quá hạn</span>';

        const div = document.createElement("div");
        div.className = "hw-item";
        div.innerHTML = `
            <div class="hw-header">
                <span class="hw-title">${hw.title}</span>
                ${statusTag}
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.3rem 0;">
                ⏰ <b>Hạn nộp:</b> ${new Date(hw.deadline).toLocaleString('vi-VN')}
            </p>
            ${hw.fileUrl ? `<p><a href="${hw.fileUrl}" target="_blank" style="color: var(--primary); font-size: 0.85rem;">📄 Xem file đề bài đính kèm</a></p>` : ''}
            
            ${isOverdue ? `<div class="overdue-alert">⚠️ Buổi học tiếp theo của bạn sẽ bị kéo dài thêm 1 tiếng vì không làm bài tập!</div>` : ''}

            <!-- PHẦN NỘP BÀI CỦA HỌC SINH -->
            ${!hw.graded ? `
                <div class="hw-actions">
                    ${currentUser.role === 'student' ? `
                        <label style="font-size: 0.8rem; font-weight: bold;">Nộp bài làm (Tải file PDF hoặc Ảnh):</label>
                        <input type="file" id="submit-file-${index}" accept="image/*,.pdf" style="font-size: 0.8rem; margin: 0.4rem 0;">
                        <button onclick="submitHomework(${index})" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Nộp bài</button>
                    ` : ''}

                    <!-- PHẦN CHẤM ĐIỂM CỦA GIÁO VIÊN -->
                    ${currentUser.role === 'teacher' ? `
                        <div style="background: #ffffff; padding: 0.6rem; border-radius: 6px; margin-top: 0.5rem; border: 1px solid #e2e8f0;">
                            ${hw.submissionImg ? `<p style="margin: 0 0 0.4rem 0;"><a href="${hw.submissionImg}" target="_blank" style="color: var(--primary); font-weight: bold; font-size: 0.8rem;">📁 Xem file bài làm học sinh đã nộp</a></p>` : '<p style="font-size: 0.8rem; color: var(--text-muted);">Học sinh chưa tải file bài làm.</p>'}
                            <div style="display: flex; gap: 0.4rem; align-items: center;">
                                <input type="number" id="grade-score-${index}" min="0" max="10" step="0.5" placeholder="Nhập điểm..." style="width: 90px; padding: 0.3rem;">
                                <button onclick="gradeHomework(${index})" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Lưu điểm chấm</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        `;
        container.appendChild(div);
    });
}

// GIAO BÀI TẬP MỚI
document.getElementById("assign-hw-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentUser.role !== "teacher") return;

    const title = document.getElementById("hw-title").value.trim();
    const deadline = document.getElementById("hw-deadline").value;
    const fileInput = document.getElementById("hw-file");

    const student = appData.students[selectedStudentKey];
    if (!student.homeworks) student.homeworks = [];

    const newHw = { title, deadline, submitted: false, graded: false, score: 0 };

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            newHw.fileUrl = e.target.result;
            student.homeworks.push(newHw);
            saveToFirebase();
            alert("Đã giao bài tập thành công!");
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        student.homeworks.push(newHw);
        saveToFirebase();
        alert("Đã giao bài tập thành công!");
    }
});

// HỌC SINH NỘP BÀI (PDF / ÁNH)
function submitHomework(index) {
    const student = appData.students[selectedStudentKey];
    const fileInput = document.getElementById(`submit-file-${index}`);

    if (fileInput.files.length === 0) {
        alert("Vui lòng chọn file PDF hoặc Ảnh bài làm trước khi bấm nộp!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        student.homeworks[index].submitted = true;
        student.homeworks[index].submissionImg = e.target.result;
        saveToFirebase();
        alert("Đã nộp bài tập thành công!");
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// CHẤM ĐIỂM BÀI TẬP
function gradeHomework(index) {
    if (currentUser.role !== "teacher") return;
    const student = appData.students[selectedStudentKey];
    const scoreVal = parseFloat(document.getElementById(`grade-score-${index}`).value);

    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
        alert("Điểm bài tập phải từ 0 đến 10!");
        return;
    }

    const hw = student.homeworks[index];
    hw.graded = true;
    hw.score = scoreVal;

    if (scoreVal >= 9.0) {
        student.xp = (student.xp || 0) + 1;
        const now = new Date();
        if (!student.history) student.history = [];
        student.history.push({
            amount: 1,
            reason: `🎯 Đạt ${scoreVal}đ BTVN: ${hw.title}`,
            date: `${now.getDate()}/${now.getMonth() + 1}`
        });
        alert(`Đã chấm ${scoreVal} điểm! Tự động cộng +1 XP BTVN đầy đủ cho học sinh! 🎉`);
    } else {
        alert(`Đã lưu điểm chấm: ${scoreVal} điểm.`);
    }

    saveToFirebase();
}

// BIỂU ĐỒ DONUT
function renderDonutChart() {
    const canvas = document.getElementById("hw-donut-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const student = appData.students[selectedStudentKey];
    const homeworks = student.homeworks || [];

    let countDone = 0;
    let countPending = 0;
    let countOverdue = 0;
    const now = new Date().getTime();

    homeworks.forEach(hw => {
        if (hw.graded) countDone++;
        else if (now > new Date(hw.deadline).getTime() && !hw.submitted) countOverdue++;
        else countPending++;
    });

    document.getElementById("count-done").textContent = countDone;
    document.getElementById("count-pending").textContent = countPending;
    document.getElementById("count-overdue").textContent = countOverdue;

    const total = homeworks.length;
    const percent = total > 0 ? Math.round((countDone / total) * 100) : 0;
    document.getElementById("donut-percent").textContent = `${percent}%`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (total === 0) {
        ctx.beginPath();
        ctx.arc(90, 90, 70, 0, 2 * Math.PI);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 20;
        ctx.stroke();
        return;
    }

    const angles = [
        (countDone / total) * 2 * Math.PI,
        (countPending / total) * 2 * Math.PI,
        (countOverdue / total) * 2 * Math.PI
    ];
    const colors = ["#10b981", "#f59e0b", "#ef4444"];

    let startAngle = -0.5 * Math.PI;

    for (let i = 0; i < 3; i++) {
        if (angles[i] > 0) {
            ctx.beginPath();
            ctx.arc(90, 90, 70, startAngle, startAngle + angles[i]);
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 20;
            ctx.stroke();
            startAngle += angles[i];
        }
    }
}

// HỌC PHÍ & BÁO LỊCH BÙ
function updateTuitionData() {
    if (currentUser.role !== "teacher") return;
    const learned = parseInt(document.getElementById("input-learned").value) || 0;
    const planned = parseInt(document.getElementById("input-planned").value) || 8;

    const student = appData.students[selectedStudentKey];
    student.tuition = { learned, planned };

    saveToFirebase();
    alert("Đã cập nhật dữ liệu học phí!");
}

document.getElementById("schedule-change-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentUser.role !== "teacher") return;

    const dateVal = document.getElementById("reschedule-date").value;
    const reason = document.getElementById("reschedule-reason").value.trim();

    const formattedDate = new Date(dateVal).toLocaleString('vi-VN');
    const notiMsg = `📅 Thông báo đổi lịch/học bù: ${reason} (Vào lúc: ${formattedDate})`;

    const student = appData.students[selectedStudentKey];
    student.notification = notiMsg;

    saveToFirebase();
    alert("Đã gửi thông báo lịch học đến học sinh!");
});

// CỘNG ĐIỂM & RENDER GUIDE
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
    if (confirm("Xác nhận reset Rank đầu tháng?")) {
        Object.keys(appData.students).forEach(key => {
            appData.students[key].xp = 0;
            appData.students[key].streak = 0;
            appData.students[key].testScore = 0;
        });
        saveToFirebase();
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
            <p><b>📈 Điểm ưu tiên bài thi cuối tháng:</b> <code>+${rank.bonusExam} điểm</code></p>
        `;
        guideList.appendChild(div);
    });
}

function redeemReward(cost, cardType, rewardName) {
    const student = appData.students[selectedStudentKey];
    if ((student.xp || 0) < cost) {
        alert("Em chưa đủ XP để đổi thẻ này!");
        return;
    }
    if (confirm(`Đổi ${cost} XP lấy "${rewardName}"?`)) {
        student.xp -= cost;
        student[cardType] = (student[cardType] || 0) + 1;
        saveToFirebase();
    }
}

function useCard(cardType, amount, reason) {
    if (currentUser.role !== "teacher") return;
    const student = appData.students[selectedStudentKey];
    if ((student[cardType] || 0) <= 0) {
        alert("Học sinh không còn thẻ này!");
        return;
    }
    student[cardType] = Math.max(0, (student[cardType] || 0) + amount);
    saveToFirebase();
}

function saveToFirebase() {
    db.ref("app_data").set(appData);
}
