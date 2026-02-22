import './globals.css'

export const metadata = {
  title: 'ShipLog — AI Changelog Generator',
  description: 'Turn your messy git commits into beautiful changelogs. Automatically.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
