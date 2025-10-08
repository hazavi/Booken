// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  HOMEPAGE: '/api/homepage',
  BOOK_DETAIL: '/api/book',
  BESTSELLERS: '/api/books/bestsellers',
} as const;

// API fetch configuration
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  cache: 'no-store',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
  },
};