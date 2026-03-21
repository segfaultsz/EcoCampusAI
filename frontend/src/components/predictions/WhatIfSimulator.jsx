'use client';
import { useState } from 'react';

export default function WhatIfSimulator() {
  const [acHour, setAcHour] = useState(18);
  const [reduction, setReduction] = useState(10);
  const [result, setResult] = useState(null);

  const simulate = () => {
    const savingsKwh = Math.floor(acHour * 50 + reduction * 100);
    const savingsRs = savingsKwh * 10;
    setResult({ savingsKwh, savingsRs });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400">Shut AC at: {acHour}:00</label>
        <input type="range" min="16" max="22" value={acHour} onChange={(e) => setAcHour(Number(e.target.value))} className="w-full accent-primary-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-400">Reduce lighting by: {reduction}%</label>
        <input type="range" min="0" max="50" value={reduction} onChange={(e) => setReduction(Number(e.target.value))} className="w-full accent-primary-500" />
      </div>
      <button onClick={simulate} className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Simulate</button>
      {result && (
        <div className="card p-4 space-y-2">
          <div className="text-xl font-semibold tracking-tight text-primary-400">Estimated Savings</div>
          <div>{result.savingsKwh} kWh/month</div>
          <div>{result.savingsRs.toLocaleString('en-IN')} ₹/month</div>
        </div>
      )}
    </div>
  );
}