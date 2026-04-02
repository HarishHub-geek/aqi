'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { getPollutantName, getPollutantUnit, getAqiColor } from '@/lib/aqi-utils';

interface PollutantChartProps {
    pollutants: Record<string, number>;
    subIndices?: Record<string, { value: number; concentration: number }>;
}

const POLLUTANT_COLORS: Record<string, string> = {
    pm25: '#ef4444',
    pm10: '#f97316',
    no2: '#eab308',
    so2: '#84cc16',
    co: '#06b6d4',
    o3: '#8b5cf6',
};

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;

    return (
        <div className="glass-card p-3 shadow-xl">
            <p className="font-semibold text-sm mb-1">{data?.fullName}</p>
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Concentration:</span>
                    <span className="text-sm font-bold">{data?.concentration} {data?.unit}</span>
                </div>
                {data?.subIndex !== undefined && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Sub-index:</span>
                        <span className="text-sm font-bold" style={{ color: getAqiColor(data.subIndex) }}>
                            {data.subIndex}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PollutantChart({ pollutants, subIndices }: PollutantChartProps) {
    const fullNames: Record<string, string> = {
        pm25: 'Fine Particulate Matter',
        pm10: 'Coarse Particulate Matter',
        no2: 'Nitrogen Dioxide',
        so2: 'Sulfur Dioxide',
        co: 'Carbon Monoxide',
        o3: 'Ozone',
    };

    const chartData = Object.entries(pollutants).map(([key, value]) => ({
        name: getPollutantName(key),
        key,
        concentration: value,
        unit: getPollutantUnit(key),
        fullName: fullNames[key] || key,
        subIndex: subIndices?.[key]?.value || 0,
        color: POLLUTANT_COLORS[key] || '#6b7280',
    }));

    return (
        <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Pollutant Breakdown</h3>

            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={11}
                        tick={{ fill: '#94a3b8' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={10}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="concentration" radius={[6, 6, 0, 0]} animationDuration={800}>
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Pollutant pills */}
            <div className="grid grid-cols-3 gap-2 mt-4">
                {chartData.map((p) => (
                    <div
                        key={p.key}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={{ background: `${p.color}10` }}
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: p.color }}
                        />
                        <div>
                            <span className="text-xs font-semibold text-slate-300">{p.name}</span>
                            <p className="text-[10px] text-slate-500">
                                {p.concentration} {p.unit}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
