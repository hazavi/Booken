"use client";

import { useEffect, useState } from "react";
import BookCarousel from "../components/BookCarousel";
import Hero from "../components/Hero";
import BookCardSkeleton from "../components/BookCardSkeleton";
import { getHomepageData } from "../lib";
import type { BookSection } from "../lib/types";

export default function Home() {
  const [sections, setSections] = useState<BookSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getHomepageData();
        setSections(data.data?.sections || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load books. Please check that the API server is running on localhost:5000"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="page-container">
      <Hero />

      <main className="main-sections">
        {loading ? (
          <div className="section">
            <div className="section-header">
              <div
                className="skeleton"
                style={{ width: "200px", height: "32px", marginBottom: "24px" }}
              >
                <div className="skeleton-shimmer"></div>
              </div>
            </div>
            <div
              className="books-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "24px",
              }}
            >
              {[...Array(12)].map((_, index) => (
                <BookCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="loading-state">
            <h2 className="error-title">Unable to load books</h2>
            <p className="error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="hero-button-primary"
              style={{ marginTop: "16px" }}
            >
              Retry
            </button>
          </div>
        ) : (
          sections.map((section, index) => (
            <BookCarousel
              key={index}
              title={section.title}
              books={section.books}
              seeMoreUrl={section.see_more_url}
            />
          ))
        )}
      </main>
    </div>
  );
}
