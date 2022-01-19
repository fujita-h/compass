type PageView = {
  visitCount: number
  lastVisitedAt: number
}

const PAGE_VIEWS_KEY = 'page_views'

export function getPageViews(): { [key: string]: PageView } {
  const pv_str = localStorage.getItem(PAGE_VIEWS_KEY)
  const pv: { [key: string]: PageView } = pv_str ? JSON.parse(pv_str) : {}
  return pv
}

export function updatePageViews(type: string, name: string) {

  const pv = getPageViews()

  // upsert data
  const targetEntry = pv[`${type}:${name}`] ?? { visitCount: 0, lastVisitedAt: 0 }
  targetEntry['visitCount'] += 1
  targetEntry['lastVisitedAt'] = Date.now()
  pv[`${type}:${name}`] = targetEntry

  // sort and slice
  const sort_and_filtered = Object.entries(pv).sort(([key_a, value_a], [key_b, value_b]) => value_b.lastVisitedAt - value_a.lastVisitedAt).slice(0, 10)
  const new_pv = Object.fromEntries(sort_and_filtered)

  // save
  localStorage.setItem(PAGE_VIEWS_KEY, JSON.stringify(new_pv))

}