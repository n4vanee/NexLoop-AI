'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  popup: string;
  category?: string;
}

const categoryColors: Record<string, string> = {
  scrap_metal: '#64748b',
  plastic: '#3b82f6',
  textile: '#a855f7',
  e_waste: '#f59e0b',
  food_agro: '#22c55e',
};

export function LeafletMap({
  markers,
  height = 400,
  center = [22.5, 80],
  zoom = 5,
}: {
  markers: MapMarker[];
  height?: number;
  center?: [number, number];
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
      zoomControl: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    markers.forEach((m) => {
      const color = categoryColors[m.category || ''] || '#17B26A';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 8px ${color}80;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(`<div style="font-weight:600;margin-bottom:4px;">${m.title}</div><div style="font-size:12px;color:#666;">${m.popup}</div>`);
    });
  }, [markers]);

  return <div ref={containerRef} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden" />;
}
