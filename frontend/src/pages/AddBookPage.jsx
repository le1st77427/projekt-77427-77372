import { useState } from 'react';

import { createBook } from '../services/api';

function AddBookPage() {

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fantasy');

  const [successMessage, setSuccessMessage] =
      useState('');

  const [errorMessage, setErrorMessage] =
      useState('');

  async function handleSubmit(event) {

    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!title || !author || !description) {

      setErrorMessage(
          'Please fill all fields'
      );

      return;

    }

    try {

      await createBook({
        title,
        author,
        description,
        category,
      });

      setSuccessMessage(
          'Book created successfully'
      );

      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('Fantasy');

    } catch (error) {

      console.log(error);

      setErrorMessage(
          'Failed to create book'
      );

    }

  }

  return (
      <div className="container">

        <h1 className="page-title">
          Add New Book
        </h1>

        {successMessage && (
            <p className="success-message">
              ✅ {successMessage}
            </p>
        )}

        {errorMessage && (
            <p className="error-message">
              ❌ {errorMessage}
            </p>
        )}

        <form
            className="book-form"
            onSubmit={handleSubmit}
        >

          <input
              type="text"
              placeholder="Book title"
              value={title}
              onChange={(e) =>
                  setTitle(e.target.value)
              }
          />

          <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) =>
                  setAuthor(e.target.value)
              }
          />

          <select
              value={category}
              onChange={(e) =>
                  setCategory(e.target.value)
              }
          >
            <option value="Fantasy">
              Fantasy
            </option>

            <option value="History">
              History
            </option>

            <option value="Science">
              Science
            </option>

            <option value="Programming">
              Programming
            </option>
          </select>

          <textarea
              placeholder="Description"
              rows="6"
              value={description}
              onChange={(e) =>
                  setDescription(e.target.value)
              }
          />

          <button type="submit">
            Add Book
          </button>

        </form>

      </div>
  );
}

export default AddBookPage;