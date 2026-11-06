import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NewsAggregator } from './aggregator.ts'
import { parseArticleQuery } from './query.ts'
import { BbcSource } from './sources/bbc.ts'
import { GuardianSource } from './sources/guardian.ts'
import { NewsApiSource } from './sources/newsapi.ts'
import { NytSource } from './sources/nyt.ts'

dotenv.config()

const aggregator = new NewsAggregator([
  new GuardianSource(process.env.GUARDIAN_API_KEY),
  new NytSource(process.env.NYT_API_KEY),
  new NewsApiSource(process.env.NEWSAPI_API_KEY),
  new BbcSource(),
])

const app = express()
const port = Number(process.env.PORT) || 5174
const dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(dirname, '../dist')

app.use(cors())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/sources', (_req, res) => {
  res.json({ sources: aggregator.status() })
})

app.get('/api/articles', async (req, res) => {
  try {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') search.set(key, value)
    }
    const result = await aggregator.search(parseArticleQuery(search))
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load articles'
    res.status(500).json({ error: message })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir))
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Briefing API listening on http://localhost:${port}`)
})
