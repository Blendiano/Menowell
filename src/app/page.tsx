import { getCurrentUser } from '@/lib/user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

export default async function LandingPage() {
  const user = await getCurrentUser()
  if (user) redirect('/dashboard')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>Menowell</Link>
          <nav className={styles.nav}>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#how-it-works" className={styles.navLink}>How It Works</Link>
            <Link href="/auth/login" className={styles.navLink}>Log in</Link>
            <Link href="/auth/register" className={styles.navCta}>Get Started</Link>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Navigate menopause with&nbsp;confidence
          </h1>
          <p className={styles.heroSubtitle}>
            Track symptoms, discover patterns, and connect with a community that understands.
            Your personalized menopause companion.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth/register" className={styles.btnPrimary}>Start Your Journey</Link>
            <Link href="#features" className={styles.btnSecondary}>Learn More</Link>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionLabel}>Everything you need</h2>
          <p className={styles.sectionTitle}>Built for every stage of your journey</p>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureName}>Symptom Tracking</h3>
              <p className={styles.featureDesc}>Log daily symptoms and see how they change over time. Identify triggers and patterns.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>✨</div>
              <h3 className={styles.featureName}>Personalized Insights</h3>
              <p className={styles.featureDesc}>Get data-driven insights about your cycle, symptom correlations, and trends.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <h3 className={styles.featureName}>Community Support</h3>
              <p className={styles.featureDesc}>Join a safe space to share experiences, ask questions, and find encouragement.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📚</div>
              <h3 className={styles.featureName}>Learn & Grow</h3>
              <p className={styles.featureDesc}>Access curated articles and resources from healthcare professionals.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionLabel}>How It Works</h2>
          <p className={styles.sectionTitle}>Start in minutes</p>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <h3 className={styles.stepTitle}>Create your account</h3>
              <p className={styles.stepDesc}>Sign up free and set up your profile in under a minute.</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <h3 className={styles.stepTitle}>Track your symptoms</h3>
              <p className={styles.stepDesc}>Log daily symptoms, mood, sleep, and more with a simple tap.</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <h3 className={styles.stepTitle}>Discover insights</h3>
              <p className={styles.stepDesc}>Uncover patterns and get personalized recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.sectionInner}>
          <h2 className={styles.ctaTitle}>Ready to take control?</h2>
          <p className={styles.ctaDesc}>Join thousands of women navigating menopause with confidence.</p>
          <Link href="/auth/register" className={styles.btnPrimary}>Get Started Free</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>Menowell</div>
          <div className={styles.footerLinks}>
            <Link href="#features" className={styles.footerLink}>Features</Link>
            <Link href="#how-it-works" className={styles.footerLink}>How It Works</Link>
            <Link href="/auth/login" className={styles.footerLink}>Log in</Link>
          </div>
          <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} Menowell. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
