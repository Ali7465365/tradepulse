import { MarketAnalytics, MapMarker, LocationInfo } from './types';

const COUNTRIES: { code: string; name: string; lat: number; lng: number }[] = [
  { code: 'CN', name: 'China', lat: 35.8617, lng: 104.1954 },
  { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 },
  { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 },
  { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
  { code: 'BR', name: 'Brazil', lat: -14.2350, lng: -51.9253 },
  { code: 'AE', name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478 },
  { code: 'KR', name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  { code: 'TR', name: 'Turkey', lat: 38.9637, lng: 35.2433 },
  { code: 'VN', name: 'Vietnam', lat: 14.0583, lng: 108.2772 },
  { code: 'BD', name: 'Bangladesh', lat: 23.6850, lng: 90.3563 },
  { code: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674 },
  { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 },
  { code: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528 },
  { code: 'NG', name: 'Nigeria', lat: 9.0820, lng: 8.6753 },
  { code: 'EG', name: 'Egypt', lat: 26.8206, lng: 30.8025 },
  { code: 'ZA', name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  { code: 'TH', name: 'Thailand', lat: 15.8700, lng: 100.9925 },
  { code: 'ID', name: 'Indonesia', lat: -0.7893, lng: 113.9213 },
  { code: 'PK', name: 'Pakistan', lat: 30.3753, lng: 69.3451 },
  { code: 'SA', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792 },
  { code: 'ES', name: 'Spain', lat: 40.4637, lng: -3.7492 },
  { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468 },
  { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751 },
  { code: 'SG', name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { code: 'MY', name: 'Malaysia', lat: 4.2105, lng: 101.9758 },
  { code: 'NL', name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
  { code: 'PH', name: 'Philippines', lat: 12.8797, lng: 121.7740 },
  { code: 'RU', name: 'Russia', lat: 61.5240, lng: 105.3188 },
  { code: 'PL', name: 'Poland', lat: 51.9194, lng: 19.1451 },
  { code: 'AR', name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  { code: 'KE', name: 'Kenya', lat: -0.0236, lng: 37.9062 },
  { code: 'MA', name: 'Morocco', lat: 31.7917, lng: -7.0926 },
  { code: 'GR', name: 'Greece', lat: 39.0742, lng: 21.8243 },
  { code: 'PT', name: 'Portugal', lat: 39.3999, lng: -8.2245 },
  { code: 'CL', name: 'Chile', lat: -35.6751, lng: -71.5430 },
  { code: 'CO', name: 'Colombia', lat: 4.5709, lng: -74.2973 },
  { code: 'PE', name: 'Peru', lat: -9.1900, lng: -75.0152 },
  { code: 'ET', name: 'Ethiopia', lat: 9.1450, lng: 40.4897 },
  { code: 'GH', name: 'Ghana', lat: 7.9465, lng: -1.0232 },
  { code: 'NP', name: 'Nepal', lat: 28.3949, lng: 84.1240 },
  { code: 'LK', name: 'Sri Lanka', lat: 7.8731, lng: 80.7718 },
  { code: 'IR', name: 'Iran', lat: 32.4279, lng: 53.6880 },
  { code: 'IQ', name: 'Iraq', lat: 33.2232, lng: 43.6793 },
  { code: 'MM', name: 'Myanmar', lat: 21.9162, lng: 95.9560 },
];

const CITIES: { name: string; country: string; countryCode: string; lat: number; lng: number }[] = [
  { name: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.2304, lng: 121.4737 },
  { name: 'Guangzhou', country: 'China', countryCode: 'CN', lat: 23.1291, lng: 113.2644 },
  { name: 'Shenzhen', country: 'China', countryCode: 'CN', lat: 22.5431, lng: 114.0579 },
  { name: 'Beijing', country: 'China', countryCode: 'CN', lat: 39.9042, lng: 116.4074 },
  { name: 'Yiwu', country: 'China', countryCode: 'CN', lat: 29.3054, lng: 120.0764 },
  { name: 'Hong Kong', country: 'China', countryCode: 'CN', lat: 22.3193, lng: 114.1694 },
  { name: 'Hangzhou', country: 'China', countryCode: 'CN', lat: 30.2741, lng: 120.1551 },
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', country: 'Pakistan', countryCode: 'PK', lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.6844, lng: 73.0479 },
  { name: 'Faisalabad', country: 'Pakistan', countryCode: 'PK', lat: 31.4504, lng: 73.1350 },
  { name: 'Rawalpindi', country: 'Pakistan', countryCode: 'PK', lat: 33.5651, lng: 73.0169 },
  { name: 'Multan', country: 'Pakistan', countryCode: 'PK', lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', country: 'Pakistan', countryCode: 'PK', lat: 34.0151, lng: 71.5249 },
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060 },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0522, lng: -118.2437 },
  { name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.7604, lng: -95.3698 },
  { name: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.7749, lng: -122.4194 },
  { name: 'Miami', country: 'United States', countryCode: 'US', lat: 25.7617, lng: -80.1918 },
  { name: 'Seattle', country: 'United States', countryCode: 'US', lat: 47.6062, lng: -122.3321 },
  { name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', country: 'India', countryCode: 'IN', lat: 28.7041, lng: 77.1025 },
  { name: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.6139, lng: 77.2090 },
  { name: 'Bangalore', country: 'India', countryCode: 'IN', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', country: 'India', countryCode: 'IN', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', country: 'India', countryCode: 'IN', lat: 22.5726, lng: 88.3639 },
  { name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lng: 28.9784 },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708 },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278 },
  { name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5200, lng: 13.4050 },
  { name: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.1109, lng: 8.6821 },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
  { name: 'Osaka', country: 'Japan', countryCode: 'JP', lat: 34.6937, lng: 135.5023 },
  { name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lng: 126.9780 },
  { name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', lat: 21.0285, lng: 105.8542 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', lat: 10.8231, lng: 106.6297 },
  { name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.8103, lng: 90.4125 },
  { name: 'Sao Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333 },
  { name: 'Milan', country: 'Italy', countryCode: 'IT', lat: 45.4642, lng: 9.1900 },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  { name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.4326, lng: -99.1332 },
  { name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.5244, lng: 3.3792 },
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lng: 31.2357 },
  { name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.2041, lng: 28.0473 },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lng: 100.5018 },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.2088, lng: 106.8456 },
  { name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.7136, lng: 46.6753 },
  { name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038 },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lng: -79.3832 },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093 },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198 },
  { name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.1390, lng: 101.6869 },
  { name: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.5995, lng: 120.9842 },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041 },
  { name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.7558, lng: 37.6173 },
  { name: 'Warsaw', country: 'Poland', countryCode: 'PL', lat: 52.2297, lng: 21.0122 },
  { name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.6037, lng: -58.3816 },
  { name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.2921, lng: 36.8219 },
  { name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.5731, lng: -7.5898 },
  { name: 'Kathmandu', country: 'Nepal', countryCode: 'NP', lat: 27.7172, lng: 85.3240 },
  { name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', lat: 6.9271, lng: 79.8612 },
  { name: 'Yangon', country: 'Myanmar', countryCode: 'MM', lat: 16.8409, lng: 96.1735 },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

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

  const countryMatches = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(q)
  ).map((c) => ({
    id: `country-${c.code}`,
    label: c.name,
    placeName: c.name,
    lat: c.lat,
    lng: c.lng,
    country: c.name,
    city: '',
  }));

  const combined = [...cityMatches, ...countryMatches];

  combined.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    const aType = a.city ? 0 : 1;
    const bType = b.city ? 0 : 1;
    return aType - bType;
  });

  return combined.slice(0, 10);
}

export async function searchLocations(query: string): Promise<GeoSearchResult[]> {
  if (!query.trim()) return [];

  // Try OpenStreetMap Nominatim first for worldwide city/country coverage
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`;
    const response = await fetch(nominatimUrl, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!response.ok) throw new Error(`Nominatim failed (${response.status})`);
    const data: NominatimResult[] = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No Nominatim results');

    const results: GeoSearchResult[] = data.map((item, idx) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const country = addr.country || '';
      const label = city || country || item.display_name?.split(',')[0] || 'Unknown';
      const placeName = item.display_name?.split(',').slice(0, 3).join(',').trim() || label;

      return {
        id: `nominatim-${item.osm_id || idx}`,
        label,
        placeName,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        country,
        city,
      };
    });

    return results;
  } catch {
    // Fallback to local hardcoded database if Nominatim is unavailable
    return searchLocationsLocal(query);
  }
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_id?: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    country?: string;
    country_code?: string;
    state?: string;
  };
}

export function getLocationFromCoords(lat: number, lng: number): LocationInfo {
  let nearestCountry = COUNTRIES[0];
  let minCountryDist = Infinity;
  for (const c of COUNTRIES) {
    const dist = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2));
    if (dist < minCountryDist) {
      minCountryDist = dist;
      nearestCountry = c;
    }
  }

  let nearestCity = CITIES[0];
  let minCityDist = Infinity;
  for (const c of CITIES) {
    if (c.countryCode !== nearestCountry.code) continue;
    const dist = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2));
    if (dist < minCityDist) {
      minCityDist = dist;
      nearestCity = c;
    }
  }

  return {
    country: nearestCountry.name,
    countryCode: nearestCountry.code,
    city: nearestCity.name,
    region: nearestCountry.name,
    lat,
    lng,
  };
}

export function getMarketAnalytics(product: string, location: LocationInfo): MarketAnalytics {
  const seed = hashString(`${product}-${location.country}-${location.city}`);
  const rng = seededRandom(seed);

  const demandPercent = Math.floor(45 + rng() * 55);
  const demandScore = demandPercent > 75 ? 'High' : demandPercent > 55 ? 'Medium' : 'Low';

  const viabilityPercent = Math.floor(50 + rng() * 45);

  const basePrice = 5 + rng() * 200;
  const averagePrice = Math.round(basePrice * 100) / 100;

  const requiredQuantity = Math.floor(1000 + rng() * 50000);
  const deficit = Math.floor(requiredQuantity * (0.2 + rng() * 0.6));

  const popularity = Math.floor(30 + rng() * 70);

  const importNeedRaw = rng();
  const importNeed = importNeedRaw > 0.7 ? 'High' : importNeedRaw > 0.4 ? 'Medium' : importNeedRaw > 0.15 ? 'Low' : 'None';

  const trendRaw = rng();
  const trend = trendRaw > 0.6 ? 'rising' : trendRaw > 0.3 ? 'stable' : 'declining';

  const marketSize = `$${(0.5 + rng() * 50).toFixed(1)}B`;
  const competitorCount = Math.floor(5 + rng() * 200);

  return {
    demandScore,
    demandPercent,
    averagePrice,
    currency: 'USD',
    requiredQuantity,
    deficit,
    viabilityScore: Math.round(viabilityPercent / 10) / 10,
    viabilityPercent,
    popularity,
    importNeed,
    trend,
    marketSize,
    competitorCount,
  };
}

export function getMapMarkers(product: string, location: LocationInfo): MapMarker[] {
  const seed = hashString(`${product}-markers-${location.city}-${location.country}`);
  const rng = seededRandom(seed);

  const markers: MapMarker[] = [];
  const storeNames = ['Global Trade Co.', 'Prime Source Ltd.', 'Metro Wholesale', 'Direct Factory Outlet', 'Apex Imports', 'Sunrise Trading', 'Orient Market', 'Continental Supplies', 'Pacific Distributors', 'Elite Commerce', 'Worldwide Bazaar', 'City Mart Wholesale'];
  const productContext = product || 'general goods';

  // Ensure at least 3 verified local stores (free-accessible)
  const freeStoreNames = ['Verified Trade Hub', 'Certified Commerce Co.', 'Trusted Source Ltd.'];
  for (let i = 0; i < 3; i++) {
    const latOffset = (rng() - 0.5) * 1.5;
    const lngOffset = (rng() - 0.5) * 1.5;
    const basePrice = 5 + rng() * 200;

    markers.push({
      id: `free-store-${i}-${seed}`,
      name: `${freeStoreNames[i]} — ${productContext}`,
      type: 'store',
      lat: location.lat + latOffset,
      lng: location.lng + lngOffset,
      address: `${100 + Math.floor(rng() * 900)} Market St, ${location.city || location.country}`,
      rating: Math.round((3.5 + rng() * 1.5) * 10) / 10,
      originalPrice: Math.round(basePrice * 100) / 100,
      bulkPrice: Math.round(basePrice * 0.75 * 100) / 100,
      verified: true,
      popularity: Math.floor(50 + rng() * 50),
      proLocked: false,
    });
  }

  // Generate additional markers — wholesale and production are PRO-locked
  const additionalCount = 5 + Math.floor(rng() * 5);
  const types: MapMarker['type'][] = ['store', 'wholesale', 'production'];

  for (let i = 0; i < additionalCount; i++) {
    const type = types[Math.floor(rng() * types.length)];
    const name = storeNames[Math.floor(rng() * storeNames.length)];
    const latOffset = (rng() - 0.5) * 2;
    const lngOffset = (rng() - 0.5) * 2;

    const basePrice = 5 + rng() * 300;
    const bulkPrice = basePrice * (0.4 + rng() * 0.3);

    const isProLocked = type === 'wholesale' || type === 'production';

    markers.push({
      id: `marker-${i}-${seed}`,
      name: `${name} — ${productContext}`,
      type,
      lat: location.lat + latOffset,
      lng: location.lng + lngOffset,
      address: `${Math.floor(rng() * 999)} Trade St, ${location.city || location.country}`,
      rating: Math.round((3 + rng() * 2) * 10) / 10,
      originalPrice: Math.round(basePrice * 100) / 100,
      bulkPrice: Math.round(bulkPrice * 100) / 100,
      verified: rng() > 0.3,
      popularity: Math.floor(40 + rng() * 60),
      proLocked: isProLocked,
    });
  }

  return markers;
}
