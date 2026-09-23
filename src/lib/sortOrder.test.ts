import { describe, expect, it } from 'vitest'
import { nextSortOrder } from './sortOrder'

describe('nextSortOrder', () => {
  it('returns 0 for an empty list', () => {
    expect(nextSortOrder([])).toBe(0)
  })

  it('returns one past the last item in a gapless list', () => {
    expect(nextSortOrder([{ sort_order: 0 }, { sort_order: 1 }, { sort_order: 2 }])).toBe(3)
  })

  it('returns one past the highest value when there is a gap', () => {
    expect(nextSortOrder([{ sort_order: 0 }, { sort_order: 2 }])).toBe(3)
  })

  it('does not depend on the order of the list', () => {
    expect(nextSortOrder([{ sort_order: 5 }, { sort_order: 1 }])).toBe(6)
  })
})
