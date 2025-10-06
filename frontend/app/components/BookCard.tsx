import Image from "next/image";
import Link from "next/link";

interface Book {
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

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const bookUrl = book.url;

  return (
    <Link href={bookUrl} className="book-card-link">
      <div className="book-card">
        <div className="book-image-container">
          <Image
            src={book.image}
            alt={book.alt_text}
            fill
            className="book-image"
            sizes="200px"
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
