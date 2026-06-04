import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="landing-root">
      <div className="landing-content">
        <h1 className="landing-title">Menowell</h1>
        <p className="landing-subtitle">Your personalized menopause management platform for tracking, insights, and community support.</p>
        <Link href="/auth/login" className="get-started-button">
          Get Started
        </Link>
      </div>
    </main>
  );
}
