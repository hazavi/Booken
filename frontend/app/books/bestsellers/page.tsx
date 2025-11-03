"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import BestsellerBookCard from "../../../components/BestsellerBookCard";
import BookCardSkeleton from "../../../components/BookCardSkeleton";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  Filter,
  X,
  ChevronDown,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getBestsellers,
  type BestsellerParams,
  type BestsellerData,
} from "../../../lib/books";

export default function BestsellersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<BestsellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort") || "bestselling"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedFormat, setSelectedFormat] = useState(
    searchParams.get("format") || ""
  );
  const [selectedAuthor, setSelectedAuthor] = useState(
    searchParams.get("contributor") || ""
  );
  const [selectedPublisher, setSelectedPublisher] = useState(
    searchParams.get("publisher") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  // Update URL with current filters
  const updateURL = (page?: number) => {
    const params = new URLSearchParams();

    if (selectedSort && selectedSort !== "bestselling")
      params.set("sort", selectedSort);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedFormat) params.set("format", selectedFormat);
    if (selectedAuthor) params.set("contributor", selectedAuthor);
    if (selectedPublisher) params.set("publisher", selectedPublisher);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (page && page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    const newURL = queryString
      ? `/books/bestsellers?${queryString}`
      : "/books/bestsellers";
    router.push(newURL, { scroll: false });
  };

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: BestsellerParams = {
        sort: selectedSort,
        category: selectedCategory || undefined,
        format: selectedFormat || undefined,
        contributor: selectedAuthor || undefined,
        publisher: selectedPublisher || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        page: currentPage > 1 ? currentPage : undefined,
      };

      const result = await getBestsellers(params);

      if (result.success && result.data) {
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
      updateURL(1);
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
    if (data) {
      updateURL(currentPage);
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
    router.push("/books/bestsellers");
  };

  const extractIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "";
  };

  if (loading && !data) {
    return (
      <div className="page-container">
        <Navbar />

        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Bestselling Books</h1>
          </div>
        </div>

        <main className="main-sections">
          <div className="bestsellers-layout">
            <aside className="filters-sidebar">
              <div className="filters-panel">
                <div
                  className="skeleton skeleton-filter"
                  style={{ height: "300px", borderRadius: "8px" }}
                >
                  <div className="skeleton-shimmer"></div>
                </div>
              </div>
            </aside>

            <div className="bestsellers-content">
              <div className="books-grid">
                {[...Array(24)].map((_, index) => (
                  <BookCardSkeleton key={`skeleton-initial-${index}`} />
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
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
          <h1 className="page-title">Bestselling Books</h1>
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
            {/* Books Grid */}
            {loading ? (
              <div className="books-grid">
                {[...Array(24)].map((_, index) => (
                  <BookCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : data?.books && data.books.length > 0 ? (
              <>
                <div className="books-grid">
                  {data.books.map((book, index) => (
                    <BestsellerBookCard
                      key={`${book.isbn}-${index}`}
                      book={book}
                      priority={index < 12}
                      sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 18vw, 15vw"
                      index={index}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data.pagination && data.pagination.total_pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, currentPage - 1);
                        setCurrentPage(newPage);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage <= 1}
                      className="pagination-button pagination-button-prev"
                    >
                      <ChevronLeft className="pagination-icon" />
                      <span>Previous</span>
                    </button>

                    <div className="pagination-info">
                      <span className="pagination-current">
                        Page {currentPage}
                      </span>
                      <span className="pagination-separator">of</span>
                      <span className="pagination-total">
                        {data.pagination.total_pages.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const newPage = Math.min(
                          data.pagination.total_pages,
                          currentPage + 1
                        );
                        setCurrentPage(newPage);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage >= data.pagination.total_pages}
                      className="pagination-button pagination-button-next"
                    >
                      <span>Next</span>
                      <ChevronRight className="pagination-icon" />
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
