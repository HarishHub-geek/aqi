/**
 * API client for fetching AQI data from the backend.
 */
import { API_BASE } from './aqi-utils';

async function fetchApi<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

export async function fetchCities() {
    return fetchApi<{ count: number; cities: any[] }>('/api/cities');
}

export async function fetchCurrentAqi(cityId: string) {
    return fetchApi<any>(`/api/aqi/current/${cityId}`);
}

export async function fetchAllCurrentAqi() {
    return fetchApi<{ count: number; data: any[] }>('/api/aqi/current');
}

export async function fetchAqiHistory(cityId: string, hours = 168) {
    return fetchApi<any>(`/api/aqi/history/${cityId}?hours=${hours}`);
}

export async function fetchAqiForecast(cityId: string, hours = 48) {
    return fetchApi<any>(`/api/aqi/forecast/${cityId}?hours=${hours}`);
}

export async function fetchMapData() {
    return fetchApi<any>('/api/map');
}
