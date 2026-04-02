'use client';

import React from 'react';
import { Wind, Activity, Brain } from 'lucide-react';

export default function ChildrenHealthAdvisory() {
    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between hover:bg-surface transition theme-transition">
            <h3 className="text-lg font-bold mb-4 text-primary theme-transition">How does air pollution affect children?</h3>
            <div className="space-y-5 flex-1">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
                        <Wind className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-primary theme-transition">Respiratory issues</h4>
                        <p className="text-xs text-secondary mt-0.5 theme-transition">Increased asthma and bronchitis cases</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-primary theme-transition">Reduced lung function</h4>
                        <p className="text-xs text-secondary mt-0.5 theme-transition">Long-term exposure can impair lung development</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
                        <Brain className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-primary theme-transition">Cognitive development</h4>
                        <p className="text-xs text-secondary mt-0.5 theme-transition">Potential impacts on brain development and academic performance</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border theme-transition">
                <p className="text-[10px] text-muted theme-transition">Source: EEA (European Environment Agency)</p>
            </div>
        </div>
    );
}
