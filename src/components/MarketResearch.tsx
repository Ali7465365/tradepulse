import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, DollarSign, Target, BarChart3, Gauge, Package, Import } from 'lucide-react';
import { getMarketAnalytics } from '@/lib/dataEngine';
import { LocationInfo, MarketAnalytics } from '@/lib/types';

interface MarketResearchProps {
  product: string;
  location: LocationInfo;
  isPro: boolean;
}

export default function MarketResearch({ product, location, isPro }: MarketResearchProps) {
  const analytics: MarketAnalytics = useMemo(
    () => product ? getMarketAnalytics(product, location) : null as any,
    [product, location]
  );

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
          <BarChart3 className="text-blue-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--tp-text)] mb-2">Market Research</h3>
        <p className="text-sm text-[var(--tp-text-muted)] max-w-sm">
          Search for a product above to see detailed market analytics for {location.city || location.country}.
        </p>
      </div>
    );
  }

  const demandColor = analytics.demandScore === 'High' ? 'text-emerald-500' : analytics.demandScore === 'Medium' ? 'text-amber-500' : 'text-red-500';
  const demandBg = analytics.demandScore === 'High' ? 'bg-emerald-500' : analytics.demandScore === 'Medium' ? 'bg-amber-500' : 'bg-red-500';
  const TrendIcon = analytics.trend === 'rising' ? TrendingUp : analytics.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = analytics.trend === 'rising' ? 'text-emerald-500' : analytics.trend === 'declining' ? 'text-red-500' : 'text-[var(--tp-text-muted)]';

  const importColor = analytics.importNeed === 'High' ? 'text-red-500' : analytics.importNeed === 'Medium' ? 'text-amber-500' : analytics.importNeed === 'Low' ? 'text-blue-500' : 'text-emerald-500';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--tp-text)]">{product}</h2>
          <p className="text-sm text-[var(--tp-text-muted)] mt-1">
            Market analysis for {location.city ? `${location.city}, ` : ''}{location.country}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <TrendIcon className={trendColor} size={20} />
          <span className={`text-sm font-semibold capitalize ${trendColor}`}>{analytics.trend}</span>
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Demand Score */}
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="text-blue-500" size={18} />
              </div>
              <span className="text-sm text-[var(--tp-text-muted)]">Market Demand</span>
            </div>
            <span className={`text-lg font-bold ${demandColor}`}>{analytics.demandScore}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[var(--tp-text-muted)] mb-1">
              <span>Score</span>
              <span className="font-semibold text-[var(--tp-text)]">{analytics.demandPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--tp-border)] overflow-hidden">
              <div className={`h-full ${demandBg} transition-all duration-700`} style={{ width: `${analytics.demandPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="text-emerald-500" size={18} />
              </div>
              <span className="text-sm text-[var(--tp-text-muted)]">Avg Market Price</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[var(--tp-text)]">${analytics.averagePrice}</span>
            <span className="text-sm text-[var(--tp-text-muted)] ml-1">USD</span>
          </div>
        </div>

        {/* Viability Score */}
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Target className="text-purple-500" size={18} />
              </div>
              <span className="text-sm text-[var(--tp-text-muted)]">Viability Score</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[var(--tp-text-muted)] mb-1">
              <span>Success Probability</span>
              <span className="font-semibold text-[var(--tp-text)]">{analytics.viabilityPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--tp-border)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                style={{ width: `${analytics.viabilityPercent}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-[var(--tp-text-muted)]">
              Score: {analytics.viabilityScore}/10
            </div>
          </div>
        </div>

        {/* Required Quantity / Deficit */}
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Package className="text-amber-500" size={18} />
              </div>
              <span className="text-sm text-[var(--tp-text-muted)]">Quantity & Deficit</span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tp-text-muted)]">Required:</span>
              <span className="font-semibold text-[var(--tp-text)]">{analytics.requiredQuantity.toLocaleString()} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--tp-text-muted)]">Deficit:</span>
              <span className="font-semibold text-amber-500">{analytics.deficit.toLocaleString()} units</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--tp-border)] overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${(analytics.deficit / analytics.requiredQuantity) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Popularity */}
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Gauge className="text-blue-500" size={18} />
              </div>
              <span className="text-sm text-[var(--tp-text-muted)]">Local Popularity</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-[var(--tp-text-muted)] mb-1">
              <span>Consumer Interest</span>
              <span className="font-semibold text-[var(--tp-text)]">{analytics.popularity}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--tp-border)] overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${analytics.popularity}%` }} />
            </div>
          </div>
        </div>

        {/* Import Need */}
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Import className="text-indigo-500" size={18} />
              </div>
              <span className="text-sm text-[var(--tp-text-muted)]">Import Need</span>
            </div>
            <span className={`text-lg font-bold ${importColor}`}>{analytics.importNeed}</span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-[var(--tp-text-muted)]">
              {analytics.importNeed === 'High' && 'Local supply insufficient — strong import opportunity'}
              {analytics.importNeed === 'Medium' && 'Moderate supply gap — balanced import potential'}
              {analytics.importNeed === 'Low' && 'Market mostly self-supplied — niche import opportunity'}
              {analytics.importNeed === 'None' && 'Market fully supplied — focus on differentiation'}
            </p>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="text-xs text-[var(--tp-text-muted)] mb-1">Market Size</div>
          <div className="text-2xl font-bold text-[var(--tp-text)]">{analytics.marketSize}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="text-xs text-[var(--tp-text-muted)] mb-1">Active Competitors</div>
          <div className="text-2xl font-bold text-[var(--tp-text)]">~{analytics.competitorCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="text-xs text-[var(--tp-text-muted)] mb-1">Opportunity Rating</div>
          <div className={`text-2xl font-bold ${analytics.viabilityPercent > 75 ? 'text-emerald-500' : analytics.viabilityPercent > 60 ? 'text-amber-500' : 'text-red-500'}`}>
            {analytics.viabilityPercent > 75 ? 'Excellent' : analytics.viabilityPercent > 60 ? 'Good' : 'Risky'}
          </div>
        </div>
      </div>

      {!isPro && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gauge className="text-amber-500" size={20} />
            <p className="text-sm text-[var(--tp-text)]">
              <span className="font-semibold">PRO:</span> Unlock deep trend analysis, competitor pricing breakdowns, and monthly forecast data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
