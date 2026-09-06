function formatINR(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

function formatPercent(value, includeSign = true) {
  const num = Number(value) || 0;
  const sign = includeSign && num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}

function normalizeRouteCode(origin, destination) {
  return `${origin.toUpperCase().trim()}-${destination.toUpperCase().trim()}`;
}

module.exports = {
  formatINR,
  formatPercent,
  normalizeRouteCode
};
