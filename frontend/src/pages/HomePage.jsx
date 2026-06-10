import { useEffect, useState } from 'react';
import { getBooks } from '../services/api';
import BookCard from '../components/BookCard';

function HomePage() {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');


    const [selectedCategory, setSelectedCategory] = useState('');

    async function fetchBooks() {
        try {
            const response = await getBooks();
            console.log('API RESPONSE:', response);

            const booksArray = Array.isArray(response)
                ? response
                : response.data || response.dane || [];

            setBooks(booksArray);
        } catch (error) {
            console.log(error);
            setBooks([]);
        }
    }

    useEffect(() => {
        void fetchBooks();
    }, []);

    const categories = [...new Set(books.map((book) => book.category).filter(Boolean))];

    const filteredBooks = books
        .filter((book) => {

            if (selectedCategory && book.category !== selectedCategory) {
                return false;
            }

            const search = searchTerm.toLowerCase();
            return (
                book.title?.toLowerCase().includes(search) ||
                book.author?.toLowerCase().includes(search)
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

            <p className="books-count">
                📚 Found: {filteredBooks.length} / Total: {books.length}
            </p>


            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                />


                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="sort-select"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="sort-select"
                >
                    <option value="newest">
                        Newest First
                    </option>
                    <option value="oldest">
                        Oldest First
                    </option>
                </select>
            </div>

            {filteredBooks.length === 0 ? (
                <div className="empty-state">
                    <h2>No books found</h2>
                    <p>
                        Try another title, author or category.
                    </p>
                </div>
            ) : (
                <div className="books-grid">
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomePage;