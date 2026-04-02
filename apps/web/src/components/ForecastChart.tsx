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
import { formatDetailedDate, formatAxisTime, getAqiColor, getAqiCategory } from '@/lib/aqi-utils';

interface ForecastChartProps {
    data: Array<{
        timestamp: string;
        aqi: number;
        confidence: number;
        category?: string;
        color?: string;
    }>;
    height?: number;
    selectedModel?: string;
    onModelChange?: (model: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const aqi = payload[0]?.value;
    const confidence = payload[0]?.payload?.confidence;
    const color = getAqiColor(aqi);

    return (
        <div className="glass-card p-4 shadow-2xl border border-border bg-card/90 backdrop-blur-md theme-transition">
            <p className="text-sm text-secondary mb-2 font-medium theme-transition">{formatDetailedDate(label)}</p>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="font-bold text-lg" style={{ color }}>{aqi}</span>
                <span className="text-xs text-muted theme-transition">{getAqiCategory(aqi)}</span>
            </div>
            {confidence !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-muted theme-transition">Confidence:</span>
                    <div className="flex-1 bg-surface rounded-full h-1.5 theme-transition">
                        <div
                            className="h-full rounded-full bg-accent-cyan"
                            style={{ width: `${confidence * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-muted theme-transition">{Math.round(confidence * 100)}%</span>
                </div>
            )}
        </div>
    );
};

export default function ForecastChart({ data, height = 400, selectedModel, onModelChange }: ForecastChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6 theme-transition">
                <h3 className="text-sm font-semibold text-secondary mb-4 theme-transition">48-Hour AQI Forecast</h3>
                <div className="flex items-center justify-center h-[200px] text-muted theme-transition">
                    No forecast data
                </div>
            </div>
        );
    }

    // Find min/max for domain
    const maxAqi = Math.max(...data.map((d) => d.aqi));
    const minAqi = Math.min(...data.map((d) => d.aqi));

    return (
        <div className="glass-card p-6 theme-transition">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-primary theme-transition">48-Hour AQI Forecast</h3>
                        <p className="text-xs font-medium text-accent-purple mt-1">Powered by Real-Time Machine Learning Predictions</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {onModelChange && (
                            <div className="relative">
                                <select
                                    value={selectedModel || 'RandomForest'}
                                    onChange={(e) => onModelChange(e.target.value)}
                                    className="bg-surface border border-border text-primary text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-accent-purple/50 appearance-none cursor-pointer hover:bg-card/50 transition theme-transition"
                                >
                                    <option value="RandomForest">RandomForest</option>
                                    <option value="GradientBoosting">GradientBoosting</option>
                                    <option value="LSTM">LSTM</option>
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-[10px] theme-transition">▼</div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-0.5 bg-purple-500 rounded" />
                                <span className="text-[10px] text-secondary theme-transition">Predicted</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500/30" />
                                <span className="text-[10px] text-secondary theme-transition">Confidence</span>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-secondary leading-relaxed max-w-4xl mt-2 theme-transition">
                    <strong> RandomForest</strong> models variance, <strong>GradientBoosting</strong> fits extreme errors, and <strong>LSTM</strong> identifies deep temporal trends in the time-series data. The graph dynamically updates to reflect the chosen algorithm.
                </p>
            </div>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <defs>
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatAxisTime}
                        stroke="rgba(150,150,150,0.5)"
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(150,150,150,0.3)' }}
                        minTickGap={40}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="rgba(150,150,150,0.5)"
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: 'rgba(150,150,150,0.3)' }}
                        domain={[Math.max(0, minAqi - 20), maxAqi + 20]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                    <ReferenceLine y={100} stroke="#a3c853" strokeDasharray="5 5" opacity={0.3} />
                    <ReferenceLine y={200} stroke="#fff833" strokeDasharray="5 5" opacity={0.3} />
                    <ReferenceLine y={300} stroke="#f29c33" strokeDasharray="5 5" opacity={0.3} />
                    <Area
                        type="monotone"
                        dataKey="aqi"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#forecastGradient)"
                        animationDuration={1200}
                        dot={false}
                        activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Predictions Table */}
            <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-primary theme-transition">Tabular Data View</h4>
                    <span className="text-[10px] text-secondary bg-surface px-2 py-1 rounded-md theme-transition">
                        Showing {data.length} data points
                    </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-surface/30 theme-transition shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-surface/80 text-secondary border-b border-black/5 dark:border-white/5 theme-transition">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">AQI</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {data.map((row, i) => {
                                    const d = new Date(row.timestamp);
                                    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
                                    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                                    const aqiValue = Math.round(row.aqi);
                                    const category = getAqiCategory(aqiValue);
                                    const color = getAqiColor(aqiValue);
                                    return (
                                        <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors theme-transition">
                                            <td className="px-6 py-4 text-primary font-medium">{dateStr}</td>
                                            <td className="px-6 py-4 text-secondary">{timeStr}</td>
                                            <td className="px-6 py-4 text-right font-black text-sm" style={{ color }}>{aqiValue}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span 
                                                    className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter"
                                                    style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}30` }}
                                                >
                                                    {category}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
