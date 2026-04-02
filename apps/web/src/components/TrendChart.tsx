'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from 'recharts';
import { formatDetailedDate, formatAxisDate, getAqiColor, getAqiCategory } from '@/lib/aqi-utils';

interface TrendChartProps {
    data: Array<{
        timestamp: string;
        aqi: number;
        category?: string;
    }>;
    title?: string;
    height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const aqi = payload[0]?.value;
    const color = getAqiColor(aqi);

    return (
        <div className="glass-card p-4 shadow-2xl border border-border bg-card/90 backdrop-blur-md theme-transition">
            <p className="text-sm text-secondary mb-2 font-medium theme-transition">{formatDetailedDate(label)}</p>
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: color }}
                />
                <span className="font-bold text-lg" style={{ color }}>
                    {aqi}
                </span>
                <span className="text-xs text-muted theme-transition">{getAqiCategory(aqi)}</span>
            </div>
        </div>
    );
};

export default function TrendChart({ data, title = 'AQI Trend', height = 400 }: TrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6 theme-transition">
                <h3 className="text-sm font-semibold text-secondary mb-4 theme-transition">{title}</h3>
                <div className="flex items-center justify-center h-[200px] text-muted theme-transition">
                    No data available
                </div>
            </div>
        );
    }

    // Sample data if too many points (show ~100 points)
    const step = Math.max(1, Math.floor(data.length / 100));
    const sampledData = data.filter((_, i) => i % step === 0);

    return (
        <div className="glass-card p-6 theme-transition">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary theme-transition">{title}</h3>
                    <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border theme-transition">
                        <span className="text-xs font-semibold text-secondary theme-transition">{data.length} data points</span>
                    </div>
                </div>
                <p className="text-sm text-secondary leading-relaxed max-w-4xl theme-transition">
                    This chart visualizes the hourly Air Quality Index (AQI) over the past 7 days. Use the tooltips and vertical axes to
                    track historical pollution trends and identify patterns in severe air quality deterioration.
                </p>
            </div>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={sampledData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <defs>
                        <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatAxisDate}
                        stroke="rgba(150,150,150,0.5)"
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(150,150,150,0.3)' }}
                        minTickGap={30}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="rgba(150,150,150,0.5)"
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(150,150,150,0.3)' }}
                        domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                    {/* AQI threshold lines */}
                    <ReferenceLine y={50} stroke="#55a84f" strokeDasharray="3 3" opacity={0.3} />
                    <ReferenceLine y={100} stroke="#a3c853" strokeDasharray="3 3" opacity={0.3} />
                    <ReferenceLine y={200} stroke="#fff833" strokeDasharray="3 3" opacity={0.3} />
                    <ReferenceLine y={300} stroke="#f29c33" strokeDasharray="3 3" opacity={0.3} />
                    <Area
                        type="monotone"
                        dataKey="aqi"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#aqiGradient)"
                        animationDuration={1000}
                        dot={false}
                        activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
