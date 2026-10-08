import { MapMarker, LocationInfo } from '../lib/types';
import { Store, ShieldCheck, Lock } from 'lucide-react';

interface SellersSectionProps {
  selectedMarker: MapMarker | null;
  location?: LocationInfo;
  isPro: boolean;
}

export default function SellersSection({ selectedMarker, location, isPro }: SellersSectionProps) {
  if (!selectedMarker) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] text-center text-sm text-[var(--tp-text-muted)]">
        Select a marker on the map to view verified supplier details for {location?.city || location?.country || 'this area'}.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
          <Store size={18} className="text-blue-500 shrink-0" /> {selectedMarker.name}
        </h3>
        {selectedMarker.verified && (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 shrink-0">
            <ShieldCheck size={12} /> Verified
          </span>
        )}
      </div>

      <p className="text-xs text-[var(--tp-text-muted)]">
        {selectedMarker.address || `${location?.city || 'Local Area'}, ${location?.country || ''}`}
      </p>

      <div className="pt-2 border-t border-[var(--tp-border)] flex items-center justify-between text-sm">
        <div>
          <span className="text-xs text-[var(--tp-text-muted)] block">Retail Price</span>
          <span className="font-bold">${(selectedMarker.originalPrice || 0).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-xs text-[var(--tp-text-muted)] block">Bulk Wholesale</span>
          <span className="font-bold text-green-500">
            {selectedMarker.proLocked && !isPro ? (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <Lock size={12} /> Pro Unlocks Bulk
              </span>
            ) : (
              `$${(selectedMarker.bulkPrice || 0).toFixed(2)}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
}