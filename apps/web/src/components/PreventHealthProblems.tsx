'use client';

import React, { useState } from 'react';
import { getAqiCategory } from '@/lib/aqi-utils';

interface PreventHealthProblemsProps {
    cityName: string;
    aqi: number;
}

const RISKS = [
    {
        id: 'Asthma',
        icon: '🫁',
        riskLevels: { Good: 'Low', Moderate: 'Moderate', Poor: 'High', Unhealthy: 'High', Severe: 'Critical', Hazardous: 'Critical' },
        desc: 'Severe symptoms including intense wheezing, severe shortness of breath, significant chest tightness, and persistent coughing that may disrupt daily activities.',
        color: '#ef4444',
        dos: [
            'Avoid going outside and keep windows closed to reduce exposure to pollutants.',
            'Take prescribed medications as directed by your healthcare provider.',
            'Maintain clean indoor air with air purifiers, especially in bedrooms and living areas.'
        ],
        donts: [
            'Smoke or expose yourself to secondhand smoke.',
            'Engage in physical exertion outdoors.'
        ]
    },
    {
        id: 'Heart Issues',
        icon: '🫀',
        riskLevels: { Good: 'Low', Moderate: 'Moderate', Poor: 'High', Unhealthy: 'High', Severe: 'Critical', Hazardous: 'Critical' },
        desc: 'Increased risk of palpitations, irregular heartbeats, and chest pain. Can precipitate serious cardiovascular events.',
        color: '#f97316',
        dos: [
            'Monitor blood pressure and heart rate closely.',
            'Stay in well-ventilated indoor spaces with air purification.',
            'Keep emergency contacts and medications readily accessible.'
        ],
        donts: [
            'Perform strenuous outdoor exercise.',
            'Ignore early warning signs like chest discomfort.'
        ]
    },
    {
        id: 'Allergies',
        icon: '🤧',
        riskLevels: { Good: 'Low', Moderate: 'High', Poor: 'High', Unhealthy: 'Critical', Severe: 'Critical', Hazardous: 'Critical' },
        desc: 'Heightened allergic reactions, watery eyes, extreme sneezing, and skin irritation due to particulate matter combining with allergens.',
        color: '#eab308',
        dos: [
            'Use antihistamines proactively during high pollution days.',
            'Shower before bed to remove particulates from hair and skin.',
            'Use HEPA filters in living spaces.'
        ],
        donts: [
            'Leave windows open during peak pollution hours.',
            'Dry clothes outside where they can catch pollutants.'
        ]
    },
    {
        id: 'Sinus',
        icon: '👃',
        riskLevels: { Good: 'Low', Moderate: 'Moderate', Poor: 'High', Unhealthy: 'High', Severe: 'Critical', Hazardous: 'Critical' },
        desc: 'Severe nasal congestion, sinus pressure headaches, and potential for secondary bacterial infections due to inflamed nasal passages.',
        color: '#8b5cf6',
        dos: [
            'Use saline nasal sprays or neti pots to clear particulates.',
            'Stay hydrated to keep mucus membranes moist.',
            'Use a humidifier indoors if the air is dry.'
        ],
        donts: [
            'Use strong aerosol sprays or scented candles indoors.',
            'Ignore persistent sinus pain or green/yellow discharge.'
        ]
    },
    {
        id: 'Cold/Flu',
        icon: '🤒',
        riskLevels: { Good: 'Low', Moderate: 'High', Poor: 'High', Unhealthy: 'Critical', Severe: 'Critical', Hazardous: 'Critical' },
        desc: 'Prolonged recovery times, worsened coughs, and increased susceptibility to respiratory viruses.',
        color: '#06b6d4',
        dos: [
            'Rest extensively and stay fully indoors.',
            'Drink warm fluids continuously.',
            'Wear a high-quality mask even indoors if living with others.'
        ],
        donts: [
            'Push through symptoms with physical activity.',
            'Expose yourself to cold drafts or AC blasting directly.'
        ]
    },
    {
        id: 'Chronic (COPD)',
        icon: '😮‍💨',
        riskLevels: { Good: 'Low', Moderate: 'High', Poor: 'Critical', Unhealthy: 'Critical', Severe: 'Critical', Hazardous: 'Critical' },
        desc: 'Acutely worsened lung function, severe exacerbations requiring medical intervention, and critically low oxygen saturation.',
        color: '#ec4899',
        dos: [
            'Follow your COPD action plan strictly.',
            'Ensure oxygen supplies are full if you use supplemental oxygen.',
            'Contact doctor immediately if breathing becomes significantly harder.'
        ],
        donts: [
            'Venture outdoors under any circumstances.',
            'Be around strong odors, fumes, or cleaning chemicals.'
        ]
    }
];

export default function PreventHealthProblems({ cityName, aqi }: PreventHealthProblemsProps) {
    const [activeTab, setActiveTab] = useState(RISKS[0].id);
    const category = getAqiCategory(aqi) || 'Good';

    const activeData = RISKS.find(r => r.id === activeTab) || RISKS[0];
    const riskLevel = activeData.riskLevels[category as keyof typeof activeData.riskLevels] || 'High';

    return (
        <div className="mt-8 mb-6">
            <h2 className="text-xl font-bold text-slate-100 mb-1">Prevent Health Problems: Understand Your Risks</h2>
            <h3 className="text-lg font-bold text-accent-blue mb-4">{cityName}</h3>

            {/* Scrollable Tabs */}
            <div className="flex overflow-x-auto pb-3 mb-4 gap-2 scrollbar-none">
                {RISKS.map((risk) => (
                    <button
                        key={risk.id}
                        onClick={() => setActiveTab(risk.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${activeTab === risk.id
                                ? 'bg-accent-blue text-white border-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                : 'bg-dark-800 text-slate-400 border-white/5 hover:bg-dark-700 hover:text-slate-300'
                            }`}
                    >
                        <span>{risk.icon}</span>
                        {risk.id}
                    </button>
                ))}
            </div>

            <div className="glass-card flex flex-col md:flex-row overflow-hidden border border-white/5 bg-dark-800/80">
                {/* Left Card: Graphic representation */}
                <div
                    className="md:w-1/3 p-6 flex flex-col items-center justify-center min-h-[250px] relative transition-colors duration-500"
                    style={{ backgroundColor: `${activeData.color}20` }}
                >
                    <div className="text-8xl mb-6 mix-blend-luminosity opacity-80 animate-pulse-slow">
                        {activeData.icon}
                    </div>

                    <div
                        className="px-4 py-2 rounded-md font-bold text-sm text-white shadow-lg w-full text-center"
                        style={{ backgroundColor: activeData.color }}
                    >
                        ■ {riskLevel} Chances of {activeData.id}
                    </div>
                </div>

                {/* Right Content */}
                <div className="md:w-2/3 p-6 lg:p-8">
                    <h4 className="text-lg font-bold text-white mb-2">{activeData.id}</h4>
                    <p className="text-sm text-slate-300 mb-4">
                        Risk of <span className="font-bold text-white">{activeData.id}</span> symptoms is <span className="font-bold" style={{ color: activeData.color }}>{riskLevel}</span> when AQI is <span className="font-bold text-[#ef4444]">{category} ({aqi})</span>
                    </p>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                        {activeData.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h5 className="font-bold text-white mb-3 text-sm">Do's :</h5>
                            <ul className="space-y-3">
                                {activeData.dos.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        <span className="leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-white mb-3 text-sm">Don'ts :</h5>
                            <ul className="space-y-3">
                                {activeData.donts.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-rose-500 mt-0.5">✕</span>
                                        <span className="leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-slate-500 italic mt-4 max-w-4xl leading-relaxed">
                Disclaimer: The above health risks are precautionary suggestions based on current AQI levels. You may not feel the effects immediately, but prolonged exposure to air pollution can contribute to these health conditions over time. AQI.IN is neither a medical expert nor a provider of medical advice. Please consult a doctor if you experience any of the above similar symptoms.
            </p>
        </div>
    );
}
