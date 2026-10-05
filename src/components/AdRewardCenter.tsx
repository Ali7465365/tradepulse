import { useState, useEffect } from 'react';
import { X, Play, Gift, CheckCircle2, Crown, Clock, Eye, Sparkles } from 'lucide-react';
import { recordAdWatch, fetchProPassStatus, ProPassStatus } from '@/lib/supabase';

interface AdRewardCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onPassUnlocked: () => void;
}

export default function AdRewardCenter({ isOpen, onClose, onPassUnlocked }: AdRewardCenterProps) {
  const [status, setStatus] = useState<ProPassStatus | null>(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [adTitle, setAdTitle] = useState('');
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const ADS_PER_WEEK = 5;
  const ADS_TITLES = [
    'TradeFlow Pro — Streamline Your Exports',
    'GlobalShip — 50% Off International Shipping',
    'MarketLens — Real-Time Trade Analytics',
    'SupplyChain+ — Find Suppliers Instantly',
    'TariffTracker — Never Miss a Duty Update',
    'CargoConnect — Book Freight in Seconds',
  ];

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoading(true);
    const s = await fetchProPassStatus();
    setStatus(s);
    setLoading(false);
  };

  const handleWatchAd = async () => {
    if (watchingAd || status?.proPassUnlockedThisWeek) return;

    const randomAd = ADS_TITLES[Math.floor(Math.random() * ADS_TITLES.length)];
    setAdTitle(randomAd);
    setWatchingAd(true);
    setAdProgress(0);

    // Simulate ad playback (5 seconds)
    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  useEffect(() => {
    if (adProgress >= 100 && watchingAd) {
      const timeout = setTimeout(async () => {
        setWatchingAd(false);
        setAdProgress(0);

        const result = await recordAdWatch();
        await loadStatus();

        if (result.passUnlocked) {
          setJustUnlocked(true);
          onPassUnlocked();
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [adProgress, watchingAd]);

  if (!isOpen) return null;

  const adsWatched = status?.adsWatchedThisWeek ?? 0;
  const progressPercent = (adsWatched / ADS_PER_WEEK) * 100;
  const canWatch = adsWatched < ADS_PER_WEEK && !status?.proPassUnlockedThisWeek;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl bg-[var(--tp-surface)] border border-[var(--tp-border)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-b border-[var(--tp-border)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--tp-border)] transition-colors text-[var(--tp-text-muted)]"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Gift className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--tp-text)]">Ad Reward Center</h2>
              <p className="text-sm text-[var(--tp-text-muted)]">Watch ads to unlock free PRO access</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="space-y-4">
              <div className="h-24 rounded-2xl shimmer" />
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : justUnlocked ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 pulse-ring">
                <Crown className="text-white" size={36} />
              </div>
              <h3 className="text-xl font-bold text-[var(--tp-text)] mb-2">PRO Access Unlocked!</h3>
              <p className="text-sm text-[var(--tp-text-muted)] max-w-xs mx-auto">
                You've earned 1 day of free PRO access. Enjoy premium features until {status?.expiresAt?.toLocaleString()}.
              </p>
              <button
                onClick={() => { setJustUnlocked(false); onClose(); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:scale-105 transition-transform"
              >
                Start Using PRO
              </button>
            </div>
          ) : status?.hasActivePass ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-500" size={36} />
              </div>
              <h3 className="text-xl font-bold text-[var(--tp-text)] mb-2">PRO Pass Active</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--tp-text-muted)]">
                <Clock size={16} />
                Expires {status.expiresAt?.toLocaleString()}
              </div>
            </div>
          ) : status?.proPassUnlockedThisWeek ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-blue-500" size={36} />
              </div>
              <h3 className="text-xl font-bold text-[var(--tp-text)] mb-2">Weekly Limit Reached</h3>
              <p className="text-sm text-[var(--tp-text-muted)] max-w-xs mx-auto">
                You've already unlocked your free PRO pass for this week. Come back next week to earn another.
              </p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="p-5 rounded-2xl bg-[var(--tp-bg)] border border-[var(--tp-border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[var(--tp-text)]">Weekly Progress</span>
                  <span className="text-sm text-[var(--tp-text-muted)]">
                    Watched: <span className="font-bold text-amber-500">{adsWatched}</span> / {ADS_PER_WEEK}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[var(--tp-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--tp-text-muted)]">
                  <Sparkles size={14} className="text-amber-500" />
                  Watch {ADS_PER_WEEK - adsWatched} more ad{ADS_PER_WEEK - adsWatched !== 1 ? 's' : ''} to unlock 1 day of PRO access
                </div>
              </div>

              {/* Ad player */}
              {watchingAd ? (
                <div className="rounded-2xl bg-black overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center relative">
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> AD
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 text-white text-xs">
                      {Math.ceil((100 - adProgress) / 20)}s
                    </div>
                    <div className="text-center px-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                        <Play className="text-white" size={28} />
                      </div>
                      <p className="text-white font-semibold text-sm">{adTitle}</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div
                        className="h-full bg-amber-500 transition-all duration-100"
                        style={{ width: `${adProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleWatchAd}
                  disabled={!canWatch}
                  className={`w-full p-5 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all ${
                    canWatch
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-[1.02] shadow-lg'
                      : 'bg-[var(--tp-border)] text-[var(--tp-text-muted)] cursor-not-allowed'
                  }`}
                >
                  <Eye size={20} />
                  {canWatch ? 'Watch a Short Ad' : 'Limit Reached'}
                </button>
              )}

              {/* Info */}
              <div className="flex items-start gap-2 text-xs text-[var(--tp-text-muted)]">
                <Clock size={14} className="mt-0.5 shrink-0" />
                <p>
                  Each ad takes ~5 seconds. Watch {ADS_PER_WEEK} ads per week to unlock 1 day of PRO access.
                  Limited to 1 ad-unlocked PRO pass per week.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
