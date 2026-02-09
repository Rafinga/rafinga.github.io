const VolumeBar = ({ volume }) => {
  return (
    <div className="volume-bar-container">
      <div className="volume-bar">
        <div 
          className="volume-bar-fill" 
          style={{ height: `${volume * 100}%` }}
        />
      </div>
    </div>
  )
}

export default VolumeBar
