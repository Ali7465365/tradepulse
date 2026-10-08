import { useState, useEffect } from 'react';
import GlobalMap from './components/GlobalMap';
import MarketResearch from './components/MarketResearch';
import SellersSection from './components/SellersSection';
import Pricingpage from './components/Pricingpage';
import { getMarketAnalytics } from './lib/dataEngine';
import { LocationInfo, MapMarker, MarketAnalytics } from './lib/types';

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
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Search product (e.g. Textiles, Laptops)..."
          className="px-4 py-2 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-sm"
        />
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
          <SellersSection selectedMarker={selectedMarker} isPro={isPro} />
        </div>
      </main>

      <Pricingpage isPro={isPro} onUpgrade={() => setIsPro(true)} />
    </div>
  );
}