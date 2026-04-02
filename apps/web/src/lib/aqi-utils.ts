/**
 * AQI utility functions for color mapping, category labels, and data formatting.
 */

export interface AqiData {
    aqi: number;
    category: string;
    color: string;
    dominant_pollutant: string | null;
    sub_indices?: Record<string, { value: number; concentration: number }>;
}

export interface CityData {
    id: string;
    name: string;
    state: string;
    lat: number;
    lon: number;
    population?: number;
}

export interface WeatherData {
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    weather_code: number;
    pressure: number;
}

export interface ForecastPoint {
    timestamp: string;
    hour: number;
    aqi: number;
    category: string;
    color: string;
    dominant_pollutant: string;
    pollutants: Record<string, number>;
    confidence: number;
}

export interface MapFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
    properties: {
        id: string;
        name: string;
        state: string;
        aqi: number;
        category: string;
        color: string;
        dominant_pollutant: string;
        population: number;
    };
}

export function getAqiColor(aqi: number): string {
    if (aqi <= 50) return '#55a84f';
    if (aqi <= 100) return '#a3c853';
    if (aqi <= 200) return '#fff833';
    if (aqi <= 300) return '#f29c33';
    if (aqi <= 400) return '#e93f33';
    return '#af2d24';
}

export function getAqiCategory(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Satisfactory';
    if (aqi <= 200) return 'Moderate';
    if (aqi <= 300) return 'Poor';
    if (aqi <= 400) return 'Very Poor';
    return 'Severe';
}

export function getAqiBgClass(aqi: number): string {
    if (aqi <= 50) return 'bg-aqi-good';
    if (aqi <= 100) return 'bg-aqi-satisfactory';
    if (aqi <= 200) return 'bg-aqi-moderate';
    if (aqi <= 300) return 'bg-aqi-poor';
    if (aqi <= 400) return 'bg-aqi-very-poor';
    return 'bg-aqi-severe';
}

export function getAqiEmoji(aqi: number): string {
    if (aqi <= 50) return '😊';
    if (aqi <= 100) return '🙂';
    if (aqi <= 200) return '😐';
    if (aqi <= 300) return '😷';
    if (aqi <= 400) return '🤢';
    return '☠️';
}

export function getAqiDescription(aqi: number): string {
    if (aqi <= 50) return 'Air quality is good. A great day to be outdoors!';
    if (aqi <= 100) return 'Air quality is acceptable. Enjoy your day!';
    if (aqi <= 200) return 'Moderate pollution. Sensitive individuals should reduce outdoor activity.';
    if (aqi <= 300) return 'Poor air quality. Everyone may experience health effects.';
    if (aqi <= 400) return 'Very poor conditions. Avoid outdoor exposure.';
    return 'Severe pollution. Stay indoors and use air purifiers.';
}

export function getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌧️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '❄️';
    return '⛈️';
}

export function getPollutantName(key: string): string {
    const names: Record<string, string> = {
        pm25: 'PM2.5',
        pm10: 'PM10',
        no2: 'NO₂',
        so2: 'SO₂',
        co: 'CO',
        o3: 'O₃',
    };
    return names[key] || key.toUpperCase();
}

export function getPollutantUnit(key: string): string {
    return key === 'co' ? 'mg/m³' : 'µg/m³';
}

export function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

export function formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

export function formatAxisTime(timestamp: string): string {
    const d = new Date(timestamp);
    const day = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
    return `${day}, ${time}`;
}

export function formatAxisDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
    });
}

export function formatDetailedDate(timestamp: string): string {
    const d = new Date(timestamp);
    return d.toLocaleString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
}

export function formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
