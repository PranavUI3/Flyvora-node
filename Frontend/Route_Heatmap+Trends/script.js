const home = document.getElementById("home");
const route = document.getElementById("route");
const lead = document.getElementById("lead");
const airline = document.getElementById("airline");
const quality = document.getElementById("quality");

home.addEventListener("click", () => {
  window.location.href = "../Overview/index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const routePicker = document.getElementById("route-picker");
  const dateRangePicker = document.getElementById("date-range-picker");
  const heatmapBody = document.getElementById("route-heatmap-body");
  const metric = (id) => document.querySelector(`#${id} .metric-value`);

  function days() { return dateRangePicker?.value.match(/\d+/)?.[0] || 30; }
  function renderRanking(rows) {
    if (!heatmapBody) return;
    heatmapBody.innerHTML = rows.map((row) => `<tr class="hover:bg-slate-700/30 transition-colors"><td class="py-2.5 font-medium">${row.route}</td><td class="py-2.5 text-right text-slate-400">${row.weight}</td><td class="py-2.5 text-right font-semibold ${row.change >= 0 ? "text-red-400" : "text-emerald-400"}">${row.change >= 0 ? "+" : ""}${row.change}%</td></tr>`).join("");
  }
  async function updateRoute(routeCode) {
    const data = await FlyvoraApi.get(`/routes/${encodeURIComponent(routeCode)}/summary`, { days: days() });
    metric("kpi-avg-fare").textContent = data.avgFare;
    metric("kpi-index-weight").textContent = data.weight;
    metric("kpi-observations").textContent = data.observations;
    const change = metric("kpi-30day-change");
    change.textContent = `${data.change30D} ${data.changeTrend === "up" ? "▲" : "▼"}`;
    change.className = `metric-value text-3xl font-bold mt-2 ${data.changeTrend === "up" ? "text-red-400" : "text-emerald-400"}`;
    const title = document.querySelector("#price-trend-card h2"); if (title) title.textContent = `Price Trend - ${data.name} vs National Avg`;
    const header = document.querySelector("#airline-breakdown-header h3"); if (header) header.textContent = `Airline Breakdown - ${data.name}`;
    const airlineTiles = { indigo: "airline-tile-indigo", airIndia: "airline-tile-air-india", spicejet: "airline-tile-spicejet", akasa: "airline-tile-akasa" };
    Object.entries(airlineTiles).forEach(([key, id]) => { const tile = metric(id); if (tile) tile.textContent = data.airlines[key] || "-"; });
    const activeChart = Chart.getChart("chart-price-trend");
    if (activeChart) { activeChart.data.labels = data.labels; activeChart.data.datasets[0].label = data.name; activeChart.data.datasets[0].data = data.routePrices; activeChart.data.datasets[1].data = data.nationalAvgPrices; activeChart.update(); }
  }
  async function load() {
    const [routes, ranking] = await Promise.all([FlyvoraApi.get("/routes"), FlyvoraApi.get("/routes/ranking", { days: days() })]);
    if (routePicker) {
      routePicker.innerHTML = routes.map((item) => `<option value="${item.code}">${item.label}</option>`).join("");
      await updateRoute(routePicker.value);
    }
    renderRanking(ranking);
  }
  routePicker?.addEventListener("change", () => updateRoute(routePicker.value).catch((error) => console.error("Unable to load route", error)));
  dateRangePicker?.addEventListener("change", () => load().catch((error) => console.error("Unable to load routes", error)));
  load().catch((error) => console.error("Unable to load route explorer", error));
});

route.addEventListener("click", () => {
  window.location.href = "routeheatmap.html";
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

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. Mock Data Source
  // ==========================================
  const mockData = {
    route1: {
      name: "DEL-BOM",
      avgFare: "₹4,325",
      change30D: "+18%",
      changeTrend: "up",
      weight: "30%",
      observations: "1,141",
      airlines: {
        indigo: "₹4,325",
        airIndia: "₹4,680",
        spicejet: "₹4,110",
        akasa: "₹4,250",
      },
      labels: [
        "1 Aug",
        "5 Aug",
        "10 Aug",
        "15 Aug",
        "20 Aug",
        "25 Aug",
        "27 Aug",
      ],
      routePrices: [3800, 3950, 4100, 4200, 4150, 4300, 4325],
      nationalAvgPrices: [3900, 3950, 4000, 4050, 4100, 4120, 4150],
    },
    route2: {
      name: "DEL-HYD",
      avgFare: "₹3,890",
      change30D: "-3%",
      changeTrend: "down",
      weight: "22%",
      observations: "982",
      airlines: {
        indigo: "₹3,890",
        airIndia: "₹4,200",
        spicejet: "₹3,750",
        akasa: "₹3,820",
      },
      labels: [
        "1 Aug",
        "5 Aug",
        "10 Aug",
        "15 Aug",
        "20 Aug",
        "25 Aug",
        "27 Aug",
      ],
      routePrices: [4100, 4050, 3980, 3950, 3900, 3880, 3890],
      nationalAvgPrices: [3900, 3950, 4000, 4050, 4100, 4120, 4150],
    },
    route3: {
      name: "DEL-MAA",
      avgFare: "₹4,750",
      change30D: "+9%",
      changeTrend: "up",
      weight: "18%",
      observations: "845",
      airlines: {
        indigo: "₹4,750",
        airIndia: "₹5,100",
        spicejet: "₹4,500",
        akasa: "₹4,650",
      },
      labels: [
        "1 Aug",
        "5 Aug",
        "10 Aug",
        "15 Aug",
        "20 Aug",
        "25 Aug",
        "27 Aug",
      ],
      routePrices: [4350, 4400, 4500, 4620, 4680, 4710, 4750],
      nationalAvgPrices: [3900, 3950, 4000, 4050, 4100, 4120, 4150],
    },
  };

  // ==========================================
  // 2. DOM Elements Setup
  // ==========================================
  const routePicker = document.getElementById("route-picker");
  const dateRangePicker = document.getElementById("date-range-picker");

  // KPI Elements
  const kpiAvgFare = document.querySelector("#kpi-avg-fare .metric-value");
  const kpi30DayChange = document.querySelector(
    "#kpi-30day-change .metric-value",
  );
  const kpiIndexWeight = document.querySelector(
    "#kpi-index-weight .metric-value",
  );
  const kpiObservations = document.querySelector(
    "#kpi-observations .metric-value",
  );

  // Breakdown Elements
  const breakdownHeader = document.querySelector(
    "#airline-breakdown-header h3",
  );
  const tileIndigo = document.querySelector(
    "#airline-tile-indigo .metric-value",
  );
  const tileAirIndia = document.querySelector(
    "#airline-tile-air-india .metric-value",
  );
  const tileSpiceJet = document.querySelector(
    "#airline-tile-spicejet .metric-value",
  );
  const tileAkasa = document.querySelector("#airline-tile-akasa .metric-value");

  // Heatmap Elements
  const heatmapBody = document.getElementById("route-heatmap-body");
  const heatmapHeaders = document.querySelectorAll("#route-heatmap-card th");

  // Helper for visual pulse micro-interaction on update
  function triggerPopAnimation(elements) {
    elements.forEach((el) => {
      if (!el) return;
      el.classList.remove("animate-pop");
      void el.offsetWidth; // Force reflow
      el.classList.add("animate-pop");
    });
  }

  // ==========================================
  // 3. Chart.js Setup with Dynamic Animations
  // ==========================================
  const ctx = document.getElementById("chart-price-trend").getContext("2d");

  const routeGradient = ctx.createLinearGradient(0, 0, 0, 300);
  routeGradient.addColorStop(0, "rgba(96, 165, 250, 0.45)");
  routeGradient.addColorStop(1, "rgba(96, 165, 250, 0.0)");

  let priceTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: mockData.route1.labels,
      datasets: [
        {
          label: "Selected Route",
          data: mockData.route1.routePrices,
          borderColor: "#60a5fa",
          backgroundColor: routeGradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: "#60a5fa",
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#60a5fa",
          pointHoverBorderWidth: 2,
        },
        {
          label: "National Avg",
          data: mockData.route1.nationalAvgPrices,
          borderColor: "#94a3b8",
          borderDash: [4, 4],
          fill: false,
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: "easeOutQuart",
      },
      transitions: {
        active: {
          animation: { duration: 250 },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "end",
          labels: {
            color: "#94a3b8",
            font: { size: 11, family: "sans-serif" },
            usePointStyle: true,
            boxWidth: 6,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleColor: "#38bdf8",
          bodyColor: "#f8fafc",
          borderColor: "rgba(56, 189, 248, 0.3)",
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: { color: "#94a3b8", font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          ticks: {
            color: "#94a3b8",
            font: { size: 10 },
            callback: (val) => `₹${val}`,
          },
        },
      },
    },
  });

  // ==========================================
  // 4. Update Functions
  // ==========================================
  function updateDashboard(routeKey) {
    const data = mockData[routeKey];
    if (!data) return;

    // Update KPIs
    kpiAvgFare.textContent = data.avgFare;
    kpiIndexWeight.textContent = data.weight;
    kpiObservations.textContent = data.observations;

    if (data.changeTrend === "up") {
      kpi30DayChange.className =
        "metric-value text-3xl font-bold text-red-400 mt-2";
      kpi30DayChange.innerHTML = `${data.change30D} <span class="text-sm inline-block transform translate-y-[-1px]">▲</span>`;
    } else {
      kpi30DayChange.className =
        "metric-value text-3xl font-bold text-emerald-400 mt-2";
      kpi30DayChange.innerHTML = `${data.change30D} <span class="text-sm inline-block transform translate-y-[1px]">▼</span>`;
    }

    // Update Airline Breakdown Section
    breakdownHeader.textContent = `Airline Breakdown — ${data.name}`;
    if (tileIndigo) tileIndigo.textContent = data.airlines.indigo;
    if (tileAirIndia) tileAirIndia.textContent = data.airlines.airIndia;
    if (tileSpiceJet) tileSpiceJet.textContent = data.airlines.spicejet;
    if (tileAkasa) tileAkasa.textContent = data.airlines.akasa;

    // Trigger micro pop animation on changed elements
    triggerPopAnimation([
      kpiAvgFare,
      kpi30DayChange,
      kpiIndexWeight,
      kpiObservations,
      tileIndigo,
      tileAirIndia,
      tileSpiceJet,
      tileAkasa,
    ]);

    // Update Chart Title & Data Smoothly
    const chartTitle = document.querySelector("#price-trend-card h2");
    if (chartTitle)
      chartTitle.textContent = `Price Trend — ${data.name} vs National Avg`;

    priceTrendChart.data.datasets[0].label = data.name;
    priceTrendChart.data.datasets[0].data = data.routePrices;
    priceTrendChart.data.datasets[1].data = data.nationalAvgPrices;
    priceTrendChart.update();
  }

  // ==========================================
  // 5. Event Listeners
  // ==========================================
  routePicker.addEventListener("change", (e) => {
    updateDashboard(e.target.value);
  });

  dateRangePicker.addEventListener("change", (e) => {
    console.log(`Selected Date Range: Last ${e.target.value} Days`);
  });

  // ==========================================
  // 6. Heatmap Table Sorting with Smooth Reordering
  // ==========================================
  let sortAscending = false;
  heatmapHeaders.forEach((header, index) => {
    header.style.cursor = "pointer";
    header.addEventListener("click", () => {
      const rows = Array.from(heatmapBody.querySelectorAll("tr"));
      sortAscending = !sortAscending;

      rows.sort((a, b) => {
        const cellA = a.children[index].textContent
          .trim()
          .replace(/[₹%,+]/g, "");
        const cellB = b.children[index].textContent
          .trim()
          .replace(/[₹%,+]/g, "");

        const valA = isNaN(cellA) ? cellA : parseFloat(cellA);
        const valB = isNaN(cellB) ? cellB : parseFloat(cellB);

        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
      });

      // Re-append rows with slight fade effect
      heatmapBody.style.opacity = "0.4";
      setTimeout(() => {
        rows.forEach((row) => heatmapBody.appendChild(row));
        heatmapBody.style.opacity = "1";
      }, 120);
    });
  });
});
