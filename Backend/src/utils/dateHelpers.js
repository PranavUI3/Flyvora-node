function formatDateLabel(dateInput) {
  const d = new Date(dateInput);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getDaysAgoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - parseInt(days, 10));
  return d.toISOString().split('T')[0];
}

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

module.exports = {
  formatDateLabel,
  getDaysAgoDate,
  getTodayDate
};
