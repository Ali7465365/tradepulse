import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Globe2, Search, BarChart3, Store, Bot, Gift, Crown, Zap, Layers, Menu, X, Code2 } from 'lucide-react';
import GlobalMap from '@/components/GlobalMap';
import MarketResearch from '@/components/MarketResearch';
import SellersSection from '@/components/SellersSection';
import AIAssistant from '@/components/AIAssistant';
import AdRewardCenter from '@/components/AdRewardCenter';
import PricingPage from '@/components/PricingPage';
import DeveloperAPIPage from '@/components/DeveloperAPIPage';
import { Tier, ProPassStatus, fetchProPassStatus, fetchSubscriptionTier } from '@/lib/supabase';
import { LocationInfo, TabType, MapMarker } from '@/lib/types';
import { getLocationFromCoords } from '@/lib/dataEngine';

const DEFAULT_LOCATION: LocationInfo = {
  country: 'China',
  countryCode: 'CN',
  city: 'Shanghai',
  region: 'China',
  lat: 31.2304,
  lng: 121.4737,
};

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [product, setProduct] = useState('');
  const [location, setLocation] = useState<LocationInfo>(DEFAULT_LOCATION);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showAdCenter, setShowAdCenter] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAPI, setShowAPI] = useState(false);
  const [proPassStatus, setProPassStatus] = useState<ProPassStatus | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<Tier>('free');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'platinum' || proPassStatus?.hasActivePass === true;

  // Load initial state
  useEffect(() => {
    (async () => {
      const [passStatus, tier] = await Promise.all([
        fetchProPassStatus(),
        fetchSubscriptionTier(),
      ]);
      setProPassStatus(passStatus);
      setSubscriptionTier(tier);
    })();
  }, []);

  const refreshProPassStatus = useCallback(async () => {
    const s = await fetchProPassStatus();
    setProPassStatus(s);
  }, []);

  const handleLocationChange = useCallback((loc: LocationInfo) => {
    setLocation(loc);
  }, []);

  const handleMarkerSelect = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  const handleTierChange = useCallback((tier: Tier) => {
    setSubscriptionTier(tier);
  }, []);

  const tabs: { id: TabType; label: string; icon: typeof Globe2 }[] = [
    { id: 'map', label: 'Global Map', icon: Globe2 },
    { id: 'research', label: 'Market Research', icon: BarChart3 },
    { id: 'sellers', label: 'Sellers & Production', icon: Store },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'api', label: 'Developer API', icon: Code2 },
  ];

  const tierBadge = subscriptionTier === 'platinum' ? (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-semibold">
      <Layers size={12} /> Platinum
    </span>
  ) : subscriptionTier === 'pro' ? (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-semibold">
      <Crown size={12} /> Pro
    </span>
  ) : proPassStatus?.hasActivePass ? (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-semibold">
      <Crown size={12} /> PRO Pass
    </span>
  ) : (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold">
      <Zap size={12} /> Free
    </span>
  );

  return (
    <div className="h-screen flex flex-col bg-[var(--tp-bg)] overflow-hidden">
      {/* Top navigation */}
      <header className="shrink-0 px-4 py-3 bg-[var(--tp-surface)] border-b border-[var(--tp-border)] flex items-center justify-between gap-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--tp-border)] transition-colors text-[var(--tp-text)]"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Globe2 className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[var(--tp-text)] leading-tight">TradePulse</h1>
              <p className="text-xs text-[var(--tp-text-muted)] leading-tight">Market Intelligence & Global Trade</p>
            </div>
          </div>
        </div>

        {/* Product search bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tp-text-muted)]" size={16} />
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Search any product (e.g. Wireless Earbuds, Leather Bags)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)] text-sm text-[var(--tp-text)] placeholder:text-[var(--tp-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tierBadge}

          {/* Ad reward button */}
          <button
            onClick={() => setShowAdCenter(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold hover:from-amber-500/20 hover:to-orange-500/20 transition-all"
            title="Ad Reward Center"
          >
            <Gift size={14} />
            <span className="hidden sm:inline">Ad Rewards</span>
            {proPassStatus && !proPassStatus.proPassUnlockedThisWeek && proPassStatus.adsWatchedThisWeek > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                {proPassStatus.adsWatchedThisWeek}/5
              </span>
            )}
          </button>

          {/* Pricing button */}
          <button
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-all"
          >
            <Crown size={14} />
            <span className="hidden sm:inline">Upgrade</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--tp-border)] transition-colors text-[var(--tp-text)]"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile product search */}
      <div className="md:hidden px-4 py-2 bg-[var(--tp-surface)] border-b border-[var(--tp-border)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tp-text-muted)]" size={16} />
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Search any product..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)] text-sm text-[var(--tp-text)] placeholder:text-[var(--tp-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="shrink-0 px-4 py-2 bg-[var(--tp-surface)] border-b border-[var(--tp-border)] flex items-center gap-1 overflow-x-auto z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] hover:bg-[var(--tp-border)]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="h-full">
          {activeTab === 'map' && (
            <GlobalMap
              location={location}
              product={product}
              onLocationChange={handleLocationChange}
              onMarkerSelect={handleMarkerSelect}
              isPro={isPro}
            />
          )}
          {activeTab === 'research' && (
            <div className="h-full rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
              <MarketResearch product={product} location={location} isPro={isPro} />
            </div>
          )}
          {activeTab === 'sellers' && (
            <div className="h-full rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
              <SellersSection
                product={product}
                location={location}
                isPro={isPro}
                onUpgradeClick={() => setShowPricing(true)}
              />
            </div>
          )}
          {activeTab === 'ai' && (
            <div className="h-full rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] overflow-hidden">
              <AIAssistant
                product={product}
                location={location}
                isPro={isPro}
                onUpgradeClick={() => setShowPricing(true)}
              />
            </div>
          )}
          {activeTab === 'api' && (
            <DeveloperAPIPage
              onClose={() => setActiveTab('map')}
              tier={subscriptionTier}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <AdRewardCenter
        isOpen={showAdCenter}
        onClose={() => setShowAdCenter(false)}
        onPassUnlocked={refreshProPassStatus}
      />
      {showPricing && (
        <PricingPage
          onClose={() => setShowPricing(false)}
          onTierChange={handleTierChange}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
