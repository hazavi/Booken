"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BookCard from "./BookCard";
import type { Book } from "../lib/types";

interface BookCarouselProps {
  title: string;
  books: Book[];
  seeMoreUrl?: string;
}

export default function BookCarousel({
  title,
  books,
  seeMoreUrl,
}: BookCarouselProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleSeeMore = () => {
    if (seeMoreUrl) {
      router.push(seeMoreUrl);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 320; // Width of one book card + gap
    const newScrollPosition =
      direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="book-carousel-section">
      <div className="carousel-header">
        <div className="section-title-wrapper">
          <h2 className="section-title">{title}</h2>
          <div className="section-divider"></div>
        </div>

        {books.length > 6 && seeMoreUrl && (
          <div className="view-all-wrapper">
            <button className="view-all-button" onClick={handleSeeMore}>
              See More
            </button>
          </div>
        )}
      </div>

      <div className="carousel-container">
        <div ref={scrollRef} className="carousel-track" onScroll={handleScroll}>
          {books.map((book, index) => (
            <div key={book.product_id} className="carousel-item">
              <BookCard 
                book={book} 
                priority={index < 4}
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 400px"
              />
            </div>
          ))}
        </div>

        <div className="carousel-controls">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="carousel-button carousel-button-left"
            aria-label="Scroll left"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="carousel-button carousel-button-right"
            aria-label="Scroll right"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
