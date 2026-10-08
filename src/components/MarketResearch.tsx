import { MarketAnalytics, LocationInfo } from '../lib/types';
import { Loader2, TrendingUp, DollarSign, Target, Package, Award, HelpCircle } from 'lucide-react';

interface MarketResearchProps {
  analytics: MarketAnalytics | null;
  loading: boolean;
  product: string;
  location: LocationInfo;
}

export default function MarketResearch({ analytics, loading, product, location }: MarketResearchProps) {
  if (loading || !analytics) {
    return (
      <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Gathering global analytics for {product} in {location.city || location.country}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 capitalize">{product}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Market analysis for {location.city ? `${location.city}, ${location.country}` : location.country}
          </p>
        </div>
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
          <TrendingUp size={14} className="rotate-180" /> Declining
        </div>
      </div>

      {/* Grid Cards Matching Reference Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Demand */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-400" /> Market Demand
            </span>
            <span className="font-semibold text-amber-400">{analytics.demandScore}</span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-400">Score</span>
            <span className="font-bold text-slate-200">{analytics.demandPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.demandPercent}%` }}
            />
          </div>
        </div>

        {/* Avg Market Price */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <DollarSign size={15} className="text-emerald-400" /> Avg Market Price
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-100">${analytics.averagePrice.toFixed(2)}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
        </div>

        {/* Viability Score */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Award size={15} className="text-purple-400" /> Viability Score
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-400">Success Probability</span>
            <span className="font-bold text-slate-200">{analytics.viabilityPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.viabilityPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">Score: {analytics.viabilityScore}/10</p>
        </div>

        {/* Quantity & Deficit */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Package size={15} className="text-amber-400" /> Quantity & Deficit
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Required:</span>
              <span className="font-semibold text-slate-200">{analytics.requiredQuantity.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deficit:</span>
              <span className="font-semibold text-amber-400">{analytics.deficit.toLocaleString()} units</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-1/2" />
          </div>
        </div>

        {/* Local Popularity */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Target size={15} className="text-cyan-400" /> Local Popularity
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-400">Consumer Interest</span>
            <span className="font-bold text-slate-200">{analytics.popularity}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.popularity}%` }}
            />
          </div>
        </div>

        {/* Import Need */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <HelpCircle size={15} className="text-indigo-400" /> Import Need
            </span>
            <span className="font-semibold text-amber-400">{analytics.importNeed}</span>
          </div>
          <p className="text-[11px] text-slate-400">Moderate supply gap — balanced import potential</p>
        </div>

        {/* Market Size */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs text-slate-400">Market Size</p>
          <p className="text-2xl font-bold text-slate-100">{analytics.marketSize}</p>
        </div>

        {/* Active Competitors */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs text-slate-400">Active Competitors</p>
          <p className="text-2xl font-bold text-slate-100">~{analytics.competitorCount}</p>
        </div>

        {/* Opportunity Rating */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs text-slate-400">Opportunity Rating</p>
          <p className="text-2xl font-bold text-amber-400">Good</p>
        </div>
      </div>
    </div>
  );
}