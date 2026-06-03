import { Link } from 'react-router-dom';

function BookCard({ book }) {

  return (
      <Link
          to={`/books/${book.id}`}
          className="book-card"
      >

        <h2>{book.title}</h2>

        <p className="book-author">
          Author: {book.author}
        </p>

        <p className="book-description">
          {
            book.description.length > 120
                ? `${book.description.substring(0, 120)}...`
                : book.description
          }
        </p>

        <div className="book-read-more">
          Read More →
        </div>

      </Link>
  );
}

export default BookCard;