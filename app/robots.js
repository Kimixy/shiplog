export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://shiplog-jade.vercel.app/sitemap.xml',
  }
}
