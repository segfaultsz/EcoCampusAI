'use client';
import { Zap, Trash2, Globe } from 'lucide-react';

export default function RecommendationCard({ data, onStatusChange }) {
  const { id, title, description, priority, category, savingsRs, savingsKwh, co2Reduction, status } = data;

  const priorityColors = { High: 'text-red-400 bg-red-500/20', Medium: 'text-yellow-400 bg-yellow-500/20', Low: 'text-green-400 bg-green-500/20' };
  const CategoryIcon = category === 'Energy' ? Zap : category === 'Waste' ? Trash2 : Globe;

  return (
    <div className="dashboard-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <CategoryIcon size={18} className="text-primary-400" />
            <span className="text-sm text-gray-400">{category}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[priority]}`}>{priority}</span>
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-3 hover:line-clamp-none transition-all">{description}</p>
        
        <div className="grid grid-cols-2 gap-6 mb-4 text-sm">
          <div>
            <div className="text-gray-500">Est. Savings</div>
            <div className="font-semibold text-green-400">â‚¹{savingsRs.toLocaleString()} /mo</div>
            <div className="text-xs text-gray-400">{savingsKwh} kWh</div>
          </div>
          <div>
            <div className="text-gray-500">COâ‚‚ Reduction</div>
            <div className="font-semibold text-primary-400">{co2Reduction} kg</div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700 mt-auto">
        <select 
          value={status} 
          onChange={(e) => onStatusChange(id, e.target.value)}
          className="w-full card border  rounded p-2 text-sm focus:outline-none focus:border-primary-500 text-white"
        >
          <option value="Pending">Pending</option>
          <option value="Implemented">Implemented</option>
          <option value="Dismissed">Dismissed</option>
        </select>
      </div>
    </div>
  );
}