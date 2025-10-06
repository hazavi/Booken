from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from scrapers.homepage import fetch_homepage, clear_cache as clear_homepage_cache, get_cache_stats as get_homepage_cache_stats
from scrapers.book_detail import fetch_book_detail, clear_cache as clear_book_detail_cache, get_cache_stats as get_book_detail_cache_stats

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# No global scraper instance needed for homepage fetch

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'message': 'Scraping API is running!',
        'status': 'healthy'
    })

@app.route('/api/homepage', methods=['GET', 'POST'])
def scrape_waterstones_homepage():
    """Return key content from Waterstones homepage.

    Explicitly scoped to the public homepage and avoids generic arbitrary-URL scraping.
    """
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

        data = fetch_homepage(cookie=cookie, user_agent=user_agent, accept_language=accept_language)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/book/<path:book_path>', methods=['GET', 'POST'])
def scrape_book_detail(book_path):
    """Return detailed information about a specific book.
    
    Args:
        book_path: The book path like 'the-courage-to-be-disliked/ichiro-kishimi/fumitake-koga/9781760630737'
    """
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

@app.route('/cache/stats', methods=['GET'])
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
        else:
            # Return stats for both scrapers
            homepage_stats = get_homepage_cache_stats()
            book_detail_stats = get_book_detail_cache_stats()
            return jsonify({
                "success": True, 
                "data": {
                    "homepage": homepage_stats,
                    "book_detail": book_detail_stats
                }
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/cache/clear', methods=['POST'])
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
        else:
            # Clear both caches
            homepage_result = clear_homepage_cache()
            book_detail_result = clear_book_detail_cache()
            return jsonify({
                "success": True, 
                "data": {
                    "homepage": homepage_result,
                    "book_detail": book_detail_result
                }
            })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Web Scraping API...")
    print("API will be available at: http://localhost:5000")
    print("Waterstones homepage scraper: http://localhost:5000/api/homepage")
    print("Book detail scraper: http://localhost:5000/api/book/<book_path>")
    print("  Example: http://localhost:5000/api/book/the-courage-to-be-disliked/ichiro-kishimi/fumitake-koga/9781760630737")
    print("Cache stats: http://localhost:5000/cache/stats")
    print("Clear cache: POST http://localhost:5000/cache/clear")
    app.run(debug=True, host='0.0.0.0', port=5000)