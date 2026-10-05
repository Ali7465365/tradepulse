export type Tier = 'free' | 'pro' | 'platinum';

export interface MapMarker {
  id: string;
  name: string;
  type: 'store' | 'wholesale' | 'production';
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  originalPrice?: number;
  bulkPrice?: number;
  verified?: boolean;
  popularity?: number;
  proLocked?: boolean;
}

export interface MarketAnalytics {
  demandScore: 'High' | 'Medium' | 'Low';
  demandPercent: number;
  averagePrice: number;
  currency: string;
  requiredQuantity: number;
  deficit: number;
  viabilityScore: number;
  viabilityPercent: number;
  popularity: number;
  importNeed: 'High' | 'Medium' | 'Low' | 'None';
  trend: 'rising' | 'stable' | 'declining';
  marketSize: string;
  competitorCount: number;
}

export interface LocationInfo {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
}

export interface SearchResult {
  id: string;
  label: string;
  placeName: string;
  lat: number;
  lng: number;
  country?: string;
  city?: string;
}

export type TabType = 'map' | 'research' | 'sellers' | 'ai' | 'api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: 'free' | 'pro';
  timestamp: Date;
}

export interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
  request_count: number;
  full_key?: string;
}
