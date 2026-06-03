import { useEffect, useState } from 'react';

import { getBooks } from '../services/api';

import BookCard from '../components/BookCard';

function HomePage() {

    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    async function fetchBooks() {

        try {

            const data = await getBooks();

            console.log(data);

            setBooks(data.data || data);

        } catch (error) {

            console.log(error);

        }

    }

    useEffect(() => {

        void fetchBooks();

    }, []);

    const filteredBooks = books
        .filter((book) => {

            const search = searchTerm.toLowerCase();

            return (
                book.title
                    .toLowerCase()
                    .includes(search) ||

                book.author
                    .toLowerCase()
                    .includes(search)
            );

        })
        .sort((a, b) => {

            if (sortOrder === 'newest') {
                return b.id - a.id;
            }

            return a.id - b.id;

        });

    return (
        <div className="container">

            <h1 className="page-title">
                Book Catalog
            </h1>

            <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            <select
                value={sortOrder}
                onChange={(e) =>
                    setSortOrder(e.target.value)
                }
                className="sort-select"
            >
                <option value="newest">
                    Newest First
                </option>

                <option value="oldest">
                    Oldest First
                </option>
            </select>

            <div className="books-grid">

                {filteredBooks.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                    />
                ))}

            </div>

        </div>
    );
}

export default HomePage;