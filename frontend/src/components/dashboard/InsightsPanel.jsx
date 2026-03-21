'use client';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const insights = [
  {
    id: 1,
    title: 'Library AC ran 3 hours past closing',
    severity: 'high',
    message: 'Energy consumption remained elevated until 1 AM.',
  },
  {
    id: 2,
    title: 'CSE building within 10% of peak',
    severity: 'medium',
    message: 'Current usage trending toward afternoon peak.',
  },
  {
    id: 3,
    title: 'Waste diversion rate improved',
    severity: 'low',
    message: 'Recycling increased 5% this week.',
  },
];

export default function InsightsPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Quick Insights</h2>
      {insights.map((insight) => (
        <div key={insight.id} className="card p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-primary-400" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{insight.title}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    insight.severity === 'high' &&
                      'bg-red-500/20 text-red-400',
                    insight.severity === 'medium' &&
                      'bg-yellow-500/20 text-yellow-400',
                    insight.severity === 'low' &&
                      'bg-green-500/20 text-green-400'
                  )}
                >
                  {insight.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">{insight.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
