import type { Book as HomePageBook } from "./types";
import type { Book as BestsellerBook } from "./books";

/**
 * Converts a bestseller book to homepage book format
 * This ensures compatibility with the optimized BookCard component
 */
export function adaptBestsellerBook(book: BestsellerBook): HomePageBook {
  return {
    title: book.title,
    author: book.author,
    image: book.image,
    price: book.price,
    url: book.url,
    isbn: book.isbn,
    format: book.format,
    alt_text: book.image_alt || book.title,
    product_id: book.isbn, // Use ISBN as product_id for now
  };
}

/**
 * Converts multiple bestseller books to homepage book format
 */
export function adaptBestsellerBooks(books: BestsellerBook[]): HomePageBook[] {
  return books.map(adaptBestsellerBook);
}