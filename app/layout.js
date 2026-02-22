import './globals.css'

export const metadata = {
  title: 'ShipLog — AI Changelog Generator',
  description: 'Turn messy git commits into beautiful changelogs. Paste a GitHub repo, get a clean categorized changelog in seconds. Free.',
  keywords: 'changelog generator, git changelog, github changelog, ai changelog, release notes generator, commit changelog',
  openGraph: {
    title: 'ShipLog — AI Changelog Generator',
    description: 'Turn messy git commits into beautiful changelogs in seconds.',
    url: 'https://shiplog-jade.vercel.app',
    siteName: 'ShipLog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShipLog — AI Changelog Generator',
    description: 'Turn messy git commits into beautiful changelogs in seconds.',
  },
  robots: 'index, follow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://shiplog-jade.vercel.app" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
