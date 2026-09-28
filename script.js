@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

:root { 
    --primary: #6366f1; 
    --primary-hover: #4f46e5;
    --accent-gold: #f59e0b;
    --accent-green: #10b981;
    --accent-red: #ef4444;
    --accent-orange: #f97316;
    --bg-dark: #0f172a;
    --bg-body: #f8fafc;
    --card-bg: #ffffff;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --radius-lg: 16px;
    --radius-md: 10px;
    --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-body);
    color: var(--text-main);
    margin: 0;
    padding: 0;
    overflow-x: hidden;
}

.hidden { display: none !important; }

/* MÀN HÌNH ĐĂNG NHẬP */
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
}

.login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 2.5rem;
    border-radius: 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 380px;
    text-align: center;
}

.login-card h2 {
    color: var(--primary);
    font-size: 1.6rem;
    margin-bottom: 0.2rem;
}

.login-card p {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1.8rem;
}

.input-group {
    text-align: left;
    margin-bottom: 1.2rem;
}

.input-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
    color: var(--text-main);
}

.input-group input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: all 0.2s;
}

.input-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.error-msg {
    color: var(--accent-red);
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.8rem;
}

/* NAVBAR */
.navbar {
    background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    padding: 0.9rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 0;
    z-index: 500;
}

.logo {
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-guide {
    background: #fbbf24;
    color: #78350f;
    border: none;
    padding: 0.5rem 1.1rem;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.85rem;
    transition: transform 0.2s, background 0.2s;
}

.btn-guide:hover {
    background: #f59e0b;
    transform: translateY(-2px);
}

/* CHUÔNG THÔNG BÁO */
.notif-wrapper {
    position: relative;
}

.btn-notif-bell {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.btn-notif-bell:hover {
    background: rgba(255, 255, 255, 0.35);
}

.notif-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    background: var(--accent-red);
    color: white;
    font-size: 0.68rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 10px;
    border: 2px solid #7c3aed;
}

.notif-dropdown {
    position: absolute;
    right: 0;
    top: 48px;
    width: 320px;
    background: white;
    color: var(--text-main);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    border: 1px solid #e2e8f0;
    z-index: 1000;
    overflow: hidden;
}

.notif-header {
    background: #f8fafc;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.notif-header h4 {
    margin: 0;
    font-size: 0.9rem;
    color: var(--primary);
}

.notif-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 280px;
    overflow-y: auto;
}

.notif-item {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.83rem;
}

.notif-item .notif-time {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 0.3rem;
}

.empty-notif {
    padding: 1.5rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
}

/* SIDEBAR DỌC */
.sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    width: 210px;
    background: #1e1b4b;
    color: white;
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 400;
    display: flex;
    flex-direction: column;
}

.sidebar.collapsed {
    width: 68px;
}

.sidebar-toggle {
    background: #312e81;
    color: white;
    border: none;
    padding: 0.6rem;
    cursor: pointer;
    text-align: right;
    font-size: 0.9rem;
    border-bottom: 1px solid #3730a3;
    transition: background 0.2s;
}

.sidebar-toggle:hover {
    background: #4338ca;
}

.sidebar.collapsed .sidebar-toggle {
    text-align: center;
}

.sidebar.collapsed .sidebar-toggle i {
    transform: rotate(180deg);
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    gap: 0.5rem;
}

.nav-item {
    background: transparent;
    border: none;
    color: #c7d2fe;
    padding: 0.9rem 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.9rem;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    text-align: left;
}

.nav-item i {
    font-size: 1.1rem;
    min-width: 24px;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.nav-item.active {
    background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border-left: 4px solid #fbbf24;
}

.sidebar.collapsed .nav-text {
    display: none;
}

/* KHU VỰC WRAPPER BÊN PHẢI SIDEBAR */
.main-wrapper {
    margin-left: 210px;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed + .main-wrapper {
    margin-left: 68px;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

/* TEACHER PANEL */
.teacher-panel {
    background: #e0e7ff;
    padding: 0.8rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 2px solid #c7d2fe;
}

.teacher-panel select {
    padding: 0.4rem 0.8rem;
    border-radius: var(--radius-md);
    border: 1px solid #a5b4fc;
    font-weight: 700;
    color: var(--primary);
}

.btn-reset-rank {
    background: var(--accent-red);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 700;
    margin-left: auto;
    transition: opacity 0.2s;
}

.btn-reset-rank:hover { opacity: 0.9; }

/* DASHBOARD GRID */
.dashboard-grid {
    padding: 1.8rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
}

.card {
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid #f1f5f9;
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    box-shadow: var(--shadow-md);
}

.card h3 {
    margin-top: 0;
    font-size: 1.05rem;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 0.6rem;
}

/* PROFILE CARD */
.profile-header {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1rem;
}

.avatar {
    width: 55px;
    height: 55px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.6rem;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.profile-header h2 {
    margin: 0 0 0.3rem 0;
    font-size: 1.3rem;
}

.rank-tag {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 0.3rem 0.9rem;
    border-radius: 20px;
    font-weight: 800;
    font-size: 0.8rem;
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

.xp-progress-container { margin: 1.2rem 0; }

.xp-text {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 0.4rem;
}

.progress-bar {
    background: #e2e8f0;
    height: 12px;
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
    height: 100%;
    border-radius: 10px;
    transition: width 0.5s ease-out;
}

.streak-box {
    background: #fef3c7;
    color: #92400e;
    padding: 0.7rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 700;
    border-left: 4px solid var(--accent-gold);
}

/* BIỂU ĐỒ RANK */
.rank-chart-container {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 150px;
    padding-top: 1rem;
    border-bottom: 2px solid #f1f5f9;
    margin-bottom: 0.8rem;
}

.bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 18%;
    height: 100%;
    justify-content: flex-end;
}

.bar-fill {
    width: 80%;
    background: #cbd5e1;
    border-radius: 8px 8px 0 0;
    transition: all 0.3s;
}

.bar-group.active .bar-fill {
    background: linear-gradient(180deg, #6366f1 0%, #4338ca 100%);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    transform: scaleY(1.08);
}

.bar-label {
    font-size: 0.75rem;
    font-weight: 700;
    margin-top: 0.5rem;
}

.bar-group small {
    font-size: 0.65rem;
    color: var(--text-muted);
}

.chart-status-text {
    text-align: center;
    margin: 0;
    font-size: 0.88rem;
    color: var(--text-muted);
}

/* SCORE CARD */
.score-details { margin-top: 0.8rem; }

.score-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
    font-size: 0.9rem;
}

.score-item.total {
    border-top: 2px dashed #e2e8f0;
    padding-top: 0.8rem;
    font-size: 1.1rem;
    color: var(--primary);
}

.reward-status {
    background: #d1fae5;
    color: #065f46;
    padding: 0.8rem;
    border-radius: var(--radius-md);
    text-align: center;
    margin-top: 1rem;
    font-size: 0.9rem;
}

/* ACTION BUTTONS (GIÁO VIÊN) */
.btn-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-bottom: 1rem;
}

.btn-action, .btn-danger {
    padding: 0.6rem 0.8rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    text-align: left;
    transition: all 0.2s;
}

.btn-action {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.btn-action:hover {
    background: #dcfce7;
    transform: translateY(-1px);
}

.btn-danger {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.btn-danger:hover {
    background: #fee2e2;
    transform: translateY(-1px);
}

.custom-update {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.8rem;
}

.custom-update input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: var(--radius-md);
}

/* BUTTONS CHUNG */
.btn-primary {
    background: var(--primary);
    color: white;
    border: none;
    padding: 0.75rem 1.2rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 700;
    transition: background 0.2s;
}

.btn-primary:hover { background: var(--primary-hover); }

.btn-secondary {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
}

.btn-shop {
    background: var(--accent-green);
    color: white;
    border: none;
    padding: 0.4rem 0.9rem;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 700;
}

/* HISTORY LOG & SHOP */
.history-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 180px;
    overflow-y: auto;
}

.history-list li {
    padding: 0.6rem 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.82rem;
    display: flex;
    justify-content: space-between;
}

.history-list .plus { color: var(--accent-green); font-weight: 800; }
.history-list .minus { color: var(--accent-red); font-weight: 800; }

.shop-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding: 0.8rem 0;
}

.shop-item p { margin: 0; font-size: 0.78rem; color: var(--text-muted); }

/* MODAL HƯỚNG DẪN */
.modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center; z-index: 1000;
}

.modal-content {
    background: white; width: 90%; max-width: 580px; border-radius: 20px;
    padding: 1.8rem; max-height: 85vh; overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #f1f5f9; padding-bottom: 0.8rem;
}

.modal-header h2 { font-size: 1.1rem; color: var(--primary); margin: 0; }
.close-btn { font-size: 1.6rem; cursor: pointer; color: var(--text-muted); }

.rank-card-guide {
    background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid var(--primary);
    border-radius: var(--radius-md); padding: 0.8rem; margin: 0.8rem 0;
}

.rank-card-guide h4 { margin: 0 0 0.3rem 0; color: var(--primary); font-size: 0.95rem; }
.rank-card-guide p { margin: 0.2rem 0; font-size: 0.85rem; }

.guide-note {
    background: #e0e7ff; border-radius: var(--radius-md); padding: 1rem; margin-top: 1rem;
}

.guide-note h4 { margin: 0 0 0.4rem 0; color: var(--primary); font-size: 0.9rem; }
.guide-note ul { margin: 0; padding-left: 1.2rem; font-size: 0.82rem; line-height: 1.5; }

/* KHO THẺ & BẢNG DUYỆT THẺ */
.inventory-box {
    display: flex;
    gap: 1rem;
    background: #f1f5f9;
    padding: 0.8rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
}

.inventory-item {
    font-size: 0.85rem;
    font-weight: 600;
}

.inventory-item strong {
    color: var(--primary);
    font-size: 1rem;
}

.sub-title {
    font-size: 0.9rem;
    margin: 1rem 0 0.5rem 0;
    color: var(--text-muted);
}

.teacher-card-panel {
    border-top: 2px dashed #e2e8f0;
    margin-top: 1rem;
    padding-top: 0.5rem;
}

.card-use-btns {
    display: flex;
    gap: 0.5rem;
}

.btn-use-card {
    background: #fff7ed;
    color: #c2410c;
    border: 1px solid #ffedd5;
    padding: 0.5rem 0.8rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    transition: all 0.2s;
}

.btn-use-card:hover {
    background: #ffedd5;
}

/* LAYOUT TRANG BÀI TẬP & HỌC PHÍ CHUNG */
.page-container {
    padding: 1.8rem;
    max-width: 1300px;
    margin: 0 auto;
}

.page-header-banner {
    background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
    color: white;
    padding: 1.5rem 2rem;
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-md);
}

.page-header-banner.alt-banner {
    background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
}

.page-header-banner h2 {
    margin: 0 0 0.4rem 0;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.page-header-banner p {
    margin: 0;
    font-size: 0.88rem;
    opacity: 0.9;
}

/* TRANG BÀI TẬP VỀ NHÀ */
.hw-layout-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 1.5rem;
}

@media (max-width: 900px) {
    .hw-layout-grid { grid-template-columns: 1fr; }
}

.donut-chart-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
    margin: 1rem auto;
}

.donut-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    border-radius: 50%;
}

.donut-svg path {
    fill: none;
    stroke-width: 3.8;
    transition: stroke-dasharray 0.5s ease;
}

.circle-bg { stroke: #e2e8f0; }
.circle-done { stroke: var(--accent-green); }
.circle-pending { stroke: var(--accent-orange); }
.circle-late { stroke: var(--accent-red); }

.donut-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.donut-text span {
    display: block;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--primary);
}

.donut-text small {
    font-size: 0.7rem;
    color: var(--text-muted);
}

.chart-legend-box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: 0.82rem;
    font-weight: 600;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.dot.done { background: var(--accent-green); }
.dot.pending { background: var(--accent-orange); }
.dot.late { background: var(--accent-red); }

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #cbd5e1;
    border-radius: var(--radius-md);
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.88rem;
}

.hw-items-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.hw-card-item {
    border-left: 5px solid #cbd5e1;
    background: #f8fafc;
    border-radius: var(--radius-md);
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    transition: all 0.2s;
}

.hw-card-item.status-pending { border-left-color: var(--accent-orange); }
.hw-card-item.status-done { border-left-color: var(--accent-green); }
.hw-card-item.status-late { border-left-color: var(--accent-red); }

.hw-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.hw-header-row h4 {
    margin: 0 0 0.3rem 0;
    font-size: 1rem;
}

.hw-status-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 800;
    color: white;
    text-transform: uppercase;
}

.status-pending .hw-status-badge { background: var(--accent-orange); }
.status-done .hw-status-badge { background: var(--accent-green); }
.status-late .hw-status-badge { background: var(--accent-red); }

.hw-deadline-text {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 0.8rem;
}

.hw-file-upload-box {
    background: white;
    padding: 0.8rem;
    border-radius: var(--radius-md);
    border: 1px dashed #cbd5e1;
    margin-top: 0.8rem;
}

.hw-grading-box {
    background: #e0e7ff;
    padding: 0.8rem;
    border-radius: var(--radius-md);
    margin-top: 0.8rem;
}

/* TRANG HỌC PHÍ & LỊCH HỌC */
.tuition-layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

@media (max-width: 900px) {
    .tuition-layout-grid { grid-template-columns: 1fr; }
}

.tuition-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
}

.stat-box {
    background: #f8fafc;
    padding: 1rem;
    border-radius: var(--radius-md);
    border: 1px solid #e2e8f0;
}

.stat-box.highlight {
    background: #fef3c7;
    border-color: #fde68a;
    grid-column: span 2;
}

.stat-title {
    display: block;
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
    margin-bottom: 0.3rem;
}

.stat-value {
    font-size: 1.2rem;
    font-weight: 800;
}

.stat-value.text-primary { color: var(--primary); }
.stat-value.text-gold { color: #b45309; }

.stat-value-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.stat-value-group input {
    width: 60px;
    padding: 0.3rem;
    font-weight: 800;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
}

.tuition-notice-box {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.9rem;
    border-radius: var(--radius-md);
    font-size: 0.8rem;
}

.tuition-notice-box h4 { margin: 0 0 0.4rem 0; }
.tuition-notice-box p { margin: 0.2rem 0; }

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
}

.schedule-fixed-tag {
    background: #fef3c7;
    color: #92400e;
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    border: 1px solid #fde68a;
}

.calendar-grid-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: 800;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.calendar-days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
}

.cal-day {
    aspect-ratio: 1;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 700;
    position: relative;
}

.cal-day.today {
    border: 2px solid var(--primary);
    background: #e0e7ff;
}

.cal-day.has-class {
    background: #d1fae5;
    color: #065f46;
}

.cal-day.makeup-class {
    background: #ffedd5;
    color: #c2410c;
}

.cal-day .class-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-top: 2px;
}

.cal-day.has-class .class-dot { background: #10b981; }
.cal-day.makeup-class .class-dot { background: #f97316; }
