import { API_BASE_URL, API_ENDPOINTS, DEFAULT_FETCH_OPTIONS } from './config';
import { BookDetailResponse } from './types';

/**
 * Parameters for bestsellers API
 */
export interface BestsellerParams {
  sort?: string;
  category?: string;
  format?: string;
  contributor?: string;
  publisher?: string;
  min_price?: string;
  max_price?: string;
  page?: number;
}

/**
 * Book interface for bestsellers
 */
export interface Book {
  title: string;
  author: string;
  author_url: string;
  image: string;
  image_alt: string;
  price: string;
  price_rrp?: string;
  rating?: {
    stars: string;
  };
  stock_status: string;
  format: string;
  url: string;
  isbn: string;
}

/**
 * Filter option interface
 */
export interface FilterOption {
  name: string;
  url: string;
  value?: string;
  label?: string;
}

/**
 * Bestseller data response interface
 */
export interface BestsellerData {
  books: Book[];
  filters: {
    category: FilterOption[];
    format: FilterOption[];
    author: FilterOption[];
    publisher: FilterOption[];
    language: FilterOption[];
    sort_options: FilterOption[];
    price_range: {
      min_default: string;
      max_default: string;
    };
  };
  pagination: {
    current_page: number;
    total_pages: number;
    next_url?: string;
    total_items: string;
  };
  metadata: {
    title: string;
    books_count: number;
    sort: string;
  };
}

/**
 * API response wrapper
 */
export interface BestsellerResponse {
  success: boolean;
  data?: BestsellerData;
  error?: string;
}

/**
 * Fetch bestsellers data with optional filters
 */
export async function getBestsellers(params: BestsellerParams = {}): Promise<BestsellerResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.category) searchParams.append("category", params.category);
    if (params.format) searchParams.append("format", params.format);
    if (params.contributor) searchParams.append("contributor", params.contributor);
    if (params.publisher) searchParams.append("publisher", params.publisher);
    if (params.min_price) searchParams.append("min_price", params.min_price);
    if (params.max_price) searchParams.append("max_price", params.max_price);
    if (params.page && params.page > 1) searchParams.append("page", params.page.toString());

    const url = `${API_BASE_URL}${API_ENDPOINTS.BESTSELLERS}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetch(url, DEFAULT_FETCH_OPTIONS);

    if (!response.ok) {
      throw new Error(`Failed to fetch bestsellers: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred"
    };
  }
}

/**
 * Fetch detailed information for a specific book
 * @param bookPath - The book path (e.g., "the-courage-to-be-disliked/ichiro-kishimi/fumitake-koga/9781760630737")
 */
export async function getBookDetails(bookPath: string): Promise<BookDetailResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.BOOK_DETAIL}/${bookPath}`,
      DEFAULT_FETCH_OPTIONS
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch book details: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}