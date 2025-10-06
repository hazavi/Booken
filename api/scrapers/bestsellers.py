import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs
from typing import Dict, List, Optional
import time
import hashlib
import re

WATERSTONES_URL = "https://www.waterstones.com/"
BESTSELLERS_BASE_URL = "https://www.waterstones.com/books/bestsellers"
BASE_HEADERS = {
    # Default to a modern desktop UA; can be overridden via env or request
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Referer": "https://www.waterstones.com/",
    "Sec-CH-UA": '"Google Chrome";v="140", "Chromium";v="140", "Not=A?Brand";v="24"',
    "Sec-CH-UA-Platform": '"Windows"',
    "Sec-CH-UA-Mobile": "?0",
    "Upgrade-Insecure-Requests": "1",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Origin": "https://www.waterstones.com",
}

# Simple in-memory cache
_cache = {}
CACHE_TTL = 300  # 5 minutes in seconds


def _get_cache_key(url: str, cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None) -> str:
    """Generate a cache key based on the request parameters."""
    # Create a hash of the parameters to use as cache key
    params = f"{url}-{cookie or ''}-{user_agent or ''}-{accept_language or ''}"
    return hashlib.md5(params.encode()).hexdigest()


def _get_from_cache(cache_key: str) -> Dict | None:
    """Get data from cache if it exists and is not expired."""
    if cache_key in _cache:
        cached_data, timestamp = _cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data
        else:
            # Remove expired cache entry
            del _cache[cache_key]
    return None


def _set_cache(cache_key: str, data: Dict) -> None:
    """Store data in cache with current timestamp."""
    _cache[cache_key] = (data, time.time())


def _build_headers(cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None) -> Dict[str, str]:
    headers = dict(BASE_HEADERS)
    # Allow env overrides if args not provided
    if not user_agent:
        user_agent = os.environ.get("WATERSTONES_USER_AGENT")
    if not accept_language:
        accept_language = os.environ.get("WATERSTONES_ACCEPT_LANGUAGE")
    if user_agent:
        headers["User-Agent"] = user_agent
    if accept_language:
        headers["Accept-Language"] = accept_language
    # Optional cookie passthrough (e.g., CF clearance) via arg or env var
    cookie = cookie or os.environ.get("WATERSTONES_COOKIE") or os.environ.get("WATERSTONES_COOKIES")
    if cookie:
        headers["Cookie"] = cookie
    return headers


def _get_client(cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None):
    """Return a requests-like session, preferring curl_cffi (impersonation) then cloudscraper."""
    headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
    
    # 1) Try curl_cffi with browser impersonation (very effective for CF)
    try:
        from curl_cffi import requests as cf_requests  # type: ignore
        sess = cf_requests.Session(impersonate="chrome")
        sess.headers.update(headers)
        return sess, "curl_cffi"
    except ImportError:
        pass
    except Exception:
        pass
    
    # 2) Try cloudscraper
    try:
        import cloudscraper  # type: ignore
        scraper = cloudscraper.create_scraper(browser={
            "browser": "chrome",
            "platform": "windows",
            "mobile": False,
        })
        scraper.headers.update(headers)
        return scraper, "cloudscraper"
    except ImportError:
        pass
    except Exception:
        pass
    
    # 3) Fallback to plain requests
    sess = requests.Session()
    sess.headers.update(headers)
    return sess, "requests"


def _clean_url(href: str) -> str:
    """Clean URL to return relative path."""
    if not href:
        return ''
    
    # If it's already a relative path, return it
    if href.startswith('/'):
        return href
    
    # If it's a full URL, extract the path
    if href.startswith('http'):
        parsed = urlparse(href)
        return parsed.path
    
    # Otherwise, add leading slash
    return '/' + href.lstrip('/')


def _extract_price(price_text: str) -> Dict[str, str]:
    """Extract price information from price text."""
    price_info = {}
    
    if not price_text:
        return price_info
    
    # Remove extra whitespace and normalize
    price_text = ' '.join(price_text.split())
    
    # Look for RRP (recommended retail price)
    rrp_match = re.search(r'£([\d,]+\.?\d*)', price_text)
    if rrp_match:
        price_info["rrp"] = f"£{rrp_match.group(1)}"
    
    # Look for actual price (usually the last price mentioned)
    price_matches = re.findall(r'£([\d,]+\.?\d*)', price_text)
    if price_matches:
        price_info["price"] = f"£{price_matches[-1]}"
    
    return price_info


def _extract_rating(rating_div) -> Dict[str, str] | None:
    """Extract star rating from rating div."""
    if not rating_div:
        return None
    
    try:
        # Try to compute rating from star icons (supports half stars)
        stars_container = rating_div.find('div', class_='star-rating')
        if stars_container:
            total = 0.0
            for star in stars_container.find_all('span', class_='star-icon'):
                classes = star.get('class', [])
                if 'full' in classes:
                    total += 1.0
                elif 'half' in classes:
                    total += 0.5
            
            if total > 0:
                # Keep one decimal for halves, strip trailing .0
                rating_value = f"{total:.1f}".rstrip('0').rstrip('.')
                return {"stars": rating_value}
    except Exception:
        pass
    
    return None


def _parse_book_item(book_div) -> Dict:
    """Parse individual book item from the search results."""
    book = {}
    
    try:
        # Product ID and ISBN
        product_id = book_div.get('data-productid')
        isbn = book_div.get('data-isbn')
        if product_id:
            book["product_id"] = product_id
        if isbn:
            book["isbn"] = isbn
        
        # Title and URL
        title_link = book_div.find('a', class_='title')
        if title_link:
            book["title"] = title_link.get_text(strip=True)
            book["url"] = _clean_url(title_link.get('href', ''))
        
        # Author
        author_link = book_div.find('a', class_='text-author')
        if author_link:
            book["author"] = author_link.get_text(strip=True)
            book["author_url"] = _clean_url(author_link.get('href', ''))
        else:
            # Sometimes author is in a span without link
            author_span = book_div.find('span', class_='text-author')
            if author_span:
                book["author"] = author_span.get_text(strip=True)
        
        # Image
        img_elem = book_div.find('img', class_='img-book-jacket')
        if img_elem:
            # Prefer data-src (lazy loading) over src, fallback to src if data-src not available
            image_url = img_elem.get('data-src') or img_elem.get('src', '')
            # Skip placeholder/fallback images
            if image_url and not image_url.endswith('cover404.png') and not image_url == '/images/cover404.png':
                book["image"] = image_url
            book["image_alt"] = img_elem.get('alt', '')
        
        # Price information
        price_div = book_div.find('div', class_='book-price')
        if price_div:
            # RRP (recommended retail price)
            rrp_span = price_div.find('span', class_='price-rrp')
            if rrp_span:
                book["price_rrp"] = rrp_span.get_text(strip=True)
            
            # Actual price
            price_span = price_div.find('span', class_='price')
            if price_span:
                book["price"] = price_span.get_text(strip=True).replace('\xa0', ' ').strip()
            
            # Format
            format_span = price_div.find('span', class_='format')
            if format_span:
                book["format"] = format_span.get_text(strip=True)
            
            # Stock status
            stock_spans = price_div.find_all('span', class_='format')
            for span in stock_spans:
                text = span.get_text(strip=True)
                if 'In stock' in text or 'stock' in text.lower():
                    book["stock_status"] = text
                    break
        
        # Rating
        rating_div = book_div.find('div', class_='star-rating')
        rating = _extract_rating(book_div)
        if rating:
            book["rating"] = rating
        
    except Exception as e:
        # Skip individual book errors but log the issue
        print(f"Error parsing book: {e}")
    
    return book


def _parse_filters(soup) -> Dict:
    """Parse available filters from the sidebar."""
    filters = {}
    
    try:
        sidebar = soup.find('div', class_='search-sidebar')
        if not sidebar:
            return filters
        
        # Sort options
        sort_select = sidebar.find('select', attrs={'name': 'sort'})
        if sort_select:
            sort_options = []
            for option in sort_select.find_all('option'):
                sort_options.append({
                    "value": option.get('value'),
                    "label": option.get_text(strip=True),
                    "url": option.get('data-href', '')
                })
            filters["sort_options"] = sort_options
        
        # Filter containers
        filter_containers = sidebar.find_all('div', class_='filter-container')
        for container in filter_containers:
            header = container.find('div', class_='filter-header')
            if not header:
                continue
            
            filter_name = header.get_text(strip=True).lower()
            filter_items = []
            
            # Find filter links
            links = container.find_all('a', class_='filter-link')
            for link in links:
                filter_items.append({
                    "name": link.get_text(strip=True),
                    "url": _clean_url(link.get('href', ''))
                })
            
            # Handle special filters like price range
            if filter_name == 'price':
                price_form = container.find('form', class_='filter-range')
                if price_form:
                    min_input = price_form.find('input', attrs={'name': 'min_price'})
                    max_input = price_form.find('input', attrs={'name': 'max_price'})
                    if min_input and max_input:
                        filters[f"{filter_name}_range"] = {
                            "min_default": min_input.get('value', '0'),
                            "max_default": max_input.get('value', '5000'),
                            "form_action": price_form.get('action', '')
                        }
            
            if filter_items:
                filters[filter_name.replace(' ', '_')] = filter_items
    
    except Exception as e:
        print(f"Error parsing filters: {e}")
    
    return filters


def _parse_pagination(soup) -> Dict:
    """Parse pagination information."""
    pagination = {}
    
    try:
        pagination_div = soup.find('div', class_='pagination')
        if not pagination_div:
            return pagination
        
        # Current page
        page_form = pagination_div.find('form', class_='page-form')
        if page_form:
            page_input = page_form.find('input', attrs={'name': 'page'})
            if page_input:
                pagination["current_page"] = int(page_input.get('value', 1))
                pagination["total_pages"] = int(page_input.get('data-pagecount', 0))
        
        # Previous page
        prev_link = pagination_div.find('a', class_='prev')
        if prev_link and 'inactive' not in prev_link.get('class', []):
            pagination["prev_url"] = _clean_url(prev_link.get('href', ''))
        
        # Next page
        next_link = pagination_div.find('a', class_='next')
        if next_link and 'inactive' not in next_link.get('class', []):
            pagination["next_url"] = _clean_url(next_link.get('href', ''))
        
        # Total items
        result_tab = soup.find('span', class_='search-result-tab-all')
        if result_tab:
            total_text = result_tab.get_text(strip=True)
            # Extract number from text like "10000+ items"
            total_match = re.search(r'([\d,]+)', total_text)
            if total_match:
                pagination["total_items"] = total_match.group(1).replace(',', '')
    
    except Exception as e:
        print(f"Error parsing pagination: {e}")
    
    return pagination


def fetch_bestsellers(
    page: int = 1,
    sort: str = "bestselling",
    category: str | None = None,
    format_filter: str | None = None,
    min_price: str | None = None,
    max_price: str | None = None,
    rating: str | None = None,
    contributor: str | None = None,
    publisher: str | None = None,
    facet: str | None = None,
    cookie: str | None = None,
    user_agent: str | None = None,
    accept_language: str | None = None
) -> Dict:
    """Fetch and parse Waterstones bestsellers page.
    
    Args:
        page: Page number (default: 1)
        sort: Sort option (bestselling, price-asc, price-desc, rating, pub-date-asc, pub-date-desc)
        category: Category ID filter
        format_filter: Format ID filter
        min_price: Minimum price filter
        max_price: Maximum price filter
        rating: Rating filter (1-5)
        contributor: Author/contributor ID filter
        publisher: Publisher ID filter
        facet: Other facet filters (language, age, etc.)
        cookie: Optional cookie for bypassing Cloudflare
        user_agent: Optional custom user agent
        accept_language: Optional accept language header
        
    Returns a dict with:
    - books: list of book information
    - pagination: pagination details
    - filters: available filters and sort options
    - metadata: page metadata
    """
    
    # Build URL with parameters
    url_parts = [BESTSELLERS_BASE_URL]
    
    # Always add sort (default to bestselling if not specified)
    if sort:
        url_parts.append(f"sort/{sort}")
    else:
        url_parts.append("sort/bestselling")
    
    # Add filters before page
    if category:
        url_parts.append(f"category/{category}")
    if format_filter:
        url_parts.append(f"format/{format_filter}")
    if min_price and max_price:
        url_parts.append(f"min_price/{min_price}/max_price/{max_price}")
    if rating:
        url_parts.append(f"rating/{rating}")
    if contributor:
        url_parts.append(f"contributor/{contributor}")
    if publisher:
        url_parts.append(f"publisher/{publisher}")
    if facet:
        url_parts.append(f"facet/{facet}")
    
    # Add page at the end if not first page
    if page > 1:
        url_parts.append(f"page/{page}")
    
    full_url = "/".join(url_parts)
    
    # Check cache first
    cache_key = _get_cache_key(full_url, cookie, user_agent, accept_language)
    cached_result = _get_from_cache(cache_key)
    if cached_result:
        cached_result["cached"] = True
        cached_result["cache_key"] = cache_key
        return cached_result
    
    client, client_type = _get_client(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
    
    # Fetch the page
    try:
        resp = client.get(full_url, timeout=20)
        if resp.status_code == 200:
            pass
        elif resp.status_code == 403:
            # Try different strategies for 403
            if client_type == "curl_cffi":
                try:
                    from curl_cffi import requests as cf_requests
                    headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                    alt_client = cf_requests.Session(impersonate="chrome110")
                    alt_client.headers.update(headers)
                    resp = alt_client.get(full_url, timeout=20)
                except Exception:
                    pass
            
            if resp.status_code == 403:
                try:
                    import cloudscraper
                    headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                    scraper = cloudscraper.create_scraper()
                    scraper.headers.update(headers)
                    resp = scraper.get(full_url, timeout=20)
                except Exception:
                    pass
            
            if resp.status_code == 403:
                headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                alt = requests.Session()
                alt.headers.update(headers)
                resp = alt.get(full_url, timeout=20)
        
        resp.raise_for_status()
        
    except Exception as e:
        error_msg = f"Failed to fetch bestsellers page (status {getattr(resp, 'status_code', 'unknown')}). "
        
        if not cookie:
            error_msg += "No cookie provided. To bypass Cloudflare:\n"
            error_msg += "1. Open Waterstones.com in your browser\n"
            error_msg += "2. Open Developer Tools (F12) > Application/Storage > Cookies\n"
            error_msg += "3. Copy the 'cf_clearance' cookie value\n"
            error_msg += "4. Pass it via X-Cookie header or set WATERSTONES_COOKIE environment variable."
        else:
            error_msg += "Cookie provided but still blocked. The cookie may be expired or invalid."
        
        raise RuntimeError(error_msg) from e

    soup = BeautifulSoup(resp.text, "html.parser")

    # Initialize result structure
    result = {
        "books": [],
        "pagination": {},
        "filters": {},
        "metadata": {},
        "cached": False,
        "cache_key": cache_key
    }

    # Extract page title
    title_elem = soup.find('h1', class_='alternate')
    if title_elem:
        result["metadata"]["title"] = title_elem.get_text(strip=True)

    # Extract breadcrumbs
    breadcrumbs_p = soup.find('p', class_='breadcrumbs')
    if breadcrumbs_p:
        breadcrumbs = []
        for link in breadcrumbs_p.find_all('a'):
            breadcrumbs.append({
                "name": link.get_text(strip=True),
                "url": _clean_url(link.get('href', ''))
            })
        result["metadata"]["breadcrumbs"] = breadcrumbs

    # Parse pagination
    result["pagination"] = _parse_pagination(soup)

    # Parse filters
    result["filters"] = _parse_filters(soup)

    # Extract books
    search_results = soup.find('div', class_='search-results-list')
    if search_results:
        book_items = search_results.find_all('div', class_='book-preview')
        
        for book_div in book_items:
            book = _parse_book_item(book_div)
            if book.get("title"):  # Only add books with titles
                result["books"].append(book)

    # Set final counts
    result["metadata"]["books_count"] = len(result["books"])
    result["metadata"]["current_page"] = page
    result["metadata"]["sort"] = sort
    result["metadata"]["url"] = full_url

    # Cache the result
    _set_cache(cache_key, result.copy())
    
    return result


def clear_cache() -> Dict[str, object]:
    """Clear all cached data and return stats."""
    global _cache
    cache_size = len(_cache)
    _cache.clear()
    return {
        "message": "Cache cleared",
        "entries_removed": cache_size,
        "cache_size": len(_cache)
    }


def get_cache_stats() -> Dict[str, object]:
    """Get cache statistics."""
    current_time = time.time()
    valid_entries = 0
    expired_entries = 0
    
    for cache_key, (data, timestamp) in _cache.items():
        if current_time - timestamp < CACHE_TTL:
            valid_entries += 1
        else:
            expired_entries += 1
    
    return {
        "total_entries": len(_cache),
        "valid_entries": valid_entries,
        "expired_entries": expired_entries,
        "cache_ttl_seconds": CACHE_TTL,
        "cache_keys": list(_cache.keys())
    }


def bestsellers_debug_info(cookie: str | None = None) -> Dict[str, object]:
    """Return non-sensitive debug details to help diagnose 403 issues."""
    info: Dict[str, object] = {}
    info["has_cookie_env"] = bool(os.environ.get("WATERSTONES_COOKIE") or os.environ.get("WATERSTONES_COOKIES"))
    info["has_cookie_arg"] = bool(cookie)
    info["default_user_agent"] = BASE_HEADERS.get("User-Agent")
    info["env_user_agent_set"] = bool(os.environ.get("WATERSTONES_USER_AGENT"))
    
    # Check curl_cffi availability
    try:
        from curl_cffi import requests as cf_requests  # type: ignore
        info["curl_cffi_available"] = True
        info["curl_cffi_version"] = getattr(cf_requests, "__version__", "unknown")
    except ImportError:
        info["curl_cffi_available"] = False
        info["curl_cffi_error"] = "Not installed"
    except Exception as e:
        info["curl_cffi_available"] = False
        info["curl_cffi_error"] = str(e)
    
    # Check cloudscraper availability
    try:
        import cloudscraper  # type: ignore
        info["cloudscraper_available"] = True
        info["cloudscraper_version"] = getattr(cloudscraper, "__version__", "unknown")
    except ImportError:
        info["cloudscraper_available"] = False
        info["cloudscraper_error"] = "Not installed"
    except Exception as e:
        info["cloudscraper_available"] = False
        info["cloudscraper_error"] = str(e)
    
    return info


# Helper functions for common use cases
def get_bestsellers_page(page: int = 1, **kwargs) -> Dict:
    """Get a specific page of bestsellers."""
    return fetch_bestsellers(page=page, **kwargs)


def get_bestsellers_by_category(category_id: str, **kwargs) -> Dict:
    """Get bestsellers filtered by category."""
    return fetch_bestsellers(category=category_id, **kwargs)


def get_bestsellers_by_format(format_id: str, **kwargs) -> Dict:
    """Get bestsellers filtered by format."""
    return fetch_bestsellers(format_filter=format_id, **kwargs)


def get_bestsellers_sorted(sort_option: str, **kwargs) -> Dict:
    """Get bestsellers with specific sorting."""
    return fetch_bestsellers(sort=sort_option, **kwargs)


def search_bestsellers_price_range(min_price: str, max_price: str, **kwargs) -> Dict:
    """Get bestsellers within a price range."""
    return fetch_bestsellers(min_price=min_price, max_price=max_price, **kwargs)