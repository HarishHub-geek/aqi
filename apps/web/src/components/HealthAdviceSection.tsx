'use client';

import React, { useState } from 'react';

interface HealthAdviceSectionProps {
    cityName: string;
    pm25: number;
    aqi: number;
}

export default function HealthAdviceSection({ cityName, pm25, aqi }: HealthAdviceSectionProps) {
    // 1 cigarette ≈ 22 μg/m³ of PM2.5
    const cigsPerDay = Math.max(0, (pm25 / 22)).toFixed(1);
    const cigsWeekly = (parseFloat(cigsPerDay) * 7).toFixed(1);
    const cigsMonthly = Math.round(parseFloat(cigsPerDay) * 30);

    const [activeSolution, setActiveSolution] = useState('Air Purifier');

    const solutions = [
        {
            id: 'Air Purifier',
            icon: '🌬️',
            status: aqi > 100 ? 'Turn On' : 'Optional',
            desc: 'Must turn on the air purifier to enjoy fresh air.',
            link: 'Get an Air Purifier'
        },
        {
            id: 'Car Filter',
            icon: '🚗',
            status: aqi > 150 ? 'Must' : 'Check',
            desc: 'Ensure your car cabin filter is upgraded to HEPA.',
            link: 'Get a Car Filter'
        },
        {
            id: 'N95 Mask',
            icon: '😷',
            status: aqi > 200 ? 'Must' : 'Optional',
            desc: 'Wear an N95 mask when stepping outdoors to filter out PM2.5 particles.',
            link: 'Get N95 Masks'
        },
        {
            id: 'Stay Indoor',
            icon: '🏠',
            status: aqi > 300 ? 'Must' : 'Recommended',
            desc: 'Avoid outdoor activities and keep windows closed.',
            link: 'Learn More'
        }
    ];

    const activeObj = solutions.find(s => s.id === activeSolution) || solutions[0];

    return (
        <div className="mt-8 mb-6">
            <h2 className="text-xl font-bold text-primary mb-1 theme-transition">Health Advice For People Living In</h2>
            <h3 className="text-lg font-bold text-accent-blue mb-4">{cityName}</h3>

            <div className="glass-card p-6 border border-border bg-card/80 theme-transition">
                {/* Top Section: Cigarette Equivalent */}
                <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-border theme-transition">
                    <div className="flex-1">
                        <div className="flex items-end gap-4 mb-4">
                            <div>
                                <span className="text-5xl font-extrabold text-[#ef4444] leading-none mb-1 block">{cigsPerDay}</span>
                                <span className="text-xs text-[#ef4444] font-medium block">Cigarettes<br />per day</span>
                            </div>
                            <div className="text-4xl translate-y-[-8px]">🚬💨</div>
                        </div>
                        <p className="text-primary text-base font-medium max-w-sm theme-transition">
                            Breathing the air in this location is as harmful as smoking {cigsPerDay} cigarettes a day.
                        </p>
                    </div>

                    <div className="flex gap-8 justify-start md:justify-end items-start pt-2">
                        <div>
                            <p className="text-sm text-secondary font-medium theme-transition">Weekly</p>
                            <p className="text-lg font-bold text-[#ef4444]">{cigsWeekly} Cigarettes</p>
                        </div>
                        <div>
                            <p className="text-sm text-secondary font-medium theme-transition">Monthly</p>
                            <p className="text-lg font-bold text-[#ef4444]">{cigsMonthly} Cigarettes</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 pb-2 flex justify-between">
                    <p className="text-[9px] text-muted max-w-2xl italic leading-relaxed theme-transition">
                        Disclaimer: This cigarette-equivalent estimate is based on the average PM2.5 concentration, assuming continuous exposure during that time.
                    </p>
                    <p className="text-[10px] text-muted theme-transition">Source: Berkeley Earth ⓘ</p>
                </div>

                {/* Bottom Section: Solutions */}
                <div className="pt-6">
                    <h4 className="text-sm font-bold text-primary mb-4 theme-transition">Solutions for Current AQI (IN)</h4>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-2/3">
                            {solutions.map((sol) => (
                                <button
                                    key={sol.id}
                                    onClick={() => setActiveSolution(sol.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${activeSolution === sol.id
                                        ? 'border-accent-blue bg-accent-blue/10 theme-transition'
                                        : 'border-transparent hover:bg-surface theme-transition'
                                        }`}
                                >
                                    <span className="text-2xl">{sol.icon}</span>
                                    <div>
                                        <p className="text-xs font-bold text-primary theme-transition">{sol.id}</p>
                                        <p className="text-[10px] text-muted theme-transition">{sol.status}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="lg:w-1/3 flex flex-col justify-center pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 theme-transition">
                            <p className="text-sm text-secondary mb-2 theme-transition">{activeObj.desc}</p>
                            <button className="text-accent-blue hover:text-blue-400 text-sm font-medium text-left w-max group flex items-center gap-1">
                                {activeObj.link} <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
