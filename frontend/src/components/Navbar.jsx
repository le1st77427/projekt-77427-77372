import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="navbar">

            <div className="logo">
                ReaderHub
            </div>

            <div className="nav-links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/add-book">
                    Add Book
                </Link>

                <Link to="/authors">
                    Authors
                </Link>

            </div>

        </nav>
    );
}

export default Navbar;