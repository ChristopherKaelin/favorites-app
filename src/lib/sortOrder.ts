export function nextSortOrder(items: { sort_order: number }[]): number {
  return Math.max(-1, ...items.map((item) => item.sort_order)) + 1
}
