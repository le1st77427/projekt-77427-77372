import { useState, useEffect } from 'react';
import { createBook, getCategories } from '../services/api';

function AddBookPage() {

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');


  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    async function fetchCategories() {
      try {
        const dbCategories = await getCategories();


        const defaultCategories = ['Fantastyka', 'Kryminał', 'Sci-Fi', 'Romans', 'Programowanie', 'Historia'];


        const mergedCategories = [...new Set([...defaultCategories, ...dbCategories])];

        setCategoriesList(mergedCategories);
        setCategory(mergedCategories[0]);
      } catch (error) {
        console.log("Błąd ładowania kategorii:", error);


        const fallback = ['Fantastyka', 'Kryminał', 'Sci-Fi', 'Romans'];
        setCategoriesList(fallback);
        setCategory(fallback[0]);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!title || !author || !description || !category) {
      setErrorMessage('Please fill all fields');
      return;
    }

    try {
      await createBook({
        title,
        author,
        description,
        category,
      });

      setSuccessMessage('Book created successfully');


      setTitle('');
      setAuthor('');
      setDescription('');


      if (categoriesList.length > 0) {
        setCategory(categoriesList[0]);
      }

    } catch (error) {
      console.log(error);
      setErrorMessage('Failed to create book');
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
              onChange={(e) => setTitle(e.target.value)}
          />

          <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
          />

          <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
          >
            {/*  */}
            {categoriesList.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
            ))}
          </select>

          <textarea
              placeholder="Description"
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">
            Add Book
          </button>

        </form>

      </div>
  );
}

export default AddBookPage;