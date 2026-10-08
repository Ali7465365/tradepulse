import { useState, useEffect } from 'react';
import GlobalMap from './components/GlobalMap';
import MarketResearch from './components/MarketResearch';
import SellersSection from './components/SellersSection';
import PricingPage from './components/PricingPage';
import { getMarketAnalytics } from './lib/dataEngine';
import { LocationInfo, MapMarker, MarketAnalytics } from './lib/types';
import { Globe, BarChart2, Store, Bot, Code, Search, Gift, Zap, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'research' | 'sellers' | 'ai' | 'api'>('map');
  const [product, setProduct] = useState('medicine');
  const [location, setLocation] = useState<LocationInfo>({
    country: 'Italy',
    countryCode: 'IT',
    city: 'Provincia di Imperia',
    region: 'Liguria',
    lat: 43.8861,
    lng: 7.9275,
  });

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
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
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            T
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">TradePulse</h1>
            <p className="text-[11px] text-slate-400">Market Intelligence & Global Trade</p>
          </div>
        </div>

        {/* Top Product Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Search any product (e.g. Wireless Earbuds, Leather Bags)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Header Action Badges */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Zap size={13} /> Free
          </span>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20">
            <Gift size={13} /> Ad Rewards
          </button>
          <button
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all"
          >
            <Zap size={13} /> {isPro ? 'Pro Active' : 'Upgrade'}
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-200">
            <Moon size={16} />
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <div className="px-6 border-b border-slate-800 bg-[#0f172a] flex items-center gap-2 text-sm pt-2">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 font-medium transition-all ${
            activeTab === 'map'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe size={16} /> Global Map
        </button>

        <button
          onClick={() => setActiveTab('research')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 font-medium transition-all ${
            activeTab === 'research'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 size={16} /> Market Research
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 font-medium transition-all ${
            activeTab === 'sellers'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store size={16} /> Sellers & Production
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 font-medium transition-all ${
            activeTab === 'ai'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot size={16} /> AI Assistant
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 font-medium transition-all ${
            activeTab === 'api'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code size={16} /> Developer API
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 p-6">
        {activeTab === 'map' && (
          <div className="h-[calc(100vh-145px)] rounded-2xl overflow-hidden border border-slate-800">
            <GlobalMap
              location={location}
              product={product}
              onLocationChange={setLocation}
              onMarkerSelect={setSelectedMarker}
              isPro={isPro}
            />
          </div>
        )}

        {activeTab === 'research' && (
          <MarketResearch
            analytics={analytics}
            loading={analyticsLoading}
            product={product}
            location={location}
          />
        )}

        {activeTab === 'sellers' && (
          <SellersSection
            selectedMarker={selectedMarker}
            location={location}
            isPro={isPro}
          />
        )}

        {activeTab === 'ai' && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            AI Assistant is active for product recommendations and supplier verification.
          </div>
        )}

        {activeTab === 'api' && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            Developer API access key and endpoints documentation.
          </div>
        )}
      </main>

      {/* Subscription Overlay Modal */}
      {showPricing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowPricing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-bold px-3 py-1 rounded-lg border border-slate-700"
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