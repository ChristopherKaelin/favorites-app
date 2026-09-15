import { supabase } from './supabase'

export interface UserLink {
  id: string
  title: string
  url: string
  icon_url: string | null
  category_id: string
  sort_order: number
}

export interface UserCategory {
  id: string
  name: string
  sort_order: number
  links: UserLink[]
}

export async function fetchUserFavorites(): Promise<UserCategory[]> {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true })

  if (categoriesError) {
    throw categoriesError
  }

  const { data: links, error: linksError } = await supabase
    .from('links')
    .select('id, title, url, icon_url, category_id, sort_order')
    .order('sort_order', { ascending: true })

  if (linksError) {
    throw linksError
  }

  return (categories ?? []).map((category) => ({
    ...category,
    links: (links ?? []).filter((link) => link.category_id === category.id),
  }))
}

export async function createCategory(name: string, sortOrder: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not signed in')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: user.id, name, sort_order: sortOrder })
    .select('id, name, sort_order')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteCategory(categoryId: string) {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)

  if (error) {
    throw error
  }
}

export async function renameCategory(categoryId: string, name: string) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', categoryId)
    .select('id, name, sort_order')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function swapCategoryOrder(
  categoryAId: string,
  categoryASortOrder: number,
  categoryBId: string,
  categoryBSortOrder: number,
) {
  const { error: errorA } = await supabase
    .from('categories')
    .update({ sort_order: categoryBSortOrder })
    .eq('id', categoryAId)

  if (errorA) {
    throw errorA
  }

  const { error: errorB } = await supabase
    .from('categories')
    .update({ sort_order: categoryASortOrder })
    .eq('id', categoryBId)

  if (errorB) {
    throw errorB
  }
}

export async function createLink(
  categoryId: string,
  title: string,
  url: string,
  sortOrder: number,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not signed in')
  }

  const { data, error } = await supabase
    .from('links')
    .insert({ user_id: user.id, category_id: categoryId, title, url, sort_order: sortOrder })
    .select('id, title, url, icon_url, category_id, sort_order')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteLink(linkId: string) {
  const { error } = await supabase.from('links').delete().eq('id', linkId)

  if (error) {
    throw error
  }
}

export async function moveLink(linkId: string, categoryId: string, sortOrder: number) {
  const { data, error } = await supabase
    .from('links')
    .update({ category_id: categoryId, sort_order: sortOrder })
    .eq('id', linkId)
    .select('id, title, url, icon_url, category_id, sort_order')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateLink(linkId: string, title: string, url: string) {
  const { data, error } = await supabase
    .from('links')
    .update({ title, url })
    .eq('id', linkId)
    .select('id, title, url, icon_url, category_id, sort_order')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function swapLinkOrder(
  linkAId: string,
  linkASortOrder: number,
  linkBId: string,
  linkBSortOrder: number,
) {
  const { error: errorA } = await supabase
    .from('links')
    .update({ sort_order: linkBSortOrder })
    .eq('id', linkAId)

  if (errorA) {
    throw errorA
  }

  const { error: errorB } = await supabase
    .from('links')
    .update({ sort_order: linkASortOrder })
    .eq('id', linkBId)

  if (errorB) {
    throw errorB
  }
}
