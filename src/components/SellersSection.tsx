import { useMemo, useState } from 'react';
import { Store, Factory, Building2, MapPin, Star, BadgeCheck, Lock, TrendingUp, DollarSign, ShoppingCart, Phone } from 'lucide-react';
import { getMapMarkers } from '@/lib/dataEngine';
import { LocationInfo, MapMarker } from '@/lib/types';

interface SellersSectionProps {
  product: string;
  location: LocationInfo;
  isPro: boolean;
  onUpgradeClick: () => void;
}

function typeIcon(type: MapMarker['type']) {
  switch (type) {
    case 'store': return Store;
    case 'wholesale': return Building2;
    case 'production': return Factory;
  }
}

function typeColor(type: MapMarker['type']): string {
  switch (type) {
    case 'store': return 'text-blue-500 bg-blue-500/10';
    case 'wholesale': return 'text-amber-500 bg-amber-500/10';
    case 'production': return 'text-emerald-500 bg-emerald-500/10';
  }
}

function typeLabel(type: MapMarker['type']): string {
  switch (type) {
    case 'store': return 'Local Store';
    case 'wholesale': return 'Wholesale Market';
    case 'production': return 'Production Center';
  }
}

export default function SellersSection({ product, location, isPro, onUpgradeClick }: SellersSectionProps) {
  const [filter, setFilter] = useState<'all' | 'store' | 'wholesale' | 'production'>('all');

  const markers = useMemo(
    () => product ? getMapMarkers(product, location) : [],
    [product, location]
  );

  const filtered = filter === 'all' ? markers : markers.filter((m) => m.type === filter);
  const freeSellers = markers.filter((m) => !m.proLocked);
  const proSellers = markers.filter((m) => m.proLocked);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
          <Store className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--tp-text)] mb-2">Sellers & Production</h3>
        <p className="text-sm text-[var(--tp-text-muted)] max-w-sm">
          Search for a product to discover verified stores, wholesale markets, and production centers in {location.city || location.country}.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--tp-text)]">Sellers & Production</h2>
          <p className="text-sm text-[var(--tp-text-muted)] mt-1">
            {freeSellers.length} free sellers + {proSellers.length} PRO sources for {product} in {location.city || location.country}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
          {(['all', 'store', 'wholesale', 'production'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]'
              }`}
            >
              {f === 'all' ? 'All' : typeLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Free sellers section */}
      {filter !== 'wholesale' && filter !== 'production' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck className="text-emerald-500" size={18} />
            <h3 className="text-sm font-semibold text-[var(--tp-text)]">Verified Local Stores</h3>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-medium">Free Access</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter((m) => !m.proLocked).map((marker) => {
              const Icon = typeIcon(marker.type);
              return (
                <div
                  key={marker.id}
                  className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(marker.type)}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--tp-text)]">{marker.name}</div>
                        <div className="text-xs text-[var(--tp-text-muted)] mt-0.5">{typeLabel(marker.type)}</div>
                      </div>
                    </div>
                    {marker.verified && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <BadgeCheck size={16} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)] mb-4">
                    <MapPin size={14} />
                    {marker.address}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)]">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                        <DollarSign size={14} />
                        Original Price
                      </div>
                      <span className="text-sm font-semibold text-[var(--tp-text)]">
                        ${marker.originalPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)]">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                        <TrendingUp size={14} />
                        Popularity Rating
                      </div>
                      <span className="text-sm font-semibold text-[var(--tp-text)] flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        {marker.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)]">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                        <ShoppingCart size={14} />
                        Retail Bulk Price
                      </div>
                      <span className="text-sm font-semibold text-emerald-500">
                        ${marker.bulkPrice?.toFixed(2)}/unit
                      </span>
                    </div>
                    {marker.verified && (
                      <div className="flex items-center gap-1.5 py-2 border-t border-[var(--tp-border)] text-xs text-emerald-500">
                        <Phone size={14} />
                        Verified — Contact available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRO-locked sellers section */}
      {(filter === 'all' || filter === 'wholesale' || filter === 'production') && filtered.filter((m) => m.proLocked).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="text-amber-500" size={18} />
            <h3 className="text-sm font-semibold text-[var(--tp-text)]">Factory-Direct & Wholesale Contacts</h3>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium">PRO Only</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter((m) => m.proLocked).map((marker) => {
              const Icon = typeIcon(marker.type);
              const locked = !isPro;
              return (
                <div
                  key={marker.id}
                  className="p-5 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)] hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(marker.type)}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--tp-text)]">{marker.name}</div>
                        <div className="text-xs text-[var(--tp-text-muted)] mt-0.5">{typeLabel(marker.type)}</div>
                      </div>
                    </div>
                    <Lock size={16} className="text-amber-500" />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)] mb-4">
                    <MapPin size={14} />
                    {marker.address}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)]">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                        <DollarSign size={14} />
                        Original Price
                      </div>
                      <span className="text-sm font-semibold text-[var(--tp-text)]">
                        ${marker.originalPrice?.toFixed(2)}
                      </span>
                    </div>

                    {locked ? (
                      <div className="relative">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)] blur-sm select-none pointer-events-none">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                              <TrendingUp size={14} />
                              Factory Rating
                            </div>
                            <span className="text-sm font-semibold text-[var(--tp-text)] flex items-center gap-1">
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                              {marker.rating}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)] blur-sm select-none pointer-events-none">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                              <ShoppingCart size={14} />
                              Bulk Factory Price
                            </div>
                            <span className="text-sm font-semibold text-emerald-500">
                              ${marker.bulkPrice?.toFixed(2)}/unit
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 py-2 border-t border-[var(--tp-border)] blur-sm select-none pointer-events-none text-xs text-emerald-500">
                            <Phone size={14} />
                            Direct factory contact
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--tp-surface)]/85 rounded-lg">
                          <button
                            onClick={onUpgradeClick}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:scale-105 transition-transform"
                          >
                            <Lock size={14} />
                            Unlock with PRO
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)]">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                            <TrendingUp size={14} />
                            Factory Rating
                          </div>
                          <span className="text-sm font-semibold text-[var(--tp-text)] flex items-center gap-1">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            {marker.rating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-[var(--tp-border)]">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--tp-text-muted)]">
                            <ShoppingCart size={14} />
                            Bulk Factory Price
                          </div>
                          <span className="text-sm font-semibold text-emerald-500">
                            ${marker.bulkPrice?.toFixed(2)}/unit
                          </span>
                        </div>
                        {marker.verified && (
                          <div className="flex items-center gap-1.5 py-2 border-t border-[var(--tp-border)] text-xs text-emerald-500">
                            <Phone size={14} />
                            Verified Supplier — Direct contact available
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isPro && proSellers.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Lock className="text-amber-500" size={20} />
              <p className="text-sm text-[var(--tp-text)]">
                <span className="font-semibold">PRO Feature:</span> Unlock {proSellers.length} factory-direct bulk contacts, wholesale pricing, and verified supplier phone numbers.
              </p>
            </div>
            <button
              onClick={onUpgradeClick}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:scale-105 transition-transform whitespace-nowrap"
            >
              Upgrade to PRO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
