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

    if (typeof initProjectOverview === "function") {
        initProjectOverview();
    }

}

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);