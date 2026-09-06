const nav = { home: "../Overview/index.html", route: "../Route_Heatmap+Trends/routeheatmap.html", lead: "lead-time.html", airline: "../Airline/airline-comparison.html", quality: "../Data-quality/data-quality.html" };
Object.entries(nav).forEach(([id, href]) => document.getElementById(id)?.addEventListener("click", () => { window.location.href = href; }));
Chart.defaults.color = "#94a3b8";
const colors = ["#60a5fa", "#22d3ee", "#fbbf24", "#34d399", "#f87171"];
const inr = (value) => `Rs ${Math.round(value || 0).toLocaleString("en-IN")}`;
let elasticityChart; let routeComparisonChart;
function renderCheckpoints(rows) { const body = document.getElementById("checkpoint-breakdown-body"); if (!body) return; body.innerHTML = rows.map((row) => { const up = row.pctChange >= 0; return `<tr class="text-slate-300 hover:bg-white/[0.04]"><td class="py-2.5 font-medium">${row.checkpoint}</td><td class="py-2.5 text-right font-mono">${inr(row.price)}</td><td class="py-2.5 text-right ${up ? "text-red-400" : "text-emerald-400"}">${up ? "▲" : "▼"} ${Math.abs(row.pctChange).toFixed(1)}%</td></tr>`; }).join(""); }
async function loadDashboard() {
  const routes = await FlyvoraApi.get("/routes"); const selected = routes.slice(0, 3).map((item) => item.code);
  const [curve, checkpoints, comparison] = await Promise.all([FlyvoraApi.get("/analytics/lead-time"), FlyvoraApi.get("/analytics/lead-time/checkpoints"), FlyvoraApi.get("/analytics/lead-time/compare", { routes: selected.join(",") })]);
  elasticityChart?.destroy(); routeComparisonChart?.destroy();
  const elasticityCanvas = document.getElementById("chart-lead-time-elasticity"); if (elasticityCanvas) elasticityChart = new Chart(elasticityCanvas, { type: "line", data: { labels: curve.labels, datasets: [{ label: "Average fare", data: curve.prices, borderColor: colors[0], backgroundColor: "rgba(96,165,250,.2)", fill: true, tension: .35, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { reverse: true }, y: { ticks: { callback: inr } } } } });
  const comparisonCanvas = document.getElementById("chart-route-elasticity-comparison"); if (comparisonCanvas) routeComparisonChart = new Chart(comparisonCanvas, { type: "line", data: { labels: comparison.labels, datasets: Object.entries(comparison.series).map(([name, data], i) => ({ label: name, data, borderColor: colors[i % colors.length], tension: .35, pointRadius: 2 })) }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, scales: { x: { reverse: true }, y: { ticks: { callback: inr } } } } });
  renderCheckpoints(checkpoints);
}
async function refresh() { const icon = document.getElementById("refresh-icon"); icon?.classList.add("rotate-180"); try { await loadDashboard(); } catch (error) { console.error("Unable to load lead-time dashboard", error); } icon?.classList.remove("rotate-180"); }
document.getElementById("refresh-data-btn")?.addEventListener("click", refresh); refresh();
