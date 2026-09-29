// HÀM ĐĂNG NHẬP XỬ LÝ CHUẨN
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

function initDashboard() {
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");
    const teacherControls = document.getElementById("teacher-controls");
    const actionPanel = document.getElementById("action-panel");
    const studentSelector = document.getElementById("student-selector");

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
    } else {
        if (teacherControls) teacherControls.classList.add("hidden");
        if (actionPanel) actionPanel.classList.add("hidden");
        if (teacherHwCard) teacherHwCard.classList.add("hidden");
        if (teacherNotifCard) teacherNotifCard.classList.add("hidden");
        selectedStudentKey = currentUser.username;
    }

    // 5. Render toàn bộ dữ liệu các Tab
    try {
        renderStudentData();
        renderHomeworks();
        renderTuitionAndCalendar();
        renderNotifications();
    } catch (err) {
        console.warn("Lỗi render dữ liệu:", err);
    }
}
