import type { UserLink } from './userFavorites'

function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
}

export function filterLinks(links: UserLink[], query: string): UserLink[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return links
  }

  return links.filter(
    (link) =>
      link.title.toLowerCase().includes(q) || normalizeUrl(link.url).includes(q),
  )
}