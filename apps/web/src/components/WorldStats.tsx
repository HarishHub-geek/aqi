'use client';

import React from 'react';

export default function WorldStats() {
    return (
        <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-primary theme-transition">Global Impact of Air Pollution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1 */}
                <div className="glass-card p-8 flex flex-col justify-between bg-card/50 hover:-translate-y-1 transition duration-300 theme-transition">
                    <div>
                        <h3 className="text-4xl font-extrabold text-primary mb-4 theme-transition">99%</h3>
                        <p className="text-sm font-medium text-secondary leading-relaxed theme-transition">
                            Of the world's population lives in places where air quality exceeds the annual WHO guideline limits.
                        </p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-border theme-transition">
                        <p className="text-[10px] text-muted theme-transition">Source: World Health Organization</p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="glass-card p-8 flex flex-col justify-between bg-card/50 hover:-translate-y-1 transition duration-300 theme-transition">
                    <div>
                        <h3 className="text-4xl font-extrabold text-primary mb-2 theme-transition">8.1 Million</h3>
                        <p className="text-sm font-medium text-secondary leading-relaxed mb-6 theme-transition">
                            Of deaths worldwide can be attributed to air pollution.
                        </p>

                        <div className="bg-surface rounded-xl p-4 space-y-4 border border-border theme-transition mt-6">
                            <div className="flex items-start gap-2">
                                <span className="text-accent-blue font-bold">→</span>
                                <div>
                                    <p className="text-sm font-bold text-primary theme-transition">4.7 million</p>
                                    <p className="text-xs text-secondary theme-transition">Due to outdoor particulate matter air pollution</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-accent-blue font-bold">→</span>
                                <div>
                                    <p className="text-sm font-bold text-primary theme-transition">3.1 million</p>
                                    <p className="text-xs text-secondary theme-transition">Due to indoor air pollution</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-accent-blue font-bold">→</span>
                                <div>
                                    <p className="text-sm font-bold text-primary theme-transition">0.5 million</p>
                                    <p className="text-xs text-secondary theme-transition">Due to outdoor ozone pollution</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-border theme-transition">
                        <p className="text-[10px] text-muted theme-transition">Source: Health Effects Institute 2021 - Numbers for 2021</p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="glass-card p-8 flex flex-col justify-between bg-card/50 hover:-translate-y-1 transition duration-300 theme-transition">
                    <div>
                        <h3 className="text-2xl font-extrabold text-primary mb-2 theme-transition">
                            <span className="text-4xl">100</span><span className="text-muted font-medium theme-transition">/100,000</span>
                        </h3>
                        <p className="text-sm font-medium text-secondary leading-relaxed mb-6 theme-transition">
                            People worldwide die from air pollution
                        </p>

                        <div className="bg-surface rounded-xl p-4 space-y-4 border border-border theme-transition mt-6">
                            <div className="flex items-start gap-2">
                                <span className="text-muted font-bold theme-transition">→</span>
                                <div>
                                    <p className="text-sm font-bold text-primary theme-transition">58<span className="text-xs text-muted font-normal theme-transition">/100,000</span></p>
                                    <p className="text-xs text-secondary theme-transition">From outdoor particulate matter</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-muted font-bold theme-transition">→</span>
                                <div>
                                    <p className="text-sm font-bold text-primary theme-transition">39<span className="text-xs text-muted font-normal theme-transition">/100,000</span></p>
                                    <p className="text-xs text-secondary theme-transition">From indoor air pollution</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-muted font-bold theme-transition">→</span>
                                <div>
                                    <p className="text-sm font-bold text-primary theme-transition">6<span className="text-xs text-muted font-normal theme-transition">/100,000</span></p>
                                    <p className="text-xs text-secondary theme-transition">From outdoor ozone pollution</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-border theme-transition">
                        <p className="text-[10px] text-muted theme-transition">Source: IHME (Institute for Health Metrics and Evaluation) 2024</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
