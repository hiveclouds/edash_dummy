// =============================
// Load HTML Component
// =============================

async function loadComponent(file, target) {

    try {

        const response = await fetch(file);

        if (!response.ok)
            throw new Error(`Cannot load ${file}`);

        document.querySelector(target).innerHTML =
            await response.text();

    } catch (err) {

        console.error(err);

        document.querySelector(target).innerHTML =
            `<p style="padding:20px;color:red;">
                Failed loading ${file}
            </p>`;
    }

}

// =============================
// Load Page
// =============================

async function loadPage(page) {

    try {

        const response = await fetch(page);

        document.getElementById("page-root").innerHTML =
            await response.text();

        applyLanguage(getSavedLanguage());

        // Jalankan initializer khusus halaman jika tersedia
        if (page.includes("project-overview") && typeof initProjectOverview === "function") {
            initProjectOverview();
        }

        if (page.includes("project-selector") && typeof initProjectSelector === "function") {
            initProjectSelector();
        }

    } catch (err) {

        console.error(err);

    }

}

// =============================
// Language Switch (EN / ID)
// =============================

const translations = {
    en: {
        "sidebar.greeting.label": "Hello,",
        "sidebar.dashboard": "Dashboard",
        "sidebar.nav.monitoring": "Monitoring",
        "sidebar.nav.projectSelector": "Project Selector",
        "sidebar.nav.projectMonitoring": "Project Monitoring",
        "sidebar.nav.alerts": "Alerts",
        "sidebar.nav.taskMaintenance": "Task Maintenance",
        "sidebar.nav.tools": "Tools",
        "sidebar.nav.adminCalc": "Admin Calculator",
        "sidebar.nav.addProject": "Add New Project",
        "sidebar.nav.administration": "Administration",
        "sidebar.nav.adminView": "Admin View",
        "sidebar.nav.ActivityLog": "Activity Log",
        "sidebar.nav.others": "Others",
        "sidebar.nav.setting": "Setting",
        "sidebar.nav.logout": "Logout"
    },
    id: {
        "sidebar.greeting.label": "Halo,",
        "sidebar.dashboard": "Dashboard",
        "sidebar.nav.monitoring": "Monitoring",
        "sidebar.nav.projectSelector": "Pemilih Proyek",
        "sidebar.nav.projectMonitoring": "Pemantauan Proyek",
        "sidebar.nav.alerts": "Peringatan",
        "sidebar.nav.taskMaintenance": "Pemeliharaan Tugas",
        "sidebar.nav.tools": "Alat",
        "sidebar.nav.adminCalc": "Kalkulator Admin",
        "sidebar.nav.addProject": "Tambah Proyek Baru",
        "sidebar.nav.administration": "Administrasi",
        "sidebar.nav.adminView": "Tampilan Admin",
        "sidebar.nav.marketing": "Pemasaran",
        "sidebar.nav.others": "Lainnya",
        "sidebar.nav.setting": "Pengaturan",
        "sidebar.nav.logout": "Keluar"
    }
};

function getSavedLanguage() {

    return localStorage.getItem("edash-lang") || "id";

}

function applyLanguage(lang) {

    const dict = translations[lang] || translations.id;

    document.querySelectorAll("[data-i18n]").forEach((el) => {

        const key = el.getAttribute("data-i18n");

        if (dict[key]) {
            el.textContent = dict[key];
        }

    });

    const currentLabel = document.getElementById("hdLangCurrent");

    if (currentLabel) {
        currentLabel.textContent = lang.toUpperCase();
    }

    localStorage.setItem("edash-lang", lang);

}

function languageSwitcher() {

    const toggle = document.getElementById("hdLangToggle");

    if (!toggle) return;

    toggle.onclick = () => {

        const nextLang = getSavedLanguage() === "id" ? "en" : "id";

        applyLanguage(nextLang);

    };

}

// =============================
// Sidebar Toggle
// =============================

function sidebarToggle() {

    const sidebar = document.getElementById("edashSidebar");
    const button = document.getElementById("sbToggle");

    if (!sidebar || !button) return;

    button.onclick = () => {

        sidebar.classList.toggle("is-collapsed");

    };

}

// =============================
// Sidebar Active State + Page Navigation
// =============================

function sidebarActiveState() {

    const dashboardBtn = document.getElementById("sbDashboardBtn");
    const navItems = document.querySelectorAll(".sb-nav-item");

    if (!dashboardBtn) return;

    dashboardBtn.addEventListener("click", () => {

        dashboardBtn.classList.add("is-active");
        navItems.forEach((el) => el.classList.remove("is-active"));

        loadPage("pages/project-overview.html");

    });

    navItems.forEach((item) => {

        item.addEventListener("click", (e) => {

            dashboardBtn.classList.remove("is-active");
            navItems.forEach((el) => el.classList.remove("is-active"));
            item.classList.add("is-active");

            const page = item.getAttribute("data-page");

            if (page) {
                e.preventDefault();
                loadPage(page);
            }

        });

    });

}

// =============================
// Initialize Dashboard
// =============================

async function initializeDashboard() {

    await Promise.all([

        loadComponent(
            "master/sidebar/sidebar.html",
            "#sidebar-root"
        ),

        loadComponent(
            "master/header/header.html",
            "#header-root"
        ),

        loadPage(
            "pages/project-overview.html"
        )

    ]);

    sidebarToggle();
    sidebarActiveState();
    languageSwitcher();
    applyLanguage(getSavedLanguage());

}

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);