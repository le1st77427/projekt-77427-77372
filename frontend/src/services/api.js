const API_URL =
    'https://projekt-77427-77372.onrender.com/api/books';

export async function getBooks() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  return response.json();
}

export async function createBook(bookData) {
  const response = await fetch(API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    throw new Error('Failed to create book');
  }

  return response.json();
}

export async function getBookById(id) {
  const response = await fetch(
      `${API_URL}/${id}`
  );

  const data = await response.json();

  return data;
}
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories/all`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

export async function getComments(bookId) {
  const response = await fetch(`${API_URL}/${bookId}/comments`);

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}


export async function createComment(bookId, commentData) {
  const response = await fetch(`${API_URL}/${bookId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    throw new Error('Failed to create comment');
  }

  return response.json();
}

export async function addRating(bookId, ratingValue) {
  const response = await fetch(`${API_URL}/${bookId}/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating: ratingValue }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit rating');
  }

  return response.json();
}