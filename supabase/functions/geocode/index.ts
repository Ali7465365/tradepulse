const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GeoResult {
  id: string;
  label: string;
  placeName: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
}

// Curated database of world cities and countries for geocoding
const WORLD_PLACES: { name: string; country: string; countryCode: string; lat: number; lng: number; type: string }[] = [
  // China
  { name: "Shanghai", country: "China", countryCode: "CN", lat: 31.2304, lng: 121.4737, type: "city" },
  { name: "Guangzhou", country: "China", countryCode: "CN", lat: 23.1291, lng: 113.2644, type: "city" },
  { name: "Shenzhen", country: "China", countryCode: "CN", lat: 22.5431, lng: 114.0579, type: "city" },
  { name: "Beijing", country: "China", countryCode: "CN", lat: 39.9042, lng: 116.4074, type: "city" },
  { name: "Yiwu", country: "China", countryCode: "CN", lat: 29.3054, lng: 120.0764, type: "city" },
  { name: "Hong Kong", country: "China", countryCode: "CN", lat: 22.3193, lng: 114.1694, type: "city" },
  { name: "Hangzhou", country: "China", countryCode: "CN", lat: 30.2741, lng: 120.1551, type: "city" },
  // Pakistan
  { name: "Karachi", country: "Pakistan", countryCode: "PK", lat: 24.8607, lng: 67.0011, type: "city" },
  { name: "Lahore", country: "Pakistan", countryCode: "PK", lat: 31.5204, lng: 74.3587, type: "city" },
  { name: "Islamabad", country: "Pakistan", countryCode: "PK", lat: 33.6844, lng: 73.0479, type: "city" },
  { name: "Faisalabad", country: "Pakistan", countryCode: "PK", lat: 31.4504, lng: 73.1350, type: "city" },
  { name: "Rawalpindi", country: "Pakistan", countryCode: "PK", lat: 33.5651, lng: 73.0169, type: "city" },
  { name: "Multan", country: "Pakistan", countryCode: "PK", lat: 30.1575, lng: 71.5249, type: "city" },
  { name: "Peshawar", country: "Pakistan", countryCode: "PK", lat: 34.0151, lng: 71.5249, type: "city" },
  // India
  { name: "Mumbai", country: "India", countryCode: "IN", lat: 19.0760, lng: 72.8777, type: "city" },
  { name: "Delhi", country: "India", countryCode: "IN", lat: 28.7041, lng: 77.1025, type: "city" },
  { name: "New Delhi", country: "India", countryCode: "IN", lat: 28.6139, lng: 77.2090, type: "city" },
  { name: "Bangalore", country: "India", countryCode: "IN", lat: 12.9716, lng: 77.5946, type: "city" },
  { name: "Chennai", country: "India", countryCode: "IN", lat: 13.0827, lng: 80.2707, type: "city" },
  { name: "Kolkata", country: "India", countryCode: "IN", lat: 22.5726, lng: 88.3639, type: "city" },
  { name: "Hyderabad", country: "India", countryCode: "IN", lat: 17.3850, lng: 78.4867, type: "city" },
  // Japan
  { name: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lng: 139.6503, type: "city" },
  { name: "Osaka", country: "Japan", countryCode: "JP", lat: 34.6937, lng: 135.5023, type: "city" },
  { name: "Yokohama", country: "Japan", countryCode: "JP", lat: 35.4437, lng: 139.6380, type: "city" },
  { name: "Nagoya", country: "Japan", countryCode: "JP", lat: 35.1815, lng: 136.9066, type: "city" },
  { name: "Kyoto", country: "Japan", countryCode: "JP", lat: 35.0116, lng: 135.7681, type: "city" },
  // United States
  { name: "New York", country: "United States", countryCode: "US", lat: 40.7128, lng: -74.0060, type: "city" },
  { name: "Los Angeles", country: "United States", countryCode: "US", lat: 34.0522, lng: -118.2437, type: "city" },
  { name: "Chicago", country: "United States", countryCode: "US", lat: 41.8781, lng: -87.6298, type: "city" },
  { name: "Houston", country: "United States", countryCode: "US", lat: 29.7604, lng: -95.3698, type: "city" },
  { name: "San Francisco", country: "United States", countryCode: "US", lat: 37.7749, lng: -122.4194, type: "city" },
  { name: "Miami", country: "United States", countryCode: "US", lat: 25.7617, lng: -80.1918, type: "city" },
  { name: "Seattle", country: "United States", countryCode: "US", lat: 47.6062, lng: -122.3321, type: "city" },
  { name: "Dallas", country: "United States", countryCode: "US", lat: 32.7767, lng: -96.7970, type: "city" },
  { name: "Atlanta", country: "United States", countryCode: "US", lat: 33.7490, lng: -84.3880, type: "city" },
  // United Kingdom
  { name: "London", country: "United Kingdom", countryCode: "GB", lat: 51.5074, lng: -0.1278, type: "city" },
  { name: "Manchester", country: "United Kingdom", countryCode: "GB", lat: 53.4808, lng: -2.2426, type: "city" },
  { name: "Birmingham", country: "United Kingdom", countryCode: "GB", lat: 52.4862, lng: -1.8904, type: "city" },
  { name: "Glasgow", country: "United Kingdom", countryCode: "GB", lat: 55.8642, lng: -4.2518, type: "city" },
  // Germany
  { name: "Berlin", country: "Germany", countryCode: "DE", lat: 52.5200, lng: 13.4050, type: "city" },
  { name: "Frankfurt", country: "Germany", countryCode: "DE", lat: 50.1109, lng: 8.6821, type: "city" },
  { name: "Munich", country: "Germany", countryCode: "DE", lat: 48.1351, lng: 11.5820, type: "city" },
  { name: "Hamburg", country: "Germany", countryCode: "DE", lat: 53.5511, lng: 9.9937, type: "city" },
  { name: "Cologne", country: "Germany", countryCode: "DE", lat: 50.9375, lng: 6.9603, type: "city" },
  // Turkey
  { name: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.0082, lng: 28.9784, type: "city" },
  { name: "Ankara", country: "Turkey", countryCode: "TR", lat: 39.9334, lng: 32.8597, type: "city" },
  { name: "Izmir", country: "Turkey", countryCode: "TR", lat: 38.4192, lng: 27.1287, type: "city" },
  // UAE
  { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", lat: 25.2048, lng: 55.2708, type: "city" },
  { name: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", lat: 24.4539, lng: 54.3773, type: "city" },
  { name: "Sharjah", country: "United Arab Emirates", countryCode: "AE", lat: 25.3463, lng: 55.4209, type: "city" },
  // South Korea
  { name: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.5665, lng: 126.9780, type: "city" },
  { name: "Busan", country: "South Korea", countryCode: "KR", lat: 35.1796, lng: 129.0756, type: "city" },
  { name: "Incheon", country: "South Korea", countryCode: "KR", lat: 37.4563, lng: 126.7052, type: "city" },
  // Vietnam
  { name: "Hanoi", country: "Vietnam", countryCode: "VN", lat: 21.0285, lng: 105.8542, type: "city" },
  { name: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", lat: 10.8231, lng: 106.6297, type: "city" },
  { name: "Da Nang", country: "Vietnam", countryCode: "VN", lat: 16.0544, lng: 108.2022, type: "city" },
  // Bangladesh
  { name: "Dhaka", country: "Bangladesh", countryCode: "BD", lat: 23.8103, lng: 90.4125, type: "city" },
  { name: "Chittagong", country: "Bangladesh", countryCode: "BD", lat: 22.3569, lng: 91.7832, type: "city" },
  // Others
  { name: "Sao Paulo", country: "Brazil", countryCode: "BR", lat: -23.5505, lng: -46.6333, type: "city" },
  { name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.9068, lng: -43.1729, type: "city" },
  { name: "Milan", country: "Italy", countryCode: "IT", lat: 45.4642, lng: 9.1900, type: "city" },
  { name: "Rome", country: "Italy", countryCode: "IT", lat: 41.9028, lng: 12.4964, type: "city" },
  { name: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522, type: "city" },
  { name: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4168, lng: -3.7038, type: "city" },
  { name: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.3851, lng: 2.1734, type: "city" },
  { name: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4326, lng: -99.1332, type: "city" },
  { name: "Lagos", country: "Nigeria", countryCode: "NG", lat: 6.5244, lng: 3.3792, type: "city" },
  { name: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.0444, lng: 31.2357, type: "city" },
  { name: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.2041, lng: 28.0473, type: "city" },
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241, type: "city" },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.7563, lng: 100.5018, type: "city" },
  { name: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.2088, lng: 106.8456, type: "city" },
  { name: "Riyadh", country: "Saudi Arabia", countryCode: "SA", lat: 24.7136, lng: 46.6753, type: "city" },
  { name: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6532, lng: -79.3832, type: "city" },
  { name: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.2827, lng: -123.1207, type: "city" },
  { name: "Sydney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093, type: "city" },
  { name: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.8136, lng: 144.9631, type: "city" },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041, type: "city" },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.3293, lng: 18.0686, type: "city" },
  { name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198, type: "city" },
  { name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 3.1390, lng: 101.6869, type: "city" },
  { name: "Manila", country: "Philippines", countryCode: "PH", lat: 14.5995, lng: 120.9842, type: "city" },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.0082, lng: 28.9784, type: "city" },
  { name: "Athens", country: "Greece", countryCode: "GR", lat: 37.9838, lng: 23.7275, type: "city" },
  { name: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7223, lng: -9.1393, type: "city" },
  { name: "Moscow", country: "Russia", countryCode: "RU", lat: 55.7558, lng: 37.6173, type: "city" },
  { name: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.2297, lng: 21.0122, type: "city" },
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.6037, lng: -58.3816, type: "city" },
  { name: "Santiago", country: "Chile", countryCode: "CL", lat: -33.4489, lng: -70.6693, type: "city" },
  { name: "Bogota", country: "Colombia", countryCode: "CO", lat: 4.7110, lng: -74.0721, type: "city" },
  { name: "Lima", country: "Peru", countryCode: "PE", lat: -12.0464, lng: -77.0428, type: "city" },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.2921, lng: 36.8219, type: "city" },
  { name: "Addis Ababa", country: "Ethiopia", countryCode: "ET", lat: 9.0192, lng: 38.7525, type: "city" },
  { name: "Accra", country: "Ghana", countryCode: "GH", lat: 5.6037, lng: -0.1870, type: "city" },
  { name: "Casablanca", country: "Morocco", countryCode: "MA", lat: 33.5731, lng: -7.5898, type: "city" },
  { name: "Tehran", country: "Iran", countryCode: "IR", lat: 35.6892, lng: 51.3890, type: "city" },
  { name: "Baghdad", country: "Iraq", countryCode: "IQ", lat: 33.3152, lng: 44.3661, type: "city" },
  { name: "Yangon", country: "Myanmar", countryCode: "MM", lat: 16.8409, lng: 96.1735, type: "city" },
  { name: "Kathmandu", country: "Nepal", countryCode: "NP", lat: 27.7172, lng: 85.3240, type: "city" },
  { name: "Colombo", country: "Sri Lanka", countryCode: "LK", lat: 6.9271, lng: 79.8612, type: "city" },
  { name: "Hanoi", country: "Vietnam", countryCode: "VN", lat: 21.0285, lng: 105.8542, type: "city" },
  // Countries as standalone
  { name: "China", country: "China", countryCode: "CN", lat: 35.8617, lng: 104.1954, type: "country" },
  { name: "United States", country: "United States", countryCode: "US", lat: 37.0902, lng: -95.7129, type: "country" },
  { name: "India", country: "India", countryCode: "IN", lat: 20.5937, lng: 78.9629, type: "country" },
  { name: "Pakistan", country: "Pakistan", countryCode: "PK", lat: 30.3753, lng: 69.3451, type: "country" },
  { name: "Japan", country: "Japan", countryCode: "JP", lat: 36.2048, lng: 138.2529, type: "country" },
  { name: "Germany", country: "Germany", countryCode: "DE", lat: 51.1657, lng: 10.4515, type: "country" },
  { name: "United Kingdom", country: "United Kingdom", countryCode: "GB", lat: 55.3781, lng: -3.4360, type: "country" },
  { name: "Brazil", country: "Brazil", countryCode: "BR", lat: -14.2350, lng: -51.9253, type: "country" },
  { name: "United Arab Emirates", country: "United Arab Emirates", countryCode: "AE", lat: 23.4241, lng: 53.8478, type: "country" },
  { name: "South Korea", country: "South Korea", countryCode: "KR", lat: 35.9078, lng: 127.7669, type: "country" },
  { name: "Turkey", country: "Turkey", countryCode: "TR", lat: 38.9637, lng: 35.2433, type: "country" },
  { name: "Vietnam", country: "Vietnam", countryCode: "VN", lat: 14.0583, lng: 108.2772, type: "country" },
  { name: "Bangladesh", country: "Bangladesh", countryCode: "BD", lat: 23.6850, lng: 90.3563, type: "country" },
  { name: "Italy", country: "Italy", countryCode: "IT", lat: 41.8719, lng: 12.5674, type: "country" },
  { name: "France", country: "France", countryCode: "FR", lat: 46.2276, lng: 2.2137, type: "country" },
  { name: "Mexico", country: "Mexico", countryCode: "MX", lat: 23.6345, lng: -102.5528, type: "country" },
  { name: "Nigeria", country: "Nigeria", countryCode: "NG", lat: 9.0820, lng: 8.6753, type: "country" },
  { name: "Egypt", country: "Egypt", countryCode: "EG", lat: 26.8206, lng: 30.8025, type: "country" },
  { name: "South Africa", country: "South Africa", countryCode: "ZA", lat: -30.5595, lng: 22.9375, type: "country" },
  { name: "Thailand", country: "Thailand", countryCode: "TH", lat: 15.8700, lng: 100.9925, type: "country" },
  { name: "Indonesia", country: "Indonesia", countryCode: "ID", lat: -0.7893, lng: 113.9213, type: "country" },
  { name: "Saudi Arabia", country: "Saudi Arabia", countryCode: "SA", lat: 23.8859, lng: 45.0792, type: "country" },
  { name: "Spain", country: "Spain", countryCode: "ES", lat: 40.4637, lng: -3.7492, type: "country" },
  { name: "Canada", country: "Canada", countryCode: "CA", lat: 56.1304, lng: -106.3468, type: "country" },
  { name: "Australia", country: "Australia", countryCode: "AU", lat: -25.2744, lng: 133.7751, type: "country" },
  { name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198, type: "country" },
  { name: "Malaysia", country: "Malaysia", countryCode: "MY", lat: 4.2105, lng: 101.9758, type: "country" },
  { name: "Netherlands", country: "Netherlands", countryCode: "NL", lat: 52.1326, lng: 5.2913, type: "country" },
  { name: "Sweden", country: "Sweden", countryCode: "SE", lat: 60.1282, lng: 18.6435, type: "country" },
  { name: "Philippines", country: "Philippines", countryCode: "PH", lat: 12.8797, lng: 121.7740, type: "country" },
  { name: "Greece", country: "Greece", countryCode: "GR", lat: 39.0742, lng: 21.8243, type: "country" },
  { name: "Portugal", country: "Portugal", countryCode: "PT", lat: 39.3999, lng: -8.2245, type: "country" },
  { name: "Russia", country: "Russia", countryCode: "RU", lat: 61.5240, lng: 105.3188, type: "country" },
  { name: "Poland", country: "Poland", countryCode: "PL", lat: 51.9194, lng: 19.1451, type: "country" },
  { name: "Argentina", country: "Argentina", countryCode: "AR", lat: -38.4161, lng: -63.6167, type: "country" },
  { name: "Chile", country: "Chile", countryCode: "CL", lat: -35.6751, lng: -71.5430, type: "country" },
  { name: "Colombia", country: "Colombia", countryCode: "CO", lat: 4.5709, lng: -74.2973, type: "country" },
  { name: "Peru", country: "Peru", countryCode: "PE", lat: -9.1900, lng: -75.0152, type: "country" },
  { name: "Kenya", country: "Kenya", countryCode: "KE", lat: -0.0236, lng: 37.9062, type: "country" },
  { name: "Ethiopia", country: "Ethiopia", countryCode: "ET", lat: 9.1450, lng: 40.4897, type: "country" },
  { name: "Ghana", country: "Ghana", countryCode: "GH", lat: 7.9465, lng: -1.0232, type: "country" },
  { name: "Morocco", country: "Morocco", countryCode: "MA", lat: 31.7917, lng: -7.0926, type: "country" },
  { name: "Iran", country: "Iran", countryCode: "IR", lat: 32.4279, lng: 53.6880, type: "country" },
  { name: "Iraq", country: "Iraq", countryCode: "IQ", lat: 33.2232, lng: 43.6793, type: "country" },
  { name: "Myanmar", country: "Myanmar", countryCode: "MM", lat: 21.9162, lng: 95.9560, type: "country" },
  { name: "Nepal", country: "Nepal", countryCode: "NP", lat: 28.3949, lng: 84.1240, type: "country" },
  { name: "Sri Lanka", country: "Sri Lanka", countryCode: "LK", lat: 7.8731, lng: 80.7718, type: "country" },
];

function searchPlaces(query: string): GeoResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: GeoResult[] = [];

  for (const place of WORLD_PLACES) {
    const nameMatch = place.name.toLowerCase().includes(q);
    const countryMatch = place.country.toLowerCase().includes(q);
    if (nameMatch || countryMatch) {
      const isCountry = place.type === "country";
      results.push({
        id: `${place.type}-${place.name}-${place.countryCode}`,
        label: place.name,
        placeName: isCountry ? place.name : `${place.name}, ${place.country}`,
        lat: place.lat,
        lng: place.lng,
        country: place.country,
        city: isCountry ? "" : place.name,
      });
    }
  }

  // Prioritize exact starts-with matches
  results.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.label.toLowerCase().startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    // Cities before countries
    const aType = a.city ? 0 : 1;
    const bType = b.city ? 0 : 1;
    return aType - bType;
  });

  return results.slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";

    if (!query.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = searchPlaces(query);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
