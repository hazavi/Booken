import { API_BASE_URL, API_ENDPOINTS, DEFAULT_FETCH_OPTIONS } from './config';
import { HomepageResponse } from './types';

/**
 * Fetch homepage data including all book sections
 */
export async function getHomepageData(): Promise<HomepageResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.HOMEPAGE}`,
      DEFAULT_FETCH_OPTIONS
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    throw error;
  }
}