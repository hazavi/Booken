import Image from "next/image";
import Link from "next/link";
import BookCard from "../../../components/BookCard";

interface Author {
  name: string;
  url: string;
}

interface Category {
  name: string;
  url: string;
}

interface FormatInfo {
  format: string;
  pages: string;
  price: string;
  publication_date: string;
}

interface PublisherInfo {
  dimensions: {
    depth: string;
    height: string;
    width: string;
  };
  edition: string;
  isbn: string;
  language: string;
  publisher: string;
}

interface Rating {
  stars: string;
}

interface MediaReview {
  content: string;
  source: string;
}

interface BookInfo {
  authors: Author[];
  categories: Category[];
  format_info: FormatInfo;
  image: string;
  image_alt: string;
  media_reviews: MediaReview[];
  product_id: string;
  publisher_info: PublisherInfo;
  rating: Rating;
  synopsis: string;
  title: string;
  waterstones_says: string;
}

interface Recommendation {
  author: string;
  author_url: string;
  format: string;
  image: string;
  image_alt: string;
  isbn: string;
  price: string;
  product_id: string;
  title: string;
  url: string;
}

interface BookPageData {
  data: {
    book_info: BookInfo;
    recommendations: Recommendation[];
  };
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function BookPage({ params }: PageProps) {
  const resolvedParams = await params;
  const bookPath = resolvedParams.slug.join("/");

  try {
    const response = await fetch(`http://localhost:5000/api/book/${bookPath}`, {
      cache: "no-store",
      headers: {
        "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch book details");
    }

    const data: BookPageData = await response.json();
    const { book_info, recommendations } = data.data;

    return (
      <div className="book-page-container">
        <div className="book-page-content">
          {/* Breadcrumb Navigation */}
          <nav className="book-breadcrumb">
            <Link href="/" className="book-breadcrumb-item">
              Home
            </Link>

            {book_info.categories && book_info.categories.length > 0 && (
              <>
                <span className="book-breadcrumb-separator">/</span>
                <Link href="#" className="book-breadcrumb-item">
                  {book_info.categories[0].name}
                </Link>

                {book_info.categories.length > 1 && (
                  <>
                    <span className="book-breadcrumb-separator">/</span>
                    <Link href="#" className="book-breadcrumb-item">
                      {book_info.categories[1].name}
                    </Link>
                  </>
                )}
              </>
            )}

            <span className="book-breadcrumb-separator">/</span>
            <span className="book-breadcrumb-current">
              {book_info.title.length > 30
                ? `${book_info.title.substring(0, 30)}...`
                : book_info.title}
            </span>
          </nav>

          <div className="book-page-grid">
            {/* Book Image */}
            <div className="book-image-section">
              <div className="book-image-wrapper">
                <Image
                  src={book_info.image}
                  alt={book_info.image_alt}
                  fill
                  className="book-image"
                  priority
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="book-page-details">
              {/* Title and Author */}
              <div className="book-page-header">
                <h1 className="book-page-title">{book_info.title}</h1>
                <div className="book-page-authors">
                  {book_info.authors.map((author, index) => (
                    <span key={index} className="book-page-author">
                      {author.name}
                      {index < book_info.authors.length - 1 && ", "}
                    </span>
                  ))}
                </div>

                {book_info.rating && (
                  <div className="book-page-rating">
                    <div className="book-page-stars">
                      {[...Array(5)].map((_, i) => {
                        const rating = parseFloat(book_info.rating.stars);
                        const isHalf = rating > i && rating < i + 1;
                        const isFull = rating >= i + 1;

                        if (isFull) {
                          return (
                            <svg
                              key={i}
                              className="book-star book-star-filled"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        } else if (isHalf) {
                          return (
                            <div key={i} className="book-star book-star-half">
                              <svg
                                className="book-star-empty"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg
                                className="book-star-filled-half"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <defs>
                                  <clipPath id={`half-${i}`}>
                                    <rect width="10" height="20" />
                                  </clipPath>
                                </defs>
                                <path
                                  clipPath={`url(#half-${i})`}
                                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                />
                              </svg>
                            </div>
                          );
                        } else {
                          return (
                            <svg
                              key={i}
                              className="book-star book-star-empty"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        }
                      })}
                    </div>
                    <span className="book-page-rating-text">
                      {book_info.rating.stars} stars
                    </span>
                  </div>
                )}
              </div>

              {/* Price and Format */}
              <div className="book-page-price-card">
                <div className="book-page-price-grid">
                  <div className="book-page-price-item">
                    <span className="book-page-price-label">Price</span>
                    <span className="book-page-price-value">
                      {book_info.format_info.price}
                    </span>
                  </div>
                  <div className="book-page-price-item">
                    <span className="book-page-price-label">Format</span>
                    <span className="book-page-price-text">
                      {book_info.format_info.format}
                    </span>
                  </div>
                  <div className="book-page-price-item">
                    <span className="book-page-price-label">Pages</span>
                    <span className="book-page-price-text">
                      {book_info.format_info.pages}
                    </span>
                  </div>
                  <div className="book-page-price-item">
                    <span className="book-page-price-label">Published</span>
                    <span className="book-page-price-text">
                      {new Date(
                        book_info.format_info.publication_date
                      ).getFullYear()}
                    </span>
                  </div>
                </div>

                <button className="book-page-add-to-cart">
                  <span>Add to Cart</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6" />
                  </svg>
                </button>
              </div>

              {/* Synopsis */}
              <div className="book-page-synopsis">
                <h2 className="book-page-section-title">About this book</h2>
                <p className="book-page-synopsis-text">{book_info.synopsis}</p>
                {book_info.waterstones_says && (
                  <div className="book-page-highlight">
                    <h3 className="book-page-highlight-title">
                      Waterstones Says
                    </h3>
                    <p className="book-page-highlight-text">
                      {book_info.waterstones_says}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="book-page-additional">
            {/* Reviews */}
            {book_info.media_reviews && book_info.media_reviews.length > 0 && (
              <div className="book-page-reviews">
                <h2 className="book-page-section-title">Reviews</h2>
                <div className="book-page-reviews-list">
                  {book_info.media_reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="book-page-review-item">
                      <p className="book-page-review-content">
                        "{review.content}"
                      </p>
                      <p className="book-page-review-source">
                        — {review.source}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Details */}
            <div className="book-page-info">
              <h2 className="book-page-section-title">Details</h2>
              <div className="book-page-info-grid">
                <div className="book-page-info-column">
                  <h3 className="book-page-info-subtitle">
                    Publisher Information
                  </h3>
                  <div className="book-page-info-list">
                    <p className="book-page-info-item">
                      Publisher: {book_info.publisher_info.publisher}
                    </p>
                    <p className="book-page-info-item">
                      ISBN: {book_info.publisher_info.isbn}
                    </p>
                    <p className="book-page-info-item">
                      Language: {book_info.publisher_info.language}
                    </p>
                    <p className="book-page-info-item">
                      Edition: {book_info.publisher_info.edition}
                    </p>
                  </div>
                </div>
                <div className="book-page-info-column">
                  <h3 className="book-page-info-subtitle">Dimensions</h3>
                  <div className="book-page-info-list">
                    <p className="book-page-info-item">
                      Height: {book_info.publisher_info.dimensions.height}mm
                    </p>
                    <p className="book-page-info-item">
                      Width: {book_info.publisher_info.dimensions.width}mm
                    </p>
                    <p className="book-page-info-item">
                      Depth: {book_info.publisher_info.dimensions.depth}mm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="book-page-recommendations">
              <h2 className="book-page-recommendations-title">
                You might also like
              </h2>
              <div className="book-page-recommendations-grid">
                {recommendations.slice(0, 6).map((rec) => (
                  <div
                    key={rec.product_id}
                    className="book-page-recommendation-item"
                  >
                    <BookCard
                      book={{
                        title: rec.title,
                        author: rec.author,
                        image: rec.image,
                        price: rec.price,
                        url: rec.url,
                        isbn: rec.isbn,
                        format: rec.format,
                        alt_text: rec.image_alt,
                        product_id: rec.product_id,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching book details:", error);

    return (
      <div className="book-page-container">
        <div className="book-page-error">
          <div className="book-page-error-content">
            <div className="book-page-error-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
            <h1 className="book-page-error-title">Book Not Found</h1>
            <p className="book-page-error-description">
              Sorry, we couldn't find the book you're looking for.
            </p>
            <Link href="/" className="book-page-error-button">
              <span>Back to Home</span>
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
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
