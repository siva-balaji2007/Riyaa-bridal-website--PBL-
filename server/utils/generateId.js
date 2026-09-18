/**
 * Generates a human-readable appointment ID e.g. APT-202609-8472
 */
function generateAppointmentId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `APT-${year}${month}-${randomSuffix}`;
}

module.exports = { generateAppointmentId };
