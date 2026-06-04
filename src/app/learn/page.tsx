import { prisma } from '@/lib/prisma'
import type { EducationalArticle } from '@prisma/client'
import styles from './learn.module.css'

export default async function LearnPage() {
  const articles = await prisma.educationalArticle.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Educational Library</h1>
      <p className={styles.subtitle}>Evidence-based guides about menopause and wellness.</p>
      <p className={styles.disclaimer}>This information is educational and not medical advice.</p>

      {articles.length === 0 ? (
        <div className={styles.empty}>
          <p>No articles available yet. Check back soon.</p>
        </div>
      ) : (
        <ul className={styles.grid}>
          {articles.map((article: EducationalArticle) => (
            <li key={article.id} className={styles.articleCard}>
              <span className={styles.category}>{article.category}</span>
              <h2 className={styles.articleTitle}>{article.title}</h2>
              <p className={styles.articlePreview}>{article.content.slice(0, 160)}…</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
