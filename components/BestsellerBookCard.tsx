import Link from "next/link";
import SafeImage from "./SafeImage";
import { Star } from "lucide-react";
import type { Book as BestsellerBook } from "../lib/books";

interface BestsellerBookCardProps {
  book: BestsellerBook;
  priority?: boolean;
  sizes?: string;
  index?: number;
}

export default function BestsellerBookCard({
  book,
  priority = false,
  sizes = "(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 18vw, 15vw",
  index = 0,
}: BestsellerBookCardProps) {
  const renderStars = (rating?: { stars: string }) => {
    if (!rating || !rating.stars) {
      return (
        <div className="rating-stars">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="star star-empty" fill="none" />
          ))}
          <span className="rating-text">(No rating)</span>
        </div>
      );
    }

    const ratingValue = parseFloat(rating.stars) || 0;

    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => {
          const isHalf = ratingValue > i && ratingValue < i + 1;
          const isFull = ratingValue >= i + 1;

          if (isFull) {
            return (
              <svg
                key={i}
                className="star star-filled"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          } else if (isHalf) {
            return (
              <div key={i} className="star star-half">
                <svg
                  className="star-empty"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  className="star-filled-half"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <defs>
                    <clipPath id={`half-bestseller-${index}-${i}`}>
                      <rect width="10" height="20" />
                    </clipPath>
                  </defs>
                  <path
                    clipPath={`url(#half-bestseller-${index}-${i})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
            );
          } else {
            return (
              <svg
                key={i}
                className="star star-empty"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          }
        })}
        <span className="rating-text">({rating.stars})</span>
      </div>
    );
  };

  return (
    <Link href={book.url} className="book-card-link">
      <article className="book-card book-card-compact">
        <div className="book-image-container">
          <SafeImage
            src={book.image}
            alt={book.image_alt || book.title}
            fill
            className="book-image"
            sizes={sizes}
            priority={priority}
            quality={90}
          />
          <div className="book-overlay"></div>
          {book.price_rrp && book.price !== book.price_rrp && (
            <div className="book-sale-badge">Sale</div>
          )}
        </div>

        <div className="book-content book-content-compact">
          <h3 className="book-title book-title-compact" title={book.title}>
            {book.title}
          </h3>

          <p className="book-author book-author-compact">{book.author}</p>

          <div className="book-rating book-rating-compact">
            {renderStars(book.rating)}
          </div>

          <div className="book-footer book-footer-compact">
            <div className="book-price-group">
              <span className="book-price book-price-compact">
                {book.price}
              </span>
              {book.price_rrp && book.price !== book.price_rrp && (
                <span className="book-price-original book-price-original-compact">
                  {book.price_rrp}
                </span>
              )}
            </div>
            {book.stock_status && (
              <span
                className={`book-format book-format-compact ${
                  book.stock_status === "In stock online"
                    ? "book-format-available"
                    : book.stock_status === "Pre-order"
                    ? "book-format-preorder"
                    : "book-format-default"
                }`}
              >
                {book.stock_status === "In stock online"
                  ? "In Stock"
                  : book.stock_status}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
