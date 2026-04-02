'use client';

import React, { useState } from 'react';
import { getAqiColor, getAqiCategory, getPollutantName } from '@/lib/aqi-utils';

interface LocationData {
    location: string;
    aqi: number;
    category: string;
    color: string;
    dominant_pollutant: string;
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
    temperature: number;
    humidity: number;
}

interface LocationsTableProps {
    cityName: string;
    locations: LocationData[];
}

type SortKey = 'location' | 'aqi' | 'pm25' | 'pm10' | 'temperature' | 'humidity';
type TabKey = 'aqi' | 'history' | 'pm25' | 'pm10' | 'co' | 'so2' | 'no2';

export default function LocationsTable({ cityName, locations }: LocationsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('aqi');
    const [sortAsc, setSortAsc] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('aqi');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(key === 'location');
        }
    };

    const sorted = [...locations].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    const tabs: { key: TabKey; label: string }[] = [
        { key: 'aqi', label: 'AQI' },
        { key: 'history', label: '⏰ History' },
        { key: 'pm25', label: 'PM2.5' },
        { key: 'pm10', label: 'PM10' },
        { key: 'co', label: 'CO' },
        { key: 'so2', label: 'SO2' },
        { key: 'no2', label: 'NO2' },
    ];

    function getCategoryBadge(category: string, color: string) {
        const bgMap: Record<string, string> = {
            'Good': 'bg-green-600',
            'Satisfactory': 'bg-green-500',
            'Moderate': 'bg-yellow-600',
            'Poor': 'bg-orange-500',
            'Very Poor': 'bg-red-500',
            'Severe': 'bg-red-700',
        };
        const bg = bgMap[category] || 'bg-gray-600';
        return (
            <span className={`${bg} text-white text-[10px] font-semibold px-2.5 py-1 rounded-full`}>
                {category}
            </span>
        );
    }

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className="text-slate-600 ml-0.5 text-[10px]">
            {sortKey === col ? (sortAsc ? '↑' : '↓') : '↕'}
        </span>
    );

    return (
        <div className="glass-card p-5 theme-transition">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <span className="text-muted theme-transition">📍</span>
                <h2 className="text-lg font-bold text-primary theme-transition">{cityName}</h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${activeTab === tab.key
                            ? 'bg-accent-blue text-white'
                            : 'bg-surface text-secondary hover:bg-card hover:text-primary theme-transition'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Sub-header */}
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-primary theme-transition">{cityName}&apos;s Locations</h3>
                <p className="text-xs text-accent-cyan">Real-time Air Pollution Level</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border theme-transition">
                            <th
                                className="text-left text-xs text-secondary font-medium py-2.5 px-3 cursor-pointer hover:text-primary transition theme-transition"
                                onClick={() => handleSort('location')}
                            >
                                Location <SortIcon col="location" />
                            </th>
                            <th className="text-center text-xs text-secondary font-medium py-2.5 px-3 theme-transition">
                                Status
                            </th>
                            <th
                                className="text-center text-xs text-secondary font-medium py-2.5 px-3 cursor-pointer hover:text-primary transition theme-transition"
                                onClick={() => handleSort('aqi')}
                            >
                                AQI (IN) <SortIcon col="aqi" />
                            </th>
                            <th
                                className="text-center text-xs text-secondary font-medium py-2.5 px-3 cursor-pointer hover:text-primary transition theme-transition"
                                onClick={() => handleSort('pm25')}
                            >
                                PM2.5<br /><span className="text-[9px] font-normal">(µg/m³)</span> <SortIcon col="pm25" />
                            </th>
                            <th
                                className="text-center text-xs text-secondary font-medium py-2.5 px-3 cursor-pointer hover:text-primary transition theme-transition"
                                onClick={() => handleSort('pm10')}
                            >
                                PM10<br /><span className="text-[9px] font-normal">(µg/m³)</span> <SortIcon col="pm10" />
                            </th>
                            <th
                                className="text-center text-xs text-secondary font-medium py-2.5 px-3 cursor-pointer hover:text-primary transition theme-transition"
                                onClick={() => handleSort('temperature')}
                            >
                                Temp.<br /><span className="text-[9px] font-normal">(°C)</span> <SortIcon col="temperature" />
                            </th>
                            <th
                                className="text-center text-xs text-secondary font-medium py-2.5 px-3 cursor-pointer hover:text-primary transition theme-transition"
                                onClick={() => handleSort('humidity')}
                            >
                                Humi.<br /><span className="text-[9px] font-normal">(%)</span> <SortIcon col="humidity" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((loc, idx) => {
                            const color = getAqiColor(loc.aqi);
                            return (
                                <tr
                                    key={loc.location}
                                    className="border-b border-border hover:bg-card/50 transition theme-transition"
                                >
                                    <td className="py-3 px-3">
                                        <span className="text-sm font-medium text-primary theme-transition">{loc.location}</span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        {getCategoryBadge(loc.category, loc.color)}
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                        <span className="text-sm font-bold" style={{ color }}>{loc.aqi}</span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-sm text-muted theme-transition">{loc.pm25}</td>
                                    <td className="py-3 px-3 text-center text-sm text-muted theme-transition">{loc.pm10}</td>
                                    <td className="py-3 px-3 text-center text-sm text-muted theme-transition">{loc.temperature}</td>
                                    <td className="py-3 px-3 text-center text-sm text-muted theme-transition">{loc.humidity}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Count */}
            <p className="text-xs text-muted mt-3 theme-transition">
                Showing {locations.length} monitoring stations in {cityName}
            </p>
        </div>
    );
}
