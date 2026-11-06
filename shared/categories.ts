import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
} from './types.ts'

const KEYWORD_MAP: Array<{ match: RegExp; category: ArticleCategory }> = [
  { match: /technolog|silicon|software|ai\b/, category: 'technology' },
  { match: /sport|football|soccer|tennis|cricket|nfl|nba/, category: 'sports' },
  { match: /business|money|econom|market|finance/, category: 'business' },
  { match: /science|climate|environment|space/, category: 'science' },
  { match: /health|medical|wellness/, category: 'health' },
  { match: /politic|election|government/, category: 'politics' },
  { match: /film|music|tv|television|celebrity|entertainment/, category: 'entertainment' },
  { match: /culture|books|art|fashion/, category: 'culture' },
  { match: /world|international|global/, category: 'world' },
]

export function normalizeCategory(raw: string | undefined | null): ArticleCategory {
  const value = (raw ?? '').trim().toLowerCase()
  if ((ARTICLE_CATEGORIES as readonly string[]).includes(value)) {
    return value as ArticleCategory
  }

  for (const { match, category } of KEYWORD_MAP) {
    if (match.test(value)) return category
  }

  return 'general'
}

export function matchesAuthorFilter(author: string | null, authors: string[] | undefined) {
  if (!authors?.length) return true
  if (!author) return false
  const haystack = author.toLowerCase()
  return authors.some((name) => haystack.includes(name.trim().toLowerCase()))
}
