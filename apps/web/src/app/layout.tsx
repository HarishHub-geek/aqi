import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
    title: 'AQI Intelligence Platform | Real-Time Air Quality Monitoring for India',
    description: 'Monitor real-time air quality across Indian cities with ML-powered 48-hour forecasting, pollutant analysis, and interactive maps.',
    keywords: 'air quality, AQI, India, pollution, PM2.5, forecast, monitoring',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-background text-primary theme-transition">
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    {/* Header / Nav */}
                    <header className="absolute top-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-blue-500/20 pointer-events-auto">
                                <span className="text-white font-bold text-xl drop-shadow-md">🌍</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-primary drop-shadow-sm pointer-events-auto theme-transition">
                                    AQI Intelligence
                                </h1>
                                <p className="text-xs text-secondary font-medium tracking-wide theme-transition">
                                    Real-time Air Quality Platform for India
                                </p>
                            </div>
                        </div>
                    </header>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
