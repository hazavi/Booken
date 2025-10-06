"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-content">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          Book<span className="navbar-logo-accent">en</span>
        </Link>

        {/* Search Bar */}
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search books..."
            className="navbar-search-input"
          />
          <svg
            className="navbar-search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <Link href="/" className="navbar-link active">
            Home
          </Link>
          <Link href="/books/bestsellers" className="navbar-link">
            Bestsellers
          </Link>
          <Link href="/categories" className="navbar-link">
            Categories
          </Link>
          <Link href="/about" className="navbar-link">
            About
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="mobile-menu-bar"></div>
          <div className="mobile-menu-bar"></div>
          <div className="mobile-menu-bar"></div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-search">
          <input
            type="text"
            placeholder="Search books..."
            className="navbar-search-input"
          />
        </div>
        <Link href="/" className="mobile-nav-link">
          Home
        </Link>
        <Link href="/books/bestsellers" className="mobile-nav-link">
          Bestsellers
        </Link>
        <Link href="/categories" className="mobile-nav-link">
          Categories
        </Link>
        <Link href="/about" className="mobile-nav-link">
          About
        </Link>
      </div>
    </nav>
  );
}
