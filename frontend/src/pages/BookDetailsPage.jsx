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

                <h1>Loading...</h1>

            </div>

        );

    }

    return (

        <div className="container">

            <h1 className="page-title">
                {book.title}
            </h1>

            <h2 className="book-author">
                {book.author}
            </h2>

            <p className="book-description">
                {book.description}
            </p>

            <br />

            <p>
                Created: {
                new Date(
                    book.created_at
                ).toLocaleDateString(
                    'uk-UA'
                )
            }
            </p>

        </div>

    );

}

export default BookDetailsPage;