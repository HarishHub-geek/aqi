'use client';

import React from 'react';
import AqiGauge from './AqiGauge';
import WeatherCard from './WeatherCard';
import PollutantChart from './PollutantChart';
import { getAqiColor, getAqiCategory, formatNumber } from '@/lib/aqi-utils';

interface CityPanelProps {
    city: {
        id: string;
        name: string;
        state: string;
        population?: number;
    };
    aqi: {
        aqi: number;
        category: string;
        color: string;
        dominant_pollutant: string | null;
        sub_indices?: Record<string, { value: number; concentration: number }>;
    };
    pollutants: Record<string, number>;
    weather: {
        temperature: number;
        humidity: number;
        wind_speed: number;
        wind_direction: number;
        weather_code: number;
        pressure: number;
    };
    onViewDetails: () => void;
    onClose: () => void;
}

export default function CityPanel({ city, aqi, pollutants, weather, onViewDetails, onClose }: CityPanelProps) {
    return (
        <div className="glass-card p-5 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-primary theme-transition">{city.name}</h2>
                    <p className="text-sm text-secondary theme-transition">{city.state}</p>
                    {city.population && (
                        <p className="text-xs text-muted mt-0.5 theme-transition">Pop: {formatNumber(city.population)}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-muted hover:text-primary transition p-1 theme-transition"
                >
                    ✕
                </button>
            </div>

            {/* AQI Gauge */}
            <div className="flex justify-center mb-5">
                <AqiGauge aqi={aqi.aqi} size="lg" />
            </div>

            {/* Dominant Pollutant */}
            {aqi.dominant_pollutant && (
                <div className="text-center mb-4">
                    <span className="text-xs text-secondary theme-transition">Dominant Pollutant: </span>
                    <span className="text-sm font-semibold" style={{ color: aqi.color }}>
                        {aqi.dominant_pollutant.toUpperCase()}
                    </span>
                </div>
            )}

            {/* Weather */}
            <div className="mb-4">
                <WeatherCard weather={weather} />
            </div>

            {/* Pollutant Chart */}
            <div className="mb-4">
                <PollutantChart pollutants={pollutants} subIndices={aqi.sub_indices} />
            </div>

            {/* View Details Button */}
            <button
                onClick={onViewDetails}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white
          bg-gradient-to-r from-accent-blue to-accent-purple
          hover:from-blue-600 hover:to-purple-600
          transition-all duration-300 transform hover:scale-[1.02]
          shadow-lg shadow-blue-500/20"
            >
                View Full Analysis →
            </button>
        </div>
    );
}
