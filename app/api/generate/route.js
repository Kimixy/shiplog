import { Octokit } from '@octokit/rest'
import OpenAI from 'openai'

// Simple in-memory rate limit (resets on cold start, good enough for free tier)
const usageMap = new Map()
const FREE_LIMIT = 5 // generations per day per IP
const PRO_LIMIT = 100

function getUsageKey(ip) {
  const today = new Date().toISOString().split('T')[0]
  return `${ip}:${today}`
}

function checkRateLimit(ip, isPro) {
  const key = getUsageKey(ip)
  const count = usageMap.get(key) || 0
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT
  if (count >= limit) return false
  usageMap.set(key, count + 1)
  return true
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const { repo, apiKey } = await req.json()
    
    // Pro users can bring their own OpenAI key
    const isPro = !!apiKey
    
    if (!checkRateLimit(ip, isPro)) {
      return Response.json({ 
        error: `Daily limit reached (${FREE_LIMIT}/day). Upgrade to Pro for ${PRO_LIMIT}/day, or bring your own OpenAI API key.`,
        upgrade: true
      }, { status: 429 })
    }
    
    if (!repo || !repo.includes('/')) {
      return Response.json({ error: 'Please enter a valid repo (owner/repo)' }, { status: 400 })
    }

    const [owner, name] = repo.split('/')
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

    // Get recent commits (last 50)
    let commits
    try {
      const res = await octokit.repos.listCommits({
        owner,
        repo: name,
        per_page: 50,
      })
      commits = res.data
    } catch (e) {
      return Response.json({ error: 'Repo not found or not accessible.' }, { status: 404 })
    }

    if (!commits.length) {
      return Response.json({ error: 'No commits found in this repo.' }, { status: 404 })
    }

    // Get recent tags for version context
    let tags = []
    try {
      const tagRes = await octokit.repos.listTags({ owner, repo: name, per_page: 5 })
      tags = tagRes.data.map(t => t.name)
    } catch (e) {}

    // Get recent PRs merged
    let prs = []
    try {
      const prRes = await octokit.pulls.list({
        owner,
        repo: name,
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 20,
      })
      prs = prRes.data
        .filter(pr => pr.merged_at)
        .map(pr => `- PR #${pr.number}: ${pr.title}`)
        .slice(0, 15)
    } catch (e) {}

    // Format commits for the AI
    const commitList = commits.map(c => {
      const msg = c.commit.message.split('\n')[0]
      const date = c.commit.author?.date?.split('T')[0] || ''
      const author = c.commit.author?.name || 'unknown'
      return `- [${date}] ${msg} (${author})`
    }).join('\n')

    const prompt = `You are a changelog generator. Given these recent git commits and merged PRs from the repo "${repo}", generate a clean, professional changelog in Markdown format.

Rules:
- Group changes into categories: ✨ Features, 🐛 Bug Fixes, 🔧 Improvements, 📝 Documentation, 🏗️ Internal
- Write human-readable summaries (don't just copy commit messages)
- Combine related commits into single entries
- Skip merge commits and trivial changes
- Use the most recent tag as the version header if available, otherwise use "Unreleased"
- Be concise but informative
- Add a date range at the top

Recent tags: ${tags.join(', ') || 'none'}

Recent merged PRs:
${prs.join('\n') || 'none'}

Recent commits:
${commitList}

Generate the changelog:`

    const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY })
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const changelog = completion.choices[0]?.message?.content || 'Failed to generate changelog.'
    const remaining = (isPro ? PRO_LIMIT : FREE_LIMIT) - (usageMap.get(getUsageKey(ip)) || 0)

    return Response.json({ changelog, remaining })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal error. Try again.' }, { status: 500 })
  }
}
