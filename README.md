# 📋 ShipLog — AI Changelog Generator

Turn messy git commits into beautiful, categorized changelogs in seconds.

**[Try it live →](https://shiplog.vercel.app)**

## Features

- 🤖 **AI-powered** — Understands commit intent, groups by category
- ⚡ **Instant** — Paste a repo, get a changelog in seconds
- 📝 **Smart grouping** — Features, Bug Fixes, Improvements, Docs, Internal
- 🔗 **PR-aware** — Incorporates merged pull request context
- 🏷️ **Version detection** — Uses git tags for version headers

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kimixy/shiplog&env=GITHUB_TOKEN,OPENAI_API_KEY)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | GitHub personal access token (for API rate limits) |
| `OPENAI_API_KEY` | OpenAI API key (gpt-4o-mini is used, very cheap) |

## Local Development

```bash
cp .env.local.example .env.local
# Fill in your keys
npm install
npm run dev
```

## Cost

- **GitHub API**: Free (5,000 req/hour with token)
- **OpenAI**: ~$0.001 per changelog generation (gpt-4o-mini)
- **Hosting**: Free on Vercel

## License

MIT
