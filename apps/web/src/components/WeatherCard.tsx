'use client';

import React from 'react';
import { getWeatherIcon } from '@/lib/aqi-utils';

interface WeatherCardProps {
    weather: {
        temperature: number;
        humidity: number;
        wind_speed: number;
        wind_direction: number;
        weather_code: number;
        pressure: number;
    };
}

export default function WeatherCard({ weather }: WeatherCardProps) {
    const windDirectionLabel = (deg: number): string => {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return dirs[Math.round(deg / 45) % 8];
    };

    return (
        <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Weather Conditions</h3>
            <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{getWeatherIcon(weather.weather_code)}</span>
                <div>
                    <p className="text-3xl font-bold">{weather.temperature}°C</p>
                    <p className="text-xs text-slate-500">Current Temperature</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark-700/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-accent-cyan">{weather.humidity}%</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Humidity</p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-accent-emerald">{weather.wind_speed} km/h</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Wind {windDirectionLabel(weather.wind_direction)}</p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-accent-purple">{weather.pressure}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">hPa</p>
                </div>
            </div>
        </div>
    );
}
