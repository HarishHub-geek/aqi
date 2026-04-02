'use client';

import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';
import { getAqiColor, getAqiCategory, formatTime } from '@/lib/aqi-utils';

interface HistoryPoint {
    timestamp: string;
    time_label: string;
    date_label: string;
    hour: number;
    aqi: number;
    category: string;
    color: string;
}

interface HistoricalBarChartProps {
    data: HistoryPoint[];
    cityName: string;
    min: { aqi: number; timestamp: string; time_label: string };
    max: { aqi: number; timestamp: string; time_label: string };
    startDate: string;
    endDate: string;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const color = getAqiColor(d.aqi);

    return (
        <div className="glass-card p-3 shadow-xl border border-border theme-transition">
            <p className="text-[10px] text-secondary mb-1 theme-transition">{d.time_label}</p>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="font-bold text-lg" style={{ color }}>{d.aqi}</span>
                <span className="text-xs text-muted theme-transition">{d.category}</span>
            </div>
        </div>
    );
};

// Get bar color based on AQI value — matching reference image style
function getBarColor(aqi: number): string {
    if (aqi <= 100) return '#a3c853';     // green-yellow
    if (aqi <= 200) return '#f5a623';     // orange
    if (aqi <= 300) return '#e74c7a';     // pink-red
    if (aqi <= 400) return '#e93f33';     // red
    return '#af2d24';                      // dark red
}

export default function HistoricalBarChart({
    data,
    cityName,
    min,
    max,
    startDate,
    endDate,
}: HistoricalBarChartProps) {
    const [viewMode, setViewMode] = useState<'bar' | 'line'>('bar');

    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6 theme-transition">
                <h3 className="text-base font-semibold text-primary theme-transition">Historical Air Quality Data</h3>
                <div className="flex items-center justify-center h-[250px] text-secondary theme-transition">
                    No historical data available
                </div>
            </div>
        );
    }

    const maxAqi = Math.max(...data.map((d) => d.aqi));

    return (
        <div className="glass-card p-6 theme-transition">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-primary theme-transition">Historical Air Quality Data</h3>
                    <p className="text-sm text-accent-cyan mt-0.5">{cityName}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View toggle */}
                    <div className="flex bg-surface border border-border rounded-lg p-0.5 theme-transition">
                        <button
                            onClick={() => setViewMode('bar')}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition ${viewMode === 'bar' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-secondary'
                                }`}
                        >
                            📊
                        </button>
                        <button
                            onClick={() => setViewMode('line')}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition ${viewMode === 'line' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-secondary'
                                }`}
                        >
                            📈
                        </button>
                    </div>
                    <div className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-secondary theme-transition">
                        24 Hours
                    </div>
                    <div className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-secondary theme-transition">
                        AQI (IN)
                    </div>
                </div>
            </div>

            {/* Min/Max stats */}
            <div className="flex items-center justify-center gap-8 mb-4 py-3 bg-surface border border-border rounded-xl theme-transition">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted theme-transition">{cityName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                            background: getAqiColor(min.aqi),
                            color: min.aqi > 200 ? '#fff' : '#1a1a2e',
                        }}
                    >
                        {min.aqi}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-primary theme-transition">Min.</p>
                        <p className="text-[10px] text-muted theme-transition">at {min.time_label}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                            background: getAqiColor(max.aqi),
                            color: max.aqi > 200 ? '#fff' : '#1a1a2e',
                        }}
                    >
                        {max.aqi}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-primary theme-transition">Max.</p>
                        <p className="text-[10px] text-muted theme-transition">at {max.time_label}</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 20 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="time_label"
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={9}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                        interval={1}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={10}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                        domain={[0, Math.ceil(maxAqi / 50) * 50 + 50]}
                        label={{
                            value: 'AQI (IN)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 20,
                            style: { fill: '#64748b', fontSize: 10 },
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Reference lines for AQI thresholds */}
                    <ReferenceLine y={50} stroke="#55a84f" strokeDasharray="3 3" opacity={0.2} />
                    <ReferenceLine y={100} stroke="#a3c853" strokeDasharray="3 3" opacity={0.2} />
                    <ReferenceLine y={200} stroke="#fff833" strokeDasharray="3 3" opacity={0.2} />
                    <ReferenceLine y={300} stroke="#f29c33" strokeDasharray="3 3" opacity={0.2} />
                    <Bar
                        dataKey="aqi"
                        radius={[3, 3, 0, 0]}
                        animationDuration={800}
                        maxBarSize={20}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={getBarColor(entry.aqi)} fillOpacity={0.9} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Date labels at bottom */}
            <div className="flex justify-between mt-1 px-2">
                <span className="text-xs font-medium text-accent-cyan">{startDate}</span>
                <span className="text-xs text-secondary theme-transition">Time</span>
                <span className="text-xs font-medium text-accent-cyan">{endDate}</span>
            </div>
        </div>
    );
}
