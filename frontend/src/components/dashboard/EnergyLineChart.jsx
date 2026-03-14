'use client'
import { useState } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Brush, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useFetch } from '@/lib/hooks'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#F1F5F9',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4)'
  },
  labelStyle: { color: '#94A3B8', marginBottom: '4px' }
}

function SkeletonChart() {
  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5">
      <div className="animate-shimmer h-5 w-48 rounded mb-4"/>
      <div className="animate-shimmer h-64 w-full rounded"/>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <p style={TOOLTIP_STYLE.labelStyle} className="mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span style={{ color: p.color }}>■</span>
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-medium text-white">
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
            {p.dataKey === 'kwh' ? ' kWh' : p.dataKey === 'temp' ? '°C' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function EnergyLineChart({ buildingCode = 'ALL' }) {
  const [hiddenLines, setHiddenLines] = useState({})
  const { data, loading, error } = useFetch(
    `/api/energy/hourly?building=${buildingCode}`
  )

  if (loading) return <SkeletonChart />

  if (error || !data?.length) return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5">
      <p className="text-slate-500 text-sm">
        Energy data unavailable — ensure the /api/energy/hourly route returns
        [{`{`}hour: "06:00", kwh: 245, predicted: 230, temp: 29{`}`}...]
      </p>
    </div>
  )

  const toggleLine = (dataKey) => {
    setHiddenLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }))
  }

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-5 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-medium text-sm">24-hour energy trend</h3>
        <span className="text-slate-500 text-xs">Click legend to hide/show lines</span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" strokeOpacity={0.4}/>
          <XAxis
            dataKey="hour"
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="kwh"
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <YAxis
            yAxisId="temp"
            orientation="right"
            tick={{ fill: '#64748B', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />}/>
          <Legend
            wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
            onClick={(e) => toggleLine(e.dataKey)}
          />
          <Brush
            dataKey="hour"
            height={20}
            stroke="#334155"
            fill="#0F172A"
            travellerWidth={6}
          />
          <ReferenceLine yAxisId="kwh" y={0} stroke="#334155"/>
          <Bar
            yAxisId="kwh"
            dataKey="kwh"
            name="Actual (kWh)"
            fill="#3B82F6"
            fillOpacity={0.7}
            radius={[2,2,0,0]}
            isAnimationActive={true}
            animationDuration={800}
            hide={!!hiddenLines['kwh']}
          />
          <Line
            yAxisId="kwh"
            type="monotone"
            dataKey="predicted"
            name="Predicted (kWh)"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
            hide={!!hiddenLines['predicted']}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temp"
            name="Temp (°C)"
            stroke="#F59E0B"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
            hide={!!hiddenLines['temp']}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}