'use client'
import { useState } from 'react'

export default function Home() {
  const [repo, setRepo] = useState('')
  const [changelog, setChangelog] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [remaining, setRemaining] = useState(null)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError('')
    setChangelog('')
    setShowUpgrade(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repo.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        if (data.upgrade) setShowUpgrade(true)
      } else {
        setChangelog(data.changelog)
        if (data.remaining !== undefined) setRemaining(data.remaining)
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  function copyChangelog() {
    navigator.clipboard.writeText(changelog)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className="flex gap-3 mb-4">
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

      {remaining !== null && (
        <p className="text-sm text-neutral-500 mb-6">
          {remaining} free generations remaining today
        </p>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {showUpgrade && (
        <div className="p-6 mb-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2">⚡ Go Pro</h3>
          <p className="text-neutral-300 mb-4">
            Unlimited changelogs, private repos, webhook automation, and API access.
          </p>
          <div className="flex gap-4">
            <a href="#pricing" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition">
              $5/month →
            </a>
            <a href="#byokey" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition border border-neutral-600">
              Bring your own API key (free)
            </a>
          </div>
        </div>
      )}

      {/* Result */}
      {changelog && (
        <div className="relative">
          <button
            onClick={copyChangelog}
            className="absolute top-3 right-3 px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-600 transition"
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <div className="p-6 bg-neutral-900 border border-neutral-700 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-neutral-300 font-mono leading-relaxed">
              {changelog}
            </pre>
          </div>
        </div>
      )}

      {/* Features */}
      {!changelog && !showUpgrade && (
        <>
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
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">Private Repos</h3>
              <p className="text-sm text-neutral-400">Pro plan supports private repos. Or bring your own API key — we never store it.</p>
            </div>
          </div>

          {/* Pricing */}
          <div id="pricing" className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Simple Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">$0</div>
                <ul className="space-y-2 text-sm text-neutral-400">
                  <li>✅ 5 generations per day</li>
                  <li>✅ Public repos only</li>
                  <li>✅ Copy & paste output</li>
                  <li>❌ Private repos</li>
                  <li>❌ API access</li>
                  <li>❌ Webhook automation</li>
                </ul>
              </div>
              <div className="p-6 bg-gradient-to-b from-green-900/20 to-neutral-900 border border-green-700 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-4">$5<span className="text-base font-normal text-neutral-400">/mo</span></div>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>✅ 100 generations per day</li>
                  <li>✅ Private repos</li>
                  <li>✅ API access</li>
                  <li>✅ Webhook: auto-generate on release</li>
                  <li>✅ Custom changelog format</li>
                  <li>✅ Export to GitHub Release</li>
                </ul>
                <button className="mt-4 w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* BYOK */}
          <div id="byokey" className="mt-12 p-6 bg-neutral-900 border border-neutral-800 rounded-lg">
            <h3 className="font-semibold mb-2">🔑 Bring Your Own Key</h3>
            <p className="text-sm text-neutral-400">
              Don&apos;t want to pay? Just paste your OpenAI API key below and get unlimited generations for free. 
              Your key is never stored — it&apos;s only used for the request and discarded.
            </p>
            <p className="text-xs text-neutral-500 mt-2">
              (BYOK coming soon — for now, enjoy the free tier!)
            </p>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="text-center mt-20 text-neutral-600 text-sm">
        Built with 🪵 by ShipLog &middot; <a href="https://github.com/Kimixy/shiplog" className="hover:text-neutral-400 transition">GitHub</a>
      </div>
    </main>
  )
}
