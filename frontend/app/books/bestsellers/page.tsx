"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import BestsellerBookCard from "../../../components/BestsellerBookCard";
import {
  Filter,
  X,
  ChevronDown,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { getBestsellers, type BestsellerParams, type BestsellerData } from "../../../lib/books";

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
                    <BestsellerBookCard
                      key={`${book.isbn}-${index}`}
                      book={book}
                      priority={index < 6}
                      sizes="(max-width: 480px) 400px, (max-width: 768px) 600px, (max-width: 1024px) 500px, 800px"
                      index={index}
                    />
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
