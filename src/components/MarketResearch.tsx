import { useEffect, useState } from 'react';
import { getMarketAnalytics } from '../lib/dataEngine';
import { MarketAnalytics, LocationInfo } from '../lib/types';
import { TrendingUp, DollarSign, BarChart2, AlertCircle, Loader2 } from 'lucide-react';

interface MarketResearchProps {
  product: string;
  location: LocationInfo;
}

export default function MarketResearch({ product, location }: MarketResearchProps) {
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    getMarketAnalytics(product, location)
      .then((data) => {
        if (isMounted) {
          setAnalytics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product, location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Fetching trade data...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400">
        Unable to load market data for "{product}".
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Demand Index</span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {analytics.demandScore} ({analytics.demandPercent}%)
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${analytics.demandPercent}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Market Size</span>
            <BarChart2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white">{analytics.marketSize}</div>
          <p className="text-xs text-slate-400 mt-1">UN Comtrade volumes</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Unit Price</span>
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-white">${analytics.averagePrice.toFixed(2)}</div>
          <p className="text-xs text-slate-400 mt-1">Benchmark price ({analytics.currency})</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <AlertCircle size={18} className="text-blue-500" />
          Supply Deficit & Opportunity Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <span className="text-xs text-slate-400">Target Location</span>
            <p className="text-sm font-semibold text-white">{location.city}, {location.country}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Estimated Deficit</span>
            <p className="text-sm font-semibold text-amber-500">{analytics.deficit.toLocaleString()} units</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Import Need</span>
            <p className="text-sm font-semibold text-white">{analytics.importNeed}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Market Trend</span>
            <p className="text-sm font-semibold text-emerald-500 capitalize">{analytics.trend}</p>
          </div>
        </div>
      </div>
    </div>
  );
}