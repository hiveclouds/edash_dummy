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

}

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);