import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { getBookById } from '../services/api';

function BookDetailsPage() {

    const { id } = useParams();

    const [book, setBook] = useState(null);

    async function fetchBook() {

        try {

            const data = await getBookById(id);

            setBook(data.data);

        } catch (error) {

            console.log(error);

        }

    }

    useEffect(() => {

        void fetchBook();

    }, [id]);

    if (!book) {

        return (

            <div className="container">

                <div className="book-details">

                    <h2>Loading book...</h2>

                </div>

            </div>

        );

    }

    return (

        <div className="container">

            <div className="book-details">

                <h1 className="page-title">
                    📖 {book.title}
                </h1>

                <h3>
                    👤 Author
                </h3>

                <p className="book-author">
                    {book.author}
                </p>

                <br />

                <h3>
                    🏷️ Category
                </h3>

                <p className="book-category">
                    {book.category}
                </p>

                <br />

                <h3>
                    📝 Description
                </h3>

                <p className="book-description">
                    {book.description}
                </p>

                <br />

                <h3>
                    📅 Created
                </h3>

                <p>
                    {new Date(
                        book.created_at
                    ).toLocaleDateString(
                        'uk-UA'
                    )}
                </p>

            </div>

        </div>

    );

}

export default BookDetailsPage;