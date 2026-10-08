import { MarketAnalytics, LocationInfo } from '../lib/types';
import { Loader2, TrendingUp, DollarSign, Target, Package, Award, Globe, HelpCircle } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-slate-100">{product}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Market analysis for {location.city ? `${location.city}, ${location.country}` : location.country}
          </p>
        </div>
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
          <TrendingUp size={14} className="rotate-180" /> Declining
        </div>
      </div>

      {/* Grid Cards Matching UI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Demand */}
        <div className="p-5 rounded-2xl bg-slate