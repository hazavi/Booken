import { buildApiUrl, DEFAULT_FETCH_OPTIONS } from './config';
import { API_ENDPOINTS } from './config';
import { HomepageResponse } from './types';

/**
 * Fetch homepage data including all book sections
 */
export async function getHomepageData(): Promise<HomepageResponse> {
  try {
    const url = buildApiUrl(API_ENDPOINTS.HOMEPAGE);
    
    const response = await fetch(url, DEFAULT_FETCH_OPTIONS);

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.status} ${response.statusText}`);
    }

    const result: HomepageResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch homepage data');
    }

    return result;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    throw error;
  }
}