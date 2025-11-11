"use client";

import { useEffect, useState } from "react";
import { getHomepageData } from "../lib/homepage";
import type { Book } from "../lib/types";
import Link from "next/link";
import SafeImage from "./SafeImage";

export default function Hero() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBestsellers() {
      try {
        const response = await getHomepageData();
        if (response.success && response.data?.sections) {
          // Find "Our Bestsellers" section - exact match
          const bestsellersSection = response.data.sections.find(
            (section) => section.title === "Our Bestsellers"
          );
          if (bestsellersSection && bestsellersSection.books) {
            // Get all bestseller books
            setBooks(bestsellersSection.books);
          }
        }
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBestsellers();
  }, []);

  useEffect(() => {
    if (books.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 5000); // Change book every 5 seconds for smoother experience

    return () => clearInterval(interval);
  }, [books.length]);

  const currentBook = books[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + books.length) % books.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % books.length);
  };

  return (
    <section className="hero-section">
      <div className="hero-background-pattern"></div>
      <div className="hero-content-wrapper">
        <div className="hero-inner">
          <div className="hero-text-center">
            <h2 className="hero-section-title">Our Bestsellers</h2>

            {isLoading ? (
              <div className="hero-book-showcase">
                <div className="hero-book-loading">
                  <div className="loading-spinner"></div>
                </div>
              </div>
            ) : currentBook ? (
              <>
                <div className="hero-book-showcase">
                  {books.map((book, index) => (
                    <Link
                      key={book.isbn}
                      href={book.url}
                      className={`hero-book-item ${
                        index === currentIndex ? "active" : ""
                      }`}
                    >
                      <div className="hero-book-image-wrapper">
                        <SafeImage
                          src={book.image}
                          alt={book.alt_text || book.title}
                          className="hero-book-image"
                          fill
                          priority={index === currentIndex}
                        />
                      </div>
                    </Link>
                  ))}

                  {/* Navigation Buttons */}
                  <button
                    onClick={handlePrevious}
                    className="hero-nav-button hero-nav-prev"
                    aria-label="Previous book"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  <button
                    onClick={handleNext}
                    className="hero-nav-button hero-nav-next"
                    aria-label="Next book"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
                <div className="hero-view-more">
                  <Link
                    href="/books/bestsellers"
                    className="hero-view-more-button"
                  >
                    View More
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
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
