export default function sitemap() {
  return [
    { url: 'https://shiplog-jade.vercel.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://shiplog-jade.vercel.app/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
