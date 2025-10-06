export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-background-pattern"></div>
      <div className="hero-content-wrapper">
        <div className="hero-inner">
          <div className="hero-text-center">
            <div className="hero-badge">✨ Discover Books</div>
            <h1 className="hero-title">
              Welcome to <span className="hero-brand-blue">Book</span>
              <span className="hero-brand-dark">en</span>
            </h1>
            <p className="hero-description">
              Discover your next favorite book in our carefully curated
              collection of bestsellers, new releases, and timeless classics.
              Start your reading journey today.
            </p>

            <div className="hero-buttons">
              <button className="hero-button-primary">
                <span>Browse Collections</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <button className="hero-button-secondary">View Categories</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
