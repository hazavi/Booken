import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">
              Book<span className="footer-logo-accent">en</span>
            </h3>
            <p className="footer-description">
              Discover your next favorite book at Booken - A modern,
              minimalistic bookstore experience.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link" aria-label="Facebook">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="footer-social-link" aria-label="Twitter">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="footer-social-link" aria-label="Instagram">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529L12.017 8.686l6.773 6.773c-.757.933-1.908 1.529-3.205 1.529H8.449z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="/" className="footer-link">
                  Home
                </a>
              </li>
              <li>
                <a href="/books" className="footer-link">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="/categories" className="footer-link">
                  Categories
                </a>
              </li>
              <li>
                <a href="/bestsellers" className="footer-link">
                  Bestsellers
                </a>
              </li>
              <li>
                <a href="/new-releases" className="footer-link">
                  New Releases
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4 className="footer-section-title">Customer Service</h4>
            <ul className="footer-links">
              <li>
                <a href="/contact" className="footer-link">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/shipping" className="footer-link">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="/returns" className="footer-link">
                  Returns
                </a>
              </li>
              <li>
                <a href="/faq" className="footer-link">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/support" className="footer-link">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="footer-section">
            <h4 className="footer-section-title">About</h4>
            <ul className="footer-links">
              <li>
                <a href="/about" className="footer-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="footer-link">
                  Careers
                </a>
              </li>
              <li>
                <a href="/press" className="footer-link">
                  Press
                </a>
              </li>
              <li>
                <a href="/privacy" className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="footer-link">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <h4 className="footer-newsletter-title">Stay Updated</h4>
          <p className="footer-newsletter-description">
            Subscribe to our newsletter for the latest book recommendations and
            exclusive offers.
          </p>
          <form className="footer-newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="footer-newsletter-input"
              required
            />
            <button type="submit" className="footer-newsletter-button">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Booken. All rights reserved.
            </p>
            <div className="footer-payment">
              <span className="footer-payment-text">We accept:</span>
              <div className="footer-payment-icons">
                <span className="footer-payment-icon">💳</span>
                <span className="footer-payment-icon">💰</span>
                <span className="footer-payment-icon">🏦</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
