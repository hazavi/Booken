import { API_BASE_URL, API_ENDPOINTS, DEFAULT_FETCH_OPTIONS } from './config';
import { BookDetailResponse } from './types';

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