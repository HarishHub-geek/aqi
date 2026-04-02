'use client';

import React from 'react';
import { getAqiColor, getAqiCategory, getAqiEmoji, getAqiDescription } from '@/lib/aqi-utils';

interface AqiGaugeProps {
    aqi: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function AqiGauge({ aqi, size = 'md', showLabel = true }: AqiGaugeProps) {
    const color = getAqiColor(aqi);
    const category = getAqiCategory(aqi);
    const emoji = getAqiEmoji(aqi);
    const description = getAqiDescription(aqi);

    const sizes = {
        sm: { width: 100, stroke: 8, fontSize: 24, labelSize: 10 },
        md: { width: 140, stroke: 10, fontSize: 32, labelSize: 12 },
        lg: { width: 180, stroke: 12, fontSize: 42, labelSize: 14 },
    };

    const s = sizes[size];
    const radius = (s.width - s.stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(aqi / 500, 1);
    const dashOffset = circumference * (1 - progress * 0.75); // 270 degrees

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: s.width, height: s.width }}>
                <svg
                    width={s.width}
                    height={s.width}
                    viewBox={`0 0 ${s.width} ${s.width}`}
                    className="-rotate-[135deg]"
                >
                    {/* Background arc */}
                    <circle
                        cx={s.width / 2}
                        cy={s.width / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={s.stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.25}
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <circle
                        cx={s.width / 2}
                        cy={s.width / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={s.stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{
                            filter: `drop-shadow(0 0 8px ${color}80)`,
                            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
                        }}
                    />
                </svg>
                {/* Center text */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ paddingTop: size === 'lg' ? '6px' : '4px' }}
                >
                    <span className="text-lg">{emoji}</span>
                    <span
                        className="font-extrabold leading-none"
                        style={{ fontSize: s.fontSize, color }}
                    >
                        {aqi}
                    </span>
                    <span
                        className="font-semibold opacity-80 mt-0.5"
                        style={{ fontSize: s.labelSize, color }}
                    >
                        {category}
                    </span>
                </div>
            </div>
            {showLabel && (
                <p className="text-xs text-slate-400 text-center mt-2 max-w-[200px] leading-tight">
                    {description}
                </p>
            )}
        </div>
    );
}
