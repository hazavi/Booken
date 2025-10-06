import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List
import time
import hashlib
import re

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


def _get_cache_key(book_url: str, cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None) -> str:
    """Generate a cache key based on the request parameters."""
    # Create a hash of the parameters to use as cache key
    params = f"{book_url}-{cookie or ''}-{user_agent or ''}-{accept_language or ''}"
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


def fetch_book_detail(book_url: str, cookie: str | None = None, user_agent: str | None = None, accept_language: str | None = None) -> Dict:
    """Fetch and parse Waterstones book detail page.

    Args:
        book_url: Either a full URL or a relative path like '/book/...'
        
    Returns a dict with:
    - book_info: detailed book information
    - recommendations: list of recommended books
    """
    # Normalize the book URL
    if book_url.startswith('/'):
        full_url = WATERSTONES_URL.rstrip('/') + book_url
    elif book_url.startswith('http'):
        full_url = book_url
    else:
        full_url = WATERSTONES_URL.rstrip('/') + '/' + book_url.lstrip('/')
    
    # Check cache first
    cache_key = _get_cache_key(book_url, cookie, user_agent, accept_language)
    cached_result = _get_from_cache(cache_key)
    if cached_result:
        # Add cache info to result
        cached_result["cached"] = True
        cached_result["cache_key"] = cache_key
        return cached_result
    
    client, client_type = _get_client(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
    
    # First attempt
    try:
        resp = client.get(full_url, timeout=20)
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
                    resp = alt_client.get(full_url, timeout=20)
                except Exception:
                    pass
            
            # If still 403, try cloudscraper as fallback
            if resp.status_code == 403:
                try:
                    import cloudscraper
                    headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                    scraper = cloudscraper.create_scraper()
                    scraper.headers.update(headers)
                    resp = scraper.get(full_url, timeout=20)
                except Exception:
                    pass
            
            # Last resort: plain requests
            if resp.status_code == 403:
                headers = _build_headers(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
                alt = requests.Session()
                alt.headers.update(headers)
                resp = alt.get(full_url, timeout=20)
        
        resp.raise_for_status()
        
    except Exception as e:
        # Enhanced error message with specific guidance
        error_msg = f"Failed to fetch book detail page (status {getattr(resp, 'status_code', 'unknown')}). "
        
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

    # Find the main container
    main_container = soup.find('div', class_='main-container')
    if not main_container:
        raise RuntimeError("Could not find main-container div")

    # Initialize result structure
    result = {
        "book_info": {},
        "recommendations": [],
        "cached": False,
        "cache_key": cache_key
    }

    # Extract breadcrumbs
    breadcrumbs_div = main_container.find('div', class_='breadcrumbs')
    if breadcrumbs_div:
        categories = []
        category_links = breadcrumbs_div.find_all('a')
        for link in category_links:
            categories.append({
                "name": link.get_text(strip=True),
                "url": _clean_url(link.get('href', ''))
            })
        result["book_info"]["categories"] = categories

    # Find the book detail section
    book_detail_section = main_container.find('section', class_='book-detail')
    if book_detail_section:
        # Extract basic book information
        book_info = result["book_info"]
        
        # Product ID
        product_id = book_detail_section.get('data-productid')
        if product_id:
            book_info["product_id"] = product_id
        
        # Book image
        img_elem = book_detail_section.find('img', class_='img-book-jacket')
        if img_elem:
            # Prefer data-src (lazy loading) over src, fallback to src if data-src not available
            image_url = img_elem.get('data-src') or img_elem.get('src', '')
            # Skip placeholder/fallback images
            if image_url and not image_url.endswith('cover404.png') and not image_url == '/images/cover404.png':
                book_info["image"] = image_url
            book_info["image_alt"] = img_elem.get('alt', '')
        
        # Title
        title_elem = book_detail_section.find('h1', class_='title')
        if title_elem:
            book_title_span = title_elem.find('span', class_='book-title')
            if book_title_span:
                book_info["title"] = book_title_span.get_text(strip=True)
        
        # Authors
        contributors_span = book_detail_section.find('span', class_='contributors')
        if contributors_span:
            authors = []
            author_links = contributors_span.find_all('a', class_='text-author')
            for author_link in author_links:
                author_name = author_link.get_text(strip=True)
                author_url = _clean_url(author_link.get('href', ''))
                authors.append({
                    "name": author_name,
                    "url": author_url
                })
            book_info["authors"] = authors
        
        # Rating
        rating_div = book_detail_section.find('div', class_='rating')
        if rating_div:
            # Try to compute rating from star icons first (supports half stars)
            computed_rating_value: str | None = None
            try:
                stars_container = rating_div.find('div', class_='star-rating')
                if not stars_container:
                    # Some pages may place star-rating outside of rating_div
                    stars_container = book_detail_section.find('div', class_='star-rating')
                if stars_container:
                    total = 0.0
                    for s in stars_container.find_all('span'):
                        classes = s.get('class', [])
                        # Classes typically like ["star-icon", "full"] or ["star-icon", "half"]
                        if 'full' in classes:
                            total += 1.0
                        elif 'half' in classes:
                            total += 0.5
                    # Normalize to one decimal place if needed
                    if total > 0:
                        # Keep one decimal for halves, strip trailing .0
                        computed_rating_value = (f"{total:.1f}").rstrip('0').rstrip('.')
            except Exception:
                # Fallbacks below will handle if this fails
                pass

            # Fallback to meta values if present
            rating_value_meta = rating_div.find('meta', attrs={'itemprop': 'ratingValue'})
            review_count_meta = rating_div.find('meta', attrs={'itemprop': 'reviewCount'})

            rating_value = computed_rating_value or (rating_value_meta.get('content') if rating_value_meta else None)

            # Only include stars per request (no review_count in output)
            if rating_value:
                book_info["rating"] = {
                    "stars": rating_value
                }
        
        # Price and format information
        formats_div = book_detail_section.find('div', class_='formats-list')
        if formats_div:
            format_info = {}
            
            # Price
            price_elem = formats_div.find('b', attrs={'itemprop': 'price'})
            if price_elem:
                format_info["price"] = price_elem.get_text(strip=True)
            
            # Format name
            format_span = formats_div.find('span', class_='name')
            if format_span:
                format_info["format"] = format_span.get_text(strip=True)
            
            # Pages
            pages_span = formats_div.find('span', attrs={'itemprop': 'numberOfPages'})
            if pages_span:
                format_info["pages"] = pages_span.get_text(strip=True)
            
            # Publication date
            date_meta = formats_div.find('meta', attrs={'itemprop': 'datePublished'})
            if date_meta:
                format_info["publication_date"] = date_meta.get('content')
            
            book_info["format_info"] = format_info

    # Extract synopsis/description from tabs
    tabs_section = main_container.find('section', class_='book-info-tabs')
    if tabs_section:
        # Synopsis
        synopsis_div = tabs_section.find('div', attrs={'itemprop': 'description'})
        if synopsis_div:
            synopsis_paragraphs = synopsis_div.find_all('p')
            synopsis_text = ' '.join([p.get_text(strip=True) for p in synopsis_paragraphs])
            book_info["synopsis"] = synopsis_text
        
        # Waterstones Says section
        waterstones_says_div = tabs_section.find('div', class_='pdp-waterstones-says')
        if waterstones_says_div:
            waterstones_text = waterstones_says_div.find('p')
            if waterstones_text:
                book_info["waterstones_says"] = waterstones_text.get_text(strip=True)
        
        # Publisher information
        spec_div = tabs_section.find('div', class_='pdp-spec')
        if spec_div:
            publisher_info = {}
            
            # Publisher
            publisher_span = spec_div.find('span', attrs={'itemprop': 'publisher'})
            if publisher_span:
                publisher_info["publisher"] = publisher_span.get_text(strip=True)
            
            # ISBN
            isbn_span = spec_div.find('span', attrs={'itemprop': 'isbn'})
            if isbn_span:
                publisher_info["isbn"] = isbn_span.get_text(strip=True)
            
            # Dimensions
            height_span = spec_div.find('span', attrs={'itemprop': 'height'})
            width_span = spec_div.find('span', attrs={'itemprop': 'width'})
            depth_span = spec_div.find('span', attrs={'itemprop': 'depth'})
            
            if height_span and width_span and depth_span:
                publisher_info["dimensions"] = {
                    "height": height_span.get_text(strip=True),
                    "width": width_span.get_text(strip=True),
                    "depth": depth_span.get_text(strip=True)
                }
            
            # Language
            language_span = spec_div.find('span', attrs={'itemprop': 'inLanguage'})
            if language_span:
                publisher_info["language"] = language_span.get_text(strip=True)
            
            # Edition
            edition_span = spec_div.find('span', attrs={'itemprop': 'bookEdition'})
            if edition_span:
                publisher_info["edition"] = edition_span.get_text(strip=True)
            
            book_info["publisher_info"] = publisher_info
        
        # Media reviews
        media_reviews_div = tabs_section.find('div', class_='show-desc')
        if media_reviews_div:
            review_paragraphs = media_reviews_div.find_all('p')
            reviews = []
            for p in review_paragraphs:
                review_text = p.get_text(strip=True)
                if review_text and '-' in review_text:
                    # Try to extract source from review text
                    parts = review_text.rsplit('-', 1)
                    if len(parts) == 2:
                        review_content = parts[0].strip()
                        source = parts[1].strip()
                        reviews.append({
                            "content": review_content,
                            "source": source
                        })
            if reviews:
                book_info["media_reviews"] = reviews

    # Extract recommendations
    recommendations_section = main_container.find('section', class_='book-recommends')
    if recommendations_section:
        # Find swiper slides containing book recommendations
        book_slides = recommendations_section.find_all('div', class_='swiper-slide')
        
        for slide in book_slides:
            if 'book-preview' not in slide.get('class', []):
                continue
                
            try:
                recommendation = {}
                
                # ISBN and product ID
                isbn = slide.get('data-isbn')
                product_id = slide.get('data-productid')
                if isbn:
                    recommendation["isbn"] = isbn
                if product_id:
                    recommendation["product_id"] = product_id
                
                # Title and URL
                title_link = slide.find('a', class_='title')
                if title_link:
                    recommendation["title"] = title_link.get_text(strip=True)
                    recommendation["url"] = _clean_url(title_link.get('href', ''))
                
                # Author
                author_link = slide.find('a', class_='text-author')
                if author_link:
                    recommendation["author"] = author_link.get_text(strip=True)
                    recommendation["author_url"] = _clean_url(author_link.get('href', ''))
                
                # Image
                img_elem = slide.find('img', class_='img-book-jacket')
                if img_elem:
                    # Prefer data-src (lazy loading) over src, fallback to src if data-src not available
                    image_url = img_elem.get('data-src') or img_elem.get('src', '')
                    # Skip placeholder/fallback images
                    if image_url and not image_url.endswith('cover404.png') and not image_url == '/images/cover404.png':
                        recommendation["image"] = image_url
                    recommendation["image_alt"] = img_elem.get('alt', '')
                
                # Price
                price_span = slide.find('span', class_='price')
                if price_span:
                    recommendation["price"] = price_span.get_text(strip=True)
                
                # Format
                format_span = slide.find('span', class_='format')
                if format_span:
                    recommendation["format"] = format_span.get_text(strip=True)
                
                # Only add if we have at least a title
                if recommendation.get("title"):
                    result["recommendations"].append(recommendation)
                    
            except Exception:
                # Skip individual recommendation errors
                continue

    # Set final counts
    result["total_recommendations"] = len(result["recommendations"])
    
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


def book_detail_debug_info(cookie: str | None = None) -> Dict[str, object]:
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