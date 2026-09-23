import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UserFavorites } from './UserFavorites'
import {
  createCategory,
  createLink,
  deleteCategory,
  deleteLink,
  fetchUserFavorites,
  moveLink,
  renameCategory,
  updateLink,
} from '../lib/userFavorites'
import type { UserCategory } from '../lib/userFavorites'

vi.mock('../lib/userFavorites', () => ({
  fetchUserFavorites: vi.fn(),
  createCategory: vi.fn(),
  renameCategory: vi.fn(),
  deleteCategory: vi.fn(),
  swapCategoryOrder: vi.fn(),
  createLink: vi.fn(),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
  moveLink: vi.fn(),
  swapLinkOrder: vi.fn(),
  incrementLinkClick: vi.fn(),
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: { user: { email: 'chris@example.com' } } }),
}))

const categories: UserCategory[] = [
  {
    id: 'cat-1',
    name: 'Daily',
    sort_order: 0,
    links: [
      {
        id: 'link-1',
        title: 'Google Calendar',
        url: 'https://calendar.google.com',
        icon_url: null,
        category_id: 'cat-1',
        sort_order: 0,
        click_count: 5,
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Learning',
    sort_order: 1,
    links: [
      {
        id: 'link-2',
        title: 'GitHub',
        url: 'https://github.com',
        icon_url: null,
        category_id: 'cat-2',
        sort_order: 0,
        click_count: 0,
      },
    ],
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchUserFavorites).mockResolvedValue(structuredClone(categories))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('UserFavorites: All Links view', () => {
  it('shows links from every category after loading', async () => {
    render(<UserFavorites />)

    expect(
      await screen.findByRole('heading', { name: 'All Links' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Google Calendar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
  })

  it('filters links as you type in the search box', async () => {
    const user = userEvent.setup()
    render(<UserFavorites />)

    const search = await screen.findByRole('searchbox', { name: /search links/i })
    await user.type(search, 'calendar')

    expect(screen.getByRole('link', { name: 'Google Calendar' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
  })

  it('clears the search when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<UserFavorites />)

    const search = await screen.findByRole('searchbox', { name: /search links/i })
    await user.type(search, 'calendar')
    await user.keyboard('{Escape}')

    expect(search).toHaveValue('')
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
  })
})

describe('UserFavorites: categories', () => {
  it('creates a category and shows its card', async () => {
    vi.mocked(createCategory).mockResolvedValue({
      id: 'cat-3',
      name: 'Tools',
      sort_order: 2,
    })
    const user = userEvent.setup()
    render(<UserFavorites />)

    await user.type(await screen.findByPlaceholderText('New category'), 'Tools')
    await user.click(screen.getByRole('button', { name: 'Add category' }))

    expect(createCategory).toHaveBeenCalledWith('Tools', 2)
    expect(await screen.findByRole('button', { name: /^Tools/ })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('New category')).toHaveValue('')
  })

  it('renames the selected category', async () => {
    vi.mocked(renameCategory).mockResolvedValue({
      id: 'cat-1',
      name: 'Everyday',
      sort_order: 0,
    })
    const user = userEvent.setup()
    render(<UserFavorites />)

    await user.click(await screen.findByRole('button', { name: /^Daily/ }))
    await user.click(screen.getByRole('button', { name: 'Rename category' }))

    const input = screen.getByDisplayValue('Daily')
    await user.clear(input)
    await user.type(input, 'Everyday')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(renameCategory).toHaveBeenCalledWith('cat-1', 'Everyday')
    expect(await screen.findByRole('heading', { name: 'Everyday' })).toBeInTheDocument()
  })

  it('deletes a category after confirmation and selects the next one', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deleteCategory).mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<UserFavorites />)

    await user.click(await screen.findByRole('button', { name: /^Daily/ }))
    await user.click(screen.getByRole('button', { name: 'Delete category' }))

    expect(deleteCategory).toHaveBeenCalledWith('cat-1')
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^Daily/ })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Learning' })).toBeInTheDocument()
  })

  it('does not delete a category when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<UserFavorites />)

    await user.click(await screen.findByRole('button', { name: /^Daily/ }))
    await user.click(screen.getByRole('button', { name: 'Delete category' }))

    expect(deleteCategory).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /^Daily/ })).toBeInTheDocument()
  })
})

describe('UserFavorites: links', () => {
  async function openDaily() {
    const user = userEvent.setup()
    render(<UserFavorites />)
    await user.click(await screen.findByRole('button', { name: /^Daily/ }))
    return user
  }

  it('adds a link to the selected category', async () => {
    vi.mocked(createLink).mockResolvedValue({
      id: 'link-3',
      title: 'Wordle',
      url: 'https://nytimes.com/games/wordle',
      icon_url: null,
      category_id: 'cat-1',
      sort_order: 1,
      click_count: 0,
    })
    const user = await openDaily()

    await user.type(screen.getByPlaceholderText('Link title'), 'Wordle')
    await user.type(
      screen.getByPlaceholderText('https://example.com'),
      'https://nytimes.com/games/wordle',
    )
    await user.click(screen.getByRole('button', { name: 'Add link' }))

    expect(createLink).toHaveBeenCalledWith(
      'cat-1',
      'Wordle',
      'https://nytimes.com/games/wordle',
      1,
    )
    expect(await screen.findByRole('link', { name: 'Wordle' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Link title')).toHaveValue('')
    expect(screen.getByPlaceholderText('https://example.com')).toHaveValue('')
  })

  it('gives a new link a sort order past the highest, even with a gap', async () => {
    const withGap = structuredClone(categories)
    withGap[0].links.push({
      id: 'link-9',
      title: 'Wordle',
      url: 'https://nytimes.com/games/wordle',
      icon_url: null,
      category_id: 'cat-1',
      sort_order: 2,
      click_count: 0,
    })
    vi.mocked(fetchUserFavorites).mockResolvedValue(withGap)
    vi.mocked(createLink).mockResolvedValue({
      id: 'link-10',
      title: 'Zillow',
      url: 'https://zillow.com',
      icon_url: null,
      category_id: 'cat-1',
      sort_order: 3,
      click_count: 0,
    })
    const user = await openDaily()

    await user.type(screen.getByPlaceholderText('Link title'), 'Zillow')
    await user.type(screen.getByPlaceholderText('https://example.com'), 'https://zillow.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))

    expect(createLink).toHaveBeenCalledWith('cat-1', 'Zillow', 'https://zillow.com', 3)
  })

  it('edits a link title and URL', async () => {
    vi.mocked(updateLink).mockResolvedValue({
      id: 'link-1',
      title: 'Calendar',
      url: 'https://calendar.google.com/r',
      icon_url: null,
      category_id: 'cat-1',
      sort_order: 0,
      click_count: 5,
    })
    const user = await openDaily()

    await user.click(screen.getByRole('button', { name: 'Rename link' }))

    const titleInput = screen.getByDisplayValue('Google Calendar')
    const urlInput = screen.getByDisplayValue('https://calendar.google.com')
    await user.clear(titleInput)
    await user.type(titleInput, 'Calendar')
    await user.clear(urlInput)
    await user.type(urlInput, 'https://calendar.google.com/r')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(updateLink).toHaveBeenCalledWith(
      'link-1',
      'Calendar',
      'https://calendar.google.com/r',
    )
    expect(await screen.findByRole('link', { name: 'Calendar' })).toBeInTheDocument()
  })

  it('deletes a link after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deleteLink).mockResolvedValue(undefined)
    const user = await openDaily()

    await user.click(screen.getByRole('button', { name: 'Delete link' }))

    expect(deleteLink).toHaveBeenCalledWith('link-1')
    expect(
      await screen.findByText('No links in this category yet.'),
    ).toBeInTheDocument()
  })

  it('does not delete a link when confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = await openDaily()

    await user.click(screen.getByRole('button', { name: 'Delete link' }))

    expect(deleteLink).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Google Calendar' })).toBeInTheDocument()
  })

  it('moves a link to another category', async () => {
    vi.mocked(moveLink).mockResolvedValue({
      id: 'link-1',
      title: 'Google Calendar',
      url: 'https://calendar.google.com',
      icon_url: null,
      category_id: 'cat-2',
      sort_order: 1,
      click_count: 5,
    })
    const user = await openDaily()

    await user.click(screen.getByRole('button', { name: 'Move to category' }))
    await user.click(screen.getByRole('menuitem', { name: 'Learning' }))

    expect(moveLink).toHaveBeenCalledWith('link-1', 'cat-2', 1)
    expect(
      await screen.findByText('No links in this category yet.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Learning/ })).toHaveTextContent(
      '2 links',
    )
  })
})
