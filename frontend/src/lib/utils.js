export function formatNumber(num) {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat("en-IN").format(Math.round(num * 10) / 10);
}

export function formatKWh(kwh) {
  return `${formatNumber(kwh)} kWh`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCO2(kg) {
  return `${formatNumber(kg)} kg CO₂`;
}

export function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getSeverityColor(severity) {
  switch (severity) {
    case "low":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "high":
      return "text-orange-400";
    case "critical":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}
