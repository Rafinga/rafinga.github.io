import { useState } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import VolumeBar from './components/VolumeBar'
import Home from './pages/Home'
import Experience from './pages/Experience'
import Projects from './pages/Projects'
import Compiler from './pages/Compiler'
import Contact from './pages/Contact'
import { useVolumeProgress } from './hooks/useVolumeProgress'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [decayRate, setDecayRate] = useState(0.1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [volume, setVolume] = useState(0)
  
  useVolumeProgress({ 
    enabled: audioEnabled, 
    decayRate, 
    autoPlay,
    onVolumeChange: setVolume
  })

  return (
    <Router>
      <VolumeBar volume={volume} />
      <Routes>
        <Route path="/" element={
          <Layout 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            chunkDuration={decayRate}
            setChunkDuration={setDecayRate}
            autoPlay={autoPlay}
            setAutoPlay={setAutoPlay}
          >
            <Home />
          </Layout>
        } />
        <Route path="/experience" element={
          <Layout 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            chunkDuration={decayRate}
            setChunkDuration={setDecayRate}
            autoPlay={autoPlay}
            setAutoPlay={setAutoPlay}
          >
            <Experience />
          </Layout>
        } />
        <Route path="/projects" element={
          <Layout 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            chunkDuration={decayRate}
            setChunkDuration={setDecayRate}
            autoPlay={autoPlay}
            setAutoPlay={setAutoPlay}
          >
            <Projects />
          </Layout>
        } />
        <Route path="/compiler" element={
          <Layout 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            chunkDuration={decayRate}
            setChunkDuration={setDecayRate}
            autoPlay={autoPlay}
            setAutoPlay={setAutoPlay}
          >
            <Compiler />
          </Layout>
        } />
        <Route path="/contact" element={
          <Layout 
            darkMode={darkMode} 
            setDarkMode={setDarkMode}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            chunkDuration={decayRate}
            setChunkDuration={setDecayRate}
            autoPlay={autoPlay}
            setAutoPlay={setAutoPlay}
          >
            <Contact />
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
