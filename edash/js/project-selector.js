// ============================================================
// Page: Project Selector — 360eDash
// Peta sebaran project (Leaflet, fullscreen) + panel mengambang
// "Project Locations" (summary, saved projects, all projects)
// ============================================================

const PS_CATEGORY_COLORS = {
    "bss": "#FA891A",       // Solaris BSS — orange
    "rooftop": "#2F80ED",   // Rooftop Solar — biru
    "fish-farm": "#27AE60"  // Solar Fish Farm — hijau
};

const PS_CATEGORY_LABELS = {
    "fish-farm": "Solar Fish Farm",
    "bss": "Solar BSS",
    "rooftop": "Roof Top Solar"
};

// Icon representatif per kategori (Font Awesome) untuk kartu Category.
const PS_CATEGORY_ICONS = {
    "fish-farm": "fa-solid fa-fish",
    "bss": "fa-solid fa-car-battery",
    "rooftop": "fa-solid fa-solar-panel"
};

// Warna latar (tint) lembut per kategori, senada dengan warna pin di peta.
const PS_CATEGORY_TINTS = {
    "fish-farm": { bg: "#EEF8F1", border: "#DCF0E2", iconBg: "#E1F5E8" },
    "bss":       { bg: "#FEF4EA", border: "#FBE6CE", iconBg: "#FDECD8" },
    "rooftop":   { bg: "#EAF2FE", border: "#D6E6FC", iconBg: "#DCEAFD" }
};

const PS_DAILY_TARGET_MWH = 45;

// Dummy data — silakan ganti dengan data project asli dari backend.
// status: "online" | "offline", alerts: jumlah alert aktif pada project,
// saved: true jika project di-bookmark oleh user (tampil di "Saved Projects").
// capacityMWp/generatedMWh/co2AvoidedT: dummy angka pembangkitan untuk stats panel.
const PS_DUMMY_PROJECTS = [
    { name: "PNJ BSS",              location: "Depok",     category: "bss",       lat: -6.3728, lng: 106.8306, status: "online",  alerts: 0, saved: true,  capacityMWp: 0.05, generatedMWh: 3.1,  co2AvoidedT: 2.0 },
    { name: "PDAM Makasar",         location: "Makasar",   category: "rooftop",   lat: -5.1477, lng: 119.4327, status: "online",  alerts: 1, saved: true,  capacityMWp: 0.15, generatedMWh: 9.8,  co2AvoidedT: 6.4 },
    { name: "Cipete Alfamart",      location: "Jakarta",   category: "rooftop",   lat: -6.2921, lng: 106.7996, status: "offline", alerts: 2, saved: true,  capacityMWp: 0.09, generatedMWh: 0,    co2AvoidedT: 0 },
    { name: "Warung Tukad Solar",   location: "Bali",      category: "bss",       lat: -8.6705, lng: 115.2126, status: "online",  alerts: 0, saved: false, capacityMWp: 0.05, generatedMWh: 3.4,  co2AvoidedT: 2.2 },
    { name: "East Bali Cashew Fty", location: "Bali",      category: "fish-farm", lat: -8.3405, lng: 115.5100, status: "online",  alerts: 0, saved: false, capacityMWp: 0.20, generatedMWh: 14.6, co2AvoidedT: 9.7 },
    { name: "Migas Utama Jabar",    location: "Jakarta",   category: "bss",       lat: -6.2088, lng: 106.8456, status: "offline", alerts: 3, saved: false, capacityMWp: 0.10, generatedMWh: 0,    co2AvoidedT: 0 },
    { name: "RSUD DR Gondokutomo",  location: "Jawa",      category: "rooftop",   lat: -6.9932, lng: 110.4203, status: "online",  alerts: 0, saved: false, capacityMWp: 0.12, generatedMWh: 8.1,  co2AvoidedT: 5.3 },
    { name: "SPBU Coco Kemang",     location: "Jakarta",   category: "bss",       lat: -6.2615, lng: 106.8106, status: "online",  alerts: 1, saved: false, capacityMWp: 0.07, generatedMWh: 4.9,  co2AvoidedT: 3.2 },
    { name: "Griya Grand Wisata",   location: "West Java", category: "rooftop",   lat: -6.3520, lng: 107.0180, status: "online",  alerts: 0, saved: false, capacityMWp: 0.06, generatedMWh: 4.0,  co2AvoidedT: 2.6 },
    { name: "Sudirman Solar Bali",  location: "Bali",      category: "fish-farm", lat: -8.6478, lng: 115.2185, status: "offline", alerts: 1, saved: false, capacityMWp: 0.11, generatedMWh: 0,    co2AvoidedT: 0 }
];

let psMapInstance = null;
let psMarkers = [];
let psSearchTerm = "";

function psCreatePin(color) {

    return L.divIcon({
        className: "ps-pin-wrap",
        html: `<span class="ps-pin" style="--pin-color:${color}"></span>`,
        iconSize: [26, 34],
        iconAnchor: [13, 34],
        popupAnchor: [0, -30]
    });

}

// =============================
// Summary (All / Online / Offline / Active Alerts)
// =============================

function psRenderSummary() {

    const all = PS_DUMMY_PROJECTS.length;
    const online = PS_DUMMY_PROJECTS.filter((p) => p.status === "online").length;
    const offline = PS_DUMMY_PROJECTS.filter((p) => p.status === "offline").length;
    const alerts = PS_DUMMY_PROJECTS.reduce((sum, p) => sum + (p.alerts || 0), 0);

    const allEl = document.getElementById("psSummaryAll");
    const onlineEl = document.getElementById("psSummaryOnline");
    const offlineEl = document.getElementById("psSummaryOffline");
    const alertsEl = document.getElementById("psSummaryAlerts");

    if (allEl) allEl.textContent = all;
    if (onlineEl) onlineEl.textContent = online;
    if (offlineEl) offlineEl.textContent = offline;
    if (alertsEl) alertsEl.textContent = alerts;

}

// =============================
// Category Legend
// =============================

function psRenderLegend() {

    const el = document.getElementById("psLegend");
    if (!el) return;

    el.innerHTML = Object.keys(PS_CATEGORY_LABELS)
        .map((key) => {

            const count = PS_DUMMY_PROJECTS.filter((p) => p.category === key).length;
            const tint = PS_CATEGORY_TINTS[key] || {};

            const style = [
                `--cat-color:${PS_CATEGORY_COLORS[key]}`,
                `--cat-bg:${tint.bg || "#f4f7f7"}`,
                `--cat-border:${tint.border || "#e7edee"}`,
                `--cat-icon-bg:${tint.iconBg || "#e4f1f1"}`
            ].join(";");

            return `
                <div class="ps-category-item" style="${style}">
                    <span class="ps-category-icon"><i class="${PS_CATEGORY_ICONS[key]}"></i></span>
                    <span class="ps-category-value">${count}</span>
                    <span class="ps-category-label">${PS_CATEGORY_LABELS[key]}</span>
                </div>
            `;

        })
        .join("");

}

// =============================
// Generation stats (MWh / MWp / CO2)
// =============================

function psRenderGenStats() {

    const totalMWp = PS_DUMMY_PROJECTS.reduce((sum, p) => sum + (p.capacityMWp || 0), 0);
    const totalMWh = PS_DUMMY_PROJECTS.reduce((sum, p) => sum + (p.generatedMWh || 0), 0);
    const totalCO2 = PS_DUMMY_PROJECTS.reduce((sum, p) => sum + (p.co2AvoidedT || 0), 0);

    const mwhEl = document.getElementById("psGenMWh");
    const mwpEl = document.getElementById("psGenMWp");
    const co2El = document.getElementById("psGenCO2");

    if (mwhEl) mwhEl.textContent = totalMWh.toFixed(1);
    if (mwpEl) mwpEl.textContent = totalMWp.toFixed(2);
    if (co2El) co2El.textContent = totalCO2.toFixed(1);

    return totalMWh;

}

// =============================
// "Today" generation chart (projected vs realized)
// =============================

function psGenerationCurve() {

    // Kurva lonceng sederhana untuk siang hari (06.00–18.00), dummy visual saja.
    const points = [];

    for (let h = 0; h <= 24; h += 1) {
        const inDaylight = h >= 6 && h <= 18;
        const value = inDaylight ? Math.sin(Math.PI * (h - 6) / 12) : 0;
        points.push(Math.max(0, value));
    }

    return points;

}

function psRenderTodayChart(totalGeneratedMWh) {

    const wrap = document.getElementById("psTodayChartWrap");
    const valueEl = document.getElementById("psTodayValue");
    const targetEl = document.getElementById("psTodayTarget");

    if (!wrap) return;

    const width = 240;
    const height = 64;
    const baseline = height - 4;
    const curve = psGenerationCurve();

    const now = new Date();
    const nowHour = now.getHours() + now.getMinutes() / 60;

    const toXY = (h, value) => [
        (h / 24) * width,
        baseline - value * (height - 14)
    ];

    // Projected: kurva penuh 24 jam
    const projectedPts = curve.map((value, h) => toXY(h, value));
    const projectedPath = "M " + projectedPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");

    // Realized: hanya sampai jam sekarang
    const realizedHours = curve
        .map((value, h) => ({ h, value }))
        .filter((point) => point.h <= nowHour);

    const nowIndex = Math.min(Math.floor(nowHour), 24);
    const nextIndex = Math.min(nowIndex + 1, 24);
    const nowFraction = nowHour - nowIndex;
    const nowValue = curve[nowIndex] + (curve[nextIndex] - curve[nowIndex]) * nowFraction;

    realizedHours.push({ h: nowHour, value: nowValue });

    const realizedPts = realizedHours.map((point) => toXY(point.h, point.value * 1.06));
    const realizedLinePath = "M " + realizedPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
    const lastPt = realizedPts[realizedPts.length - 1];
    const firstPt = realizedPts[0];
    const realizedAreaPath = `${realizedLinePath} L ${lastPt[0].toFixed(1)},${baseline} L ${firstPt[0].toFixed(1)},${baseline} Z`;

    const nowX = (nowHour / 24) * width;

    wrap.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="${realizedAreaPath}" fill="#0f6a71" opacity="0.14"></path>
            <path d="${realizedLinePath}" fill="none" stroke="#0f6a71" stroke-width="2" stroke-linecap="round"></path>
            <path d="${projectedPath}" fill="none" stroke="#FA891A" stroke-width="1.6" stroke-dasharray="4 3" stroke-linecap="round"></path>
            <line x1="${nowX.toFixed(1)}" y1="4" x2="${nowX.toFixed(1)}" y2="${baseline}" stroke="#25343F" stroke-width="1" stroke-dasharray="2 2" opacity="0.35"></line>
        </svg>
        <span class="ps-today-now-label" style="left:${(nowX / width * 100).toFixed(1)}%">
            ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} (NOW)
        </span>
    `;

    const percentOfTarget = Math.round((totalGeneratedMWh / PS_DAILY_TARGET_MWH) * 100);

    if (valueEl) valueEl.innerHTML = `${totalGeneratedMWh.toFixed(1)}<span>MWh</span>`;
    if (targetEl) targetEl.textContent = `${percentOfTarget}% of ${PS_DAILY_TARGET_MWH} MWh target`;

}

// =============================
// Table row markup (dipakai untuk Saved Projects & All Projects)
// =============================

function psTableRowHTML(project, index) {

    const statusClass = project.status === "offline" ? "is-offline" : "";
    const savedClass = project.saved ? "is-saved" : "";

    return `
        <div class="ps-table-row" data-index="${index}">
            <div class="ps-table-row-name">
                <span class="ps-status-dot ${statusClass}"></span>
                <span>${project.name}</span>
            </div>
            <div class="ps-table-row-location">${project.location}</div>
            <div class="ps-table-row-actions">
                <button type="button" class="ps-row-action-btn ps-action-save ${savedClass}" data-action="save" data-index="${index}" title="Simpan project">
                    <i class="fa-solid fa-bookmark"></i>
                </button>
                <button type="button" class="ps-row-action-btn ps-action-edit" data-action="edit" data-index="${index}" title="Edit project">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="ps-row-action-btn ps-action-delete" data-action="delete" data-index="${index}" title="Hapus project">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `;

}

// =============================
// Saved Projects list
// =============================

function psRenderSavedList() {

    const el = document.getElementById("psSavedRows");
    if (!el) return;

    const savedIndexes = PS_DUMMY_PROJECTS
        .map((project, index) => ({ project, index }))
        .filter((entry) => entry.project.saved);

    if (savedIndexes.length === 0) {
        el.innerHTML = `<div class="ps-empty">Belum ada project yang disimpan</div>`;
        return;
    }

    el.innerHTML = savedIndexes
        .map((entry) => psTableRowHTML(entry.project, entry.index))
        .join("");

}

// =============================
// All Projects list (dengan search)
// =============================

function psRenderAllList() {

    const el = document.getElementById("psAllRows");
    if (!el) return;

    const term = psSearchTerm.trim().toLowerCase();

    const filtered = PS_DUMMY_PROJECTS
        .map((project, index) => ({ project, index }))
        .filter((entry) => {
            if (!term) return true;
            return (
                entry.project.name.toLowerCase().includes(term) ||
                entry.project.location.toLowerCase().includes(term)
            );
        });

    if (filtered.length === 0) {
        el.innerHTML = `<div class="ps-empty">Project tidak ditemukan</div>`;
        return;
    }

    el.innerHTML = filtered
        .map((entry) => psTableRowHTML(entry.project, entry.index))
        .join("");

}

function psRenderPanelLists() {

    psRenderSummary();
    psRenderLegend();
    const totalMWh = psRenderGenStats();
    psRenderTodayChart(totalMWh);
    psRenderSavedList();
    psRenderAllList();

}

// =============================
// Interaksi: pilih project, simpan, hapus, edit
// =============================

function psHighlightRow(index) {

    document.querySelectorAll(".ps-table-row").forEach((el) => {
        el.classList.toggle("is-active", Number(el.dataset.index) === index);
    });

}

function psSelectProject(index, { pan = true } = {}) {

    const project = PS_DUMMY_PROJECTS[index];
    const marker = psMarkers[index];

    if (!project || !marker || !psMapInstance) return;

    if (pan) {
        psMapInstance.flyTo([project.lat, project.lng], Math.max(psMapInstance.getZoom(), 8), { duration: 0.6 });
    }

    marker.openPopup();
    psHighlightRow(index);

}

function psToggleSaved(index) {

    const project = PS_DUMMY_PROJECTS[index];
    if (!project) return;

    project.saved = !project.saved;
    psRenderPanelLists();

}

function psDeleteProject(index) {

    const project = PS_DUMMY_PROJECTS[index];
    if (!project) return;

    const confirmed = window.confirm(`Hapus "${project.name}" dari daftar project?`);
    if (!confirmed) return;

    // TODO: ganti dengan pemanggilan API delete ke backend.
    if (psMarkers[index]) {
        psMapInstance.removeLayer(psMarkers[index]);
    }
    PS_DUMMY_PROJECTS.splice(index, 1);
    psMarkers.splice(index, 1);

    psRebuildMarkerIndexes();
    psRenderPanelLists();

}

function psEditProject(index) {

    const project = PS_DUMMY_PROJECTS[index];
    if (!project) return;

    // TODO: buka form/modal edit project yang sebenarnya.
    console.log("Edit project:", project);

}

// Setelah delete, index tiap marker & data.index pada row harus disinkronkan ulang
function psRebuildMarkerIndexes() {

    psMarkers.forEach((marker, index) => {
        marker.off("click");
        marker.on("click", () => psHighlightRow(index));
    });

}

// Delegasi klik untuk seluruh panel (row select + tombol aksi)
function psBindPanelEvents() {

    const panelBody = document.getElementById("psPanelBody");
    if (!panelBody || panelBody._psBound) return;
    panelBody._psBound = true;

    panelBody.addEventListener("click", (event) => {

        const actionBtn = event.target.closest("[data-action]");
        if (actionBtn) {
            const index = Number(actionBtn.dataset.index);
            const action = actionBtn.dataset.action;

            if (action === "save") psToggleSaved(index);
            if (action === "delete") psDeleteProject(index);
            if (action === "edit") psEditProject(index);

            return;
        }

        const row = event.target.closest(".ps-table-row");
        if (row) {
            psSelectProject(Number(row.dataset.index));
        }

    });

    const searchInput = document.getElementById("psSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            psSearchTerm = event.target.value;
            psRenderAllList();
        });
    }

}

// =============================
// Panel expand/collapse
// =============================

function psBindPanelToggle() {

    const panel = document.getElementById("psPanel");
    const toggleBtn = document.getElementById("psPanelToggle");

    if (!panel || !toggleBtn || toggleBtn._psBound) return;
    toggleBtn._psBound = true;

    toggleBtn.addEventListener("click", () => {
        panel.classList.toggle("is-open");
        if (panel.classList.contains("is-open") && psMapInstance) {
            setTimeout(() => psMapInstance.invalidateSize(), 220);
        }
    });

}

// =============================
// Locate-me button
// =============================

function psBindLocateButton() {

    const btn = document.getElementById("psLocateBtn");
    if (!btn || btn._psBound) return;
    btn._psBound = true;

    btn.addEventListener("click", () => {

        if (!navigator.geolocation || !psMapInstance) return;

        btn.classList.add("is-loading");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                btn.classList.remove("is-loading");
                psMapInstance.flyTo(
                    [position.coords.latitude, position.coords.longitude],
                    Math.max(psMapInstance.getZoom(), 10),
                    { duration: 0.6 }
                );
            },
            () => {
                btn.classList.remove("is-loading");
            }
        );

    });

}

// =============================
// Init map + panel
// =============================

function initProjectSelector() {

    const mapEl = document.getElementById("psMap");

    if (!mapEl || typeof L === "undefined") return;

    // Hindari inisialisasi ganda saat pindah halaman lalu kembali lagi
    if (mapEl._leaflet_id) return;

    psRenderPanelLists();
    psBindPanelEvents();
    psBindPanelToggle();
    psBindLocateButton();

    const map = L.map("psMap", {
        scrollWheelZoom: true
    }).setView([-2.5, 118], 5);

    psMapInstance = map;

    L.tileLayer("https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=AzG6rYYbAkjdgDX9YsnF", {
        attribution: "&copy; <a href=\"https://www.maptiler.com/copyright/\">MapTiler</a> &copy; OpenStreetMap contributors",
        maxZoom: 20
    }).addTo(map);

    psMarkers = [];

    PS_DUMMY_PROJECTS.forEach((project, index) => {

        const color = PS_CATEGORY_COLORS[project.category];

        const marker = L.marker([project.lat, project.lng], {
            icon: psCreatePin(color)
        }).addTo(map);

        marker.bindPopup(`
            <div class="ps-popup-title">${project.name}</div>
            <div class="ps-popup-category">${PS_CATEGORY_LABELS[project.category]}</div>
        `);

        marker.on("click", () => psHighlightRow(index));

        psMarkers.push(marker);

    });

    // Perbaiki ukuran tile saat container baru saja ditampilkan
    // (masalah umum Leaflet jika di-mount ke elemen yang baru dirender)
    setTimeout(() => map.invalidateSize(), 200);

}