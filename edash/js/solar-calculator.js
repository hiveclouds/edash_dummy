// =====================================================================
// Solar Calculator (public, pre-login) — 360eDash
// Estimator aligned with the internal Smart Solar Planner's core
// engine (facility load-curve profiles, Gaussian solar production
// curve, end-user/direct-purchase financial model) — kept to the same
// 6-field public form. Two simplifications vs. the internal tool:
//   1. Solar day window (start/peak/end) is fixed at 07:00 / 12:30 /
//      18:00 instead of being solved for — production is still scaled
//      so its daily total matches the province's PV potential exactly.
//   2. Roof-area limits, financing/BOT/leasing options, and the
//      admin-only developer model are out of scope for this public,
//      pre-login lead-gen page.
// =====================================================================

document.addEventListener("DOMContentLoaded", () => {

    initProvinces();
    initTariffToggle();
    initCalcForm();
    initEmailGate();
    initPdfDownload();
    initLangToggle();
    initYearlyTableToggle();

});

// Cosmetic only for now — full i18n isn't wired up yet, this just
// keeps the header control interactive/consistent with the design.
function initLangToggle() {

    const btn = document.getElementById("calcLangToggle");
    const label = document.getElementById("calcLangCurrent");
    if (!btn || !label) return;

    btn.addEventListener("click", () => {
        label.textContent = label.textContent === "EN" ? "ID" : "EN";
    });

}

// =====================================================================
// Reference data — same source as the internal Smart Solar Planner
// =====================================================================

// Avg. specific PV yield per province (kWh/kWp/day).
const PV_POTENTIAL_DATA = {
    "Aceh": 3.873, "Sumatera Utara": 3.621, "Sumatera Barat": 3.180, "Riau": 3.594,
    "Kepulauan Riau": 3.555, "Jambi": 3.408, "Sumatera Selatan": 3.454, "Bengkulu": 3.687,
    "Lampung": 3.589, "Kepulauan Bangka Belitung": 3.621, "DKI Jakarta": 3.824,
    "Jawa Barat": 3.950, "Jawa Tengah": 4.048, "DI Yogyakarta": 3.519, "Jawa Timur": 4.226,
    "Banten": 3.774, "Bali": 4.317, "Nusa Tenggara Barat": 4.310, "Nusa Tenggara Timur": 4.353,
    "Kalimantan Barat": 3.355, "Kalimantan Tengah": 3.165, "Kalimantan Selatan": 3.303,
    "Kalimantan Timur": 3.404, "Kalimantan Utara": 3.684, "Sulawesi Utara": 4.119,
    "Sulawesi Tengah": 3.877, "Gorontalo": 4.054, "Sulawesi Selatan": 3.853,
    "Sulawesi Tenggara": 3.790, "Sulawesi Barat": 3.721, "Maluku": 3.924,
    "Maluku Utara": 3.767, "Papua Barat": 3.987, "Papua": 3.691, "Papua Selatan": 4.1,
    "Papua Tengah": 3.7, "Papua Pegunungan": 3.2, "Papua Barat Daya": 4.0
};

// City/Regency list per province — same source as the internal Smart
// Solar Planner (used to populate the City/Regency select).
const CITY_DATA = {
    "Aceh": ["Aceh Barat","Aceh Barat Daya","Aceh Besar","Aceh Jaya","Aceh Selatan","Aceh Singkil","Aceh Tamiang","Aceh Tengah","Aceh Tenggara","Aceh Timur","Aceh Utara","Banda Aceh","Bener Meriah","Bireuen","Gayo Lues","Langsa","Lhokseumawe","Nagan Raya","Pidie","Pidie Jaya","Sabang","Simeulue","Subulussalam"],
    "Sumatera Utara": ["Asahan","Batu Bara","Binjai","Dairi","Deli Serdang","Gunungsitoli","Humbang Hasundutan","Karo","Labuhanbatu","Labuhanbatu Selatan","Labuhanbatu Utara","Langkat","Mandailing Natal","Medan","Nias","Nias Barat","Nias Selatan","Nias Utara","Padang Lawas","Padang Lawas Utara","Padangsidimpuan","Pakpak Bharat","Pematangsiantar","Samosir","Serdang Bedagai","Sibolga","Simalungun","Tanjungbalai","Tapanuli Selatan","Tapanuli Tengah","Tapanuli Utara","Tebing Tinggi","Toba"],
    "Sumatera Barat": ["Agam","Bukittinggi","Dharmasraya","Kepulauan Mentawai","Lima Puluh Kota","Padang","Padang Panjang","Padang Pariaman","Pariaman","Pasaman","Pasaman Barat","Payakumbuh","Pesisir Selatan","Sawahlunto","Sijunjung","Solok","Solok Selatan","Tanah Datar"],
    "Riau": ["Bengkalis","Dumai","Indragiri Hilir","Indragiri Hulu","Kampar","Kepulauan Meranti","Kuantan Singingi","Pekanbaru","Pelalawan","Rokan Hilir","Rokan Hulu","Siak"],
    "Jambi": ["Batanghari","Bungo","Jambi","Kerinci","Merangin","Muaro Jambi","Sarolangun","Sungai Penuh","Tanjung Jabung Barat","Tanjung Jabung Timur","Tebo"],
    "Sumatera Selatan": ["Banyuasin","Empat Lawang","Lahat","Lubuklinggau","Muara Enim","Musi Banyuasin","Musi Rawas","Musi Rawas Utara","Ogan Ilir","Ogan Komering Ilir","Ogan Komering Ulu","Ogan Komering Ulu Selatan","Ogan Komering Ulu Timur","Pagar Alam","Palembang","Penukal Abab Lematang Ilir","Prabumulih"],
    "Bengkulu": ["Bengkulu","Bengkulu Selatan","Bengkulu Tengah","Bengkulu Utara","Kaur","Kepahiang","Lebong","Mukomuko","Rejang Lebong","Seluma"],
    "Lampung": ["Bandar Lampung","Lampung Barat","Lampung Selatan","Lampung Tengah","Lampung Timur","Lampung Utara","Mesuji","Metro","Pesawaran","Pesisir Barat","Pringsewu","Tanggamus","Tulang Bawang","Tulang Bawang Barat","Way Kanan"],
    "Kepulauan Bangka Belitung": ["Bangka","Bangka Barat","Bangka Selatan","Bangka Tengah","Belitung","Belitung Timur","Pangkal Pinang"],
    "Kepulauan Riau": ["Batam","Bintan","Karimun","Kepulauan Anambas","Lingga","Natuna","Tanjung Pinang"],
    "DKI Jakarta": ["Jakarta Barat","Jakarta Pusat","Jakarta Selatan","Jakarta Timur","Jakarta Utara","Kepulauan Seribu"],
    "Jawa Barat": ["Bandung","Bandung Barat","Banjar","Bekasi","Bogor","Ciamis","Cianjur","Cimahi","Cirebon","Depok","Garut","Indramayu","Karawang","Kuningan","Majalengka","Pangandaran","Purwakarta","Subang","Sukabumi","Sumedang","Tasikmalaya"],
    "Jawa Tengah": ["Banjarnegara","Banyumas","Batang","Blora","Boyolali","Brebes","Cilacap","Demak","Grobogan","Jepara","Karanganyar","Kebumen","Kendal","Klaten","Kudus","Magelang","Pati","Pekalongan","Pemalang","Purbalingga","Purworejo","Rembang","Salatiga","Semarang","Sragen","Sukoharjo","Surakarta","Tegal","Temanggung","Wonogiri","Wonosobo"],
    "DI Yogyakarta": ["Bantul","Gunungkidul","Kulon Progo","Sleman","Yogyakarta"],
    "Jawa Timur": ["Bangkalan","Banyuwangi","Batu","Blitar","Bojonegoro","Bondowoso","Gresik","Jember","Jombang","Kediri","Lamongan","Lumajang","Madiun","Magetan","Malang","Mojokerto","Nganjuk","Ngawi","Pacitan","Pamekasan","Pasuruan","Ponorogo","Probolinggo","Sampang","Sidoarjo","Situbondo","Sumenep","Surabaya","Trenggalek","Tuban","Tulungagung"],
    "Banten": ["Cilegon","Lebak","Pandeglang","Serang","Tangerang","Tangerang Selatan"],
    "Bali": ["Badung","Bangli","Buleleng","Denpasar","Gianyar","Jembrana","Karangasem","Klungkung","Tabanan"],
    "Nusa Tenggara Barat": ["Bima","Dompu","Lombok Barat","Lombok Tengah","Lombok Timur","Lombok Utara","Mataram","Sumbawa","Sumbawa Barat"],
    "Nusa Tenggara Timur": ["Alor","Belu","Ende","Flores Timur","Kupang","Lembata","Malaka","Manggarai","Manggarai Barat","Manggarai Timur","Nagekeo","Ngada","Rote Ndao","Sabu Raijua","Sikka","Sumba Barat","Sumba Barat Daya","Sumba Tengah","Sumba Timur","Timor Tengah Selatan","Timor Tengah Utara"],
    "Kalimantan Barat": ["Bengkayang","Kapuas Hulu","Kayong Utara","Ketapang","Kubu Raya","Landak","Melawi","Mempawah","Pontianak","Sambas","Sanggau","Sekadau","Singkawang","Sintang"],
    "Kalimantan Tengah": ["Barito Selatan","Barito Timur","Barito Utara","Gunung Mas","Kapuas","Katingan","Kotawaringin Barat","Kotawaringin Timur","Lamandau","Murung Raya","Palangka Raya","Pulang Pisau","Seruyan","Sukamara"],
    "Kalimantan Selatan": ["Balangan","Banjar","Banjarbaru","Banjarmasin","Barito Kuala","Hulu Sungai Selatan","Hulu Sungai Tengah","Hulu Sungai Utara","Kotabaru","Tabalong","Tanah Bumbu","Tanah Laut","Tapin"],
    "Kalimantan Timur": ["Balikpapan","Berau","Bontang","Kutai Barat","Kutai Kartanegara","Kutai Timur","Mahakam Ulu","Paser","Penajam Paser Utara","Samarinda"],
    "Kalimantan Utara": ["Bulungan","Malinau","Nunukan","Tana Tidung","Tarakan"],
    "Sulawesi Utara": ["Bitung","Bolaang Mongondow","Bolaang Mongondow Selatan","Bolaang Mongondow Timur","Bolaang Mongondow Utara","Kepulauan Sangihe","Kepulauan Siau Tagulandang Biaro","Kepulauan Talaud","Kotamobagu","Manado","Minahasa","Minahasa Selatan","Minahasa Tenggara","Minahasa Utara","Tomohon"],
    "Sulawesi Tengah": ["Banggai","Banggai Kepulauan","Banggai Laut","Buol","Donggala","Morowali","Morowali Utara","Palu","Parigi Moutong","Poso","Sigi","Tojo Una-Una","Tolitoli"],
    "Sulawesi Selatan": ["Bantaeng","Barru","Bone","Bulukumba","Enrekang","Gowa","Jeneponto","Kepulauan Selayar","Luwu","Luwu Timur","Luwu Utara","Makassar","Maros","Palopo","Pangkajene dan Kepulauan","Parepare","Pinrang","Sidenreng Rappang","Sinjai","Soppeng","Takalar","Tana Toraja","Toraja Utara","Wajo"],
    "Sulawesi Tenggara": ["Baubau","Bombana","Buton","Buton Selatan","Buton Tengah","Buton Utara","Kendari","Kolaka","Kolaka Timur","Kolaka Utara","Konawe","Konawe Kepulauan","Konawe Selatan","Konawe Utara","Muna","Muna Barat","Wakatobi"],
    "Gorontalo": ["Boalemo","Bone Bolango","Gorontalo","Gorontalo Utara","Pohuwato"],
    "Sulawesi Barat": ["Majene","Mamasa","Mamuju","Mamuju Tengah","Pasangkayu","Polewali Mandar"],
    "Maluku": ["Ambon","Buru","Buru Selatan","Kepulauan Aru","Kepulauan Tanimbar","Maluku Barat Daya","Maluku Tengah","Maluku Tenggara","Seram Bagian Barat","Seram Bagian Timur","Tual"],
    "Maluku Utara": ["Halmahera Barat","Halmahera Selatan","Halmahera Tengah","Halmahera Timur","Halmahera Utara","Kepulauan Sula","Pulau Morotai","Pulau Taliabu","Ternate","Tidore Kepulauan"],
    "Papua Selatan": ["Asmat","Boven Digoel","Mappi","Merauke"],
    "Papua Tengah": ["Deiyai","Dogiyai","Intan Jaya","Mimika","Nabire","Paniai","Puncak","Puncak Jaya"],
    "Papua Pegunungan": ["Jayawijaya","Lanny Jaya","Mamberamo Tengah","Nduga","Pegunungan Bintang","Tolikara","Yahukimo","Yalimo"],
    "Papua": ["Biak Numfor","Jayapura","Keerom","Kepulauan Yapen","Mamberamo Raya","Sarmi","Supiori","Waropen"],
    "Papua Barat": ["Fakfak","Kaimana","Manokwari","Manokwari Selatan","Pegunungan Arfak","Teluk Bintuni","Teluk Wondama"],
    "Papua Barat Daya": ["Maybrat","Raja Ampat","Sorong","Sorong Selatan","Tambrauw"]
};

// Facility-type load-curve profiles — ported from the internal
// planner's `profileData` (opening/closing hours, prep & idle load as
// a % of base load, peak-load windows, ramp duration in minutes).
// Times are decimal hours (e.g. 12.5 = 12:30). "other" is a generic
// fallback the internal tool doesn't have (no custom profile there).
const FACILITY_PROFILES = {
    restaurant: {
        label: "Restaurant", opening: 9, closing: 22,
        includePeaks: true, peaks: [{ start: 12, end: 14 }, { start: 19, end: 21 }],
        rampDurationMin: 60,
        includePrep: true, prepStart: 6, prepEnd: 9, prepLoadPercent: 50,
        idleLoadPercent: 20
    },
    office: {
        label: "Office", opening: 8, closing: 18,
        includePeaks: true, peaks: [{ start: 9, end: 17 }],
        rampDurationMin: 120,
        includePrep: false, prepStart: 0, prepEnd: 0, prepLoadPercent: 0,
        idleLoadPercent: 15
    },
    mall: {
        label: "Mall / Retail", opening: 10, closing: 22,
        includePeaks: true, peaks: [{ start: 12, end: 21 }],
        rampDurationMin: 60,
        includePrep: true, prepStart: 9, prepEnd: 10, prepLoadPercent: 50,
        idleLoadPercent: 25
    },
    hospital: {
        label: "Hospital", opening: 0, closing: 23.9833,
        includePeaks: false, peaks: [],
        rampDurationMin: 60,
        includePrep: true, prepStart: 8, prepEnd: 20, prepLoadPercent: 110,
        idleLoadPercent: 100
    },
    industrial_247: {
        label: "24/7 Factory", opening: 0, closing: 23.9833,
        includePeaks: false, peaks: [],
        rampDurationMin: 0,
        includePrep: false, prepStart: 0, prepEnd: 0, prepLoadPercent: 0,
        idleLoadPercent: 100
    },
    industrial_1shift: {
        label: "1-Shift Factory", opening: 7, closing: 17,
        includePeaks: true, peaks: [{ start: 7.5, end: 16.5 }],
        rampDurationMin: 60,
        includePrep: false, prepStart: 0, prepEnd: 0, prepLoadPercent: 0,
        idleLoadPercent: 5
    },
    residential: {
        label: "Residential Complex", opening: 6, closing: 23,
        includePeaks: true, peaks: [{ start: 7, end: 9 }, { start: 18, end: 21 }],
        rampDurationMin: 60,
        includePrep: false, prepStart: 0, prepEnd: 0, prepLoadPercent: 0,
        idleLoadPercent: 70
    },
    streetlights: {
        label: "Street Lighting", opening: 0, closing: 23.9833,
        includePeaks: true, peaks: [{ start: 0, end: 6 }, { start: 18, end: 23.9833 }],
        rampDurationMin: 15,
        includePrep: false, prepStart: 0, prepEnd: 0, prepLoadPercent: 0,
        idleLoadPercent: 0
    },
    // Not present in the internal tool — generic fallback for "Other".
    other: {
        label: "Other Facility", opening: 9, closing: 18,
        includePeaks: false, peaks: [],
        rampDurationMin: 60,
        includePrep: false, prepStart: 0, prepEnd: 0, prepLoadPercent: 0,
        idleLoadPercent: 20
    }
};

// Assumptions — same defaults as the internal planner's end-user /
// direct-purchase model.
const PANEL_WATT_PEAK = 580;              // Wp per panel
const MAX_IRRADIANCE_WM2 = 850;           // W/m², used for peak-output sizing
const SINGLE_PANEL_PEAK_KW = (PANEL_WATT_PEAK / 1000) * (MAX_IRRADIANCE_WM2 / 1000);
const PANEL_AREA_M2 = 2.02 * 1.0;         // m² per panel (2.02m x 1.0m)
const FIXED_PERMIT_COST = 26000000;       // Rp, fixed permitting costs
const COST_PER_KWP = 10806717;            // Rp / kWp, turnkey EPC cost
const PROFIT_MARGIN = 0.35;               // Direct-purchase profit margin
const ANNUAL_OPEX_PER_KWP = 100000;       // Rp / kWp / year
const PLN_TARIFF_INCREASE = 0.02;         // 2%/yr escalation
const PANEL_DEGRADATION = 0.007;          // 0.7%/yr
const OPERATING_YEARS = 20;
const GRID_EMISSION_FACTOR = 0.6789984307; // kgCO2e / kWh

// Environmental / CSR equivalency — same source as the internal
// planner (mangrove-based sequestration & planting-cost proxy).
const MANGROVE_SEQUESTRATION_KG_HA = 513300; // kgCO2e / hectare
const MANGROVE_DENSITY_TREES_HA = 10000;     // trees / hectare
const MANGROVE_COST_PER_TREE = 20000;        // Rp / tree

// BOT / ZeroCapEx Solar Leasing model — tariff discount applied to
// the escalated PLN tariff each year (same default as the internal tool).
const SOLAR_LEASING_DISCOUNT = 0.10; // 10%

// Fixed solar-day window — the internal tool solves for the end time
// so the specific yield matches the province's PV potential exactly;
// here the production curve is scaled directly to hit that same
// target, so a fixed 07:00-12:30-18:00 window is a fair simplification.
const SOLAR_START = 7, SOLAR_PEAK = 12.5, SOLAR_END = 18;

const DT = 5 / 60; // 5-minute simulation step, in hours
const STEPS = Math.round(24 / DT);

let lastResult = null; // kept around so the PDF export can reuse it

// =====================================================================
// Setup
// =====================================================================

function initProvinces() {

    const select = document.getElementById("provinceSelect");
    const citySelect = document.getElementById("cityInput");
    if (!select) return;

    const provinces = Object.keys(PV_POTENTIAL_DATA).sort();

    provinces.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (name === "DKI Jakarta") opt.selected = true;
        select.appendChild(opt);
    });

    if (citySelect) {
        populateCities(select.value, citySelect);
        select.addEventListener("change", () => populateCities(select.value, citySelect));
    }

}

// Fills the City/Regency select for a given province, mirroring the
// internal planner's populateCities().
function populateCities(province, citySelect) {

    citySelect.innerHTML = "";
    const cities = CITY_DATA[province] || [`Ibu kota ${province}`];

    cities.forEach((city) => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
    });

}

function initTariffToggle() {

    const tariffSelect = document.getElementById("tariffSelect");
    const customGroup = document.getElementById("customTariffGroup");

    if (!tariffSelect || !customGroup) return;

    tariffSelect.addEventListener("change", () => {
        customGroup.hidden = tariffSelect.value !== "custom";
    });

}

// =====================================================================
// Load-curve simulation (ported from the internal planner)
// =====================================================================

// Builds the day's keyframes (time -> load in kW) for a given base
// load, mirroring the internal tool's keyframe list exactly (later
// entries win on time collisions, same as its Map-based de-dupe).
function buildKeyframes(profile, baseLoad, idleLoad, prepLoad, peakAddon) {

    const frames = [{ t: 0, load: idleLoad }, { t: 24, load: idleLoad }];

    if (profile.includePrep) {
        frames.push({ t: profile.prepStart, load: prepLoad });
        frames.push({ t: profile.prepEnd, load: baseLoad });
    } else {
        frames.push({ t: profile.opening, load: baseLoad });
    }

    if (profile.includePeaks) {
        profile.peaks.forEach((p) => {
            frames.push({ t: p.start, load: peakAddon });
            frames.push({ t: p.end, load: baseLoad });
        });
    }

    frames.push({ t: profile.closing, load: idleLoad });

    const byTime = new Map();
    frames.forEach((f) => byTime.set(f.t, f));
    return Array.from(byTime.values()).sort((a, b) => a.t - b.t);

}

// Load at time t (hours), with linear ramping into the next keyframe
// over the last `rampHours` before it — same approach as the internal
// tool's d3.scaleLinear ramp.
function getLoadAt(keyframes, t, rampHours) {

    let current = keyframes[0];
    for (const k of keyframes) {
        if (k.t <= t) current = k; else break;
    }
    const next = keyframes.find((k) => k.t > t);

    let load = current.load;
    if (next && rampHours >= 0 && t > next.t - rampHours && t <= next.t) {
        const frac = rampHours > 0 ? (t - (next.t - rampHours)) / rampHours : 1;
        load = current.load + (next.load - current.load) * Math.min(1, Math.max(0, frac));
    }
    return load;

}

// Fits a base load (kW) so the simulated day's total energy matches
// the facility's estimated daily consumption, then returns the
// resulting 5-minute load curve plus the final peak-load add-on —
// same 10-iteration convergence the internal tool uses.
function simulateLoadCurve(profile, totalEnergyKwh, maxPossibleLoadKva) {

    let operatingHours;
    if (profile.closing > profile.opening) {
        operatingHours = profile.closing - profile.opening;
    } else if (profile.closing < profile.opening) {
        operatingHours = (24 - profile.opening) + profile.closing;
    } else {
        operatingHours = 24;
    }
    if (operatingHours <= 0) operatingHours = 24;

    const rampHours = profile.rampDurationMin / 60;
    let baseLoad = (totalEnergyKwh / operatingHours) * 0.5;
    let points = [];

    for (let iter = 0; iter < 10; iter++) {

        const peakAddon = Math.max(0, maxPossibleLoadKva - baseLoad);
        const idleLoad = baseLoad * (profile.idleLoadPercent / 100);
        const prepLoad = profile.includePrep ? baseLoad * (profile.prepLoadPercent / 100) : 0;
        const keyframes = buildKeyframes(profile, baseLoad, idleLoad, prepLoad, peakAddon);

        points = [];
        let sumEnergy = 0;
        for (let i = 0; i < STEPS; i++) {
            const t = i * DT;
            const load = getLoadAt(keyframes, t, rampHours);
            points.push({ t, consumption: load });
            sumEnergy += load * DT;
        }

        const error = totalEnergyKwh - sumEnergy;
        baseLoad += error / operatingHours;
        if (baseLoad < 0) baseLoad = 0;

    }

    const finalPeakAddon = Math.max(0, maxPossibleLoadKva - baseLoad);

    return { points, baseLoad, peakAddon: finalPeakAddon };

}

// Unit Gaussian solar-day shape (peak = 1), zero outside the window.
function solarShape(t) {
    if (t < SOLAR_START || t > SOLAR_END) return 0;
    const sigma = t < SOLAR_PEAK
        ? (SOLAR_PEAK - SOLAR_START) / 3
        : (SOLAR_END - SOLAR_PEAK) / 3;
    if (sigma <= 0) return 0;
    return Math.exp(-Math.pow(t - SOLAR_PEAK, 2) / (2 * sigma * sigma));
}

function findPaybackYear(series) {
    if (series.length < 2 || series[0].value > 0) return Infinity;
    for (let i = 1; i < series.length; i++) {
        if (series[i].value >= 0) {
            const prev = series[i - 1].value;
            const flow = series[i].value - prev;
            if (flow <= 0) continue;
            return series[i - 1].year + (-prev / flow);
        }
    }
    return Infinity;
}

// =====================================================================
// Calculation
// =====================================================================

function initCalcForm() {

    const form = document.getElementById("solarCalcForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const errorEl = document.getElementById("calcFormError");
        errorEl.textContent = "";
        errorEl.classList.remove("is-visible");

        const province = document.getElementById("provinceSelect").value;
        const city = document.getElementById("cityInput").value.trim() || "your city";
        const facilityKey = document.getElementById("facilitySelect").value;
        const kva = parseFloat(document.getElementById("kvaInput").value) || 0;
        const tariffSelect = document.getElementById("tariffSelect");
        const tariff = tariffSelect.value === "custom"
            ? parseFloat(document.getElementById("customTariffInput").value) || 0
            : parseFloat(tariffSelect.value);
        const monthlyBill = parseFloat(document.getElementById("billInput").value) || 0;

        if (monthlyBill <= 0 || tariff <= 0 || kva <= 0) {
            errorEl.textContent = "Please fill in the kVA capacity, tariff, and monthly bill with valid numbers.";
            errorEl.classList.add("is-visible");
            return;
        }

        const result = computeEstimate({ province, city, facilityKey, kva, tariff, monthlyBill });
        lastResult = result;

        renderResult(result);

    });

}

function computeEstimate({ province, city, facilityKey, kva, tariff, monthlyBill }) {

    const profile = FACILITY_PROFILES[facilityKey] || FACILITY_PROFILES.other;
    const pvPotential = PV_POTENTIAL_DATA[province] || 3.8; // kWh/kWp/day

    // Estimated daily energy use, back-calculated from the monthly bill.
    const totalEnergyKwh = monthlyBill / (30 * tariff);

    // --- Load-curve simulation (per-facility profile) ---
    const { points, baseLoad, peakAddon } = simulateLoadCurve(profile, totalEnergyKwh, kva);

    // --- System sizing: match the peak-load add-on (internal tool's
    // default "Match Peak Load Add-on" method), with a floor so the
    // public tool never surfaces a 0 kWp recommendation.
    let targetLoad = peakAddon;
    if (targetLoad <= 0) targetLoad = Math.max(1, kva * 0.3);

    const panelCount = Math.max(1, Math.ceil(targetLoad / SINGLE_PANEL_PEAK_KW));
    const systemSizeKwp = panelCount * (PANEL_WATT_PEAK / 1000);
    const panelAreaM2 = Math.round(panelCount * PANEL_AREA_M2);

    // --- Solar production, calibrated so its daily total matches the
    // province's PV potential exactly (kWh/kWp/day x system size).
    let shapeIntegral = 0;
    points.forEach((p) => { shapeIntegral += solarShape(p.t) * DT; });
    const theoreticalMaxKw = shapeIntegral > 0 ? (systemSizeKwp * pvPotential) / shapeIntegral : 0;

    let dailySolarConsumed = 0;
    points.forEach((p) => {
        p.solarProduction = theoreticalMaxKw * solarShape(p.t);
        p.overlay = Math.min(p.consumption, p.solarProduction);
        dailySolarConsumed += p.overlay * DT;
    });
    const dailySolarProduction = systemSizeKwp * pvPotential;

    const coveragePct = totalEnergyKwh > 0
        ? Math.min(100, (dailySolarConsumed / totalEnergyKwh) * 100)
        : 0;

    // --- Financials: Direct Purchase (end-user) model ---
    const capexPrePpn = FIXED_PERMIT_COST + systemSizeKwp * COST_PER_KWP;
    const investment = capexPrePpn / (1 - PROFIT_MARGIN);
    const annualOpex = systemSizeKwp * ANNUAL_OPEX_PER_KWP;

    let cumulative = -investment;
    const series = [{ year: 0, value: cumulative }]; // Direct Purchase cumulative NCF
    const yearlyRows = []; // for the year-by-year table
    let lifetimeSavings = 0;
    let annualSavingsY1 = 0;

    // --- BOT / ZeroCapEx Solar Leasing model (parallel yearly loop) ---
    let totalBotSavings = 0;
    let botY1Savings = 0;

    // --- Environmental impact (20yr) ---
    let totalEmissionsReductionKg = 0;

    // --- Annual bill comparison (PLN-only vs Direct-Purchase vs BOT) ---
    const annualBillsPln = [];
    const annualBillsDp = [];
    const annualBillsBot = [];

    for (let year = 1; year <= OPERATING_YEARS; year++) {
        const degradationFactor = Math.pow(1 - PANEL_DEGRADATION, year - 1);
        const annualSolarConsumed = dailySolarConsumed * 365 * degradationFactor;
        const escalatedTariff = tariff * Math.pow(1 + PLN_TARIFF_INCREASE, year - 1);

        // Direct purchase
        const annualSavings = annualSolarConsumed * escalatedTariff;
        const annualNetSavings = annualSavings - annualOpex;
        if (year === 1) annualSavingsY1 = annualSavings;
        lifetimeSavings += annualSavings;
        cumulative += annualNetSavings;
        series.push({ year, value: cumulative });
        yearlyRows.push({ year, savings: annualSavings, opex: annualOpex, ncf: annualNetSavings, accumNcf: cumulative });

        // BOT / leasing
        const escalatedSolarTariff = escalatedTariff * (1 - SOLAR_LEASING_DISCOUNT);
        const botAnnualSavings = annualSolarConsumed * (escalatedTariff - escalatedSolarTariff);
        if (year === 1) botY1Savings = botAnnualSavings;
        totalBotSavings += botAnnualSavings;

        // Environmental
        totalEmissionsReductionKg += annualSolarConsumed * GRID_EMISSION_FACTOR;

        // Annual bills comparison
        const annualTotalConsumption = totalEnergyKwh * 365;
        const annualGridImport = Math.max(0, annualTotalConsumption - annualSolarConsumed);
        const costFromGrid = annualGridImport * escalatedTariff;
        annualBillsPln.push({ year, cost: annualTotalConsumption * escalatedTariff });
        annualBillsDp.push({ year, cost: costFromGrid + annualOpex });
        annualBillsBot.push({ year, cost: costFromGrid + (annualSolarConsumed * escalatedSolarTariff) });
    }

    let paybackYears = findPaybackYear(series);
    if (!isFinite(paybackYears)) {
        const netY1 = annualSavingsY1 - annualOpex;
        paybackYears = netY1 > 0 ? investment / netY1 : OPERATING_YEARS;
    }

    const monthlySavings = annualSavingsY1 / 12;
    const newMonthlyBill = Math.max(0, monthlyBill - monthlySavings);

    const avgBotSavings = totalBotSavings / OPERATING_YEARS;
    const botMonthlySavings = botY1Savings / 12;
    const botNewMonthlyBill = Math.max(0, monthlyBill - botMonthlySavings);
    const solarLeasingTariff = tariff * (1 - SOLAR_LEASING_DISCOUNT);

    const totalEmissionsReductionTon = totalEmissionsReductionKg / 1000;
    const avgEmissionsReductionTon = totalEmissionsReductionTon / OPERATING_YEARS;
    const totalMangroveHectares = MANGROVE_SEQUESTRATION_KG_HA > 0
        ? totalEmissionsReductionKg / MANGROVE_SEQUESTRATION_KG_HA : 0;
    const totalMangroveTrees = totalMangroveHectares * MANGROVE_DENSITY_TREES_HA;
    const totalCsrValue = totalMangroveTrees * MANGROVE_COST_PER_TREE;
    const equivalentTrees = Math.round(totalMangroveTrees / OPERATING_YEARS); // annualized, for the quick stat

    // --- Full breakdown figures (consumption / solar system / energy mix) ---
    const specificYield = systemSizeKwp > 0 ? dailySolarProduction / systemSizeKwp : 0;
    const dailyExcessSurplus = Math.max(0, dailySolarProduction - dailySolarConsumed);
    const dailyGridImport = Math.max(0, totalEnergyKwh - dailySolarConsumed);
    const prodUtilizedPct = dailySolarProduction > 0 ? (dailySolarConsumed / dailySolarProduction) * 100 : 0;
    const prodSurplusPct = dailySolarProduction > 0 ? (dailyExcessSurplus / dailySolarProduction) * 100 : 0;

    // Base/idle/prep loads for the consumption breakdown (re-derive
    // from the simulated curve's own profile — mirrors the internal
    // tool's displayed values).
    const idleLoadKw = Math.min(...points.map((p) => p.consumption));
    const maxOutputKw = Math.max(...points.map((p) => p.solarProduction));

    return {
        province, city, facilityLabel: profile.label,
        kva, tariff, monthlyBill, newMonthlyBill,
        systemSizeKwp, coveragePct, monthlySavings,
        investment, paybackYears, lifetimeSavings,
        annualCo2Ton: avgEmissionsReductionTon, equivalentTrees,
        panelCount, panelAreaM2,
        chartData: points, dailySolarProduction, dailySolarConsumed,

        // Consumption breakdown
        baseLoadKw: baseLoad,
        idleLoadDisplayKw: baseLoad * (profile.idleLoadPercent / 100),
        prepLoadDisplayKw: profile.includePrep ? baseLoad * (profile.prepLoadPercent / 100) : 0,
        peakAddonKw: peakAddon, idleLoadKw, maxOutputKw,
        dailyCostPrePv: totalEnergyKwh * tariff,
        monthlyBillPrePv: totalEnergyKwh * tariff * 30,

        // Energy mix
        dailyGridImport, dailyExcessSurplus, specificYield,
        prodVsPotentialPct: Math.min(100, coveragePct > 0 ? (specificYield / pvPotential) * 100 : 0),
        prodUtilizedPct, prodSurplusPct,

        // BOT / leasing
        solarLeasingTariff, botY1Savings, totalBotSavings, avgBotSavings,
        botMonthlySavings, botNewMonthlyBill,

        // Environmental / CSR
        totalEmissionsReductionTon, avgEmissionsReductionTon,
        totalMangroveHectares, totalMangroveTrees, totalCsrValue,

        // Tables & charts
        yearlyRows, annualBillsPln, annualBillsDp, annualBillsBot
    };

}

// =====================================================================
// Production vs. consumption chart (inline SVG, no chart library)
// =====================================================================

function buildProductionChartSvg(points) {

    const width = 640, height = 220;
    const marginL = 8, marginR = 8, marginT = 14, marginB = 22;
    const innerW = width - marginL - marginR;
    const innerH = height - marginT - marginB;

    const maxVal = Math.max(1, ...points.map((p) => Math.max(p.consumption, p.solarProduction))) * 1.15;

    const x = (t) => marginL + (t / 24) * innerW;
    const y = (v) => marginT + innerH - (v / maxVal) * innerH;

    const linePath = (key) => points
        .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p[key]).toFixed(1)}`)
        .join(" ");

    const overlayAreaPath = (() => {
        const top = points
            .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.overlay).toFixed(1)}`)
            .join(" ");
        return `${top} L${x(24).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;
    })();

    let gridlines = "";
    for (let h = 0; h <= 24; h += 4) {
        gridlines += `<line x1="${x(h).toFixed(1)}" y1="${marginT}" x2="${x(h).toFixed(1)}" y2="${(marginT + innerH).toFixed(1)}" stroke="var(--border)" stroke-width="1" />`;
        gridlines += `<text x="${x(h).toFixed(1)}" y="${height - 6}" font-size="10" fill="var(--muted)" text-anchor="middle" font-family="Poppins, sans-serif">${h}:00</text>`;
    }

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        ${gridlines}
        <path d="${overlayAreaPath}" fill="rgba(16,185,129,0.32)" stroke="none"></path>
        <path d="${linePath("consumption")}" fill="none" stroke="#2f80ed" stroke-width="1.6"></path>
        <path d="${linePath("solarProduction")}" fill="none" stroke="#e78a12" stroke-width="1.6"></path>
    </svg>`;

}

function renderProductionChart(r) {

    const container = document.getElementById("productionChart");
    if (!container) return;
    container.innerHTML = buildProductionChartSvg(r.chartData);

}

// =====================================================================
// Annual electricity bill comparison chart (PLN-only vs BOT vs Direct
// Purchase, over the 20-year horizon) — inline SVG line chart.
// =====================================================================

function buildAnnualBillsChartSvg(pln, dp, bot) {

    const width = 640, height = 260;
    const marginL = 60, marginR = 10, marginT = 18, marginB = 26;
    const innerW = width - marginL - marginR;
    const innerH = height - marginT - marginB;

    const years = pln.length;
    const allCosts = pln.concat(dp, bot).map((d) => d.cost);
    const maxCost = Math.max(1, ...allCosts) * 1.1;

    const x = (year) => marginL + ((year - 1) / (years - 1)) * innerW;
    const y = (v) => marginT + innerH - (v / maxCost) * innerH;

    const linePath = (data) => data
        .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.year).toFixed(1)},${y(d.cost).toFixed(1)}`)
        .join(" ");

    let gridlines = "";
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
        const v = (maxCost / yTicks) * i;
        const yPos = y(v);
        gridlines += `<line x1="${marginL}" y1="${yPos.toFixed(1)}" x2="${width - marginR}" y2="${yPos.toFixed(1)}" stroke="var(--border)" stroke-width="1" />`;
        gridlines += `<text x="${marginL - 8}" y="${(yPos + 3).toFixed(1)}" font-size="9.5" fill="var(--muted)" text-anchor="end" font-family="Poppins, sans-serif">${(v / 1e6).toFixed(0)}jt</text>`;
    }
    for (let yr = 1; yr <= years; yr += Math.ceil(years / 10)) {
        gridlines += `<text x="${x(yr).toFixed(1)}" y="${height - 8}" font-size="9.5" fill="var(--muted)" text-anchor="middle" font-family="Poppins, sans-serif">Y${yr}</text>`;
    }

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        ${gridlines}
        <path d="${linePath(pln)}" fill="none" stroke="#EF4444" stroke-width="2"></path>
        <path d="${linePath(bot)}" fill="none" stroke="#10B981" stroke-width="2"></path>
        <path d="${linePath(dp)}" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-dasharray="5,4"></path>
        <g font-family="Poppins, sans-serif" font-size="10.5">
            <rect x="${marginL}" y="4" width="10" height="10" fill="#EF4444"></rect>
            <text x="${marginL + 14}" y="13" fill="var(--ink)">Without PV</text>
            <rect x="${marginL + 120}" y="4" width="10" height="10" fill="#10B981"></rect>
            <text x="${marginL + 134}" y="13" fill="var(--ink)">With PV (BOT)</text>
            <rect x="${marginL + 260}" y="4" width="10" height="10" fill="#8B5CF6"></rect>
            <text x="${marginL + 274}" y="13" fill="var(--ink)">With PV (Direct Purchase)</text>
        </g>
    </svg>`;

}

function renderAnnualBillsChart(r) {

    const container = document.getElementById("annualBillsChart");
    if (!container) return;
    container.innerHTML = buildAnnualBillsChartSvg(r.annualBillsPln, r.annualBillsDp, r.annualBillsBot);

}

// =====================================================================
// Year-by-year table (Direct Purchase) + expand/collapse toggle
// =====================================================================

function renderYearlyTable(r) {

    const body = document.getElementById("yearlyTableBody");
    if (!body) return;

    body.innerHTML = r.yearlyRows.map((row) => `
        <tr>
            <td>${row.year}</td>
            <td>${formatRupiah(row.savings)}</td>
            <td>${formatRupiah(row.opex)}</td>
            <td>${formatRupiah(row.ncf)}</td>
            <td>${formatRupiah(row.accumNcf)}</td>
        </tr>
    `).join("");

}

function initYearlyTableToggle() {

    const btn = document.getElementById("toggleYearlyTable");
    const wrap = document.getElementById("yearlyTableWrap");
    if (!btn || !wrap) return;

    btn.addEventListener("click", () => {
        const isOpen = !wrap.hidden;
        wrap.hidden = isOpen;
        btn.classList.toggle("is-open", !isOpen);
        btn.innerHTML = isOpen
            ? `Expand Table <i class="fa-solid fa-chevron-down"></i>`
            : `Collapse Table <i class="fa-solid fa-chevron-down"></i>`;
    });

}

// =====================================================================
// Render
// =====================================================================

function renderResult(r) {

    document.getElementById("emptyState").hidden = true;
    const output = document.getElementById("calcOutput");
    output.hidden = false;

    document.getElementById("summaryBanner").innerHTML =
        `For a <b>${escapeHtml(r.facilityLabel)}</b> in <b>${escapeHtml(r.city)}, ${escapeHtml(r.province)}</b> ` +
        `with an installed PLN capacity of <b>${formatNumber(r.kva)} kVA</b> and a monthly bill of <b>${formatRupiah(r.monthlyBill)}</b>, ` +
        `here is your estimated solar system:`;

    document.getElementById("statSystemSize").textContent = `${formatNumber(r.systemSizeKwp)} kWp`;
    document.getElementById("statPanelCountShort").textContent = `± ${r.panelCount} solar panels`;
    document.getElementById("statCoverage").textContent = `${formatNumber(r.coveragePct)}%`;
    document.getElementById("statMonthlySavings").textContent = formatRupiah(r.monthlySavings);
    document.getElementById("statBillCompare").textContent =
        `Bill drops from ${formatRupiah(r.monthlyBill)} to ± ${formatRupiah(r.newMonthlyBill)}`;

    const fitNote = document.getElementById("fitNote");
    if (r.coveragePct < 30) {
        fitNote.hidden = false;
        fitNote.querySelector("span").textContent =
            "This load profile largely falls outside daylight hours, so on-grid solar coverage tends to be more limited than for other facility types.";
    } else {
        fitNote.hidden = true;
    }

    renderProductionChart(r);

    // --- BOT / Leasing tariff strip (unlocked, above the chart) ---
    document.getElementById("statPlnTariff").textContent = `Rp ${formatNumber(r.tariff)}/kWh`;
    document.getElementById("statSolarTariff").textContent = `Rp ${formatNumber(r.solarLeasingTariff)}/kWh`;

    // --- Sales pitch: conventional (PLN-only) vs. solar, 20-year outlook.
    // Uses the ongoing-cost totals only (grid + opex) so the upfront
    // investment figure stays a reason to unlock the full breakdown.
    const total20yConventional = r.annualBillsPln.reduce((sum, row) => sum + row.cost, 0);
    const total20yWithSolar = r.annualBillsDp.reduce((sum, row) => sum + row.cost, 0);
    const total20ySavings = Math.max(0, total20yConventional - total20yWithSolar);
    const total20ySavingsPct = total20yConventional > 0
        ? (total20ySavings / total20yConventional) * 100 : 0;

    document.getElementById("pitchConventionalCost").textContent = formatRupiah(total20yConventional);
    document.getElementById("pitchSolarCost").textContent = formatRupiah(total20yWithSolar);
    document.getElementById("pitchSavingsAmount").textContent = formatRupiah(total20ySavings);
    document.getElementById("pitchSavingsPct").textContent = `${formatNumber(total20ySavingsPct)}%`;
    document.getElementById("pitchCo2").textContent = `${formatNumber(r.totalEmissionsReductionTon)} tCO2e`;
    document.getElementById("pitchTrees").textContent = `± ${formatNumber(Math.round(r.totalMangroveTrees))}`;

    // --- Consumption breakdown ---
    document.getElementById("cBaseLoad").textContent = `${formatNumber(r.baseLoadKw)} kW`;
    document.getElementById("cPeakLoad").textContent = `${formatNumber(r.peakAddonKw)} kW`;
    document.getElementById("cMaxLoad").textContent = `${formatNumber(r.kva)} kVA`;
    document.getElementById("cPrepIdleLoad").textContent =
        `${formatNumber(r.prepLoadDisplayKw)} / ${formatNumber(r.idleLoadDisplayKw)} kW`;
    document.getElementById("cDailyCostPrePv").textContent = formatRupiah(r.dailyCostPrePv);
    document.getElementById("cMonthlyBillPrePv").textContent = formatRupiah(r.monthlyBillPrePv);

    // --- Solar PV system ---
    document.getElementById("sIdealPanels").textContent = r.panelCount;
    document.getElementById("sSystemSize").textContent = `${formatNumber(r.systemSizeKwp)} kWp`;
    document.getElementById("sTotalArea").textContent = `${formatNumber(r.panelAreaM2)} m²`;
    document.getElementById("sMaxOutput").textContent = `${formatNumber(r.maxOutputKw)} kW`;

    // --- Energy mix ---
    document.getElementById("eSolarConsumed").textContent = `${formatNumber(r.dailySolarConsumed)} kWh`;
    document.getElementById("eGridImport").textContent = `${formatNumber(r.dailyGridImport)} kWh`;
    document.getElementById("eExcessSurplus").textContent = `${formatNumber(r.dailyExcessSurplus)} kWh`;
    document.getElementById("eTotalProduction").textContent = `${formatNumber(r.dailySolarProduction)} kWh`;
    document.getElementById("eSpecificYield").textContent = `${formatNumber(r.specificYield)} kWh/kWp`;
    document.getElementById("eSolarMix").textContent = `${formatNumber(r.coveragePct)}%`;

    // --- BOT / Leasing ---
    document.getElementById("botOldBill").textContent = formatRupiah(r.monthlyBill);
    document.getElementById("botNewBill").textContent = formatRupiah(r.botNewMonthlyBill);
    document.getElementById("botMonthlySavings").textContent = `${formatRupiah(r.botMonthlySavings)}/mo`;
    document.getElementById("botY1Savings").textContent = formatRupiah(r.botY1Savings);
    document.getElementById("botTotalSavings").textContent = formatRupiah(r.totalBotSavings);
    document.getElementById("botAvgSavings").textContent = formatRupiah(r.avgBotSavings);

    // --- Direct purchase ---
    document.getElementById("dpOldBill").textContent = formatRupiah(r.monthlyBill);
    document.getElementById("dpNewBill").textContent = formatRupiah(r.newMonthlyBill);
    document.getElementById("dpMonthlySavings").textContent = `${formatRupiah(r.monthlySavings)}/mo`;
    document.getElementById("statPayback").textContent = `${formatNumber(r.paybackYears)} years`;
    document.getElementById("statLifetimeSavings").textContent = formatRupiah(r.lifetimeSavings);
    document.getElementById("statInvestment").textContent = formatRupiah(r.investment);

    // --- Environmental / CSR ---
    document.getElementById("envTotalEmissions").textContent = `${formatNumber(r.totalEmissionsReductionTon)} tCO2e`;
    document.getElementById("envAvgEmissions").textContent = `${formatNumber(r.avgEmissionsReductionTon)} tCO2e`;
    document.getElementById("envMangroveHa").textContent = `${formatNumber(r.totalMangroveHectares)} ha`;
    document.getElementById("envMangroveTrees").textContent = `± ${formatNumber(r.totalMangroveTrees)} trees`;

    renderAnnualBillsChart(r);
    renderYearlyTable(r);

    // Detail section stays locked until an email has been captured this
    // session — once unlocked, later recalculations stay unlocked too.
    const detailWrap = document.querySelector(".calc-detail-wrap");
    const isUnlocked = sessionStorage.getItem("edash-solar-lead-email");
    detailWrap.classList.toggle("is-locked", !isUnlocked);
    document.getElementById("unlockedActions").hidden = !isUnlocked;

    output.scrollIntoView({ behavior: "smooth", block: "start" });

}

// =====================================================================
// Email gate (dummy — no backend yet)
// =====================================================================

function initEmailGate() {

    const form = document.getElementById("emailGateForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const input = document.getElementById("emailGateInput");
        const errorEl = document.getElementById("emailGateError");
        const submitBtn = document.getElementById("emailGateSubmit");
        const email = input.value.trim();

        errorEl.textContent = "";
        errorEl.classList.remove("is-visible");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorEl.textContent = "Please enter a valid email address.";
            errorEl.classList.add("is-visible");
            return;
        }

        const label = submitBtn.querySelector(".btn-login__label");
        submitBtn.disabled = true;
        if (label) label.textContent = "Verifying...";

        // TODO: replace with a real lead-capture API call. For now this
        // is a dummy capture (kept locally) purely to gate the content.
        setTimeout(() => {

            saveLeadDummy(email);
            sessionStorage.setItem("edash-solar-lead-email", email);

            document.querySelector(".calc-detail-wrap").classList.remove("is-locked");
            document.getElementById("unlockedActions").hidden = false;

            submitBtn.disabled = false;
            if (label) label.textContent = "Unlock Details & Report";

        }, 500);

    });

}

function saveLeadDummy(email) {

    try {
        const key = "edash-solar-leads";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push({ email, capturedAt: new Date().toISOString(), result: lastResult });
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
        // Storage can fail (quota/private mode) — non-critical for the demo.
        console.warn("Could not save dummy lead:", err);
    }

}

// =====================================================================
// PDF export
// =====================================================================

function initPdfDownload() {

    const btn = document.getElementById("downloadPdfBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (!lastResult) return;
        generatePdf(lastResult);
    });

}

function generatePdf(r) {

    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error("jsPDF not loaded");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 106, 113);
    doc.text("360eDash — Solar System Estimate", 14, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text("PT. Pionir Energi Hijau — Initial estimate report, not a final quotation.", 14, y);

    y += 12;
    doc.setDrawColor(231, 237, 238);
    doc.line(14, y, 196, y);

    y += 10;
    doc.setTextColor(37, 52, 63);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Facility Data", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const facilityRows = [
        [`Location`, `${r.city}, ${r.province}`],
        [`Facility Type`, r.facilityLabel],
        [`PLN Capacity`, `${formatNumber(r.kva)} kVA`],
        [`Current Monthly Bill`, formatRupiah(r.monthlyBill)]
    ];
    facilityRows.forEach(([label, value]) => {
        y += 7;
        doc.text(`${label}`, 14, y);
        doc.text(`${value}`, 90, y);
    });

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Solar System Summary", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const summaryRows = [
        [`System Size`, `${formatNumber(r.systemSizeKwp)} kWp (± ${r.panelCount} panels, ± ${formatNumber(r.panelAreaM2)} m²)`],
        [`Solar Energy Coverage`, `${formatNumber(r.coveragePct)}%`],
        [`Daily Solar Production / Consumed`, `${formatNumber(r.dailySolarProduction)} / ${formatNumber(r.dailySolarConsumed)} kWh`],
        [`Daily Specific Yield`, `${formatNumber(r.specificYield)} kWh/kWp`]
    ];
    summaryRows.forEach(([label, value]) => {
        y += 7;
        doc.text(`${label}`, 14, y);
        doc.text(`${value}`, 90, y);
    });

    if (y > 245) { doc.addPage(); y = 20; }
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ZeroCapEx Solar Leasing (BOT)", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const botRows = [
        [`PLN Tariff / Solar Leasing Tariff`, `Rp ${formatNumber(r.tariff)} / Rp ${formatNumber(r.solarLeasingTariff)} per kWh`],
        [`New Monthly Bill (BOT)`, `${formatRupiah(r.botNewMonthlyBill)} (save ${formatRupiah(r.botMonthlySavings)}/mo)`],
        [`Year 1 / 20-Year Savings (BOT)`, `${formatRupiah(r.botY1Savings)} / ${formatRupiah(r.totalBotSavings)}`]
    ];
    botRows.forEach(([label, value]) => {
        y += 7;
        doc.text(`${label}`, 14, y);
        doc.text(`${value}`, 90, y);
    });

    if (y > 245) { doc.addPage(); y = 20; }
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Direct Purchase", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const dpRows = [
        [`Est. System Investment`, formatRupiah(r.investment)],
        [`New Monthly Bill (Direct)`, `${formatRupiah(r.newMonthlyBill)} (save ${formatRupiah(r.monthlySavings)}/mo)`],
        [`Est. Payback Period`, `${formatNumber(r.paybackYears)} years`],
        [`Est. 20-Year Savings`, formatRupiah(r.lifetimeSavings)]
    ];
    dpRows.forEach(([label, value]) => {
        y += 7;
        doc.text(`${label}`, 14, y);
        doc.text(`${value}`, 90, y);
    });

    if (y > 245) { doc.addPage(); y = 20; }
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Environmental Impact & CSR (20yr)", 14, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const envRows = [
        [`Total / Avg. Annual Emissions Reduction`, `${formatNumber(r.totalEmissionsReductionTon)} / ${formatNumber(r.avgEmissionsReductionTon)} tCO2e`],
        [`Mangrove Avoidance Equivalent`, `${formatNumber(r.totalMangroveHectares)} ha (± ${formatNumber(r.totalMangroveTrees)} trees)`],
        [`Total CSR Value`, formatRupiah(r.totalCsrValue)]
    ];
    envRows.forEach(([label, value]) => {
        y += 7;
        doc.text(`${label}`, 14, y);
        doc.text(`${value}`, 90, y);
    });

    if (y > 255) { doc.addPage(); y = 20; }
    y += 14;
    doc.setFontSize(8.5);
    doc.setTextColor(124, 139, 141);
    const disclaimer = doc.splitTextToSize(
        "This estimate is indicative, based on standard assumptions (regional solar irradiance potential, typical load profiles, and prevailing market prices) and was generated automatically by the 360eDash Solar Calculator. Final figures will be adjusted after a technical survey by the 360energy team.",
        182
    );
    doc.text(disclaimer, 14, y);

    doc.save("360energy-solar-estimate.pdf");

}

// =====================================================================
// Formatting helpers
// =====================================================================

function formatRupiah(n) {
    return "Rp" + Math.round(n || 0).toLocaleString("id-ID");
}

function formatNumber(n) {
    return (n || 0).toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}