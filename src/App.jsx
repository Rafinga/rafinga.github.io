import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Experimental from './pages/Experimental'
import Contact from './pages/Contact'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Home />
          </Layout>
        } />
        <Route path="/projects" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Projects />
          </Layout>
        } />
        <Route path="/experimental" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Experimental />
          </Layout>
        } />
        <Route path="/contact" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Contact />
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
