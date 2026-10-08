import { useState, useEffect } from 'react';
import GlobalMap from './components/GlobalMap';
import MarketResearch from './components/MarketResearch';
import SellersSection from './components/SellersSection';
import PricingPage from './components/PricingPage';
import { getMarketAnalytics } from './lib/dataEngine';
import { LocationInfo, MapMarker, MarketAnalytics } from './lib/types';
import { Crown } from 'lucide-react';

export default function App() {
  const [product, setProduct] = useState('Electronics');
  const [location, setLocation] = useState<LocationInfo>({
    country: 'Pakistan',
    countryCode: 'PK',
    city: 'Karachi',
    region: 'Sindh',
    lat: 24.8607,
    lng: 67.0011,
  });

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  
  // Controls subscription modal visibility (hidden by default)
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setAnalyticsLoading(true);

    getMarketAnalytics(product, location).then((data) => {
      if (isMounted) {
        setAnalytics(data);
        setAnalyticsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [product, location]);

  return (
    <div className="min-h-screen bg-[var(--tp-bg)] text-[var(--tp-text)] flex flex-col font-sans">
      <header className="p-4 border-b border-[var(--tp-border)] flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-500">TradePulse</h1>
        
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Search product..."
            className="px-4 py-2 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-sm"
          />

          <button
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
          >
            <Crown size={16} />
            {isPro ? 'Pro Active' : 'Plans'}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <div className="lg:col-span-2 h-[600px]">
          <GlobalMap
            location={location}
            product={product}
            onLocationChange={setLocation}
            onMarkerSelect={setSelectedMarker}
            isPro={isPro}
          />
        </div>

        <div className="space-y-4">
          <MarketResearch
            analytics={analytics}
            loading={analyticsLoading}
            product={product}
            location={location}
          />
          <SellersSection
            selectedMarker={selectedMarker}
            location={location}
            isPro={isPro}
          />
        </div>
      </main>

      {/* Render pricing panel only when requested */}
      {showPricing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--tp-surface)] border border-[var(--tp-border)] rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowPricing(false)}
              className="absolute top-4 right-4 text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] text-sm font-bold px-3 py-1 rounded-lg border border-[var(--tp-border)]"
            >
              ✕ Close
            </button>
            <PricingPage
              isPro={isPro}
              onUpgrade={() => {
                setIsPro(true);
                setShowPricing(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}