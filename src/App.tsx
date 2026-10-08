import { MarketAnalytics, MapMarker, LocationInfo } from './types';

const COUNTRIES: { code: string; name: string; lat: number; lng: number }[] = [
  { code: 'CN', name: 'China', lat: 35.8617, lng: 104.1954 },
  { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 },
  { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 },
  { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
  { code: 'PK', name: 'Pakistan', lat: 30.3753, lng: 69.3451 },
  { code: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674 },
];

const CITIES: { name: string; country: string; countryCode: string; lat: number; lng: number }[] = [
  { name: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.2304, lng: 121.4737 },
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.8607, lng: 67.0011 },
  { name: 'Provincia di Imperia', country: 'Italy', countryCode: 'IT', lat: 43.8861, lng: 7.9275 },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
];

export interface GeoSearchResult {
  id: string;
  label: string;
  placeName: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
}

export function searchLocationsLocal(query: string): GeoSearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const cityMatches = CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  ).map((c) => ({
    id: `city-${c.name}-${c.countryCode}`,
    label: c.name,
    placeName: `${c.name}, ${c.country}`,
    lat: c.lat,
    lng: c.lng,
    country: c.country,
    city: c.name,
  }));

  return cityMatches.slice(0, 10);
}

export async function searchLocations(query: string): Promise<GeoSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&accept-language=en`;
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error('Geocoding direct fetch failed');
    const data = await res.json();

    return data.map((item: any, idx: number) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const country = addr.country || '';
      const label = city || country || item.display_name?.split(',')[0] || 'Unknown';
      
      return {
        id: `nominatim-${item.osm_id || idx}`,
        label,
        placeName: item.display_name?.split(',').slice(0, 3).join(',').trim() || label,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        country,
        city,
      };
    });
  } catch {
    return searchLocationsLocal(query);
  }
}

export function getLocationFromCoords(lat: number, lng: number): LocationInfo {
  return {
    country: 'Italy',
    countryCode: 'IT',
    city: 'Provincia di Imperia',
    region: 'Liguria',
    lat,
    lng,
  };
}

export async function getMarketAnalytics(product: string, location: LocationInfo): Promise<MarketAnalytics> {
  const pLen = (product || 'general').length;
  const baseDemand = 50 + (pLen * 3) % 40;
  
  return {
    demandScore: baseDemand > 75 ? 'High' : baseDemand > 55 ? 'Medium' : 'Low',
    demandPercent: 67,
    averagePrice: 133.19,
    currency: 'USD',
    requiredQuantity: 27756,
    deficit: 12388,
    viabilityScore: 0.7,
    viabilityPercent: 68,
    popularity: 75,
    importNeed: 'Medium',
    trend: 'declining',
    marketSize: '$44.7B',
    competitorCount: 14,
  };
}

export async function getMapMarkers(product: string, location: LocationInfo): Promise<MapMarker[]> {
  return [
    {
      id: `fb-1-${location.city}`,
      name: `Pacific Distributors - ${product}`,
      type: 'production',
      lat: location.lat + 0.005,
      lng: location.lng + 0.005,
      address: `48 Trade St, ${location.city || 'Provincia di Imperia'}`,
      rating: 4.4,
      originalPrice: 125.64,
      bulkPrice: 56.83,
      verified: true,
      popularity: 88,
      proLocked: true,
    },
    {
      id: `fb-2-${location.city}`,
      name: `Prime Source Ltd. - ${product}`,
      type: 'production',
      lat: location.lat - 0.004,
      lng: location.lng - 0.004,
      address: `698 Trade St, ${location.city || 'Provincia di Imperia'}`,
      rating: 4.2,
      originalPrice: 18.47,
      bulkPrice: 98.31,
      verified: true,
      popularity: 76,
      proLocked: true,
    },
    {
      id: `fb-3-${location.city}`,
      name: `Worldwide Bazaar - ${product}`,
      type: 'production',
      lat: location.lat + 0.002,
      lng: location.lng - 0.006,
      address: `384 Trade St, ${location.city || 'Provincia di Imperia'}`,
      rating: 4.0,
      originalPrice: 296.19,
      bulkPrice: 110.00,
      verified: true,
      popularity: 65,
      proLocked: true,
    }
  ];
}