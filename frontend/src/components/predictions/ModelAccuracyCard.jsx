'use client';
export default function ModelAccuracyCard() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-gray-400">MAPE</span>
        <span className="font-semibold text-primary-400">8.5%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">R²</span>
        <span className="font-semibold text-primary-400">0.92</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Last Trained</span>
        <span className="font-semibold">2025-03-12 10:30 AM</span>
      </div>
    </div>
  );
}