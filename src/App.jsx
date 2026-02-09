import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Experience from './pages/Experience'
import Projects from './pages/Projects'
import Skills from './pages/Skills'
import Compiler from './pages/Compiler'
import Experimental from './pages/Experimental'
import Contact from './pages/Contact'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Home />
          </Layout>
        } />
        <Route path="/experience" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Experience />
          </Layout>
        } />
        <Route path="/projects" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Projects />
          </Layout>
        } />
        <Route path="/skills" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Skills />
          </Layout>
        } />
        <Route path="/compiler" element={
          <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
            <Compiler />
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
