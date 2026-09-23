import { useEffect, useState } from 'react'
import {
  createCategory,
  createLink,
  deleteCategory,
  deleteLink,
  fetchUserFavorites,
  incrementLinkClick,
  moveLink,
  renameCategory,
  swapCategoryOrder,
  swapLinkOrder,
  updateLink,
} from '../lib/userFavorites'
import type { UserCategory, UserLink } from '../lib/userFavorites'
import { filterLinks } from '../lib/searchLinks'
import { nextSortOrder } from '../lib/sortOrder'
import { useAuth } from '../context/AuthContext'
import { LinkIcon } from './LinkIcon'
import { IconButton } from './IconButton'
import { MovePopover } from './MovePopover'
import PencilIcon from '../assets/icons/pencil.svg?react'
import TrashIcon from '../assets/icons/trash.svg?react'
import UpIcon from '../assets/icons/up.svg?react'
import DownIcon from '../assets/icons/down.svg?react'
import BlankIcon from '../assets/icons/blank.svg?react'
import PlusIcon from '../assets/icons/plus.svg?react'
import SearchIcon from '../assets/icons/search.svg?react'

const DEMO_EMAIL = 'demo@christopherkaelin.com'
const ALL_LINKS_VIEW = 'all-links'

interface LinkDraft {
  title: string
  url: string
}

export function UserFavorites() {
  const { session } = useAuth()
  const isDemo = session?.user.email === DEMO_EMAIL

  const [categories, setCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [createCategoryError, setCreateCategoryError] = useState<string | null>(null)

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [renamingCategory, setRenamingCategory] = useState(false)
  const [renameCategoryError, setRenameCategoryError] = useState<string | null>(null)

  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null)

  const [reorderingCategoryId, setReorderingCategoryId] = useState<string | null>(null)
  const [reorderCategoryError, setReorderCategoryError] = useState<string | null>(null)

  const [linkDrafts, setLinkDrafts] = useState<Record<string, LinkDraft>>({})
  const [creatingLinkCategoryId, setCreatingLinkCategoryId] = useState<string | null>(
    null,
  )
  const [createLinkError, setCreateLinkError] = useState<string | null>(null)

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editingLinkDraft, setEditingLinkDraft] = useState<LinkDraft>({
    title: '',
    url: '',
  })
  const [updatingLink, setUpdatingLink] = useState(false)
  const [updateLinkError, setUpdateLinkError] = useState<string | null>(null)

  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [deleteLinkError, setDeleteLinkError] = useState<string | null>(null)

  const [movingLinkId, setMovingLinkId] = useState<string | null>(null)
  const [moveLinkError, setMoveLinkError] = useState<string | null>(null)

  const [reorderingLinkId, setReorderingLinkId] = useState<string | null>(null)
  const [reorderLinkError, setReorderLinkError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchUserFavorites()
      .then((data) => {
        if (!cancelled) {
          setCategories(data)
          if (data.length === 0) {
            setSelectedCategoryId(null)
          } else {
            setSelectedCategoryId(isDemo ? data[0].id : ALL_LINKS_VIEW)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load favorites')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isDemo])

  async function handleCreateCategory(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = newCategoryName.trim()
    if (!name) {
      return
    }

    setCreatingCategory(true)
    setCreateCategoryError(null)

    try {
      const created = await createCategory(name, nextSortOrder(categories))
      setCategories((prev) => [...prev, { ...created, links: [] }])
      setNewCategoryName('')
    } catch (err) {
      setCreateCategoryError(
        err instanceof Error ? err.message : 'Failed to create category',
      )
    } finally {
      setCreatingCategory(false)
    }
  }

  function startRenameCategory(category: UserCategory) {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name)
    setRenameCategoryError(null)
  }

  function cancelRenameCategory() {
    setEditingCategoryId(null)
    setEditingCategoryName('')
    setRenameCategoryError(null)
  }

  async function handleRenameCategory(
    e: React.SubmitEvent<HTMLFormElement>,
    categoryId: string,
  ) {
    e.preventDefault()
    const name = editingCategoryName.trim()
    if (!name) {
      return
    }

    setRenamingCategory(true)
    setRenameCategoryError(null)

    try {
      const updated = await renameCategory(categoryId, name)
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, name: updated.name } : c)),
      )
      setEditingCategoryId(null)
      setEditingCategoryName('')
    } catch (err) {
      setRenameCategoryError(
        err instanceof Error ? err.message : 'Failed to rename category',
      )
    } finally {
      setRenamingCategory(false)
    }
  }

  async function handleDeleteCategory(category: UserCategory) {
    const confirmed = window.confirm(
      `Delete "${category.name}" and all its links? This can't be undone.`,
    )
    if (!confirmed) {
      return
    }

    setDeletingCategoryId(category.id)
    setDeleteCategoryError(null)

    try {
      await deleteCategory(category.id)
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      setSelectedCategoryId((prev) => {
        if (prev !== category.id) {
          return prev
        }
        const remaining = categories.filter((c) => c.id !== category.id)
        return remaining.length > 0 ? remaining[0].id : null
      })
    } catch (err) {
      setDeleteCategoryError(
        err instanceof Error ? err.message : 'Failed to delete category',
      )
    } finally {
      setDeletingCategoryId(null)
    }
  }

  async function handleMoveCategory(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= categories.length) {
      return
    }

    const current = categories[index]
    const target = categories[targetIndex]

    setReorderingCategoryId(current.id)
    setReorderCategoryError(null)

    try {
      await swapCategoryOrder(
        current.id,
        current.sort_order,
        target.id,
        target.sort_order,
      )
      setCategories((prev) => {
        const next = [...prev]
        next[index] = { ...current, sort_order: target.sort_order }
        next[targetIndex] = { ...target, sort_order: current.sort_order }
        next.sort((a, b) => a.sort_order - b.sort_order)
        return next
      })
    } catch (err) {
      setReorderCategoryError(
        err instanceof Error ? err.message : 'Failed to reorder categories',
      )
    } finally {
      setReorderingCategoryId(null)
    }
  }

  function handleLinkClick(link: UserLink) {
    if (isDemo) {
      return
    }

    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        links: c.links.map((l) =>
          l.id === link.id ? { ...l, click_count: l.click_count + 1 } : l,
        ),
      })),
    )

    incrementLinkClick(link.id).catch((err) => {
      console.error('Failed to record link click', err)
    })
  }

  function getLinkDraft(categoryId: string): LinkDraft {
    return linkDrafts[categoryId] ?? { title: '', url: '' }
  }

  function updateLinkDraft(categoryId: string, patch: Partial<LinkDraft>) {
    setLinkDrafts((prev) => ({
      ...prev,
      [categoryId]: { ...getLinkDraft(categoryId), ...patch },
    }))
  }

  async function handleCreateLink(
    e: React.SubmitEvent<HTMLFormElement>,
    category: UserCategory,
  ) {
    e.preventDefault()
    const draft = getLinkDraft(category.id)
    const title = draft.title.trim()
    const url = draft.url.trim()
    if (!title || !url) {
      return
    }

    setCreatingLinkCategoryId(category.id)
    setCreateLinkError(null)

    try {
      const created = await createLink(
        category.id,
        title,
        url,
        nextSortOrder(category.links),
      )
      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, links: [...c.links, created] } : c,
        ),
      )
      setLinkDrafts((prev) => ({ ...prev, [category.id]: { title: '', url: '' } }))
    } catch (err) {
      setCreateLinkError(err instanceof Error ? err.message : 'Failed to create link')
    } finally {
      setCreatingLinkCategoryId(null)
    }
  }

  function startEditLink(link: UserLink) {
    setEditingLinkId(link.id)
    setEditingLinkDraft({ title: link.title, url: link.url })
    setUpdateLinkError(null)
  }

  function cancelEditLink() {
    setEditingLinkId(null)
    setEditingLinkDraft({ title: '', url: '' })
    setUpdateLinkError(null)
  }

  async function handleUpdateLink(
    e: React.SubmitEvent<HTMLFormElement>,
    categoryId: string,
    linkId: string,
  ) {
    e.preventDefault()
    const title = editingLinkDraft.title.trim()
    const url = editingLinkDraft.url.trim()
    if (!title || !url) {
      return
    }

    setUpdatingLink(true)
    setUpdateLinkError(null)

    try {
      const updated = await updateLink(linkId, title, url)
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                links: c.links.map((l) => (l.id === linkId ? updated : l)),
              }
            : c,
        ),
      )
      setEditingLinkId(null)
      setEditingLinkDraft({ title: '', url: '' })
    } catch (err) {
      setUpdateLinkError(err instanceof Error ? err.message : 'Failed to update link')
    } finally {
      setUpdatingLink(false)
    }
  }

  async function handleDeleteLink(categoryId: string, link: UserLink) {
    const confirmed = window.confirm(`Delete "${link.title}"? This can't be undone.`)
    if (!confirmed) {
      return
    }

    setDeletingLinkId(link.id)
    setDeleteLinkError(null)

    try {
      await deleteLink(link.id)
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, links: c.links.filter((l) => l.id !== link.id) }
            : c,
        ),
      )
    } catch (err) {
      setDeleteLinkError(err instanceof Error ? err.message : 'Failed to delete link')
    } finally {
      setDeletingLinkId(null)
    }
  }

  async function handleMoveLink(
    currentCategoryId: string,
    link: UserLink,
    targetCategoryId: string,
  ) {
    if (!targetCategoryId || targetCategoryId === currentCategoryId) {
      return
    }

    const targetCategory = categories.find((c) => c.id === targetCategoryId)
    if (!targetCategory) {
      return
    }

    setMovingLinkId(link.id)
    setMoveLinkError(null)

    try {
      const updated = await moveLink(
        link.id,
        targetCategoryId,
        nextSortOrder(targetCategory.links),
      )
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === currentCategoryId) {
            return { ...c, links: c.links.filter((l) => l.id !== link.id) }
          }
          if (c.id === targetCategoryId) {
            return { ...c, links: [...c.links, updated] }
          }
          return c
        }),
      )
    } catch (err) {
      setMoveLinkError(err instanceof Error ? err.message : 'Failed to move link')
    } finally {
      setMovingLinkId(null)
    }
  }

  async function handleReorderLink(
    category: UserCategory,
    index: number,
    direction: -1 | 1,
  ) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= category.links.length) {
      return
    }

    const current = category.links[index]
    const target = category.links[targetIndex]

    setReorderingLinkId(current.id)
    setReorderLinkError(null)

    try {
      await swapLinkOrder(current.id, current.sort_order, target.id, target.sort_order)
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id !== category.id) {
            return c
          }
          const nextLinks = [...c.links]
          nextLinks[index] = { ...current, sort_order: target.sort_order }
          nextLinks[targetIndex] = { ...target, sort_order: current.sort_order }
          nextLinks.sort((a, b) => a.sort_order - b.sort_order)
          return { ...c, links: nextLinks }
        }),
      )
    } catch (err) {
      setReorderLinkError(err instanceof Error ? err.message : 'Failed to reorder links')
    } finally {
      setReorderingLinkId(null)
    }
  }

  if (loading) {
    return <p>Loading favorites...</p>
  }

  if (error) {
    return <p role="alert">Couldn't load favorites: {error}</p>
  }

  const selectedCategoryIndex = categories.findIndex((c) => c.id === selectedCategoryId)
  const selectedCategory =
    selectedCategoryIndex === -1 ? null : categories[selectedCategoryIndex]
  const isAllLinksView = !isDemo && selectedCategoryId === ALL_LINKS_VIEW
  const allLinks = categories
    .flatMap((c) => c.links)
    .sort((a, b) => a.title.localeCompare(b.title))
  const visibleLinks = filterLinks(allLinks, searchQuery)

  const addCategoryForm = (
    <form className="add-category-form" onSubmit={handleCreateCategory}>
      <input
        id="new-category"
        type="text"
        placeholder="New category"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        disabled={creatingCategory}
      />
      <IconButton
        icon={PlusIcon}
        label="Add category"
        type="submit"
        disabled={creatingCategory}
      />
    </form>
  )

  return (
    <div>
      {isDemo && (
        <p className="demo-note">
          Demo account: limited to 5 categories and 10 links per category, so
          data stays manageable between resets.
        </p>
      )}
      {createCategoryError && <p role="alert">{createCategoryError}</p>}
      {deleteCategoryError && <p role="alert">{deleteCategoryError}</p>}
      {reorderCategoryError && <p role="alert">{reorderCategoryError}</p>}
      {createLinkError && <p role="alert">{createLinkError}</p>}
      {deleteLinkError && <p role="alert">{deleteLinkError}</p>}
      {moveLinkError && <p role="alert">{moveLinkError}</p>}
      {reorderLinkError && <p role="alert">{reorderLinkError}</p>}

      {categories.length === 0 ? (
        <>
          <p>No categories yet.</p>
          {addCategoryForm}
        </>
      ) : (
        <>
          <div className="category-card-row">
            {!isDemo && (
              <button
                type="button"
                className={`category-card${isAllLinksView ? ' active' : ''}`}
                onClick={() => setSelectedCategoryId(ALL_LINKS_VIEW)}
              >
                <span className="category-card-name">All Links</span>
                <span className="category-card-count">
                  {categories.reduce((sum, c) => sum + c.links.length, 0)} links
                </span>
              </button>
            )}
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-card${
                  selectedCategoryId === category.id ? ' active' : ''
                }`}
                onClick={() =>
                  setSelectedCategoryId((prev) =>
                    prev === category.id ? null : category.id,
                  )
                }
              >
                <span className="category-card-name">{category.name}</span>
                <span className="category-card-count">
                  {category.links.length} {category.links.length === 1 ? 'link' : 'links'}
                </span>
              </button>
            ))}
          </div>
          {addCategoryForm}
          <hr className="section-divider" />
          {isAllLinksView && (
            <div>
              <div className="link-search">
                <SearchIcon
                  className="link-search-icon"
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search titles and URLs"
                  aria-label="Search links by title or URL"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('')
                    }
                  }}
                />
              </div>
              <h2 className="category-name">All Links</h2>
              {allLinks.length === 0 ? (
                <p>No links yet.</p>
              ) : visibleLinks.length === 0 ? (
                <p>{`No links match "${searchQuery.trim()}".`}</p>
              ) : (
                <ul>
                  {visibleLinks.map((link) => (
                    <li key={link.id} className="user-link-row all-links">
                      <LinkIcon url={link.url} iconUrl={link.icon_url} />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="link-title"
                        onClick={() => handleLinkClick(link)}
                      >
                        {link.title}
                      </a>
                      ({link.click_count})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!isAllLinksView && selectedCategory && (
            <div>
              {editingCategoryId === selectedCategory.id ? (
                <form onSubmit={(e) => handleRenameCategory(e, selectedCategory.id)}>
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    disabled={renamingCategory}
                    autoFocus
                  />
                  <button type="submit" disabled={renamingCategory}>
                    {renamingCategory ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelRenameCategory}
                    disabled={renamingCategory}
                  >
                    Cancel
                  </button>
                  {renameCategoryError && <p role="alert">{renameCategoryError}</p>}
                </form>
              ) : (
                <div className="user-category-row">
                  <h2 className="category-name">{selectedCategory.name}</h2>
                  <div className="user-link-actions">
                    <IconButton
                      icon={PencilIcon}
                      label="Rename category"
                      onClick={() => startRenameCategory(selectedCategory)}
                    />
                    <IconButton
                      icon={TrashIcon}
                      label="Delete category"
                      onClick={() => handleDeleteCategory(selectedCategory)}
                      disabled={deletingCategoryId === selectedCategory.id}
                    />
                    <IconButton
                      icon={UpIcon}
                      label="Move category up"
                      onClick={() => handleMoveCategory(selectedCategoryIndex, -1)}
                      disabled={
                        selectedCategoryIndex === 0 ||
                        reorderingCategoryId === selectedCategory.id
                      }
                    />
                    <IconButton
                      icon={DownIcon}
                      label="Move category down"
                      onClick={() => handleMoveCategory(selectedCategoryIndex, 1)}
                      disabled={
                        selectedCategoryIndex === categories.length - 1 ||
                        reorderingCategoryId === selectedCategory.id
                      }
                    />
                    <span className="icon-button" aria-hidden="true">
                      <BlankIcon width={16} height={16} />
                    </span>
                  </div>
                </div>
              )}
              {selectedCategory.links.length === 0 ? (
                <p>No links in this category yet.</p>
              ) : (
                <ul>
                  {selectedCategory.links.map((link, linkIndex) =>
                    editingLinkId === link.id ? (
                      <li key={link.id}>
                        <form
                          onSubmit={(e) =>
                            handleUpdateLink(e, selectedCategory.id, link.id)
                          }
                        >
                          <input
                            type="text"
                            value={editingLinkDraft.title}
                            onChange={(e) =>
                              setEditingLinkDraft((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            disabled={updatingLink}
                            autoFocus
                          />
                          <input
                            type="url"
                            value={editingLinkDraft.url}
                            onChange={(e) =>
                              setEditingLinkDraft((prev) => ({
                                ...prev,
                                url: e.target.value,
                              }))
                            }
                            disabled={updatingLink}
                          />
                          <button type="submit" disabled={updatingLink}>
                            {updatingLink ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditLink}
                            disabled={updatingLink}
                          >
                            Cancel
                          </button>
                          {updateLinkError && <p role="alert">{updateLinkError}</p>}
                        </form>
                      </li>
                    ) : (
                      <li key={link.id} className="user-link-row">
                        <LinkIcon url={link.url} iconUrl={link.icon_url} />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="link-title cat-links"
                          onClick={() => handleLinkClick(link)}
                        >

                          {link.title}
                        </a>
                        <div className="user-link-actions">
                          <IconButton
                            icon={PencilIcon}
                            label="Rename link"
                            onClick={() => startEditLink(link)}
                          />
                          <IconButton
                            icon={TrashIcon}
                            label="Delete link"
                            onClick={() => handleDeleteLink(selectedCategory.id, link)}
                            disabled={deletingLinkId === link.id}
                          />
                          <IconButton
                            icon={UpIcon}
                            label="Move link up"
                            onClick={() =>
                              handleReorderLink(selectedCategory, linkIndex, -1)
                            }
                            disabled={
                              linkIndex === 0 || reorderingLinkId === link.id
                            }
                          />
                          <IconButton
                            icon={DownIcon}
                            label="Move link down"
                            onClick={() =>
                              handleReorderLink(selectedCategory, linkIndex, 1)
                            }
                            disabled={
                              linkIndex === selectedCategory.links.length - 1 ||
                              reorderingLinkId === link.id
                            }
                          />
                          {categories.length > 1 && (
                            <MovePopover
                              options={categories
                                .filter((c) => c.id !== selectedCategory.id)
                                .map((c) => ({ id: c.id, name: c.name }))}
                              onSelect={(targetId) =>
                                handleMoveLink(selectedCategory.id, link, targetId)
                              }
                              disabled={movingLinkId === link.id}
                            />
                          )}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              )}

              <form onSubmit={(e) => handleCreateLink(e, selectedCategory)}>
                <input
                  type="text"
                  placeholder="Link title"
                  value={getLinkDraft(selectedCategory.id).title}
                  onChange={(e) =>
                    updateLinkDraft(selectedCategory.id, { title: e.target.value })
                  }
                  disabled={creatingLinkCategoryId === selectedCategory.id}
                />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={getLinkDraft(selectedCategory.id).url}
                  onChange={(e) =>
                    updateLinkDraft(selectedCategory.id, { url: e.target.value })
                  }
                  disabled={creatingLinkCategoryId === selectedCategory.id}
                />
                <IconButton
                  icon={PlusIcon}
                  label="Add link"
                  type="submit"
                  disabled={creatingLinkCategoryId === selectedCategory.id}
                />
              </form>
            </div>
          )}
        </>
      )}
    </div>
  )
}
