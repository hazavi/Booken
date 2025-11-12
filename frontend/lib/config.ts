// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export const API_ENDPOINTS = {
  HOMEPAGE: '/homepage',
  BOOK_DETAIL: '/book',
  BESTSELLERS: '/books/bestsellers',
} as const;

// API fetch configuration
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  cache: 'no-store',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
};

// Helper to build API URL (API key sent via header, not query param for security)
export function buildApiUrl(endpoint: string, queryParams?: Record<string, string>): string {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return `${API_BASE_URL}${endpoint}`;
  }
  const params = new URLSearchParams(queryParams);
  return `${API_BASE_URL}${endpoint}?${params.toString()}`;
}