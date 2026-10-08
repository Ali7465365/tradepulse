import { MarketAnalytics, LocationInfo } from '@/lib/types';
import { Loader2, TrendingUp, DollarSign, Package } from 'lucide-react';

interface MarketResearchProps {
  analytics: MarketAnalytics | null;
  loading: boolean;
  product: string;
  location: LocationInfo;
}

export default function MarketResearch({ analytics, loading, product, location }: MarketResearchProps) {
  if (loading || !analytics) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] flex flex-col items-center justify-center min-h-[250px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <p className="text-sm text-[var(--tp-text-muted)]">Fetching UN Comtrade analytics for {product} in {location.city || location.country}...</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] space-y-4">
      <h2 className="text-lg font-bold">Market Intelligence: {product}</h2>
      <p className="text-xs text-[var(--tp-text-muted)]">Target Location: {location.city ? `${location.city}, ${location.country}` : location.country}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <TrendingUp size={14} /> Demand Score
          </div>
          <div className="text-lg font-bold text-blue-500">{analytics.demandScore} ({analytics.demandPercent}%)</div>
        </div>

        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 text-xs text-green-400">
            <DollarSign size={14} /> Market Size
          </div>
          <div className="text-lg font-bold text-green-500">{analytics.marketSize}</div>
        </div>

        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <Package size={14} /> Est. Import Deficit
          </div>
          <div className="text-lg font-bold text-yellow-500">{analytics.deficit.toLocaleString()} units</div>
        </div>

        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-xs text-purple-400">
            Viability Score
          </div>
          <div className="text-lg font-bold text-purple-500">{analytics.viabilityScore} / 10</div>
        </div>
      </div>
    </div>
  );
}