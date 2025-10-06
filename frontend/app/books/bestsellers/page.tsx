"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import {
  Filter,
  X,
  ChevronDown,
  Star,
  BookOpen,
  TrendingUp,
} from "lucide-react";

interface Book {
  title: string;
  author: string;
  author_url: string;
  image: string;
  image_alt: string;
  price: string;
  price_rrp?: string;
  rating?: {
    stars: string;
  };
  stock_status: string;
  format: string;
  url: string;
  isbn: string;
}

interface FilterOption {
  name: string;
  url: string;
  value?: string;
  label?: string;
}

interface BestsellerData {
  books: Book[];
  filters: {
    category: FilterOption[];
    format: FilterOption[];
    author: FilterOption[];
    publisher: FilterOption[];
    language: FilterOption[];
    sort_options: FilterOption[];
    price_range: {
      min_default: string;
      max_default: string;
    };
  };
  pagination: {
    current_page: number;
    total_pages: number;
    next_url?: string;
    total_items: string;
  };
  metadata: {
    title: string;
    books_count: number;
    sort: string;
  };
}

export default function BestsellersPage() {
  const [data, setData] = useState<BestsellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState("bestselling");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedSort) params.append("sort", selectedSort);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedFormat) params.append("format", selectedFormat);
      if (selectedAuthor) params.append("contributor", selectedAuthor);
      if (selectedPublisher) params.append("publisher", selectedPublisher);
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      if (currentPage > 1) params.append("page", currentPage.toString());

      const url = `http://localhost:5000/api/books/bestsellers${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (data) {
      // Only refetch if we have initial data
      setCurrentPage(1); // Reset to page 1 when filters change
      fetchData();
    }
  }, [
    selectedSort,
    selectedCategory,
    selectedFormat,
    selectedAuthor,
    selectedPublisher,
    minPrice,
    maxPrice,
  ]);

  // Refetch when page changes
  useEffect(() => {
    if (data && currentPage > 1) {
      fetchData();
    }
  }, [currentPage]);

  const clearFilters = () => {
    setSelectedSort("bestselling");
    setSelectedCategory("");
    setSelectedFormat("");
    setSelectedAuthor("");
    setSelectedPublisher("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  const extractIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "";
  };

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

    const stars = parseFloat(rating.stars) || 0;

    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => {
          const ratingValue = parseFloat(rating?.stars || "0");
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
                    <clipPath id={`half-bestseller-${i}`}>
                      <rect width="10" height="20" />
                    </clipPath>
                  </defs>
                  <path
                    clipPath={`url(#half-bestseller-${i})`}
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

  if (loading && !data) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bestsellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="error-state">
          <div className="error-content">
            <h2 className="error-title">Error: {error}</h2>
            <button onClick={fetchData} className="hero-button-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            <TrendingUp className="page-title-icon" />
            Bestselling Books
          </h1>
          {data && (
            <div className="page-stats">
              <span className="page-stat">
                <BookOpen className="w-4 h-4" />
                {data.metadata.books_count} books
              </span>
              <span className="page-stat">
                Page {data.pagination.current_page} of{" "}
                {data.pagination.total_pages.toLocaleString()}
              </span>
              <span className="page-stat">
                {parseInt(data.pagination.total_items).toLocaleString()} total
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="main-sections">
        <div className="bestsellers-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            {/* Mobile Filter Toggle */}
            <div className="mobile-filter-toggle">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-button"
              >
                <span className="filter-toggle-text">
                  <Filter className="w-5 h-5" />
                  Filters
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Filter Panel */}
            <div
              className={`filters-panel ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              {/* Active Filters */}
              <div className="filter-section">
                <div className="filter-header">
                  <h3 className="filter-title">Active Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="clear-filters-button"
                  >
                    Clear All
                  </button>
                </div>

                {/* Active Filter Tags */}
                <div className="active-filters">
                  {selectedSort !== "bestselling" && (
                    <span className="filter-tag filter-tag-primary">
                      Sort:{" "}
                      {
                        data?.filters.sort_options.find(
                          (s) => s.value === selectedSort
                        )?.label
                      }
                      <X
                        className="filter-tag-remove"
                        onClick={() => setSelectedSort("bestselling")}
                      />
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="filter-tag filter-tag-secondary">
                      Category:{" "}
                      {
                        data?.filters.category.find(
                          (c) => extractIdFromUrl(c.url) === selectedCategory
                        )?.name
                      }
                      <X
                        className="filter-tag-remove"
                        onClick={() => setSelectedCategory("")}
                      />
                    </span>
                  )}
                  {selectedFormat && (
                    <span className="filter-tag filter-tag-accent">
                      Format:{" "}
                      {
                        data?.filters.format.find(
                          (f) => extractIdFromUrl(f.url) === selectedFormat
                        )?.name
                      }
                      <X
                        className="filter-tag-remove"
                        onClick={() => setSelectedFormat("")}
                      />
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="filter-tag filter-tag-success">
                      Price: £{minPrice || "0"} - £{maxPrice || "∞"}
                      <X
                        className="filter-tag-remove"
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                        }}
                      />
                    </span>
                  )}
                </div>
              </div>

              {/* Sort Filter */}
              {data?.filters.sort_options && (
                <div className="filter-section">
                  <h3 className="filter-title">Sort By</h3>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="filter-select"
                  >
                    {data.filters.sort_options.map((option) => (
                      <option key={option.value} value={option.value || ""}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div className="filter-section">
                <h3 className="filter-title">Price Range</h3>
                <div className="price-range-inputs">
                  <div className="price-input-group">
                    <label className="price-label">Min £</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="price-input"
                    />
                  </div>
                  <div className="price-input-group">
                    <label className="price-label">Max £</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="∞"
                      className="price-input"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              {data?.filters.category && (
                <div className="filter-section">
                  <h3 className="filter-title">Category</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    {data.filters.category.map((category, index) => (
                      <option
                        key={`${extractIdFromUrl(category.url)}-${
                          category.name
                        }-${index}`}
                        value={extractIdFromUrl(category.url)}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Format Filter */}
              {data?.filters.format && (
                <div className="filter-section">
                  <h3 className="filter-title">Format</h3>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Formats</option>
                    {data.filters.format.slice(0, 10).map((format, index) => (
                      <option
                        key={`${extractIdFromUrl(format.url)}-${
                          format.name
                        }-${index}`}
                        value={extractIdFromUrl(format.url)}
                      >
                        {format.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Author Filter */}
              {data?.filters.author && (
                <div className="filter-section">
                  <h3 className="filter-title">Popular Authors</h3>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Authors</option>
                    {data.filters.author.map((author, index) => (
                      <option
                        key={`${extractIdFromUrl(author.url)}-${
                          author.name
                        }-${index}`}
                        value={extractIdFromUrl(author.url)}
                      >
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Publisher Filter */}
              {data?.filters.publisher && (
                <div className="filter-section">
                  <h3 className="filter-title">Publisher</h3>
                  <select
                    value={selectedPublisher}
                    onChange={(e) => setSelectedPublisher(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Publishers</option>
                    {data.filters.publisher.map((publisher, index) => (
                      <option
                        key={`${extractIdFromUrl(publisher.url)}-${
                          publisher.name
                        }-${index}`}
                        value={extractIdFromUrl(publisher.url)}
                      >
                        {publisher.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="bestsellers-content">
            {/* Results Header */}
            <div className="results-header">
              <div className="results-info">
                <h2 className="section-title">
                  {data?.metadata.title || "Bestselling Books"}
                </h2>
                <p className="results-count">
                  Showing {data?.metadata.books_count || 0} books
                  {data?.pagination && data.pagination.current_page > 1 && (
                    <span> - Page {data.pagination.current_page}</span>
                  )}
                </p>
              </div>

              {loading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Books Grid */}
            {data?.books && data.books.length > 0 ? (
              <>
                <div className="books-grid">
                  {data.books.map((book, index) => (
                    <a
                      key={`${book.isbn}-${index}`}
                      href={book.url}
                      rel="noopener noreferrer"
                      className="book-card-link"
                    >
                      <article className="book-card">
                        <div className="book-image-container">
                          <img
                            src={book.image}
                            alt={book.image_alt || book.title}
                            className="book-image"
                          />
                          <div className="book-overlay"></div>
                          {book.price_rrp && book.price !== book.price_rrp && (
                            <div className="book-sale-badge">Sale</div>
                          )}
                        </div>

                        <div className="book-content book-content-compact">
                          <h3 className="book-title book-title-compact">
                            {book.title}
                          </h3>

                          <p className="book-author book-author-compact">
                            {book.author}
                          </p>

                          <div className="book-rating book-rating-compact">
                            {renderStars(book.rating)}
                          </div>

                          <div className="book-footer book-footer-compact">
                            <div className="book-price-group">
                              <span className="book-price book-price-compact">
                                {book.price}
                              </span>
                              {book.price_rrp &&
                                book.price !== book.price_rrp && (
                                  <span className="book-price-original book-price-original-compact">
                                    {book.price_rrp}
                                  </span>
                                )}
                            </div>
                            <span
                              className={`book-format book-format-compact ${
                                book.stock_status === "In stock online"
                                  ? "book-format-available"
                                  : book.stock_status === "Pre-order"
                                  ? "book-format-preorder"
                                  : "book-format-default"
                              }`}
                            >
                              {book.stock_status || book.format}
                            </span>
                          </div>
                        </div>
                      </article>
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination && data.pagination.total_pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage <= 1}
                      className="pagination-button pagination-button-prev"
                    >
                      Previous
                    </button>

                    <span className="pagination-info">
                      Page {currentPage} of{" "}
                      {data.pagination.total_pages.toLocaleString()}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage(
                          Math.min(data.pagination.total_pages, currentPage + 1)
                        )
                      }
                      disabled={currentPage >= data.pagination.total_pages}
                      className="pagination-button pagination-button-next"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <BookOpen className="empty-state-icon" />
                <h3 className="empty-state-title">No books found</h3>
                <p className="empty-state-description">
                  Try adjusting your filters to see more results.
                </p>
                <button onClick={clearFilters} className="hero-button-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
