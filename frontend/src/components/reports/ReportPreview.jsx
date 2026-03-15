'use client';
export default function ReportPreview({ filters }) {
  return (
    <div className="space-y-8 text-white">
      <div className="text-center border-b  pb-6">
        <h1 className="text-3xl font-bold text-primary-400">EcoCampus Sustainability Report</h1>
        <p className="text-lg mt-2">{filters.building} | {filters.dateRange}</p>
        <p className="text-sm text-gray-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Total Energy</div>
          <div className="text-2xl font-bold">145,200 kWh</div>
        </div>
        <div className="card p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Total Waste</div>
          <div className="text-2xl font-bold">8,450 kg</div>
        </div>
        <div className="card p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Carbon Footprint</div>
          <div className="text-2xl font-bold">119,064 kg COâ‚‚</div>
        </div>
        <div className="card p-4 rounded-lg text-center">
          <div className="text-sm text-gray-400">Active Anomalies</div>
          <div className="text-2xl font-bold text-red-400">3</div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 border-b  pb-2">Executive Summary</h3>
        <p className="text-gray-300 leading-relaxed">
          During the selected period ({filters.dateRange}), {filters.building} showed typical usage patterns with a few notable exceptions. 
          Energy consumption peaked during mid-day hours, aligning with maximum occupancy. 
          Waste diversion rates remain stable but highlight an opportunity for increased recycling initiatives.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 border-b  pb-2">Top Recommendations</h3>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li>Schedule HVAC shutdown at 6 PM in Science Block (Est. Savings: â‚¹12,000/mo)</li>
          <li>Implement waste segregation drive to improve diversion past 40%</li>
        </ul>
      </div>
    </div>
  );
}