import Link from "next/link";
import SafeImage from "./SafeImage";
import type { Book } from "../lib/types";

interface BookCardProps {
  book: Book;
  priority?: boolean;
  sizes?: string;
}

export default function BookCard({
  book,
  priority = false,
  sizes = "(max-width: 480px) 400px, (max-width: 768px) 600px, (max-width: 1024px) 500px, 800px",
}: BookCardProps) {
  const bookUrl = book.url;

  return (
    <Link href={bookUrl} className="book-card-link">
      <div className="book-card">
        <div className="book-image-container">
          <SafeImage
            src={book.image}
            alt={book.alt_text || book.title}
            fill
            className="book-image"
            sizes={sizes}
            priority={priority}
            quality={100}
          />
          <div className="book-overlay"></div>
        </div>

        <div className="book-content">
          <h3 className="book-title" title={book.title}>
            {book.title}
          </h3>
          <p className="book-author">{book.author}</p>
          <div className="book-footer">
            <span className="book-price">{book.price}</span>
            <span className="book-format">{book.format}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
