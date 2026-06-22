import { getCurrentUser } from '@/lib/user'
import Link from 'next/link'
import { TransitionLink } from '@/components/ui/transition-link'
import { MarketingHeader } from '@/components/layout/marketing-header'
import styles from './page.module.css'

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div id="page-root" className={styles.page}>
      <MarketingHeader />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Track symptoms. Understand menopause.
          </h1>
          <p className={styles.heroSubtitle}>
            Get personalized insights, monitor changes, and feel supported every step of the way.
          </p>
          <div className={styles.heroActions}>
            <TransitionLink href="/auth?mode=register" className={styles.btnPrimary}>Start Tracking</TransitionLink>
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
              <p className={styles.featureDesc}>Track symptoms and spot patterns over time.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>✨</div>
              <h3 className={styles.featureName}>Personalized Insights</h3>
              <p className={styles.featureDesc}>Get personalized insights from your symptom data.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <h3 className={styles.featureName}>Community Support</h3>
              <p className={styles.featureDesc}>Connect, share experiences, and find support.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📚</div>
              <h3 className={styles.featureName}>Learn & Grow</h3>
              <p className={styles.featureDesc}>Access trusted menopause resources.</p>
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
          <TransitionLink href="/auth?mode=register" className={styles.btnPrimary}>Get Started Free</TransitionLink>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>Menowell</div>
          <div className={styles.footerLinks}>
            <Link href="#features" className={styles.footerLink}>Features</Link>
            <Link href="#how-it-works" className={styles.footerLink}>How It Works</Link>
            <TransitionLink href="/auth" className={styles.footerLink}>Log in</TransitionLink>
          </div>
          <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} Menowell. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
