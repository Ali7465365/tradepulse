import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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

// CARTO vector basemaps with API key
const CARTO_KEY = 'cb1_4d22_1_b1e4910826501c28d0d1fefa';
const DARK_STYLE = `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_KEY}`;
const LIGHT_STYLE = `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?key=${CARTO_KEY}`;

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

  // Force all map labels to English by overriding text-field on every symbol layer
  const forceEnglishLabels = useCallback((map: maplibregl.Map) => {
    const style = map.getStyle();
    if (!style || !style.layers) return;

    for (const layer of style.layers) {
      if (layer.type !== 'symbol') continue;
      try {
        const currentField = map.getLayoutProperty(layer.id, 'text-field');
        if (currentField) {
          map.setLayoutProperty(layer.id, 'text-field', [
            'coalesce',
            ['get', 'name_en'],
            ['get', 'name:en'],
            ['get', 'name'],
          ]);
        }
      } catch {
        // some layers can't be modified — skip silently
      }
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: theme === 'dark' ? DARK_STYLE : LIGHT_STYLE,
      center: [location.lng, location.lat],
      zoom: 3,
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
      forceEnglishLabels(map);
      map.resize();
    });

    // Re-apply English labels whenever a new style finishes loading
    map.on('style.load', () => {
      forceEnglishLabels(map);
    });

    map.on('move', () => {
      setZoom(map.getZoom());
      setPitch(map.getPitch());
      setBearing(map.getBearing());
    });

    map.on('click', (e) => {
      const loc = getLocationFromCoords(e.lngLat.lat, e.lngLat.lng);
      onLocationChange(loc);
    });

    // ResizeObserver ensures the map canvas fills its container on any DOM/viewport change
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update style when theme changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
    setMapLoaded(false);
    mapRef.current.once('load', () => {
      setMapLoaded(true);
      forceEnglishLabels(mapRef.current!);
      mapRef.current!.resize();
    });
  }, [theme, forceEnglishLabels]);

  // Fly to location
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
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
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      const popup = new maplibregl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(
        `<div style="padding:12px;font-family:system-ui,sans-serif;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${marker.name}</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${marker.address}</div>
          <div style="font-size:12px;text-transform:capitalize;color:${markerColor(marker.type)};font-weight:600;">${marker.type}</div>
          ${marker.originalPrice ? `<div style="font-size:13px;margin-top:4px;">Price: $${marker.originalPrice.toFixed(2)}</div>` : ''}
        </div>`
      );

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

  // Debounced search — local results immediately, then Nominatim for worldwide coverage
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Show local hardcoded results instantly for responsiveness
    const localResults = searchLocationsLocal(query);
    setSearchResults(localResults);
    setShowResults(true);

    // Then fetch worldwide results from Nominatim via searchLocations
    setSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(query);
      setSearchResults(results);
      setSearching(false);
    }, 350);
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
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-[var(--tp-border)] bg-gray-900">
      {/* Search bar overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

      {/* Map container — explicit height to prevent blank canvas */}
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />
    </div>
  );
}
