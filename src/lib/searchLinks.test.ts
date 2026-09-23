import { describe, expect, it } from 'vitest'
import { filterLinks } from './searchLinks'
import type { UserLink } from './userFavorites'

function makeLink(id: string, title: string, url: string): UserLink {
  return {
    id,
    title,
    url,
    icon_url: null,
    category_id: 'cat-1',
    sort_order: 0,
    click_count: 0,
  }
}

const links: UserLink[] = [
  makeLink('1', 'GitHub', 'https://github.com'),
  makeLink('2', 'Google Calendar', 'https://calendar.google.com'),
  makeLink('3', 'Time Tree', 'https://timetreeapp.com/calendars'),
  makeLink('4', 'Netlify', 'https://www.netlify.com'),
]

describe('filterLinks', () => {
  it('returns every link for an empty query', () => {
    expect(filterLinks(links, '')).toEqual(links)
  })

  it('returns every link for a whitespace-only query', () => {
    expect(filterLinks(links, '   ')).toEqual(links)
  })

  it('matches titles case-insensitively', () => {
    expect(filterLinks(links, 'GITHUB').map((l) => l.id)).toEqual(['1'])
  })

  it('matches URLs, not just titles', () => {
    expect(filterLinks(links, 'calendar').map((l) => l.id)).toEqual(['2', '3'])
  })

  it('ignores the protocol when matching URLs', () => {
    expect(filterLinks(links, 'https')).toEqual([])
  })

  it('ignores a leading www. when matching URLs', () => {
    expect(filterLinks(links, 'www')).toEqual([])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterLinks(links, 'zzz')).toEqual([])
  })
})