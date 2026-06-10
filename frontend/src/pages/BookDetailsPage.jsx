import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookById, getComments, createComment, addRating } from '../services/api';

function BookDetailsPage() {
    const { id } = useParams();

    const [book, setBook] = useState(null);
    const [comments, setComments] = useState([]);


    const [authorName, setAuthorName] = useState('');
    const [content, setContent] = useState('');


    const [commentError, setCommentError] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');


    async function fetchBookAndComments() {
        try {
            const bookData = await getBookById(id);
            setBook(bookData);

            const commentsData = await getComments(id);
            setComments(commentsData);
        } catch (error) {
            console.log("Błąd ładowania danych:", error);
        }
    }

    useEffect(() => {
        void fetchBookAndComments();
    }, [id]);

    // Обробка відправки коментаря
    async function handleCommentSubmit(event) {
        event.preventDefault();
        setCommentError('');

        if (!authorName.trim() || !content.trim()) {
            setCommentError('Proszę wypełnić oba pola (imię i treść).');
            return;
        }

        try {
            const newComment = await createComment(id, {
                author_name: authorName,
                content: content
            });


            setComments([newComment, ...comments]);


            setAuthorName('');
            setContent('');
        } catch (error) {
            console.log(error);
            setCommentError('Nie udało się dodać komentarza.');
        }
    }


    async function handleRatingSubmit(ratingValue) {
        setRatingMessage('');
        try {
            const result = await addRating(id, ratingValue);


            setBook(prevBook => ({
                ...prevBook,
                average_rating: result.average_rating
            }));

            setRatingMessage(`Dziękujemy! Dodano ocenę: ${ratingValue}`);
        } catch (error) {
            console.log(error);
            setRatingMessage('Nie udało się dodać oceny.');
        }
    }

    if (!book) {
        return (
            <div className="container">
                <div className="book-details">
                    <h2>Loading book...</h2>
                </div>
            </div>
        );
    }


    const renderStars = (rating) => {
        if (!rating) return 'Brak ocen';
        const rounded = Math.round(rating);
        return '⭐'.repeat(rounded) + '☆'.repeat(5 - rounded);
    };

    return (
        <div className="container">
            <div className="book-details">
                <h1 className="page-title">
                    📖 {book.title}
                </h1>

                <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>Ocena książki</h3>
                    <p style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>
                        {renderStars(book.average_rating)} ({book.average_rating ? `${book.average_rating} / 5` : '0.0'})
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Twoja ocena:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRatingSubmit(star)}
                                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}
                                title={`Oceń na ${star}`}
                            >
                                ⭐
                            </button>
                        ))}
                    </div>
                    {ratingMessage && <p style={{ color: '#4caf50', margin: '5px 0 0 0', fontSize: '0.9rem' }}>{ratingMessage}</p>}
                </div>

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
                    {new Date(book.created_at).toLocaleDateString('uk-UA')}
                </p>

                <hr style={{ margin: '30px 0', borderColor: '#333' }} />


                <div className="comments-section">
                    <h2>💬 Komentarze ({comments.length})</h2>


                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0', background: '#1a1a1a', padding: '15px', borderRadius: '8px' }}>
                        <h4 style={{ margin: 0 }}>Dodaj swój komentarz</h4>
                        {commentError && <p style={{ color: '#ff6b6b', margin: 0 }}>{commentError}</p>}

                        <input
                            type="text"
                            placeholder="Twoje imię"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                        />

                        <textarea
                            placeholder="Treść komentarza..."
                            rows="3"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
                        />

                        <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Wyślij
                        </button>
                    </form>


                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                        {comments.length === 0 ? (
                            <p style={{ color: '#888', fontStyle: 'italic' }}>Brak komentarzy. Bądź pierwszy i dodaj opinię!</p>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} style={{ background: '#222', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #007bff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#aaa' }}>
                                        <strong>{c.author_name}</strong>
                                        <span>{new Date(c.created_at).toLocaleString('uk-UA')}</span>
                                    </div>
                                    <p style={{ margin: 0, color: '#ddd', lineHeight: '1.4' }}>{c.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default BookDetailsPage;