import { Octokit } from '@octokit/rest'
import OpenAI from 'openai'

export async function POST(req) {
  try {
    const { repo } = await req.json()
    
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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const changelog = completion.choices[0]?.message?.content || 'Failed to generate changelog.'

    return Response.json({ changelog })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal error. Try again.' }, { status: 500 })
  }
}
