'use client';
export default function CarbonImpact({ totalCo2 }) {
  const trees = Math.floor(totalCo2 / 22); // ~22kg CO2 per tree/year
  const carMiles = Math.floor(totalCo2 * 2.5); // ~2.5 miles per kg CO2

  return (
    <div className="flex flex-col justify-center h-32 space-y-4">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2">
        <span className="text-gray-400">Total CO₂ Avoided</span>
        <span className="font-semibold text-primary-400">{totalCo2.toLocaleString()} kg</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Equivalent Trees Planted 🌳</span>
        <span className="font-bold">{trees} trees</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Miles not driven 🚗</span>
        <span className="font-bold">{carMiles.toLocaleString()} miles</span>
      </div>
    </div>
  );
}