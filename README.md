# Briefing

Take-home news aggregator for the innoscripta frontend challenge. React + TypeScript on the client, a small Express BFF for API keys and CORS, and Docker for a one-command run.

## What it does

- Search by keyword
- Infinite scroll as you reach the bottom of Discover and My Feed
- Filter by date, category, and source
- Personalized feed from preferred sources, categories, and authors
- Mobile-first layout
- At least three sources from the brief: **The Guardian**, **BBC News**, **New York Times**, and **NewsAPI.org**

Guardian, BBC, and NYT work out of the box via public RSS. Add API keys to switch Guardian/NYT to their official search APIs and to enable NewsAPI.org.

## Architecture

Each outlet implements the same `NewsSource` contract (open for new sources, closed for aggregator changes). `NewsAggregator` fans out in parallel, skips unconfigured keys, de-duplicates, and sorts. The UI never talks to vendor APIs directly.

Without keys, Guardian, NYT, and BBC use public RSS so `docker compose up` works immediately. With keys, Guardian and NYT switch to their search APIs; NewsAPI.org is added as a fourth source.

```text
React UI  →  /api/articles  →  NewsAggregator
                                  ├─ Guardian (API or RSS)
                                  ├─ NYT (API or RSS)
                                  ├─ NewsAPI.org (optional key)
                                  └─ BBC News (RSS)
```

Preferences live in `localStorage` only. Discover filters are stored in the URL so a search is shareable.

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the BFF on port 5174.

## Environment variables

Copy `.env.example` to `.env` in the project root. `.env` is gitignored so keys stay off git.

| Variable | Required | What it does |
| --- | --- | --- |
| `GUARDIAN_API_KEY` | No | Uses [The Guardian Open Platform](https://open-platform.theguardian.com/access/). Empty → Guardian RSS. |
| `NYT_API_KEY` | No | Uses the [NYT Article Search API](https://developer.nytimes.com/). Empty → NYT RSS. |
| `NEWSAPI_API_KEY` | No | Enables NewsAPI.org. Empty → that source is hidden. |
| `PORT` | No | API port in local dev (default `5174`). Docker sets this to `8080`. |

Guardian, NYT, and BBC still run with an empty `.env`. Add `NEWSAPI_API_KEY` if you want the fourth source.

Restart `npm run dev` or the Docker container after changing `.env`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Compose reads `.env` from the host (the file is not copied into the image). Then open [http://localhost:8080](http://localhost:8080).

The image builds the Vite app and serves it from the same Node process as `/api`, so API keys stay on the server.

```bash
docker build -t briefing .
docker run --rm -p 8080:8080 --env-file .env -e PORT=8080 -e NODE_ENV=production briefing
```

## Project layout

```text
src/        UI, hooks, preference storage
server/     Express app and source adapters
shared/     Article types used by both sides
```
