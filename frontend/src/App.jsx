import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import AddBookPage from './pages/AddBookPage';
import BookDetailsPage from './pages/BookDetailsPage';
import AuthorsPage from './pages/AuthorsPage';

function App() {
    return (
        <>
            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/add-book"
                    element={<AddBookPage />}
                />

                <Route
                    path="/books/:id"
                    element={<BookDetailsPage />}
                />

                <Route
                    path="/authors"
                    element={<AuthorsPage />}
                />

            </Routes>
        </>
    );
}

export default App;