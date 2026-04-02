'use client';

import React, { useState } from 'react';

interface ScaleItem {
    category: string;
    range: string;
    color: string;
    textColor: string;
    description: string;
    icon: string;
}

const SCALES: Record<string, ScaleItem[]> = {
    'AQI (IN)': [
        { category: 'Good', range: '0 to 50', color: '#22c55e', textColor: '#4ade80', description: 'The air is fresh and free from toxins. Enjoy outdoor activities without any health concerns.', icon: '😃' },
        { category: 'Moderate', range: '51 to 100', color: '#eab308', textColor: '#fde047', description: 'Air quality is acceptable for most, but sensitive individuals might experience mild discomfort.', icon: '🙂' },
        { category: 'Poor', range: '101 to 200', color: '#f97316', textColor: '#fdba74', description: 'Breathing may become slightly uncomfortable, especially for those with respiratory issues.', icon: '🤧' },
        { category: 'Unhealthy', range: '201 to 300', color: '#ef4444', textColor: '#fca5a5', description: 'This air quality is particularly risky for children, pregnant women, and the elderly.', icon: '😷' },
        { category: 'Severe', range: '301 to 400', color: '#a855f7', textColor: '#d8b4fe', description: 'Health alert: everyone may experience serious health effects. Stay indoors.', icon: '🤢' },
        { category: 'Hazardous', range: '401 to 500+', color: '#7f1d1d', textColor: '#fca5a5', description: 'Health alert: serious health effects for all. Avoid all outdoor activities.', icon: '☠️' }
    ],
    'NO2': [
        { category: 'Good', range: '0 to 40', color: '#22c55e', textColor: '#4ade80', description: 'Air quality is optimal. No health impact chances.', icon: '😃' },
        { category: 'Moderate', range: '41 to 80', color: '#eab308', textColor: '#fde047', description: 'Air quality is acceptable; sensitive individuals may experience mild respiratory discomfort.', icon: '🙂' },
        { category: 'Poor', range: '81 to 180', color: '#f97316', textColor: '#fdba74', description: 'Increased risk of respiratory infections and reduced lung function in sensitive groups.', icon: '🤧' },
        { category: 'Unhealthy', range: '181 to 190', color: '#ef4444', textColor: '#fca5a5', description: 'Everyone may experience more serious health effects, particularly on the respiratory system.', icon: '😷' },
        { category: 'Severe', range: '191 to 400', color: '#a855f7', textColor: '#d8b4fe', description: 'Health alert: severe health effects for all; emergency conditions for sensitive groups.', icon: '🤢' },
        { category: 'Hazardous', range: '401 to 500+', color: '#7f1d1d', textColor: '#fca5a5', description: 'Life-threatening effects for the entire population. Immediate health risks.', icon: '☠️' }
    ],
    'CO': [
        { category: 'Good', range: '0 to 8330', color: '#22c55e', textColor: '#4ade80', description: 'Air is clean and safe. No adverse health effects expected.', icon: '😃' },
        { category: 'Moderate', range: '8331 to 16670', color: '#eab308', textColor: '#fde047', description: 'Acceptable air quality, but some sensitive individuals may experience minor health effects.', icon: '🙂' },
        { category: 'Poor', range: '16671 to 25000', color: '#f97316', textColor: '#fdba74', description: 'Prolonged exposure may cause mild headaches and fatigue, especially in vulnerable groups.', icon: '🤧' },
        { category: 'Unhealthy', range: '25001 to 33330', color: '#ef4444', textColor: '#fca5a5', description: 'Increased risk of cardiovascular effects and more severe symptoms in sensitive groups.', icon: '😷' },
        { category: 'Severe', range: '33331 to 41670', color: '#a855f7', textColor: '#d8b4fe', description: 'Significant health effects, including confusion and impaired vision; emergency conditions for sensitive groups.', icon: '🤢' },
        { category: 'Hazardous', range: '41671 to 50000+', color: '#7f1d1d', textColor: '#fca5a5', description: 'Immediate danger to health. High risk of cardiovascular and neurological effects, potentially fatal.', icon: '☠️' }
    ],
    'O3': [
        { category: 'Good', range: '0 to 50', color: '#22c55e', textColor: '#4ade80', description: 'Air quality is excellent with no health impacts.', icon: '😃' },
        { category: 'Moderate', range: '51 to 100', color: '#eab308', textColor: '#fde047', description: 'Air quality is acceptable; however, sensitive people may experience respiratory symptoms.', icon: '🙂' },
        { category: 'Poor', range: '101 to 168', color: '#f97316', textColor: '#fdba74', description: 'Sensitive individuals may experience more serious effects on the lungs and heart.', icon: '🤧' },
        { category: 'Unhealthy', range: '169 to 208', color: '#ef4444', textColor: '#fca5a5', description: 'Particularly children, active adults, and people with respiratory disease face health effects.', icon: '😷' },
        { category: 'Severe', range: '209 to 748', color: '#a855f7', textColor: '#d8b4fe', description: 'Significant health effects for the general population and emergency conditions for sensitive groups.', icon: '🤢' },
        { category: 'Hazardous', range: '749 to 1250+', color: '#7f1d1d', textColor: '#fca5a5', description: 'Severe health effects; emergencies for the entire population.', icon: '☠️' }
    ],
    'PM2.5': [
        { category: 'Good', range: '0 to 30', color: '#22c55e', textColor: '#4ade80', description: 'Air quality is optimal. No health impact chances.', icon: '😃' },
        { category: 'Moderate', range: '31 to 60', color: '#eab308', textColor: '#fde047', description: 'Acceptable air quality, but some sensitive individuals may experience minor health effects.', icon: '🙂' },
        { category: 'Poor', range: '61 to 90', color: '#f97316', textColor: '#fdba74', description: 'Breathing may become slightly uncomfortable, especially for those with respiratory issues.', icon: '🤧' },
        { category: 'Unhealthy', range: '91 to 120', color: '#ef4444', textColor: '#fca5a5', description: 'This air quality is particularly risky for children, pregnant women, and the elderly.', icon: '😷' },
        { category: 'Severe', range: '121 to 250', color: '#a855f7', textColor: '#d8b4fe', description: 'Health warnings of emergency conditions. The entire population is likely to be affected.', icon: '🤢' },
        { category: 'Hazardous', range: '250+', color: '#7f1d1d', textColor: '#fca5a5', description: 'Health alert: everyone may experience serious health effects. Stay indoors.', icon: '☠️' }
    ],
    'SO2': [
        { category: 'Good', range: '0 to 40', color: '#22c55e', textColor: '#4ade80', description: 'Air quality is optimal. No health impact chances.', icon: '😃' },
        { category: 'Moderate', range: '41 to 80', color: '#eab308', textColor: '#fde047', description: 'Acceptable air quality, but some sensitive individuals may experience minor health effects.', icon: '🙂' },
        { category: 'Poor', range: '81 to 380', color: '#f97316', textColor: '#fdba74', description: 'Breathing may become slightly uncomfortable, especially for those with respiratory issues.', icon: '🤧' },
        { category: 'Unhealthy', range: '381 to 800', color: '#ef4444', textColor: '#fca5a5', description: 'This air quality is particularly risky for children, pregnant women, and the elderly.', icon: '😷' },
        { category: 'Severe', range: '801 to 1600', color: '#a855f7', textColor: '#d8b4fe', description: 'Health warnings of emergency conditions. The entire population is likely to be affected.', icon: '🤢' },
        { category: 'Hazardous', range: '1600+', color: '#7f1d1d', textColor: '#fca5a5', description: 'Health alert: everyone may experience serious health effects. Stay indoors.', icon: '☠️' }
    ],
};

const POLLUTANT_TABS = ['AQI (IN)', 'PM2.5', 'O3', 'CO', 'SO2', 'NO2'];

export default function AqiScaleSection() {
    const [activeTab, setActiveTab] = useState('AQI (IN)');

    // Fallback to AQI (IN) if scale doesn't exist
    const activeScale = SCALES[activeTab] || SCALES['AQI (IN)'];

    return (
        <div className="glass-card p-6 mt-8 theme-transition">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-primary theme-transition">
                        Air Quality Index (AQI)
                    </h2>
                    <h3 className="text-lg font-bold text-primary theme-transition">Scale</h3>
                </div>
                <p className="text-sm text-secondary max-w-md theme-transition">
                    Know about the category of air quality index (AQI) your ambient air falls in and what it implies.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4 theme-transition">
                {POLLUTANT_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition ${activeTab === tab
                            ? 'bg-primary text-background shadow-sm ring-1 ring-primary/20 theme-transition'
                            : 'text-secondary hover:bg-surface hover:text-primary transition theme-transition'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Scale items */}
            <div className="space-y-3">
                {activeScale.map((item) => (
                    <div
                        key={item.category}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-card hover:bg-surface border border-border transition theme-transition"
                    >
                        {/* Left: Indicator + Category + Range */}
                        <div className="flex items-center gap-4 sm:w-48 flex-shrink-0">
                            <div
                                className="w-4 h-4 rounded-sm flex-shrink-0"
                                style={{ background: item.color }}
                            />
                            <div>
                                <p className="text-sm font-bold" style={{ color: item.textColor }}>
                                    {item.category}
                                </p>
                                <p className="text-xs text-muted theme-transition">({item.range})</p>
                            </div>
                        </div>

                        {/* Middle: Description */}
                        <p className="text-sm text-secondary flex-1 leading-relaxed theme-transition">
                            {item.description}
                        </p>

                        {/* Right: Icon (Hidden on very small screens) */}
                        <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-12 h-12 bg-background rounded-full border border-border text-2xl theme-transition">
                            {item.icon}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
