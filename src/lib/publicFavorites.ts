import { supabase } from './supabase'

export interface PublicLink {
  id: string
  title: string
  url: string
  icon_url: string | null
  category_id: string
}

export interface PublicCategory {
  id: string
  name: string
  sort_order: number
  links: PublicLink[]
}

export async function fetchPublicFavorites(): Promise<PublicCategory[]> {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true })

  if (categoriesError) {
    throw categoriesError
  }

  const { data: links, error: linksError } = await supabase
    .from('links')
    .select('id, title, url, icon_url, category_id')
    .order('sort_order', { ascending: true })

  if (linksError) {
    throw linksError
  }

  return (categories ?? []).map((category) => ({
    ...category,
    links: (links ?? []).filter((link) => link.category_id === category.id),
  }))
}
