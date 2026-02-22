'use client'
import { useState } from 'react'

export default function Home() {
  const [repo, setRepo] = useState('')
  const [changelog, setChangelog] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    setChangelog('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repo.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setChangelog(data.changelog)
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          ShipLog
        </h1>
        <p className="text-xl text-neutral-400 mb-2">
          Turn messy git commits into beautiful changelogs.
        </p>
        <p className="text-neutral-500">
          Paste a GitHub repo → get a clean, categorized changelog in seconds.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="owner/repo (e.g. vercel/next.js)"
          className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-green-500 transition"
          onKeyDown={(e) => e.key === 'Enter' && generate()}
        />
        <button
          onClick={generate}
          disabled={loading || !repo.trim()}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:text-neutral-500 rounded-lg font-medium transition"
        >
          {loading ? '⏳ Generating...' : '🚀 Generate'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {changelog && (
        <div className="relative">
          <button
            onClick={() => navigator.clipboard.writeText(changelog)}
            className="absolute top-3 right-3 px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 transition"
          >
            📋 Copy
          </button>
          <div className="p-6 bg-neutral-900 border border-neutral-700 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-neutral-300 font-mono leading-relaxed">
              {changelog}
            </pre>
          </div>
        </div>
      )}

      {/* Features */}
      {!changelog && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold mb-1">AI-Powered</h3>
            <p className="text-sm text-neutral-400">Understands commit intent, groups by category, writes human-readable summaries.</p>
          </div>
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Instant</h3>
            <p className="text-sm text-neutral-400">Paste a repo, get a changelog in seconds. No setup, no config files.</p>
          </div>
          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold mb-1">Free to Try</h3>
            <p className="text-sm text-neutral-400">Generate changelogs for public repos for free. Pro unlocks private repos & automation.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-20 text-neutral-600 text-sm">
        Built with 🪵 by ShipLog
      </div>
    </main>
  )
}
