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

// Helper to build API URL with key
export function buildApiUrl(endpoint: string, queryParams?: Record<string, string>): string {
  const params = new URLSearchParams(queryParams);
  params.append('api_key', API_KEY);
  return `${API_BASE_URL}${endpoint}?${params.toString()}`;
}