'use client';

import dynamic from 'next/dynamic';

const LeafletMapClient = dynamic(() => import('@/components/leaflet-map').then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading map...</div>,
});

export function LeafletMapSafe(props: React.ComponentProps<typeof import('@/components/leaflet-map').LeafletMap>) {
  return <LeafletMapClient {...props} />;
}
