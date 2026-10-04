import { supabase } from './supabase'

export interface PublicClickCount {
  slug: string
  label: string
  count: number
}

export async function fetchPublicClickCounts(): Promise<PublicClickCount[]> {
  const { data, error } = await supabase
    .from('public_click_counts')
    .select('slug, label, count')
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}
