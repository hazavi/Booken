export default function BookCardSkeleton() {
  return (
    <div className="book-card book-card-compact skeleton-card">
      <div className="book-image-container skeleton">
        <div className="skeleton-shimmer"></div>
      </div>

      <div className="book-content book-content-compact">
        <div className="skeleton skeleton-title">
          <div className="skeleton-shimmer"></div>
        </div>

        <div className="skeleton skeleton-author">
          <div className="skeleton-shimmer"></div>
        </div>

        <div className="skeleton skeleton-rating">
          <div className="skeleton-shimmer"></div>
        </div>

        <div className="book-footer book-footer-compact">
          <div className="skeleton skeleton-price">
            <div className="skeleton-shimmer"></div>
          </div>
          <div className="skeleton skeleton-badge">
            <div className="skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
