'use client';
export default function SavingsSummary({ totalSavingsRs }) {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <div className="text-4xl font-bold text-green-400">₹{totalSavingsRs.toLocaleString()}</div>
        <div className="text-sm text-gray-400 mt-2">Cumulative monthly savings realized</div>
      </div>
    </div>
  );
}