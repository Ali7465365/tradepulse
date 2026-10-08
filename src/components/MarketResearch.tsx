import { useEffect, useState } from 'react';
import { getMarketAnalytics } from '@/lib/dataEngine';
import { MarketAnalytics, LocationInfo } from '@/lib/types';
import { TrendingUp, DollarSign, BarChart2, AlertCircle, Loader2 } from 'lucide-react';

interface MarketResearchProps {
  product: string;
  location: LocationInfo;
}

export default function MarketResearch({ product, location }: MarketResearchProps) {
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getMarketAnalytics(product, location).then((data) => {
      if (isMounted) {
        setAnalytics(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [product, location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[var(--tp-surface)] rounded-2xl border border-[var(--tp-border)] text-[var(--tp-text-muted)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Fetching real-time international market research...</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between text-[var(--tp-text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Demand Index</span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--tp-text)]">
            {analytics.demandScore} ({analytics.demandPercent}%)
          </div>
          <div className="mt-2 w-full bg-slate-700/30 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${analytics.demandPercent}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between text-[var(--tp-text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Market Size</span>
            <BarChart2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--tp-text)]">
            {analytics.marketSize}
          </div>
          <p className="text-xs text-[var(--tp-text-muted)] mt-1">
            Based on official UN Comtrade import volumes
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          <div className="flex items-center justify-between text-[var(--tp-text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Unit Price</span>
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--tp-text)]">
            ${analytics.averagePrice.toFixed(2)}
          </div>
          <p className="text-xs text-[var(--tp-text-muted)] mt-1">
            Global market benchmark ({analytics.currency})
          </p>
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="p-6 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] space-y-4">
        <h3 className="text-base font-semibold text-[var(--tp-text)] flex items-center gap-2">
          <AlertCircle size={18} className="text-blue-500" />
          Supply Deficit & Trade Opportunity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <span className="text-xs text-[var(--tp-text-muted)]">Target Location</span>
            <p className="text-sm font-semibold text-[var(--tp-text)]">{location.city || location.country}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--tp-text-muted)]">Estimated Deficit</span>
            <p className="text-sm font-semibold text-amber-500">{analytics.deficit.toLocaleString()} units</p>
          </div>
          <div>
            <span className="text-xs text-[var(--tp-text-muted)]">Import Need</span>
            <p className="text-sm font-semibold text-[var(--tp-text)]">{analytics.importNeed}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--tp-text-muted)]">Market Trend</span>
            <p className="text-sm font-semibold text-emerald-500 capitalize">{analytics.trend}</p>
          </div>
        </div>
      </div>
    </div>
  );
}