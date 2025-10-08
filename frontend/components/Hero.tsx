export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-background-pattern"></div>
      <div className="hero-content-wrapper">
        <div className="hero-inner">
          <div className="hero-text-center">
            <h1 className="hero-title">
              <span className="hero-brand-blue">Book</span>
              <span className="hero-brand-dark">en</span>
            </h1>
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
