'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { getAqiColor, getAqiCategory } from '@/lib/aqi-utils';

interface ForecastPoint {
    timestamp: string;
    aqi: number;
    confidence?: number;
}

interface LocationData {
    location: string;
    aqi: number;
    category: string;
    color: string;
    pm25?: number;
    pm10?: number;
    temperature?: number;
    humidity?: number;
}

interface EmailReportModalProps {
    cityName: string;
    cityState: string;
    forecastData: ForecastPoint[];
    forecastModel: string;
    locations: LocationData[];
    currentAqi: number;
    onClose: () => void;
}

const HEALTH_TIPS: Record<string, { dos: string[]; donts: string[] }> = {
    Good: {
        dos: ['Enjoy outdoor activities freely.', 'Open windows for natural ventilation.', 'Great day to exercise outdoors.'],
        donts: ['Don\'t skip regular respiratory check-ups.', 'Don\'t burn waste or add to pollution.'],
    },
    Satisfactory: {
        dos: ['Light outdoor activities are fine.', 'Stay hydrated throughout the day.', 'Use common sense if sensitive.'],
        donts: ['Avoid prolonged heavy outdoor exercise if sensitive.', 'Don\'t skip medications if prescribed.'],
    },
    Moderate: {
        dos: ['Limit prolonged outdoor exertion.', 'Use an air purifier indoors.', 'Wear a mask if outdoors for long.'],
        donts: ['Don\'t let children play outdoors for extended periods.', 'Avoid burning waste or fireworks.'],
    },
    Poor: {
        dos: ['Stay indoors as much as possible.', 'Run air purifiers on high setting.', 'Wear an N95 mask if you must go out.', 'Keep all windows and doors closed.'],
        donts: ['Don\'t exercise outdoors.', 'Don\'t open windows during peak traffic hours.', 'Avoid driving if possible.'],
    },
    'Very Poor': {
        dos: ['Remain indoors at all times.', 'Use N95/FFP2 masks even indoors if house is not sealed.', 'Seek medical attention if you feel breathing difficulty.', 'Keep emergency contacts ready.'],
        donts: ['Do NOT go outdoors unless absolutely necessary.', 'Don\'t cook with open flames.', 'Don\'t allow pets outdoors for long.'],
    },
    Severe: {
        dos: ['Stay indoors with sealed windows.', 'Use multiple air purifiers.', 'Call emergency services if experiencing chest pain or breathlessness.', 'Evacuate if possible.'],
        donts: ['Do NOT go outside under any circumstances.', 'Don\'t exercise even indoors vigorously.', 'Don\'t ignore any respiratory symptoms.'],
    },
};

function buildHtmlEmail(
    userName: string,
    locationQuery: string,
    cityName: string,
    forecastData: ForecastPoint[],
    forecastModel: string,
    filteredLocations: LocationData[],
    currentAqi: number,
): string {
    const category = getAqiCategory(currentAqi);
    const tips = HEALTH_TIPS[category] || HEALTH_TIPS['Moderate'];
    const aqiColor = getAqiColor(currentAqi);

    const forecastRows = forecastData
        .map((row) => {
            const d = new Date(row.timestamp);
            const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const cat = getAqiCategory(row.aqi);
            const color = getAqiColor(row.aqi);
            return `
        <tr style="border-bottom:1px solid #2a2a3a;">
          <td style="padding:10px 14px;color:#c8d0e0;font-size:13px;">${dateStr}</td>
          <td style="padding:10px 14px;color:#8892a4;font-size:13px;">${timeStr}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:700;font-size:16px;color:${color};">${Math.round(row.aqi)}</td>
          <td style="padding:10px 14px;">
            <span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${cat}</span>
          </td>
        </tr>`;
        })
        .join('');

    const locationRows = filteredLocations.length > 0
        ? filteredLocations.map((loc) => {
            const color = getAqiColor(loc.aqi);
            const cat = getAqiCategory(loc.aqi);
            return `
        <tr style="border-bottom:1px solid #2a2a3a;">
          <td style="padding:10px 14px;color:#c8d0e0;font-size:13px;font-weight:600;">${loc.location}</td>
          <td style="padding:10px 14px;text-align:right;font-weight:700;font-size:16px;color:${color};">${loc.aqi}</td>
          <td style="padding:10px 14px;">
            <span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${cat}</span>
          </td>
          <td style="padding:10px 14px;color:#8892a4;font-size:12px;">${loc.pm25 ?? '—'} µg/m³</td>
        </tr>`;
        }).join('')
        : `<tr><td colspan="4" style="padding:16px;color:#8892a4;font-size:13px;text-align:center;">No sub-location data found for "${locationQuery}". Showing city-level forecast above.</td></tr>`;

    const dosHtml = tips.dos.map(d => `<li style="margin-bottom:8px;color:#a0f0b0;">${d}</li>`).join('');
    const dontsHtml = tips.donts.map(d => `<li style="margin-bottom:8px;color:#f0a0a0;">${d}</li>`).join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AQI Report</title></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border-radius:16px;padding:32px;margin-bottom:24px;border:1px solid #3730a3;">
      <div style="font-size:28px;margin-bottom:12px;">🌍</div>
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#fff;">AQI Intelligence Report</h1>
      <p style="margin:0;color:#a5b4fc;font-size:14px;">Personalized Air Quality Report for ${locationQuery}, ${cityName}</p>
    </div>

    <!-- Greeting -->
    <div style="background:#161b2e;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #1e2a4a;">
      <p style="margin:0;color:#c8d0e0;font-size:15px;">Hi <strong style="color:#fff;">${userName}</strong>,</p>
      <p style="margin:12px 0 0;color:#8892a4;font-size:14px;line-height:1.6;">
        Here is your personalized 48-hour AQI report for <strong style="color:#a5b4fc;">${locationQuery}</strong> within 
        <strong style="color:#a5b4fc;">${cityName}</strong>.
        The current AQI is <strong style="color:${aqiColor};">${currentAqi} (${category})</strong>.
        Forecast generated using <strong style="color:#fff;">${forecastModel}</strong> model.
      </p>
    </div>

    <!-- 48-Hour Forecast Table -->
    <div style="background:#161b2e;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #1e2a4a;">
      <div style="padding:18px 24px;background:#1a2040;border-bottom:1px solid #2a2a3a;">
        <h2 style="margin:0;font-size:17px;font-weight:700;color:#fff;">📈 48-Hour AQI Forecast</h2>
        <p style="margin:4px 0 0;color:#8892a4;font-size:12px;">Model: ${forecastModel} • ${locationQuery}, ${cityName}</p>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#1a2040;">
              <th style="padding:12px 14px;text-align:left;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Date</th>
              <th style="padding:12px 14px;text-align:left;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Time</th>
              <th style="padding:12px 14px;text-align:right;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">AQI</th>
              <th style="padding:12px 14px;text-align:left;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
            </tr>
          </thead>
          <tbody>${forecastRows}</tbody>
        </table>
      </div>
    </div>

    <!-- Sub-Locations Table -->
    <div style="background:#161b2e;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #1e2a4a;">
      <div style="padding:18px 24px;background:#1a2040;border-bottom:1px solid #2a2a3a;">
        <h2 style="margin:0;font-size:17px;font-weight:700;color:#fff;">📍 Real-Time Sub-Locations</h2>
        <p style="margin:4px 0 0;color:#8892a4;font-size:12px;">Monitoring stations in and around ${locationQuery}</p>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#1a2040;">
              <th style="padding:12px 14px;text-align:left;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Location</th>
              <th style="padding:12px 14px;text-align:right;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">AQI</th>
              <th style="padding:12px 14px;text-align:left;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
              <th style="padding:12px 14px;text-align:left;color:#6b7a99;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">PM2.5</th>
            </tr>
          </thead>
          <tbody>${locationRows}</tbody>
        </table>
      </div>
    </div>

    <!-- Health Tips -->
    <div style="background:#161b2e;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #1e2a4a;">
      <h2 style="margin:0 0 18px;font-size:17px;font-weight:700;color:#fff;">💊 Health Precautions & Prevention Tips</h2>
      <p style="margin:0 0 16px;color:#8892a4;font-size:13px;">Current AQI Status: <strong style="color:${aqiColor};">${category} (${currentAqi})</strong></p>
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#4ade80;">✅ Do's</h3>
          <ul style="margin:0;padding-left:20px;">${dosHtml}</ul>
        </div>
        <div style="flex:1;min-width:220px;">
          <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;color:#f87171;">❌ Don'ts</h3>
          <ul style="margin:0;padding-left:20px;">${dontsHtml}</ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px;color:#4a5568;font-size:12px;line-height:1.6;">
      <p style="margin:0;">AQI Intelligence Platform • Powered by Real-Time ML Forecasting</p>
      <p style="margin:6px 0 0;">This is an automated report. Data updates every 5 minutes.</p>
    </div>
  </div>
</body>
</html>`;
}

export default function EmailReportModal({
    cityName,
    cityState,
    forecastData,
    forecastModel,
    locations,
    currentAqi,
    onClose,
}: EmailReportModalProps) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !location.trim() || !email.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        // Filter locations by user input (case-insensitive partial match)
        const query = location.trim().toLowerCase();
        const filteredLocs = locations.filter((l) =>
            l.location.toLowerCase().includes(query)
        );

        // Build the HTML body
        const htmlBody = buildHtmlEmail(
            name.trim(),
            location.trim(),
            cityName,
            forecastData,
            forecastModel,
            filteredLocs,
            currentAqi,
        );

        try {
            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

            await emailjs.send(
                serviceId,
                templateId,
                {
                    to_name: name.trim(),
                    to_email: email.trim(),
                    location_name: location.trim(),
                    city_name: cityName,
                    aqi_status: `${currentAqi} — ${getAqiCategory(currentAqi)}`,
                    forecast_model: forecastModel,
                    html_body: htmlBody,
                },
                publicKey,
            );
            setStatus('success');
        } catch (err: any) {
            console.error('EmailJS error:', err);
            setStatus('error');
            setErrorMsg(err?.text || 'Failed to send email. Please check your EmailJS configuration.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl theme-transition overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface/50 theme-transition">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-primary theme-transition">Email AQI Report</h2>
                            <p className="text-[11px] text-muted theme-transition">{cityName}, {cityState}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-primary transition theme-transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pt-5 pb-6">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-1 theme-transition">Report Sent!</h3>
                                <p className="text-sm text-secondary theme-transition">
                                    The AQI report for <strong className="text-primary">{location}</strong> has been sent to{' '}
                                    <strong className="text-primary">{email}</strong>.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 px-5 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <p className="text-xs text-secondary theme-transition leading-relaxed">
                                Enter your details and the location you want the AQI report for. We'll send a full forecast, sub-location data, and health tips to your email.
                            </p>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5 theme-transition">Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Arjun Sharma"
                                    required
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue/60 transition theme-transition"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5 theme-transition">
                                    Location / Area
                                    <span className="text-muted font-normal ml-1">(sub-place within {cityName})</span>
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder={`e.g. Connaught Place, Anand Vihar...`}
                                    required
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue/60 transition theme-transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-secondary mb-1.5 theme-transition">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. arjun@example.com"
                                    required
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent-blue/60 transition theme-transition"
                                />
                            </div>

                            {/* Error */}
                            {status === 'error' && (
                                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending Report...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send AQI Report
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
