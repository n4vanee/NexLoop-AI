export type UserRole = 'guest' | 'citizen' | 'industry' | 'municipality' | 'administrator';

export type WasteCategory =
  | 'scrap_metal'
  | 'plastic'
  | 'textile'
  | 'e_waste'
  | 'food_agro';

export type ListingStatus = 'available' | 'matched' | 'in_transit' | 'completed' | 'expired';

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'in_transit' | 'completed';

export type MatchConfidence = 'high' | 'medium' | 'low';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  circularity_score: number;
  total_diverted_kg: number;
  total_co2_saved_kg: number;
  total_matches: number;
  leaderboard_points: number;
  created_at: string;
}

export interface WasteListing {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_org: string | null;
  owner_role: UserRole;
  title: string;
  description: string;
  category: WasteCategory;
  material_subtype: string;
  quantity_kg: number;
  unit_price_per_kg: number;
  quality_grade: 'A' | 'B' | 'C';
  status: ListingStatus;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  listing_id: string;
  listing_title: string;
  supplier_name: string;
  supplier_id: string;
  receiver_name: string;
  receiver_id: string;
  category: WasteCategory;
  quantity_kg: number;
  recommended_price_per_kg: number;
  total_value: number;
  confidence: MatchConfidence;
  confidence_score: number;
  co2_saved_kg: number;
  landfill_diverted_kg: number;
  status: MatchStatus;
  match_reason: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'match' | 'alert' | 'system' | 'report' | 'message';
  read: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  detail: string;
  category: WasteCategory | 'system' | 'auth' | 'report';
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: 'esg' | 'sustainability' | 'impact' | 'circularity';
  period: string;
  summary: string;
  co2_saved_kg: number;
  waste_diverted_kg: number;
  circularity_score: number;
  matches_count: number;
  file_url: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const WASTE_CATEGORY_LABELS: Record<WasteCategory, string> = {
  scrap_metal: 'Scrap Metal',
  plastic: 'Plastic',
  textile: 'Textile',
  e_waste: 'E-Waste',
  food_agro: 'Food & Agro Waste',
};

export const WASTE_CATEGORY_ICONS: Record<WasteCategory, string> = {
  scrap_metal: '⚙️',
  plastic: '🧴',
  textile: '🧵',
  e_waste: '💻',
  food_agro: '🌾',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Guest',
  citizen: 'Citizen',
  industry: 'Industry',
  municipality: 'Municipality',
  administrator: 'Administrator',
};
