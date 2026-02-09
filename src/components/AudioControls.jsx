import { useState } from 'react'

const AudioControls = ({ enabled, setEnabled, chunkDuration, setChunkDuration, autoPlay, setAutoPlay }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="audio-controls">
      <button 
        className="audio-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🎵
      </button>
      
      {isOpen && (
        <div className="audio-menu">
          <div className="audio-option">
            <label>
              <input 
                type="checkbox" 
                checked={enabled} 
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enable
            </label>
          </div>
          
          <div className="audio-option">
            <label>
              <input 
                type="checkbox" 
                checked={autoPlay} 
                onChange={(e) => setAutoPlay(e.target.checked)}
              />
              Auto
            </label>
          </div>
          
          <div className="audio-option">
            <label>
              Decay Rate: {chunkDuration.toFixed(2)}
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01" 
                value={chunkDuration}
                onChange={(e) => setChunkDuration(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default AudioControls
