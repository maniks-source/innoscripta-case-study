import { normalizeCategory } from '../../shared/categories.ts'
import { pageNumber, paginate, requestedCategories } from '../../shared/query.ts'
import type { Article, ArticleCategory, ArticleQuery } from '../../shared/types.ts'
import {
  inDateRange,
  loadRssItems,
  matchesKeyword,
  rssImage,
  rssLink,
  stripHtml,
  uniqueFeedKeys,
} from '../rss.ts'
import type { NewsSource } from './NewsSource.ts'

const FEEDS: Record<string, string> = {
  general: 'https://feeds.bbci.co.uk/news/rss.xml',
  world: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  business: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  technology: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  science: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  sports: 'https://feeds.bbci.co.uk/sport/rss.xml',
  health: 'https://feeds.bbci.co.uk/news/health/rss.xml',
  entertainment: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  politics: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
  culture: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
}

export class BbcSource implements NewsSource {
  readonly id = 'bbc' as const
  readonly name = 'BBC News'

  isConfigured() {
    return true
  }

  async search(query: ArticleQuery): Promise<Article[]> {
    const feedKeys = uniqueFeedKeys(FEEDS, requestedCategories(query))
    const feeds = await Promise.all(
      feedKeys.map(async (category) => {
        const items = await loadRssItems(FEEDS[category] ?? FEEDS.general)
        return items.map((item) => ({ item, category }))
      }),
    )

    const filtered = feeds
      .flat()
      .filter(({ item }) => item.title && rssLink(item))
      .filter(({ item }) => matchesKeyword(item, query.q?.trim().toLowerCase()))
      .filter(({ item }) => inDateRange(item.pubDate, query.from, query.to))
      .sort((a, b) => Date.parse(b.item.pubDate ?? '') - Date.parse(a.item.pubDate ?? ''))

    return paginate(filtered, pageNumber(query)).map(({ item, category }) => {
      const url = rssLink(item) ?? ''
      return {
        id: `bbc:${url}`,
        title: item.title ?? 'Untitled',
        description: stripHtml(item.description ?? ''),
        url,
        imageUrl: rssImage(item),
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        sourceId: this.id,
        sourceName: this.name,
        category: normalizeCategory(category as ArticleCategory),
        author: 'BBC News',
      }
    })
  }
}
