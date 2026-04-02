'use client'
import { useState } from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Brush, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useFetch } from '@/lib/hooks'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#111111',
    border: '1px solid #1F1F1F',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '12px',
    fontFamily: 'Urbanist',
    padding: '10px 14px',
    boxShadow: 'none'
  },
  labelStyle: {
    color: '#8A8A8A',
    marginBottom: '6px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  }
}

function SkeletonChart() {
  return (
    <div className="card">
      <div className="animate-shimmer h-5 w-48 rounded mb-4" />
      <div className="animate-shimmer h-64 w-full rounded" />
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <p style={TOOLTIP_STYLE.labelStyle} className="mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs" style={{ fontFamily: 'Urbanist' }}>
          <span style={{ color: p.color }}>■</span>
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
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
    <div className="card">
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
        Energy data unavailable — ensure the /api/energy/hourly route returns
        [{`{`}hour: "06:00", kwh: 245, predicted: 230, temp: 29{`}`}...]
      </p>
    </div>
  )

  const toggleLine = (dataKey) => {
    setHiddenLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }))
  }

  return (
    <div className="animate-fadeIn">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="0" stroke="#1F1F1F" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#4A4A4A', fontSize: 11, fontFamily: 'Urbanist' }}
            axisLine={{ stroke: '#1F1F1F' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="kwh"
            tick={{ fill: '#4A4A4A', fontSize: 11, fontFamily: 'Urbanist' }}
            axisLine={{ stroke: '#1F1F1F' }}
            tickLine={false}
            width={45}
          />
          <YAxis
            yAxisId="temp"
            orientation="right"
            tick={{ fill: '#4A4A4A', fontSize: 11, fontFamily: 'Urbanist' }}
            axisLine={{ stroke: '#1F1F1F' }}
            tickLine={false}
            width={35}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#F26415', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#8A8A8A', fontFamily: 'Urbanist', paddingTop: '12px' }}
            onClick={(e) => toggleLine(e.dataKey)}
          />
          <Brush
            dataKey="hour"
            height={20}
            stroke="#1F1F1F"
            fill="#111111"
            travellerWidth={6}
          />
          <ReferenceLine yAxisId="kwh" y={0} stroke="#1F1F1F" />
          <Bar
            yAxisId="kwh"
            dataKey="kwh"
            name="Actual (kWh)"
            fill="#F26415"
            fillOpacity={0.85}
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            hide={!!hiddenLines['kwh']}
          />
          <Line
            yAxisId="kwh"
            type="monotone"
            dataKey="predicted"
            name="Predicted (kWh)"
            stroke="#3E3E3E"
            strokeWidth={1.5}
            strokeDasharray="4 3"
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
            stroke="#D2D2D2"
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