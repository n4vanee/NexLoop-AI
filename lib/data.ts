import { supabase } from '@/lib/supabase';
import type { WasteListing, Match, Notification, ActivityLog, Report, Profile } from '@/lib/types';

export async function fetchListings(): Promise<WasteListing[]> {
  const { data, error } = await supabase
    .from('waste_listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as WasteListing[];
}

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Match[];
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Notification[];
}

export async function fetchActivityFeed(limit = 20): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as ActivityLog[];
}

export async function fetchReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Report[];
}

export async function fetchLeaderboard(limit = 10): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('leaderboard_points', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Profile[];
}

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Profile[];
}

export async function toggleBookmark(userId: string, listingId: string, isBookmarked: boolean) {
  if (isBookmarked) {
    await supabase.from('bookmarks').delete().eq('user_id', userId).eq('listing_id', listingId);
  } else {
    await supabase.from('bookmarks').insert({ user_id: userId, listing_id: listingId });
  }
}

export async function fetchBookmarkedListingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('listing_id')
    .eq('user_id', userId);
  if (error) return [];
  return (data || []).map((b) => b.listing_id);
}

export async function markNotificationRead(id: string) {
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
}

export function subscribeToNotifications(userId: string, callback: (n: Notification) => void) {
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new as Notification)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToActivity(callback: (a: ActivityLog) => void) {
  const channel = supabase
    .channel('activity-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_logs' },
      (payload) => callback(payload.new as ActivityLog)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
