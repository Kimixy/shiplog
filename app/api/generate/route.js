import { Octokit } from '@octokit/rest'

// Categorize a commit message
function categorize(msg) {
  const m = msg.toLowerCase()
  if (m.startsWith('feat') || m.includes('add ') || m.includes('new ') || m.includes('implement') || m.includes('support')) return '✨ Features'
  if (m.startsWith('fix') || m.includes('bug') || m.includes('patch') || m.includes('resolve') || m.includes('crash')) return '🐛 Bug Fixes'
  if (m.startsWith('doc') || m.includes('readme') || m.includes('changelog') || m.includes('comment')) return '📝 Documentation'
  if (m.startsWith('refactor') || m.startsWith('chore') || m.includes('cleanup') || m.includes('lint') || m.includes('format')) return '🏗️ Internal'
  if (m.startsWith('perf') || m.includes('optim') || m.includes('speed') || m.includes('improv')) return '⚡ Performance'
  if (m.startsWith('test') || m.includes('test')) return '🧪 Tests'
  if (m.startsWith('ci') || m.includes('deploy') || m.includes('pipeline') || m.includes('workflow')) return '🔧 CI/CD'
  if (m.startsWith('style') || m.includes('css') || m.includes('ui ') || m.includes('design')) return '🎨 Styling'
  return '🔧 Improvements'
}

// Clean up a commit message for display
function cleanMessage(msg) {
  // Remove conventional commit prefix
  return msg
    .replace(/^(feat|fix|docs|chore|refactor|perf|test|ci|style|build)(\(.+?\))?[!]?:\s*/i, '')
    .replace(/^\[.+?\]\s*/, '')
    .trim()
}

function isSkippable(msg) {
  const m = msg.toLowerCase()
  return (
    m.startsWith('merge ') ||
    m.startsWith('merged ') ||
    m === 'initial commit' ||
    m.startsWith('wip') ||
    m.match(/^bump.+version/) ||
    m.length < 5
  )
}

export async function POST(req) {
  try {
    const { repo } = await req.json()

    if (!repo || !repo.includes('/')) {
      return Response.json({ error: 'Please enter a valid repo (owner/repo)' }, { status: 400 })
    }

    const [owner, name] = repo.split('/')
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

    // Get recent commits
    let commits
    try {
      const res = await octokit.repos.listCommits({ owner, repo: name, per_page: 60 })
      commits = res.data
    } catch (e) {
      return Response.json({ error: 'Repo not found or not accessible.' }, { status: 404 })
    }

    if (!commits.length) {
      return Response.json({ error: 'No commits found in this repo.' }, { status: 404 })
    }

    // Get tags for version
    let latestTag = 'Unreleased'
    try {
      const tagRes = await octokit.repos.listTags({ owner, repo: name, per_page: 1 })
      if (tagRes.data.length) latestTag = tagRes.data[0].name
    } catch (e) {}

    // Get merged PRs
    let prMap = {}
    try {
      const prRes = await octokit.pulls.list({
        owner, repo: name, state: 'closed', sort: 'updated', direction: 'desc', per_page: 30,
      })
      prRes.data.filter(pr => pr.merged_at).forEach(pr => {
        prMap[pr.merge_commit_sha] = `${pr.title} (#${pr.number})`
      })
    } catch (e) {}

    // Process commits
    const categories = {}
    const dateRange = {
      from: commits[commits.length - 1].commit.author?.date?.split('T')[0],
      to: commits[0].commit.author?.date?.split('T')[0],
    }

    for (const c of commits) {
      const rawMsg = c.commit.message.split('\n')[0]
      
      // Use PR title if this is a merge commit with a linked PR
      const msg = prMap[c.sha] || rawMsg
      
      if (isSkippable(msg)) continue

      const category = categorize(msg)
      const cleaned = cleanMessage(msg)
      const author = c.commit.author?.name || c.author?.login || 'unknown'

      if (!categories[category]) categories[category] = []
      
      // Deduplicate
      const exists = categories[category].some(e => e.text === cleaned)
      if (!exists) {
        categories[category].push({ text: cleaned, author })
      }
    }

    // Build changelog
    const order = ['✨ Features', '🐛 Bug Fixes', '⚡ Performance', '🔧 Improvements', '🎨 Styling', '📝 Documentation', '🧪 Tests', '🔧 CI/CD', '🏗️ Internal']
    
    let changelog = `# ${latestTag}\n\n`
    changelog += `> ${dateRange.from} — ${dateRange.to}\n\n`

    for (const cat of order) {
      if (!categories[cat] || !categories[cat].length) continue
      changelog += `## ${cat}\n\n`
      for (const entry of categories[cat]) {
        changelog += `- ${entry.text}\n`
      }
      changelog += '\n'
    }

    // If OpenAI key is available, enhance with AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import('openai')
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Polish this changelog. Make descriptions clearer and more professional. Keep the same structure and emojis. Be concise.\n\n${changelog}`
          }],
          max_tokens: 2000,
          temperature: 0.3,
        })
        
        const enhanced = completion.choices[0]?.message?.content
        if (enhanced) return Response.json({ changelog: enhanced, enhanced: true })
      } catch (e) {
        // Fall through to rule-based version
      }
    }

    return Response.json({ changelog, enhanced: false })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'Internal error. Try again.' }, { status: 500 })
  }
}
