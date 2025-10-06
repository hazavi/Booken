// API Types
export interface Book {
  title: string;
  author: string;
  image: string;
  price: string;
  url: string;
  isbn: string;
  format: string;
  alt_text: string;
  product_id: string;
}

export interface BookSection {
  title: string;
  books: Book[];
  see_more_url?: string;
}

export interface HomepageResponse {
  data: {
    cache_key: string;
    cached: boolean;
    sections: BookSection[];
    source: string;
    timestamp: number;
    title: string;
    total_books: number;
    total_sections: number;
  };
  success: boolean;
}

export interface Author {
  name: string;
  url: string;
}

export interface Category {
  name: string;
  url: string;
}

export interface FormatInfo {
  format: string;
  pages: string;
  price: string;
  publication_date: string;
}

export interface PublisherInfo {
  dimensions: {
    depth: string;
    height: string;
    width: string;
  };
  edition: string;
  isbn: string;
  language: string;
  publisher: string;
}

export interface Rating {
  stars: string;
}

export interface MediaReview {
  content: string;
  source: string;
}

export interface BookInfo {
  authors: Author[];
  categories: Category[];
  format_info: FormatInfo;
  image: string;
  image_alt: string;
  media_reviews: MediaReview[];
  product_id: string;
  publisher_info: PublisherInfo;
  rating: Rating;
  synopsis: string;
  title: string;
  waterstones_says: string;
}

export interface Recommendation {
  author: string;
  author_url: string;
  format: string;
  image: string;
  image_alt: string;
  isbn: string;
  price: string;
  product_id: string;
  title: string;
  url: string;
}

export interface BookDetailResponse {
  data: {
    book_info: BookInfo;
    recommendations: Recommendation[];
  };
}