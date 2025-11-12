import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Large 404 */}
        <div className="not-found-number">404</div>

        {/* Minimalist divider */}
        <div className="not-found-divider"></div>

        {/* Content */}
        <div className="not-found-text">
          <h1 className="not-found-title">Page Not Found</h1>
          <p className="not-found-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="not-found-actions">
          <Link href="/" className="not-found-button not-found-button-primary">
            Return Home
          </Link>
          <Link
            href="/search"
            className="not-found-button not-found-button-secondary"
          >
            Search Books
          </Link>
        </div>
      </div>
    </div>
  );
}
