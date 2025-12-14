import { useState } from 'react'
import { Link } from 'react-router-dom'

const Layout = ({ children, darkMode, setDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">Rafael Gomez</Link>
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button 
              className="close-menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/experience" onClick={() => setMobileMenuOpen(false)}>Experience</Link>
            <Link to="/projects" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
            <Link to="/skills" onClick={() => setMobileMenuOpen(false)}>Skills</Link>
            <Link to="/experimental" onClick={() => setMobileMenuOpen(false)}>Experimental</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
          {mobileMenuOpen && (
            <div 
              className="menu-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <div className="nav-controls">
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}

export default Layout
