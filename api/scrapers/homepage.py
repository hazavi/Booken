import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import Dict, List
import time
import hashlib

WATERSTONES_URL = "https://www.waterstones.com/"
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


def _get_cache_key(cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None) -> str:
    """Generate a cache key based on the request parameters."""
    # Create a hash of the parameters to use as cache key
    params = f"{cookie or ''}-{user_agent or ''}-{accept_language or ''}"
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


def fetch_homepage(cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None) -> Dict:
    """Fetch and parse Waterstones homepage for H2 sections and their book content.

    Returns a dict with:
    - title: page title
    - sections: list of sections with h2 headers and their book content
    """
    # Check cache first
    cache_key = _get_cache_key(cookie, user_agent, accept_language)
    cached_result = _get_from_cache(cache_key)
    if cached_result:
        # Add cache info to result
        cached_result["cached"] = True
        cached_result["cache_key"] = cache_key
        return cached_result
    
    client, client_type = _get_client(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
    
    # First attempt
    try:
        resp = client.get(WATERSTONES_URL, timeout=20)
        if resp.status_code == 200:
            # Success!
            pass
        elif resp.status_code == 403:
            # Try different strategies for 403
            if client_type == "curl_cffi":
                # Try with different impersonation
                try:
                    from curl_cffi import requests as cf_requests
                    headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                    alt_client = cf_requests.Session(impersonate="chrome110")
                    alt_client.headers.update(headers)
                    resp = alt_client.get(WATERSTONES_URL, timeout=20)
                except Exception:
                    pass
            
            # If still 403, try cloudscraper as fallback
            if resp.status_code == 403:
                try:
                    import cloudscraper
                    headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                    scraper = cloudscraper.create_scraper()
                    scraper.headers.update(headers)
                    resp = scraper.get(WATERSTONES_URL, timeout=20)
                except Exception:
                    pass
            
            # Last resort: plain requests
            if resp.status_code == 403:
                headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                alt = requests.Session()
                alt.headers.update(headers)
                resp = alt.get(WATERSTONES_URL, timeout=20)
        
        resp.raise_for_status()
        
    except Exception as e:
        # Enhanced error message with specific guidance
        error_msg = f"Failed to fetch Waterstones homepage (status {getattr(resp, 'status_code', 'unknown')}). "
        
        if not cookie:
            error_msg += "No cookie provided. To bypass Cloudflare:\n"
            error_msg += "1. Open Waterstones.com in your browser\n"
            error_msg += "2. Open Developer Tools (F12) > Application/Storage > Cookies\n"
            error_msg += "3. Copy the 'cf_clearance' cookie value\n"
            error_msg += "4. Pass it via X-Cookie header or set WATERSTONES_COOKIE environment variable."
        else:
            error_msg += "Cookie provided but still blocked. The cookie may be expired or invalid. "
            error_msg += "Try getting a fresh cf_clearance cookie from your browser."
        
        raise RuntimeError(error_msg) from e

    soup = BeautifulSoup(resp.text, "html.parser")

    # Title
    title = (soup.title.string.strip() if soup.title and soup.title.string else "").strip()

    # Find all sections with H2 headers and extract their content
    sections = []
    
    # Look for specific book section patterns based on the HTML structure
    # Find headers with class "pages-header-row" that contain H2 elements
    section_headers = soup.find_all('header', class_='pages-header-row')
    
    for header in section_headers:
        h2 = header.find('h2')
        if not h2:
            continue
            
        h2_text = h2.get_text(strip=True)
        
        # Skip if empty
        if not h2_text:
            continue
            
        section_data = {
            "title": h2_text,
            "see_more_url": None,
            "books": []
        }
        
        # Look for "See More" button in the header
        see_more_btn = header.find('a', class_='button-see-more')
        if see_more_btn:
            see_more_href = see_more_btn.get('href', '')
            if see_more_href:
                # Keep only the relative path, not the full URL
                section_data['see_more_url'] = see_more_href if see_more_href.startswith('/') else '/' + see_more_href.lstrip('/')
        
        # Find the next sibling div that contains the book carousel
        # This should be the div with span12 class containing the swiper
        next_element = header.find_next_sibling('div', class_='span12')
        if not next_element:
            continue
            
        # Look for book items in swiper slides
        book_elements = next_element.find_all('div', class_=['swiper-slide', 'book-preview'])
        
        for book_elem in book_elements:
            try:
                # Skip if this doesn't have book data attributes
                if not book_elem.get('data-isbn') and not book_elem.get('data-productid'):
                    continue
                    
                # Extract book information
                book_data = {}
                
                # Book title
                title_elem = book_elem.find('a', class_='title')
                if title_elem:
                    book_data['title'] = title_elem.get_text(strip=True)
                    # Keep only the relative path, not the full URL
                    href = title_elem.get('href', '')
                    book_data['url'] = href if href.startswith('/') else '/' + href.lstrip('/')
                
                # Author
                author_elem = book_elem.find(['a', 'span'], class_='text-author')
                if author_elem:
                    book_data['author'] = author_elem.get_text(strip=True)
                
                # Book image
                img_elem = book_elem.find('img', class_='img-book-jacket')
                if img_elem:
                    # Prefer data-src (lazy loading) over src, fallback to src if data-src not available
                    image_url = img_elem.get('data-src') or img_elem.get('src', '')
                    # Skip placeholder/fallback images
                    if image_url and not image_url.endswith('cover404.png') and not image_url == '/images/cover404.png':
                        book_data['image'] = image_url
                    book_data['alt_text'] = img_elem.get('alt', '')
                
                # Price information
                price_elem = book_elem.find('span', class_='price')
                if price_elem:
                    book_data['price'] = price_elem.get_text(strip=True)
                
                # Format
                format_elem = book_elem.find('span', class_='format')
                if format_elem:
                    book_data['format'] = format_elem.get_text(strip=True)
                
                # ISBN or product ID
                isbn = book_elem.get('data-isbn')
                product_id = book_elem.get('data-productid')
                if isbn:
                    book_data['isbn'] = isbn
                if product_id:
                    book_data['product_id'] = product_id
                
                # Only add if we have at least a title
                if book_data.get('title'):
                    section_data['books'].append(book_data)
                    
            except Exception as book_error:
                # Skip individual book errors
                continue
        
        # Only add section if it has books
        if section_data['books']:
            sections.append(section_data)

    result = {
        "source": WATERSTONES_URL,
        "title": title,
        "sections": sections,
        "total_sections": len(sections),
        "total_books": sum(len(section['books']) for section in sections),
        "cached": False,
        "cache_key": cache_key,
        "timestamp": time.time()
    }
    
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


def homepage_debug_info(cookie: str | None = None) -> Dict[str, object]:
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
