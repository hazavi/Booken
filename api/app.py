from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from functools import wraps

# Only load dotenv locally, not on Vercel
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

# Import scrapers after environment is loaded
from scrapers.homepage import fetch_homepage, clear_cache as clear_homepage_cache, get_cache_stats as get_homepage_cache_stats
from scrapers.book_detail import fetch_book_detail, clear_cache as clear_book_detail_cache, get_cache_stats as get_book_detail_cache_stats
from scrapers.bestsellers import fetch_bestsellers, clear_cache as clear_bestsellers_cache, get_cache_stats as get_bestsellers_cache_stats

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get API key from environment
API_KEY = os.getenv('API_KEY')

def require_api_key(f):
    """Decorator to require API key for protected endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for API key in headers or query parameters
        provided_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        
        if not provided_key:
            return jsonify({
                'success': False,
                'error': 'API key required',
                'message': 'Please provide an API key in X-API-Key header or api_key query parameter'
            }), 401
        
        if provided_key != API_KEY:
            return jsonify({
                'success': False,
                'error': 'Invalid API key',
                'message': 'The provided API key is invalid'
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function

# No global scraper instance needed for homepage fetch

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'message': 'Scraping API is running!',
        'status': 'healthy',
        'endpoints': {
            'homepage': '/api/homepage',
            'book_detail': '/api/book/<book_path>',
            'bestsellers': '/api/books/bestsellers',
            'bestsellers_page': '/api/books/bestsellers/page/<page>',
            'bestsellers_sort': '/api/books/bestsellers/sort/<sort_option>',
            'bestsellers_category': '/api/books/bestsellers/category/<category_id>',
            'bestsellers_format': '/api/books/bestsellers/format/<format_id>',
            'bestsellers_price': '/api/books/bestsellers/price/<min_price>/<max_price>',
            'bestsellers_rating': '/api/books/bestsellers/rating/<rating_stars>',
            'bestsellers_author': '/api/books/bestsellers/author/<contributor_id>',
            'bestsellers_publisher': '/api/books/bestsellers/publisher/<publisher_id>',
            'bestsellers_facet': '/api/books/bestsellers/facet/<facet_id>',
            'bestsellers_filter': '/api/books/bestsellers/filter',
            'cache_stats': '/cache/stats',
            'clear_cache': '/cache/clear'
        }
    })

@app.route('/api/homepage', methods=['GET', 'POST'])
@require_api_key
def scrape_waterstones_homepage():
    try:
        # Support optional cookie / UA overrides via headers or JSON body
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language

        # If no cookie provided, use the one from environment (app.py loaded it)
        if not cookie:
            cookie = os.getenv('WATERSTONES_COOKIE') or os.getenv('WATERSTONES_COOKIES')
        
        data = fetch_homepage(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"ERROR in homepage endpoint: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/book/<path:book_path>', methods=['GET', 'POST'])
@require_api_key
def scrape_book_detail(book_path):
    try:
        # Support optional cookie / UA overrides via headers or JSON body
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language

        # Construct the book URL path
        book_url = f"/book/{book_path}"
        
        data = fetch_book_detail(book_url, cookie=cookie, user_agent=user_agent, accept_language=accept_language)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers():
    try:
        # Support optional cookie / UA overrides via headers or JSON body
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        # Extract query parameters
        params = {}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            # Merge POST body params
            params.update(body)
        
        # Get parameters from query string (overrides POST body)
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/page/<int:page>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_page(page):
    """Return bestselling books from Waterstones for a specific page.
    
    Path parameters:
        page: Page number
        
    Query parameters:
        sort: Sort option (bestselling, price-asc, price-desc, rating, pub-date-asc, pub-date-desc)
        category: Category ID filter
        format: Format ID filter  
        min_price: Minimum price filter
        max_price: Maximum price filter
        rating: Rating filter (1-5)
        contributor: Author/contributor ID filter
        publisher: Publisher ID filter
        facet: Other facet filters (language, age, etc.)
    """
    try:
        # Support optional cookie / UA overrides via headers or JSON body
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        # Extract query parameters
        params = {'page': page}  # Set page from URL parameter
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            # Merge POST body params (but don't override page from URL)
            for key, value in body.items():
                if key != 'page':
                    params[key] = value
        
        # Get parameters from query string (overrides POST body but not page from URL)
        params.update({
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Specific filter endpoints for all sidebar options
@app.route('/api/books/bestsellers/sort/<sort_option>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_sort(sort_option):
    """Return bestselling books with specific sorting."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'sort': sort_option}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'sort'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/category/<category_id>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_category(category_id):
    """Return bestselling books filtered by category."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'category': category_id}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'category'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/format/<format_id>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_format(format_id):
    """Return bestselling books filtered by format."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'format_filter': format_id}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'format_filter'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/price/<min_price>/<max_price>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_price_range(min_price, max_price):
    """Return bestselling books filtered by price range."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'min_price': min_price, 'max_price': max_price}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k not in ['min_price', 'max_price']})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/rating/<rating_stars>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_rating(rating_stars):
    """Return bestselling books filtered by rating."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'rating': rating_stars}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'rating'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/author/<contributor_id>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_author(contributor_id):
    """Return bestselling books filtered by author/contributor."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'contributor': contributor_id}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'contributor'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/publisher/<publisher_id>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_publisher(publisher_id):
    """Return bestselling books filtered by publisher."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'publisher': publisher_id}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'publisher'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/facet/<facet_id>', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_facet(facet_id):
    """Return bestselling books filtered by facet (language, age, geographic region, etc.)."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {'facet': facet_id}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update({k: v for k, v in body.items() if k != 'facet'})
        
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/books/bestsellers/filter', methods=['GET', 'POST'])
@require_api_key
def scrape_bestsellers_multiple_filters():
    """Return bestselling books with multiple filters applied via query parameters."""
    try:
        cookie = request.headers.get('X-Cookie') or request.headers.get('Cookie') or request.args.get('cookie')
        user_agent = request.headers.get('X-User-Agent') or request.headers.get('User-Agent') or request.args.get('user_agent')
        accept_language = request.headers.get('X-Accept-Language') or request.headers.get('Accept-Language') or request.args.get('accept_language')
        
        params = {}
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            cookie = body.get('cookie') or cookie
            user_agent = body.get('user_agent') or user_agent
            accept_language = body.get('accept_language') or accept_language
            params.update(body)
        
        # Support all filter combinations through query parameters
        params.update({
            'page': int(request.args.get('page', params.get('page', 1))),
            'sort': request.args.get('sort', params.get('sort', 'bestselling')),
            'category': request.args.get('category', params.get('category')),
            'format_filter': request.args.get('format', params.get('format_filter')),
            'min_price': request.args.get('min_price', params.get('min_price')),
            'max_price': request.args.get('max_price', params.get('max_price')),
            'rating': request.args.get('rating', params.get('rating')),
            'contributor': request.args.get('contributor', params.get('contributor')),
            'publisher': request.args.get('publisher', params.get('publisher')),
            'facet': request.args.get('facet', params.get('facet')),
        })
        
        params = {k: v for k, v in params.items() if v is not None}
        
        data = fetch_bestsellers(
            cookie=cookie,
            user_agent=user_agent,
            accept_language=accept_language,
            **params
        )
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/cache/stats', methods=['GET'])
@require_api_key
def cache_stats():
    """Get cache statistics."""
    try:
        scraper = request.args.get('scraper', 'all')
        
        if scraper == 'homepage':
            stats = get_homepage_cache_stats()
            return jsonify({"success": True, "data": {"homepage": stats}})
        elif scraper == 'book_detail':
            stats = get_book_detail_cache_stats()
            return jsonify({"success": True, "data": {"book_detail": stats}})
        elif scraper == 'bestsellers':
            stats = get_bestsellers_cache_stats()
            return jsonify({"success": True, "data": {"bestsellers": stats}})
        else:
            # Return stats for all scrapers
            homepage_stats = get_homepage_cache_stats()
            book_detail_stats = get_book_detail_cache_stats()
            bestsellers_stats = get_bestsellers_cache_stats()
            return jsonify({
                "success": True, 
                "data": {
                    "homepage": homepage_stats,
                    "book_detail": book_detail_stats,
                    "bestsellers": bestsellers_stats
                }
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/cache/clear', methods=['POST'])
@require_api_key
def clear_cache_endpoint():
    """Clear the cache."""
    try:
        scraper = request.args.get('scraper', 'all')
        
        if scraper == 'homepage':
            result = clear_homepage_cache()
            return jsonify({"success": True, "data": {"homepage": result}})
        elif scraper == 'book_detail':
            result = clear_book_detail_cache()
            return jsonify({"success": True, "data": {"book_detail": result}})
        elif scraper == 'bestsellers':
            result = clear_bestsellers_cache()
            return jsonify({"success": True, "data": {"bestsellers": result}})
        else:
            # Clear all caches
            homepage_result = clear_homepage_cache()
            book_detail_result = clear_book_detail_cache()
            bestsellers_result = clear_bestsellers_cache()
            return jsonify({
                "success": True, 
                "data": {
                    "homepage": homepage_result,
                    "book_detail": book_detail_result,
                    "bestsellers": bestsellers_result
                }
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Vercel serverless function handler
handler = app

if __name__ == '__main__':
    print("Starting Web Scraping API...")
    print("API will be available at: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)