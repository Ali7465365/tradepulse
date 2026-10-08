import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchLocations, searchLocationsLocal, getMapMarkers, getLocationFromCoords, GeoSearchResult } from '@/lib/dataEngine';
import { MapMarker, LocationInfo } from '@/lib/types';

interface GlobalMapProps {
  location: LocationInfo;
  product: string;
  onLocationChange: (loc: LocationInfo) => void;
  onMarkerSelect: (marker: MapMarker) => void;
  isPro: boolean;
}

const GLOBAL_ENGLISH_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

function markerColor(type: MapMarker['type']): string {
  switch (type) {
    case 'store': return '#3b82f6';
    case 'wholesale': return '#f59e0b';
    case 'production': return '#10b981';
  }
}

export default function GlobalMap({ location, product, onLocationChange, onMarkerSelect }: GlobalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: GLOBAL_ENGLISH_STYLE,
      center: [location.lng, location.lat],
      zoom: 3,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.on('load', () => map.resize());

    map.on('click', (e) => {
      const loc = getLocationFromCoords(e.lngLat.lat, e.lngLat.lng);
      onLocationChange(loc);
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    if (mapContainer.current) resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
      duration: 2000,
    });
  }, [location.lat, location.lng]);

  useEffect(() => {
    if (!product || !mapRef.current) return;

    let isMounted = true;
    getMapMarkers(product, location).then((newMarkers) => {
      if (!isMounted || !mapRef.current) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      newMarkers.forEach((marker) => {
        const el = document.createElement('div');
        el.style.backgroundColor = markerColor(marker.type);
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';

        const m = new maplibregl.Marker(el)
          .setLngLat([marker.lng, marker.lat])
          .addTo(mapRef.current!);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onMarkerSelect(marker);
        });

        markersRef.current.push(m);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [location, product, onMarkerSelect]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const localResults = searchLocationsLocal(query);
    setSearchResults(localResults);
    setShowResults(true);

    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(query);
      setSearchResults(results);
      setSearching(false);
    }, 300);
  }, []);

  const handleSelectResult = (result: GeoSearchResult) => {
    const loc: LocationInfo = {
      country: result.country,
      countryCode: '',
      city: result.city || result.country,
      region: result.country,
      lat: result.lat,
      lng: result.lng,
    };
    onLocationChange(loc);
    setSearchQuery(result.placeName);
    setShowResults(false);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [result.lng, result.lat],
        zoom: result.city ? 11 : 5,
        duration: 2000,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-[var(--tp-border)]">
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tp-text-muted)]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search any global city or country..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] text-[var(--tp-text)] text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searching && <Loader2 size={16} className="absolute right-3 top-3.5 text-blue-500 animate-spin" />}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 text-left border-b border-[var(--tp-border)] last:border-0"
                >
                  <MapPin size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[var(--tp-text)]">{result.label}</div>
                    <div className="text-xs text-[var(--tp-text-muted)]">{result.placeName}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-full min-h-[500px]" />
    </div>
  );
}