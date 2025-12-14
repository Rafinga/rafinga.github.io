import { Link } from 'react-router-dom'

const Layout = ({ children, darkMode, setDarkMode }) => (
  <div className={`app ${darkMode ? 'dark' : 'light'}`}>
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">Your Name</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/experimental">Experimental</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <button 
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
    <main className="main">{children}</main>
  </div>
)

export default Layout
