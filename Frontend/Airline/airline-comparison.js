const nav = { home: "../Overview/index.html", route: "../Route_Heatmap+Trends/routeheatmap.html", lead: "../Lead-Time/lead-time.html", airline: "airline-comparison.html", quality: "../Data-quality/data-quality.html" };
Object.entries(nav).forEach(([id, href]) => document.getElementById(id)?.addEventListener("click", () => { window.location.href = href; }));
Chart.defaults.color = "#94a3b8";
const colors = ["#60a5fa", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];
let charts = [];
const inr = (value) => `Rs ${Math.round(value || 0).toLocaleString("en-IN")}`;
function chart(id, config) { const canvas = document.getElementById(id); if (canvas) charts.push(new Chart(canvas, config)); }
function renderRanking(rows) {
  const body = document.getElementById("airline-ranking-body"); if (!body) return;
  body.innerHTML = [...rows].sort((a, b) => a.avgFare - b.avgFare).map((airline, index) => { const rising = airline.change30d >= 0; return `<tr class="text-slate-300 hover:bg-white/[0.04] transition-colors duration-150"><td class="py-2.5 font-medium"><span class="airline-dot" style="background-color:${colors[index % colors.length]}"></span>${airline.name}</td><td class="py-2.5 text-right font-medium">${inr(airline.avgFare)}</td><td class="py-2.5 text-right ${rising ? "text-red-400" : "text-emerald-400"} font-medium">${rising ? "▲" : "▼"} ${Math.abs(airline.change30d).toFixed(1)}%</td><td class="py-2.5 text-right font-medium">${airline.marketShare.toFixed(1)}%</td></tr>`; }).join("");
}
async function loadDashboard() {
  const [comparison, matrix, trend] = await Promise.all([FlyvoraApi.get("/airlines/comparison"), FlyvoraApi.get("/airlines/route-matrix"), FlyvoraApi.get("/airlines/index-trend")]);
  charts.forEach((item) => item.destroy()); charts = []; renderRanking(comparison);
  chart("chart-airline-avg-fare", { type: "bar", data: { labels: comparison.map((item) => item.name), datasets: [{ data: comparison.map((item) => item.avgFare), backgroundColor: comparison.map((_, i) => `${colors[i % colors.length]}cc`), borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => inr(ctx.parsed.y) } } }, scales: { x: { grid: { display: false } }, y: { ticks: { callback: inr } } } } });
  chart("chart-airline-route-grouped", { type: "bar", data: { labels: matrix.routes, datasets: Object.entries(matrix.matrix).map(([name, data], i) => ({ label: name, data, backgroundColor: `${colors[i % colors.length]}cc`, borderRadius: 4 })) }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { ticks: { callback: inr } } } } });
  chart("chart-airline-index-trend", { type: "line", data: { labels: trend.labels, datasets: Object.entries(trend.series).map(([name, data], i) => ({ label: name, data, borderColor: colors[i % colors.length], borderWidth: 2, pointRadius: 0, tension: .35 })) }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, scales: { x: { ticks: { maxTicksLimit: 10 } }, y: { title: { display: true, text: "Index (Base = 100)" } } } } });
}
async function refresh() { const icon = document.getElementById("refresh-icon"); icon?.classList.add("rotate-[360deg]"); try { await loadDashboard(); } catch (error) { console.error("Unable to load airline dashboard", error); } icon?.classList.remove("rotate-[360deg]"); }
document.getElementById("refresh-data-btn")?.addEventListener("click", refresh); refresh();
