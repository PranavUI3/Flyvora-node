const home = document.getElementById("home");
const route = document.getElementById("route");
const lead = document.getElementById("lead");
const airline = document.getElementById("airline");
const quality = document.getElementById("quality");

home.addEventListener("click", () => {
    window.location.href = "index.html";
});

route.addEventListener("click", () => {
    window.location.href = "../Route_Heatmap+Trends/routeheatmap.html";
});

lead.addEventListener("click", () => {
    window.location.href = "../Lead-Time/lead-time.html";
});

airline.addEventListener("click", () => {
    window.location.href = "../Airline/airline-comparison.html";
});
    
quality.addEventListener("click", () => {
    window.location.href = "../Data-quality/data-quality.html";
});

Chart.defaults.color = "#94a3b8";
Chart.defaults.borderColor = "rgba(255,255,255,0.08)";
Chart.defaults.font.family = "inherit";

// Shared Grid Options with hover effects
const gridOptions = {
    grid: { color: "rgba(255,255,255,0.06)" },
    ticks: { color: "#94a3b8", font: { size: 10 } },
};

// Global animation options for smooth rendering
const chartAnimationOptions = {
    duration: 1200,
    easing: 'easeOutQuart'
};

// ---------- 1. National & Regional Airfare Price Index Trend ----------
const DEMO_INDEX_TREND = {
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"],
    national: [100, 102, 104, 107, 109, 112, 115, 118.4],
    south: [100, 101, 103, 105, 108, 110, 113, 116],
};

const indexTrendChart = new Chart(document.getElementById("chart-index-trend"), {
    type: "line",
    data: {
        labels: DEMO_INDEX_TREND.labels,
        datasets: [
            {
                label: "National Index",
                data: DEMO_INDEX_TREND.national,
                borderColor: "#60a5fa",
                backgroundColor: "rgba(96,165,250,0.15)",
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: "#60a5fa",
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 2,
            },
            {
                label: "South Regional",
                data: DEMO_INDEX_TREND.south,
                borderColor: "#34d399",
                backgroundColor: "transparent",
                tension: 0.4,
                borderDash: [4, 3],
                pointRadius: 3,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: "#34d399",
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 2,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: chartAnimationOptions,
        interaction: { mode: 'index', intersect: false },
        plugins: { 
            legend: { 
                labels: { boxWidth: 10, font: { size: 11 }, usePointStyle: true } 
            } 
        },
        scales: { x: gridOptions, y: gridOptions },
    },
});

// ---------- 2. Sector Volatility / Route Ranking Table ----------
const DEMO_ROUTES = [
    { route: "DEL-BOM", weight: "30%", change: 18 },
    { route: "DEL-CCU", weight: "12%", change: 21 },
    { route: "DEL-BLR", weight: "25%", change: 12 },
    { route: "BOM-BLR", weight: "15%", change: 7 },
    { route: "BLR-HYD", weight: "10%", change: 5 },
    { route: "MAA-DEL", weight: "8%", change: 9 },
];

function changeColor(pct) {
    if (pct >= 15) return "text-red-400";
    if (pct >= 8) return "text-amber-400";
    return "text-emerald-400";
}

function rowTint(pct) {
    if (pct >= 15) return "bg-red-500/10 hover:bg-red-500/20";
    if (pct >= 8) return "bg-amber-400/10 hover:bg-amber-400/20";
    return "hover:bg-slate-700/30";
}

const heatmapBody = document.getElementById("route-heatmap-body");
DEMO_ROUTES
    .slice()
    .sort((a, b) => b.change - a.change)
    .forEach(({ route, weight, change }) => {
        const tr = document.createElement("tr");
        tr.className = `${rowTint(change)} transition-colors duration-200 cursor-pointer`;
        tr.innerHTML = `
            <td class="py-2.5 px-1 font-medium text-slate-200">${route}</td>
            <td class="py-2.5 px-1 text-right text-slate-400">${weight}</td>
            <td class="py-2.5 px-1 text-right font-semibold ${changeColor(change)}">+${change}%</td>
        `;
        heatmapBody.appendChild(tr);
    });

// ---------- 3. Lead-Time Elasticity Curve ----------
const DEMO_LEAD_TIME = {
    labels: ["T+45", "T+30", "T+15", "T+7", "T+1"],
    prices: [3000, 3200, 3800, 5000, 7500],
};

const leadTimeChart = new Chart(document.getElementById("chart-lead-time"), {
    type: "line",
    data: {
        labels: DEMO_LEAD_TIME.labels,
        datasets: [
            {
                label: "Median Fare (₹)",
                data: DEMO_LEAD_TIME.prices,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245,158,11,0.15)",
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: "#f59e0b",
                pointHoverRadius: 7,
                pointHoverBorderColor: "#ffffff",
                pointHoverBorderWidth: 2,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: chartAnimationOptions,
        interaction: { mode: 'nearest', intersect: false },
        plugins: { legend: { display: false } },
        scales: {
            x: { ...gridOptions, title: { display: true, text: "Days before travel", color: "#64748b", font: { size: 10 } } },
            y: { ...gridOptions, ticks: { ...gridOptions.ticks, callback: (v) => "₹" + v } },
        },
    },
});

// ---------- 4a. Airline Comparison (Bar Chart) ----------
const DEMO_AIRLINES = {
    labels: ["IndiGo", "Air India", "Akasa", "SpiceJet"],
    avgFare: [4200, 4450, 4100, 3950],
};

const airlineComparisonChart = new Chart(document.getElementById("chart-airline-comparison"), {
    type: "bar",
    data: {
        labels: DEMO_AIRLINES.labels,
        datasets: [
            {
                label: "Avg Fare (₹)",
                data: DEMO_AIRLINES.avgFare,
                backgroundColor: ["#60a5fa", "#f87171", "#34d399", "#fbbf24"],
                hoverBackgroundColor: ["#93c5fd", "#fca5a5", "#6ee7b7", "#fde047"],
                borderRadius: 6,
                maxBarThickness: 40,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: chartAnimationOptions,
        plugins: { legend: { display: false } },
        scales: {
            x: { ...gridOptions, grid: { display: false } },
            y: { ...gridOptions, ticks: { ...gridOptions.ticks, callback: (v) => "₹" + v } },
        },
    },
});

// ---------- 4b. Anomaly Alerts List ----------
const DEMO_ANOMALIES = [
    { route: "DEL-CCU", detail: "Fare spiked to ₹18,400 (4.1× median)", severity: "High" },
    { route: "BOM-BLR", detail: "Fare spiked to ₹9,200 (2.3× median)", severity: "High" },
    { route: "MAA-DEL", detail: "Gap in observations for T+7 window", severity: "Medium" },
    { route: "BLR-HYD", detail: "Duplicate quotes detected, auto-resolved", severity: "Low" },
];

const severityStyle = {
    High: "bg-red-500/15 text-red-300 border-red-400/40 shadow-[0_0_8px_rgba(248,113,113,0.2)]",
    Medium: "bg-amber-400/15 text-amber-300 border-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.2)]",
    Low: "bg-slate-500/15 text-slate-300 border-slate-400/40",
};

const alertsList = document.getElementById("anomaly-alerts-list");
DEMO_ANOMALIES.forEach(({ route, detail, severity }) => {
    const li = document.createElement("li");
    li.className = "flex items-start justify-between gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer hover:translate-x-1";
    li.innerHTML = `
        <div>
            <p class="font-medium text-slate-200">${route}</p>
            <p class="text-slate-400 text-[11px] mt-0.5">${detail}</p>
        </div>
        <span class="shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${severityStyle[severity]}">${severity}</span>
    `;
    alertsList.appendChild(li);
});

// ---------- Tab Switching with Smooth Fade ----------
const tabBtnAirlines = document.getElementById("tab-btn-airlines");
const tabBtnAlerts = document.getElementById("tab-btn-alerts");
const panelAirlines = document.getElementById("tab-panel-airlines");
const panelAlerts = document.getElementById("tab-panel-alerts");

function showTab(tab) {
    const isAirlines = tab === "airlines";

    if (isAirlines) {
        panelAlerts.classList.add("hidden");
        panelAirlines.classList.remove("hidden");
        
        tabBtnAirlines.className = "px-3 py-1 rounded-md bg-gradient-to-r from-blue-600/50 to-blue-600/25 text-blue-300 cursor-pointer transition-all duration-200 shadow-sm font-medium";
        tabBtnAlerts.className = "px-3 py-1 rounded-md text-slate-400 cursor-pointer transition-all duration-200 hover:text-slate-200 font-medium";
    } else {
        panelAirlines.classList.add("hidden");
        panelAlerts.classList.remove("hidden");

        tabBtnAlerts.className = "px-3 py-1 rounded-md bg-gradient-to-r from-blue-600/50 to-blue-600/25 text-blue-300 cursor-pointer transition-all duration-200 shadow-sm font-medium";
        tabBtnAirlines.className = "px-3 py-1 rounded-md text-slate-400 cursor-pointer transition-all duration-200 hover:text-slate-200 font-medium font-medium";
    }
}

tabBtnAirlines.addEventListener("click", () => showTab("airlines"));
tabBtnAlerts.addEventListener("click", () => showTab("alerts"));

// ---------- Interactive Refresh Button ----------
const refreshBtn = document.getElementById("refresh-data-btn");
const refreshIcon = document.getElementById("refresh-icon");

refreshBtn.addEventListener("click", () => {
    refreshIcon.classList.add("rotate-180");
    refreshBtn.classList.add("opacity-80", "pointer-events-none");

    setTimeout(() => {
        refreshIcon.classList.remove("rotate-180");
        refreshBtn.classList.remove("opacity-80", "pointer-events-none");
    }, 700);
});

function renderRouteRanking(rows) {
    heatmapBody.innerHTML = "";
    rows.slice().sort((a, b) => b.change - a.change).forEach(({ route, weight, change }) => {
        const tr = document.createElement("tr");
        tr.className = `${rowTint(change)} transition-colors duration-200 cursor-pointer`;
        tr.innerHTML = `<td class="py-2.5 px-1 font-medium text-slate-200">${route}</td><td class="py-2.5 px-1 text-right text-slate-400">${weight}</td><td class="py-2.5 px-1 text-right font-semibold ${changeColor(change)}">${change >= 0 ? "+" : ""}${change}%</td>`;
        heatmapBody.appendChild(tr);
    });
}

function setMetric(id, value) {
    const element = document.querySelector(`#${id} .metric-value`);
    if (element) element.textContent = value;
}

async function loadOverview() {
    const days = document.getElementById("filter-date-range")?.value.match(/\d+/)?.[0] || 30;
    const [summary, indexTrend, routes, leadTime, airlines, anomalies] = await Promise.all([
        FlyvoraApi.get("/dashboard/overview/summary"), FlyvoraApi.get("/analytics/index-trend"),
        FlyvoraApi.get("/routes/ranking", { days }), FlyvoraApi.get("/analytics/lead-time"),
        FlyvoraApi.get("/airlines/comparison", { days }), FlyvoraApi.get("/analytics/anomalies"),
    ]);
    setMetric("metric-airfare-index", summary.airfareIndex.toFixed(1));
    setMetric("metric-inflation-rate", `${summary.inflationRate >= 0 ? "+" : ""}${summary.inflationRate.toFixed(1)}%`);
    setMetric("metric-anomalies-detected", summary.anomaliesDetected);
    setMetric("metric-tracked-routes", summary.trackedRoutes);
    indexTrendChart.data.labels = indexTrend.labels; indexTrendChart.data.datasets[0].data = indexTrend.national; indexTrendChart.data.datasets[1].data = indexTrend.south; indexTrendChart.update();
    leadTimeChart.data.labels = leadTime.labels; leadTimeChart.data.datasets[0].data = leadTime.prices; leadTimeChart.update();
    airlineComparisonChart.data.labels = airlines.map((item) => item.name); airlineComparisonChart.data.datasets[0].data = airlines.map((item) => item.avgFare); airlineComparisonChart.update();
    renderRouteRanking(routes);
    alertsList.innerHTML = "";
    anomalies.forEach(({ route, detail, severity }) => {
        const li = document.createElement("li"); li.className = "flex items-start justify-between gap-3 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5";
        li.innerHTML = `<div><p class="font-medium text-slate-200">${route}</p><p class="text-slate-400 text-[11px] mt-0.5">${detail}</p></div><span class="shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${severityStyle[severity] || severityStyle.Low}">${severity}</span>`;
        alertsList.appendChild(li);
    });
}

refreshBtn.addEventListener("click", async () => {
    try { await loadOverview(); } catch (error) { console.error("Unable to load overview data", error); }
});
document.getElementById("filter-date-range")?.addEventListener("change", () => loadOverview().catch((error) => console.error("Unable to load overview data", error)));
loadOverview().catch((error) => console.error("Unable to load overview data", error));
