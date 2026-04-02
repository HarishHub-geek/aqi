'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import AqiGauge from '@/components/AqiGauge';
import WeatherCard from '@/components/WeatherCard';
import PollutantChart from '@/components/PollutantChart';
import ForecastChart from '@/components/ForecastChart';
import HistoricalBarChart from '@/components/HistoricalBarChart';
import LocationsTable from '@/components/LocationsTable';
import AqiScaleSection from '@/components/AqiScaleSection';
import HealthAdviceSection from '@/components/HealthAdviceSection';
import PreventHealthProblems from '@/components/PreventHealthProblems';
import ChildrenHealthAdvisory from '@/components/ChildrenHealthAdvisory';
import EmailReportModal from '@/components/EmailReportModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { API_BASE, getAqiColor, getAqiEmoji, getAqiDescription, formatNumber } from '@/lib/aqi-utils';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const TrendChart = dynamic(() => import('@/components/TrendChart'), { ssr: false });

export default function CityPage() {
    const params = useParams();
    const cityId = params?.id as string;

    const [detail, setDetail] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [forecast, setForecast] = useState<any[]>([]);
    const [hourlyHistory, setHourlyHistory] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [forecastModel, setForecastModel] = useState('RandomForest');
    const [isRefetchingForecast, setIsRefetchingForecast] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    useEffect(() => {
        if (!cityId) return;

        const load = async () => {
            setLoading(true);
            try {
                const [detailRes, histRes, forecastRes, hourlyRes, locRes] = await Promise.allSettled([
                    fetch(`${API_BASE}/api/aqi/current/${cityId}`).then(r => r.json()),
                    fetch(`${API_BASE}/api/aqi/history/${cityId}?hours=168`).then(r => r.json()),
                    fetch(`${API_BASE}/api/aqi/forecast/${cityId}?hours=48&model=${forecastModel}`).then(r => r.json()),
                    fetch(`${API_BASE}/api/hourly-history/${cityId}?hours=24`).then(r => r.json()),
                    fetch(`${API_BASE}/api/locations/${cityId}`).then(r => r.json()),
                ]);

                if (detailRes.status === 'fulfilled') setDetail(detailRes.value);
                if (histRes.status === 'fulfilled') setHistory(histRes.value.data || []);
                if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value.data || []);
                if (hourlyRes.status === 'fulfilled') setHourlyHistory(hourlyRes.value);
                if (locRes.status === 'fulfilled') setLocations(locRes.value.locations || []);
            } catch (err) {
                console.error('Failed to load city data', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [cityId]); // Removed forecastModel dependency to prevent full page reload

    const fetchModelForecast = async (model: string) => {
        setForecastModel(model);
        setIsRefetchingForecast(true);
        try {
            const res = await fetch(`${API_BASE}/api/aqi/forecast/${cityId}?hours=48&model=${model}`);
            if (res.ok) {
                const data = await res.json();
                setForecast(data.data || []);
            }
        } catch (err) {
            console.error('Failed to update forecast', err);
        } finally {
            setIsRefetchingForecast(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center theme-transition">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted text-sm theme-transition">Loading air quality data...</p>
                </div>
            </div>
        );
    }

    if (!detail || detail.error || !detail.city || !detail.aqi) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center theme-transition">
                <div className="text-center">
                    <p className="text-4xl mb-4">😢</p>
                    <h2 className="text-xl font-bold mb-2 text-primary theme-transition">City or Data Not Found</h2>
                    <p className="text-sm text-muted mb-4 theme-transition">Unable to load air quality data. The backend ML or analytics API might be returning an error.</p>
                    <a href="/" className="px-4 py-2 bg-surface border border-border text-primary font-medium rounded-lg hover:border-accent-blue transition text-sm">← Back to Dashboard</a>
                </div>
                {detail?.detail && (
                    <div className="mt-8 max-w-md p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-500 font-mono break-all font-medium">API Error: {typeof detail.detail === 'string' ? detail.detail : JSON.stringify(detail.detail)}</p>
                    </div>
                )}
            </div>
        );
    }

    const { city, aqi, pollutants, weather } = detail;
    const color = getAqiColor(aqi.aqi);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemAnim: any = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen">
            {showEmailModal && (
                <EmailReportModal
                    cityName={city.name}
                    cityState={city.state}
                    forecastData={forecast}
                    forecastModel={forecastModel}
                    locations={locations}
                    currentAqi={aqi.aqi}
                    onClose={() => setShowEmailModal(false)}
                />
            )}
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl theme-transition">
                <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            className="text-muted hover:text-primary transition text-sm font-medium theme-transition"
                        >
                            ← Back
                        </a>
                        <div className="w-px h-5 bg-border theme-transition" />
                        <div>
                            <h1 className="text-lg font-bold text-primary theme-transition">{city.name}</h1>
                            <p className="text-[15px] text-secondary theme-transition">{city.state} • Pop: {formatNumber(city.population || 0)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setShowEmailModal(true)}
                            title="Email AQI Report"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-secondary hover:text-primary hover:border-accent-blue/50 transition text-xs font-medium theme-transition shadow-sm"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Email Report</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm" style={{ color }}>{getAqiEmoji(aqi.aqi)}</span>
                            <span className="text-xl font-bold" style={{ color }}>{aqi.aqi}</span>
                            <span className="aqi-badge text-xs" style={{ background: `${color}20`, color }}>
                                {aqi.category}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
                <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
                    {/* Top: AQI + Weather + Health */}
                    <motion.div variants={itemAnim} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="glass-card p-6 flex flex-col items-center justify-center theme-transition">
                            <AqiGauge aqi={aqi.aqi} size="lg" />
                            <div className="mt-3 text-center">
                                <p className="text-xs text-secondary theme-transition">Dominant Pollutant</p>
                                <p className="text-sm font-semibold theme-transition" style={{ color }}>
                                    {aqi.dominant_pollutant?.toUpperCase() || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <WeatherCard weather={weather} />
                        <ChildrenHealthAdvisory />
                    </motion.div>

                    {/* Historical Bar Chart (24h) */}
                    {hourlyHistory && hourlyHistory.data && (
                        <motion.div variants={itemAnim}>
                            <HistoricalBarChart
                                data={hourlyHistory.data}
                                cityName={city.name}
                                min={hourlyHistory.min}
                                max={hourlyHistory.max}
                                startDate={hourlyHistory.start_date}
                                endDate={hourlyHistory.end_date}
                            />
                        </motion.div>
                    )}

                    {/* Pollutant Breakdown */}
                    <motion.div variants={itemAnim}>
                        <PollutantChart pollutants={pollutants} subIndices={aqi.sub_indices} />
                    </motion.div>

                    {/* 7-Day Trend + 48h Forecast */}
                    <motion.div variants={itemAnim} className="flex flex-col gap-10 relative mt-8">
                        <TrendChart data={history} title="7-Day AQI Trend" />
                        <div className="relative">
                            {isRefetchingForecast && (
                                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 rounded-2xl flex items-center justify-center theme-transition">
                                    <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                            <ForecastChart
                                data={forecast}
                                selectedModel={forecastModel}
                                onModelChange={fetchModelForecast}
                            />
                        </div>
                    </motion.div>

                    {/* City Sub-Locations */}
                    {locations.length > 0 && (
                        <motion.div variants={itemAnim}>
                            <LocationsTable cityName={city.name} locations={locations} />
                        </motion.div>
                    )}

                    {/* Health Advice Section (Cigarettes Eq + Solutions) */}
                    <motion.div variants={itemAnim}>
                        <HealthAdviceSection cityName={city.name} pm25={pollutants?.pm25?.value || pollutants?.pm25 || 0} aqi={aqi.aqi} />
                    </motion.div>

                    {/* Prevent Health Problems Section */}
                    <motion.div variants={itemAnim}>
                        <PreventHealthProblems cityName={city.name} aqi={aqi.aqi} />
                    </motion.div>

                    {/* AQI Scale Section */}
                    <motion.div variants={itemAnim} className="pb-8">
                        <AqiScaleSection />
                    </motion.div>

                </motion.div>

                <footer className="mt-8 pb-10 text-center border-t border-border pt-6 theme-transition">
                    <p className="text-sm text-secondary font-medium tracking-wide theme-transition">
                        AQI Intelligence Platform • Powered by Real-Time ML forecasting
                    </p>
                </footer>
            </main>
        </div>
    );
}
