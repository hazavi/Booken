"use client";

import { useState } from "react";

interface ReadMoreTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  type?: "synopsis" | "highlight";
}

export default function ReadMoreText({
  text,
  maxLines = 4,
  className = "",
  type = "synopsis",
}: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if text is long enough to need truncation (rough estimate)
  const needsTruncation = text.length > maxLines * 150;

  if (!text) return null;

  return (
    <div>
      <p
        className={`${
          type === "synopsis"
            ? "book-page-synopsis-text"
            : "book-page-highlight-text"
        } ${!isExpanded && needsTruncation ? "collapsed" : ""} ${className}`}
      >
        {text}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="book-page-read-more"
        >
          {isExpanded ? "Show less" : "Read more"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
