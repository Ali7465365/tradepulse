import { useState, useEffect } from 'react';
import MarketResearch from './MarketResearch';
import PricingPage from './PricingPage';
import SellerSection from './SellerSection';
import { getMapMarkers } from './lib/dataEngine';
import { LocationInfo, MapMarker } from './lib/types';
import { Search, MapPin, Loader2 } from 'lucide-react';

export default function App() {
  const [product, setProduct] = useState<string>('Electronics');
  const [searchInput, setSearchInput] = useState<string>('Electronics');
  const [location] = useState<LocationInfo>({
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    region: 'North America',
    lat: 40.7128,
    lng: -74.0060,
  });

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [loadingMarkers, setLoadingMarkers] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'map' | 'research' | 'sellers' | 'pricing'>('research');

  useEffect(() => {
    let isMounted = true;
    setLoadingMarkers(true);

    getMapMarkers(product, location)
      .then((data) => {
        if (isMounted) {
          setMarkers(data || []);
          if (data && data.length > 0) setSelectedMarker(data[0]);
          setLoadingMarkers(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load map markers:", err);
        if (isMounted) {
          setMarkers([]);
          setLoadingMarkers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product, location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setProduct(searchInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 p-4 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-blue-500 tracking-tight">TradePulse</h1>
            <nav className="flex gap-2 text-sm font-medium">
              <button
                onClick={() => setActiveTab('research')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'research' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Market Research
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'map' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Live Stores
              </button>
              <button
                onClick={() => setActiveTab('sellers')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'sellers' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sellers
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'pricing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Pricing
              </button>
            </nav>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search product..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Search
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'research' && (
          <MarketResearch product={product} location={location} />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" /> Real Stores Near {location.city || location.country}
            </h2>
            {loadingMarkers ? (
              <div className="flex items-center justify-center p-12 bg-slate-900 rounded-2xl border border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {markers.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMarker(m)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMarker?.id === m.id ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-100">{m.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">{m.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{m.address}</p>
                    <div className="flex justify-between items-center mt-3 text-xs">
                      <span className="text-slate-400">Rating: <strong className="text-amber-400">{m.rating} ★</strong></span>
                      <span className="text-slate-400">Bulk Price: <strong className="text-emerald-400">${m.bulkPrice}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sellers' && (
          <SellerSection selectedMarker={selectedMarker} location={location} />
        )}

        {activeTab === 'pricing' && (
          <PricingPage />
        )}
      </main>
    </div>
  );
}