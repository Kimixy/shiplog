'use client'

export default function Pricing() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Simple Pricing</h1>
        <p className="text-neutral-400">Start free. Upgrade when you need more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Free */}
        <div className="p-6 bg-neutral-900 border border-neutral-700 rounded-xl">
          <h2 className="text-xl font-bold mb-1">Free</h2>
          <div className="text-3xl font-bold mb-4">$0</div>
          <ul className="space-y-2 text-sm text-neutral-400 mb-6">
            <li>✅ 5 changelogs / month</li>
            <li>✅ Public repos only</li>
            <li>✅ Copy to clipboard</li>
            <li>❌ Private repos</li>
            <li>❌ Automated schedules</li>
            <li>❌ GitHub Action</li>
          </ul>
          <a href="/" className="block text-center py-2 px-4 border border-neutral-600 rounded-lg hover:border-neutral-400 transition">
            Get Started
          </a>
        </div>

        {/* Pro */}
        <div className="p-6 bg-neutral-900 border border-green-600 rounded-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </div>
          <h2 className="text-xl font-bold mb-1">Pro</h2>
          <div className="text-3xl font-bold mb-1">$5<span className="text-lg text-neutral-400 font-normal">/mo</span></div>
          <p className="text-xs text-neutral-500 mb-4">or $48/year (save 20%)</p>
          <ul className="space-y-2 text-sm text-neutral-400 mb-6">
            <li>✅ Unlimited changelogs</li>
            <li>✅ Private repos</li>
            <li>✅ Automated weekly/release changelogs</li>
            <li>✅ GitHub Action integration</li>
            <li>✅ Custom templates</li>
            <li>✅ Markdown + HTML export</li>
            <li>✅ Embeddable changelog widget</li>
          </ul>
          <a href="#" className="block text-center py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition">
            Upgrade to Pro →
          </a>
        </div>
      </div>

      <div className="text-center mt-8 text-neutral-600 text-sm">
        <a href="/" className="hover:text-neutral-400 transition">← Back to generator</a>
      </div>
    </main>
  )
}
