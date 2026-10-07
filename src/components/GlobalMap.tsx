import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'; // CRITICAL: Fixes blank canvas and invisible map tiles
import { Search, MapPin, Navigation, X, Layers, ZoomIn, ZoomOut, Globe, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { searchLocations, searchLocationsLocal, getMapMarkers, getLocationFromCoords, GeoSearchResult } from '@/lib/dataEngine';
import { MapMarker, LocationInfo } from '@/lib/types';

interface GlobalMapProps {
  location: LocationInfo;
  product: string;
  onLocationChange: (loc: LocationInfo) => void;
  onMarkerSelect: (marker: MapMarker) => void;
  isPro: boolean;
}

// CARTO vector basemaps — free, no API key required, English labels
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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
  const styleAppliedRef = useRef(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [, setSelectedMarker] = useState<MapMarker | null>(null);
  const [zoom, setZoom] = useState(2);
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: theme === 'dark' ? DARK_STYLE : LIGHT_STYLE,
      center: [location.lng, location.lat],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      attributionControl: {},
      dragPan: true,
      scrollZoom: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      keyboard: true,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      map.resize(); // Force recalculation of container size
      setZoom(map.getZoom());
      setPitch(map.getPitch());
      setBearing(map.getBearing());
      forceEnglishLabels(map);
    });

    map.on('move', () => {
      setZoom(map.getZoom());
      setPitch(map.getPitch());
      setBearing(map.getBearing());
    });

    map.on('style.load', () => {
      forceEnglishLabels(map);
    });

    map.on('click', (e) => {
      const loc = getLocationFromCoords(e.lngLat.lat, e.lngLat.lng);
      onLocationChange(loc);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      styleAppliedRef.current = false;
    };
  }, []);

  // Force all map labels to English using name_en
  const forceEnglishLabels = (map: maplibregl.Map) => {
    const layers = map.getStyle()?.layers || [];
    for (const layer of layers) {
      if (layer.type === 'symbol') {
        const layout = map.getLayoutProperty(layer.id, 'text-field');
        if (layout) {
          try {
            map.setLayoutProperty(layer.id, 'text-field', [
              'coalesce',
              ['get', 'name_en'],
              ['get', 'name:en'],
              ['get', 'name']
            ]);
          } catch {
            // Skip layers that cannot be modified
          }
        }
      }
    }
    styleAppliedRef.current = true;
  };

  // Update style on theme change
  useEffect(() => {
    if (!mapRef.current) return;
    styleAppliedRef.current = false;
    mapRef.current.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
    setMapLoaded(false);
    mapRef.current.once('load', () => {
      setMapLoaded(true);
      mapRef.current?.resize();
      forceEnglishLabels(mapRef.current!);
    });
  }, [theme]);

  // Fly to location
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
      pitch: 45,
      bearing: 0,
      duration: 2000,
      essential: true,
    });
  }, [location.lat, location.lng]);

  // Update markers when location or product changes
  useEffect(() => {
    if (!product || !mapRef.current) return;
    const newMarkers = getMapMarkers(product, location);
    setMarkers(newMarkers);

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    newMarkers.forEach((marker) => {
      const el = document.createElement('div');
      el.className = 'tp-marker';
      el.style.backgroundColor = markerColor(marker.type);
      el.innerHTML = `<div class="tp-marker-inner"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${getIconSvg(marker.type)}</svg></div>`;

      const popupContent = `
        <div style="padding: 16px; background: var(--tp-surface); color: var(--tp-text); min-width: 220px; border-radius: 8px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${marker.name}</div>
          <div style="font-size: 12px; color: var(--tp-text-muted); margin-bottom: 8px;">${marker.address}</div>
          <div style="display: flex; gap: 12px; font-size: 12px; align-items: center;">
            <span style="color: ${markerColor(marker.type)}; text-transform: capitalize; font-weight: 600;">${marker.type}</span>
            ${marker.verified ? '<span style="color: #10b981; font-weight: 600;">Verified</span>' : ''}
            ${marker.proLocked ? '<span style="color: #f59e0b; font-weight: 600;">PRO</span>' : ''}
          </div>
          <div style="margin-top: 8px; font-size: 13px;">
            <strong>Price:</strong> $${marker.originalPrice?.toFixed(2) ?? 'N/A'}
          </div>
        </div>`;

      const popup = new maplibregl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(popupContent);

      const m = new maplibregl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedMarker(marker);
        onMarkerSelect(marker);
      });

      markersRef.current.push(m);
    });
  }, [location, product, onMarkerSelect]);

  // Debounced search with geocoding edge function
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
        pitch: 45,
        bearing: 0,
        duration: 2500,
        essential: true,
      });
    }
  };

  const flyToCurrentLocation = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 12,
      pitch: 60,
      bearing: bearing + 45,
      duration: 2000,
      essential: true,
    });
  };

  const toggle3D = () => {
    if (!mapRef.current) return;
    const newPitch = pitch > 0 ? 0 : 60;
    mapRef.current.easeTo({ pitch: newPitch, duration: 800 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-[var(--tp-border)]">
      {/* Search bar overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tp-text-muted)]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Search any city or country — Karachi, Lahore, Tokyo..."
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] text-[var(--tp-text)] placeholder:text-[var(--tp-text-muted)] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {searching ? (
                <Loader2 size={16} className="text-blue-500 animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={() => { setSearchQuery(''); setShowResults(false); setSearchResults([]); }}
                  className="text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-xl overflow-hidden animate-fade-in max-h-72 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-colors text-left border-b border-[var(--tp-border)] last:border-0"
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
          {showResults && searchResults.length === 0 && !searching && searchQuery.trim() && (
            <div className="absolute top-full mt-2 w-full rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-xl p-4 text-center animate-fade-in">
              <p className="text-sm text-[var(--tp-text-muted)]">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-lg">
          <Globe size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-[var(--tp-text)]">
            {location.city ? `${location.city}, ` : ''}{location.country}
          </span>
        </div>
      </div>

      {/* Map controls overlay */}
      <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-lg flex items-center justify-center text-[var(--tp-text)] hover:bg-blue-500 hover:text-white transition-all"
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-lg flex items-center justify-center text-[var(--tp-text)] hover:bg-blue-500 hover:text-white transition-all"
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={toggle3D}
          className={`w-10 h-10 rounded-lg border shadow-lg flex items-center justify-center transition-all ${
            pitch > 0
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-[var(--tp-surface)] border-[var(--tp-border)] text-[var(--tp-text)] hover:bg-blue-500 hover:text-white'
          }`}
          title="Toggle 3D view"
        >
          <Layers size={18} />
        </button>
        <button
          onClick={flyToCurrentLocation}
          className="w-10 h-10 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-lg flex items-center justify-center text-[var(--tp-text)] hover:bg-blue-500 hover:text-white transition-all"
          title="Fly to selected location"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Map info overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--tp-surface)]/90 backdrop-blur border border-[var(--tp-border)] shadow-lg">
        <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
          <span className="font-medium text-[var(--tp-text)]">Zoom:</span> {zoom.toFixed(1)}
        </div>
        <div className="w-px h-4 bg-[var(--tp-border)]" />
        <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
          <span className="font-medium text-[var(--tp-text)]">Pitch:</span> {pitch.toFixed(0)}°
        </div>
        {product && (
          <>
            <div className="w-px h-4 bg-[var(--tp-border)]" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-[var(--tp-text)]">Markers:</span>
              <span className="text-blue-500">{markers.length}</span>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      {product && markers.length > 0 && (
        <div className="absolute bottom-4 right-16 z-10 px-4 py-3 rounded-lg bg-[var(--tp-surface)]/90 backdrop-blur border border-[var(--tp-border)] shadow-lg">
          <div className="text-xs font-semibold text-[var(--tp-text)] mb-2">Map Legend</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-[var(--tp-text-muted)]">
              <div className="w-3 h-3 rounded-full bg-blue-500" /> Local Stores
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--tp-text-muted)]">
              <div className="w-3 h-3 rounded-full bg-amber-500" /> Wholesale Markets
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--tp-text-muted)]">
              <div className="w-3 h-3 rounded-full bg-emerald-500" /> Production Centers
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--tp-bg)] z-5">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-blue-500 animate-spin" size={32} />
            <p className="text-sm text-[var(--tp-text-muted)]">Loading world map...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className={`w-full h-full min-h-[500px] ${theme === 'dark' ? 'dark-map' : ''}`} />
    </div>
  );
}

function getIconSvg(type: MapMarker['type']): string {
  switch (type) {
    case 'store':
      return '<path d="m3 7 1.5 7.5a2 2 0 0 0 2 1.5h11a2 2 0 0 0 2-1.5L21 7"/><path d="M5 7h14l-1-3H6z"/><path d="M12 16v-5"/>';
    case 'wholesale':
      return '<rect width="16" height="16" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>';
    case 'production':
      return '<path d="M2 20a3 3 0 0 0 3-3V6a3 3 0 0 1 3-3h14"/><path d="M20 20v-8a2 2 0 0 0-2-2h-7"/><path d="M14 7a2 2 0 0 1 2 2v8"/>';
  }
}