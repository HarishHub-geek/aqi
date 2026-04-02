'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAqiColor, getAqiEmoji } from '@/lib/aqi-utils';

interface MapMarker {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  aqi: number;
  category: string;
  color: string;
  dominant_pollutant: string;
}

interface AqiMapProps {
  markers: MapMarker[];
  onCitySelect: (cityId: string) => void;
  selectedCity?: string | null;
}

export default function AqiMap({ markers, onCitySelect, selectedCity }: AqiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import of leaflet (client-side only)
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      // @ts-ignore - Leaflet CSS doesn't have type definitions
      await import('leaflet/dist/leaflet.css');

      // Prevent double-initialization in React strict mode
      const container = mapRef.current!;
      if ((container as any)._leaflet_id) {
        return; // Already initialized
      }

      const map = L.map(container, {
        center: [22.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      // Dark CARTO tiles (free, no token needed)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CARTO',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      setIsReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        setIsReady(false);
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    const L = require('leaflet');
    markersLayerRef.current.clearLayers();

    markers.forEach((city) => {
      const color = getAqiColor(city.aqi);
      const isSelected = selectedCity === city.id;
      const radius = isSelected ? 16 : 10;

      const circle = L.circleMarker([city.lat, city.lon], {
        radius,
        fillColor: color,
        fillOpacity: 0.85,
        color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.3)',
        weight: isSelected ? 3 : 2,
      });

      // Popup
      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 22px;">${getAqiEmoji(city.aqi)}</span>
            <div>
              <h3 style="font-size: 15px; font-weight: 700; margin: 0; color: #f1f5f9;">${city.name}</h3>
              <p style="font-size: 11px; margin: 0; color: #94a3b8;">${city.state}</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="background: ${color}; color: ${city.aqi > 200 ? '#fff' : '#1a1a2e'}; padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 20px;">
              ${city.aqi}
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 600; color: ${color};">${city.category}</div>
              <div style="font-size: 11px; color: #64748b;">Dominant: ${city.dominant_pollutant?.toUpperCase() || 'N/A'}</div>
            </div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'aqi-popup',
      });

      circle.on('click', () => {
        onCitySelect(city.id);
      });

      // Add a text label on the marker
      const icon = L.divIcon({
        className: 'aqi-marker-label',
        html: `<div style="
          width: ${isSelected ? 42 : 32}px;
          height: ${isSelected ? 42 : 32}px;
          border-radius: 50%;
          background: ${color};
          border: ${isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '13px' : '10px'};
          font-weight: 700;
          color: ${city.aqi > 200 ? '#fff' : '#1a1a2e'};
          box-shadow: 0 0 ${isSelected ? '20px' : '10px'} ${color}80, 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          font-family: Inter, sans-serif;
        ">${city.aqi}</div>`,
        iconSize: [isSelected ? 42 : 32, isSelected ? 42 : 32],
        iconAnchor: [isSelected ? 21 : 16, isSelected ? 21 : 16],
      });

      const labelMarker = L.marker([city.lat, city.lon], { icon });
      labelMarker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'aqi-popup',
      });
      labelMarker.on('click', () => onCitySelect(city.id));

      markersLayerRef.current.addLayer(labelMarker);
    });

    // Fly to selected city
    if (selectedCity) {
      const sel = markers.find((m) => m.id === selectedCity);
      if (sel) {
        mapInstanceRef.current.flyTo([sel.lat, sel.lon], 7, { duration: 1 });
      }
    }
  }, [markers, selectedCity, onCitySelect, isReady]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-white/5">
      <div ref={mapRef} className="w-full h-full" style={{ background: '#0a0e17' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-card p-3 z-[1000]">
        <p className="text-xs font-semibold text-slate-400 mb-2">AQI Scale</p>
        <div className="flex gap-1">
          {[
            { label: 'Good', color: '#55a84f', range: '0-50' },
            { label: 'Satisfactory', color: '#a3c853', range: '51-100' },
            { label: 'Moderate', color: '#fff833', range: '101-200' },
            { label: 'Poor', color: '#f29c33', range: '201-300' },
            { label: 'Very Poor', color: '#e93f33', range: '301-400' },
            { label: 'Severe', color: '#af2d24', range: '401-500' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-6 h-3 rounded-sm" style={{ background: item.color }} />
              <span className="text-[7px] text-slate-500 mt-0.5">{item.range}</span>
              <span className="text-[7px] text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom popup styles */}
      <style jsx global>{`
        .aqi-popup .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
          backdrop-filter: blur(20px);
        }
        .aqi-popup .leaflet-popup-content {
          margin: 12px 14px !important;
          color: #f1f5f9 !important;
        }
        .aqi-popup .leaflet-popup-tip {
          background: rgba(17, 24, 39, 0.95) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a {
          background: rgba(17, 24, 39, 0.9) !important;
          color: #e2e8f0 !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30, 41, 59, 0.95) !important;
        }
        .aqi-marker-label {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
