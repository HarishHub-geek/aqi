'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AqiGauge from '@/components/AqiGauge';
import AlertBanner from '@/components/AlertBanner';
import CityPanel from '@/components/CityPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import WorldStats from '@/components/WorldStats';
import { API_BASE, getAqiColor, getAqiCategory, getAqiEmoji, formatNumber } from '@/lib/aqi-utils';

const AqiMap = dynamic(() => import('@/components/AqiMap'), { ssr: false });

interface CityAqi {
    city: { id: string; name: string; state: string; lat: number; lon: number; population?: number };
    aqi: number;
    category: string;
    color: string;
    dominant_pollutant: string;
}

interface CityDetail {
    city: any;
    aqi: any;
    pollutants: Record<string, number>;
    weather: any;
}

const FALLBACK_CITIES: CityAqi[] = [
    { city: { id: 'delhi', name: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, population: 32941000 }, aqi: 285, category: 'Poor', color: '#f29c33', dominant_pollutant: 'pm25' },
    { city: { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, population: 21297000 }, aqi: 142, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm25' },
    { city: { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, population: 15134000 }, aqi: 198, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm10' },
    { city: { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, population: 11235000 }, aqi: 85, category: 'Satisfactory', color: '#a3c853', dominant_pollutant: 'o3' },
    { city: { id: 'bangalore', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, population: 13193000 }, aqi: 92, category: 'Satisfactory', color: '#a3c853', dominant_pollutant: 'pm25' },
    { city: { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, population: 10534000 }, aqi: 118, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm25' },
    { city: { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, population: 8450000 }, aqi: 165, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm10' },
    { city: { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, population: 7764000 }, aqi: 98, category: 'Satisfactory', color: '#a3c853', dominant_pollutant: 'pm25' },
    { city: { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, population: 3917000 }, aqi: 178, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm10' },
    { city: { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, population: 3700000 }, aqi: 245, category: 'Poor', color: '#f29c33', dominant_pollutant: 'pm25' },
    { city: { id: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, population: 3200000 }, aqi: 268, category: 'Poor', color: '#f29c33', dominant_pollutant: 'pm25' },
    { city: { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.6093, lon: 85.1376, population: 2700000 }, aqi: 302, category: 'Very Poor', color: '#e93f33', dominant_pollutant: 'pm25' },
    { city: { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, population: 2900000 }, aqi: 125, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm25' },
    { city: { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, population: 2500000 }, aqi: 135, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm10' },
    { city: { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, population: 2300000 }, aqi: 148, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm25' },
    { city: { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, population: 2100000 }, aqi: 72, category: 'Satisfactory', color: '#a3c853', dominant_pollutant: 'o3' },
    { city: { id: 'vadodara', name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812, population: 2100000 }, aqi: 155, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm10' },
    { city: { id: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, population: 1100000 }, aqi: 88, category: 'Satisfactory', color: '#a3c853', dominant_pollutant: 'pm25' },
    { city: { id: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794, population: 1100000 }, aqi: 128, category: 'Moderate', color: '#fff833', dominant_pollutant: 'pm25' },
    { city: { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, population: 950000 }, aqi: 45, category: 'Good', color: '#55a84f', dominant_pollutant: 'o3' },
];

export default function Dashboard() {
    const [cities, setCities] = useState<CityAqi[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cityDetail, setCityDetail] = useState<CityDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/aqi/current`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setCities(data.data || []);
        } catch {
            setCities(FALLBACK_CITIES);
        } finally {
            setLastUpdated(new Date().toLocaleTimeString('en-IN'));
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleCitySelect = useCallback(async (cityId: string) => {
        setSelectedCity(cityId);
        try {
            const res = await fetch(`${API_BASE}/api/aqi/current/${cityId}`);
            if (res.ok) {
                setCityDetail(await res.json());
                return;
            }
        } catch { }
        const city = cities.find((c) => c.city.id === cityId);
        if (city) {
            setCityDetail({
                city: city.city,
                aqi: { aqi: city.aqi, category: city.category, color: city.color, dominant_pollutant: city.dominant_pollutant, sub_indices: {} },
                pollutants: { pm25: 85, pm10: 130, no2: 40, so2: 15, co: 1.5, o3: 38 },
                weather: { temperature: 28, humidity: 55, wind_speed: 8, wind_direction: 220, weather_code: 1, pressure: 1012 },
            });
        }
    }, [cities]);

    const avgAqi = cities.length > 0 ? Math.round(cities.reduce((s, c) => s + c.aqi, 0) / cities.length) : 0;
    const worstCity = cities.length > 0 ? cities.reduce((a, b) => (a.aqi > b.aqi ? a : b), cities[0]) : null;
    const bestCity = cities.length > 0 ? cities.reduce((a, b) => (a.aqi < b.aqi ? a : b), cities[0]) : null;

    const mapMarkers = cities.map((c) => ({
        id: c.city.id, name: c.city.name, state: c.city.state,
        lat: c.city.lat, lon: c.city.lon, aqi: c.aqi,
        category: c.category, color: c.color, dominant_pollutant: c.dominant_pollutant,
    }));

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-black/5 dark:border-white/5 bg-card/80 backdrop-blur-xl theme-transition">
                <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-lg">
                            🌍
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">AQI Intelligence</h1>
                            <p className="text-[10px] text-secondary theme-transition">Real-time Air Quality Platform for India</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="pulse-dot" />
                            <span className="text-xs text-secondary theme-transition">Live</span>
                        </div>
                        <span className="text-xs text-secondary theme-transition">Updated: {lastUpdated || '—'}</span>
                        <button onClick={fetchData} className="px-3 py-1.5 rounded-lg bg-surface hover:brightness-95 text-primary text-xs font-medium theme-transition shadow-sm border border-black/5 dark:border-white/5">
                            ↻ Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 py-5">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <div className="glass-card glass-card-hover stat-glow p-4 theme-transition">
                        <p className="text-xs text-secondary mb-1">Cities Monitored</p>
                        <p className="text-2xl font-bold text-primary">{cities.length}</p>
                        <p className="text-[10px] text-accent-cyan mt-1">Real-time tracking</p>
                    </div>
                    <div className="glass-card glass-card-hover stat-glow p-4 theme-transition">
                        <p className="text-xs text-secondary mb-1">National Avg AQI</p>
                        <p className="text-2xl font-bold" style={{ color: getAqiColor(avgAqi) }}>{avgAqi}</p>
                        <p className="text-[10px] mt-1" style={{ color: getAqiColor(avgAqi) }}>{getAqiCategory(avgAqi)}</p>
                    </div>
                    <div className="glass-card glass-card-hover stat-glow p-4 theme-transition">
                        <p className="text-xs text-secondary mb-1">Most Polluted</p>
                        {worstCity && (
                            <>
                                <p className="text-lg font-bold text-primary">{worstCity.city.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-sm">{getAqiEmoji(worstCity.aqi)}</span>
                                    <span className="text-sm font-bold" style={{ color: worstCity.color }}>{worstCity.aqi}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="glass-card glass-card-hover stat-glow p-4 theme-transition">
                        <p className="text-xs text-secondary mb-1">Cleanest City</p>
                        {bestCity && (
                            <>
                                <p className="text-lg font-bold text-primary">{bestCity.city.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-sm">{getAqiEmoji(bestCity.aqi)}</span>
                                    <span className="text-sm font-bold" style={{ color: bestCity.color }}>{bestCity.aqi}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="mb-5">
                    <AlertBanner cities={cities.map((c) => ({ id: c.city.id, name: c.city.name, aqi: c.aqi }))} />
                </div>

                {/* Map + Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                    <div className="lg:col-span-2 h-[550px]">
                        <AqiMap markers={mapMarkers} onCitySelect={handleCitySelect} selectedCity={selectedCity} />
                    </div>
                    <div className="h-[550px]">
                        {cityDetail ? (
                            <CityPanel
                                city={cityDetail.city}
                                aqi={cityDetail.aqi}
                                pollutants={cityDetail.pollutants}
                                weather={cityDetail.weather}
                                onViewDetails={() => window.location.href = `/city/${cityDetail.city.id}`}
                                onClose={() => { setSelectedCity(null); setCityDetail(null); }}
                            />
                        ) : (
                            <div className="glass-card h-full flex flex-col items-center justify-center p-8 text-center theme-transition">
                                <div className="text-5xl mb-4">🗺️</div>
                                <h3 className="text-lg font-semibold mb-2 text-primary">Select a City</h3>
                                <p className="text-sm text-secondary max-w-[250px]">
                                    Click any marker on the map to view detailed air quality data and weather conditions
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* City Table */}
                <div className="glass-card p-5 theme-transition">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-primary">All Cities</h2>
                        <span className="text-xs text-secondary">{cities.length} cities</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/5">
                                    <th className="text-left text-xs text-muted font-medium py-2 px-3 theme-transition">City</th>
                                    <th className="text-center text-xs text-muted font-medium py-2 px-3 theme-transition">AQI</th>
                                    <th className="text-center text-xs text-muted font-medium py-2 px-3 theme-transition">Status</th>
                                    <th className="text-center text-xs text-muted font-medium py-2 px-3 hidden sm:table-cell theme-transition">Pollutant</th>
                                    <th className="text-center text-xs text-muted font-medium py-2 px-3 hidden md:table-cell theme-transition">Population</th>
                                    <th className="text-right text-xs text-muted font-medium py-2 px-3 theme-transition">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cities.map((c) => {
                                    const clr = getAqiColor(c.aqi);
                                    return (
                                        <tr
                                            key={c.city.id}
                                            className="border-b border-black/[0.05] dark:border-white/[0.03] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition cursor-pointer"
                                            onClick={() => handleCitySelect(c.city.id)}
                                        >
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">{getAqiEmoji(c.aqi)}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-primary theme-transition">{c.city.name}</p>
                                                        <p className="text-[10px] text-muted theme-transition">{c.city.state}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="text-lg font-bold" style={{ color: clr }}>{c.aqi}</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="aqi-badge text-[10px]" style={{ background: `${clr}20`, color: clr }}>
                                                    {c.category}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-xs text-secondary hidden sm:table-cell theme-transition">
                                                {c.dominant_pollutant?.toUpperCase() || 'N/A'}
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-xs text-secondary hidden md:table-cell theme-transition">
                                                {c.city.population ? formatNumber(c.city.population) : '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); window.location.href = `/city/${c.city.id}`; }}
                                                    className="text-xs text-accent-blue hover:text-blue-400 font-medium transition"
                                                >Details →</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* World Statistics Component */}
                <WorldStats />

                <footer className="mt-8 pb-6 text-center">
                    <p className="text-xs text-muted theme-transition">AQI Intelligence Platform • Data from OpenAQ & Open-Meteo • ML-powered forecasting</p>
                </footer>
            </main>
        </div>
    );
}
