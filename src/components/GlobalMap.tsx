import { useEffect, useState } from 'react';
import { getMapMarkers } from '../lib/dataEngine';
import { MapMarker, LocationInfo } from '../lib/types';
import { MapPin, Store, Building2, Factory, ShieldCheck, Loader2 } from 'lucide-react';

interface GlobalMapProps {
  location: LocationInfo;
  product: string;
  onLocationChange?: (loc: LocationInfo) => void;
  onMarkerSelect?: (marker: MapMarker | null) => void;
  isPro?: boolean;
}

export default function GlobalMap({ location, product, onMarkerSelect }: GlobalMapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getMapMarkers(product, location)
      .then((data) => {
        if (isMounted) {
          const list = data || [];
          setMarkers(list);
          if (list.length > 0) {
            setSelected(list[0]);
            if (onMarkerSelect) onMarkerSelect(list[0]);
          } else {
            setSelected(null);
            if (onMarkerSelect) onMarkerSelect(null);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Map markers loading error:", err);
        if (isMounted) {
          setMarkers([]);
          setSelected(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product, location]);

  const handleSelectMarker = (marker: MapMarker) => {
    setSelected(marker);
    if (onMarkerSelect) {
      onMarkerSelect(marker);
    }
  };

  const getTypeIcon = (type: MapMarker['type']) => {
    switch (type) {
      case 'wholesale':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'production':
        return <Factory className="w-4 h-4 text-amber-400" />;
      default:
        return <Store className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Locating physical stores and suppliers...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-[500px]">
      {/* Stores List Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-3 max-h-[500px]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            Nearby Stores ({markers.length})
          </h3>
          <span className="text-xs text-slate-400">{location.city || location.country}</span>
        </div>

        {markers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No physical stores found in this location.
          </p>
        ) : (
          markers.map((marker) => {
            const isSelected = selected?.id === marker.id;
            return (
              <div
                key={marker.id}
                onClick={() => handleSelectMarker(marker)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500 text-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(marker.type)}
                    <span className="font-medium text-sm line-clamp-1">{marker.name}</span>
                  </div>
                  {marker.verified && (
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{marker.address}</p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50 text-xs">
                  <span className="text-amber-400 font-medium">★ {marker.rating}</span>
                  <span className="text-slate-400">
                    Bulk: <strong className="text-emerald-400">${marker.bulkPrice}</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simulated Map / Selection Details View */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Selected Supplier Node
            </span>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              {selected ? selected.name : 'Select a store'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {selected ? selected.address : 'No store selected'}
            </p>
          </div>
          {selected && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 capitalize border border-slate-700">
              {selected.type}
            </span>
          )}
        </div>

        {selected ? (
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800 bg-slate-950/80 p-4 rounded-xl">
            <div>
              <span className="text-xs text-slate-500">Retail Unit Price</span>
              <p className="text-base font-bold text-slate-200">${selected.originalPrice}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Wholesale Price</span>
              <p className="text-base font-bold text-emerald-400">${selected.bulkPrice}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Store Rating</span>
              <p className="text-base font-bold text-amber-400">{selected.rating} / 5.0</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Popularity</span>
              <p className="text-base font-bold text-blue-400">{selected.popularity}%</p>
            </div>
          </div>
        ) : (
          <div className="relative z-10 text-center text-slate-500 my-auto">
            Select a store from the list to view pricing details
          </div>
        )}
      </div>
    </div>
  );
}