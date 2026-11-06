import { XMLParser } from 'fast-xml-parser'
import { fetchText } from './http.ts'

export type RssItem = {
  title?: string
  description?: string
  link?: string
  guid?: string | { '#text'?: string }
  pubDate?: string
  creator?: string
  'dc:creator'?: string
  'media:thumbnail'?: { '@_url'?: string } | Array<{ '@_url'?: string }>
  'media:content'?: { '@_url'?: string } | Array<{ '@_url'?: string }>
  enclosure?: { '@_url'?: string }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

const cache = new Map<string, { expires: number; items: RssItem[] }>()
const TTL_MS = 2 * 60 * 1000

export async function loadRssItems(url: string): Promise<RssItem[]> {
  const cached = cache.get(url)
  if (cached && cached.expires > Date.now()) return cached.items

  const xml = await fetchText(url, {
    headers: { 'user-agent': 'BriefingNewsAggregator/1.0' },
  })
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: RssItem | RssItem[] } }
  }
  const items = asArray(parsed.rss?.channel?.item)
  cache.set(url, { expires: Date.now() + TTL_MS, items })
  return items
}

export function uniqueFeedKeys(feeds: Record<string, string>, requested: string[]) {
  if (requested.length) return requested
  const seen = new Set<string>()
  const keys: string[] = []
  for (const [key, url] of Object.entries(feeds)) {
    if (seen.has(url)) continue
    seen.add(url)
    keys.push(key)
  }
  return keys
}

export function rssLink(item: RssItem) {
  if (item.link) return item.link
  if (typeof item.guid === 'string') return item.guid
  return item.guid?.['#text']
}

export function rssImage(item: RssItem) {
  return firstUrl(item['media:content']) || firstUrl(item['media:thumbnail']) || item.enclosure?.['@_url'] || null
}

export function rssAuthor(item: RssItem) {
  return item['dc:creator'] || item.creator || null
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export function matchesKeyword(item: RssItem, keyword?: string) {
  if (!keyword) return true
  const haystack = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase()
  return haystack.includes(keyword)
}

export function inDateRange(pubDate: string | undefined, from?: string, to?: string) {
  if (!from && !to) return true
  if (!pubDate) return false
  const time = Date.parse(pubDate)
  if (Number.isNaN(time)) return false
  if (from && time < Date.parse(from)) return false
  if (to && time > Date.parse(`${to}T23:59:59.999Z`)) return false
  return true
}

function firstUrl(value: RssItem['media:content']) {
  const items = asArray(value)
  return items[0]?.['@_url']
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}
