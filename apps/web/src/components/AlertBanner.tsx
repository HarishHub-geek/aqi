'use client';

import React from 'react';
import { getAqiColor, getAqiCategory, getAqiEmoji, getAqiDescription } from '@/lib/aqi-utils';

interface AlertBannerProps {
    cities: Array<{
        id: string;
        name: string;
        aqi: number;
    }>;
}

export default function AlertBanner({ cities }: AlertBannerProps) {
    const alerts = cities
        .filter((c) => c.aqi > 200)
        .sort((a, b) => b.aqi - a.aqi);

    if (alerts.length === 0) return null;

    const severeCount = alerts.filter((c) => c.aqi > 400).length;
    const veryPoorCount = alerts.filter((c) => c.aqi > 300 && c.aqi <= 400).length;
    const poorCount = alerts.filter((c) => c.aqi > 200 && c.aqi <= 300).length;

    return (
        <div className="glass-card p-4 border-l-4 border-l-red-500/80">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <h3 className="font-semibold text-sm text-red-400">Air Quality Alerts</h3>
                <span className="aqi-badge bg-red-500/20 text-red-400 text-[10px] ml-auto">
                    {alerts.length} {alerts.length === 1 ? 'city' : 'cities'}
                </span>
            </div>

            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                {alerts.slice(0, 5).map((city) => {
                    const color = getAqiColor(city.aqi);
                    return (
                        <div
                            key={city.id}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-surface theme-transition"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm">{getAqiEmoji(city.aqi)}</span>
                                <span className="text-sm font-medium">{city.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="aqi-badge text-[10px]"
                                    style={{
                                        background: `${color}20`,
                                        color: color,
                                    }}
                                >
                                    {getAqiCategory(city.aqi)}
                                </span>
                                <span className="font-bold text-sm" style={{ color }}>
                                    {city.aqi}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {alerts.length > 5 && (
                <p className="text-xs text-muted mt-2 theme-transition">
                    +{alerts.length - 5} more cities with poor air quality
                </p>
            )}
        </div>
    );
}
