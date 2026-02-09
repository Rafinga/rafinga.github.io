import { useEffect, useRef } from 'react'

interface AudioProgressOptions {
  enabled: boolean
  chunkDuration: number
  autoPlay: boolean
}

export const useAudioProgress = ({ enabled, chunkDuration, autoPlay }: AudioProgressOptions): void => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTimeRef = useRef<number>(0)
  const isPlayingRef = useRef<boolean>(false)
  const autoPlayIntervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/in-the-sea.mp3')
    audioRef.current.preload = 'auto'
    
    const playChunk = (): void => {
      if (!audioRef.current) return
      
      // If already playing, just reset the timeout (keep playing from current audio position)
      if (isPlayingRef.current) {
        // Update our position reference to where the audio actually is now
        currentTimeRef.current = audioRef.current.currentTime
        
        // Clear old timeout and set new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = window.setTimeout(() => {
          if (audioRef.current && isPlayingRef.current) {
            audioRef.current.pause()
            isPlayingRef.current = false
            
            // Advance position after chunk finishes
            currentTimeRef.current += chunkDuration
            
            // Loop back to start if we reach the end (144 seconds)
            if (currentTimeRef.current >= 144) {
              currentTimeRef.current = 0
            }
          }
        }, chunkDuration * 1000)
        
        return
      }
      
      // Start new playback
      audioRef.current.currentTime = currentTimeRef.current
      audioRef.current.play().catch(() => {})
      isPlayingRef.current = true
      
      // Stop after chunk duration and advance position
      timeoutRef.current = window.setTimeout(() => {
        if (audioRef.current && isPlayingRef.current) {
          audioRef.current.pause()
          isPlayingRef.current = false
          
          // Advance position after chunk finishes
          currentTimeRef.current += chunkDuration
          
          // Loop back to start if we reach the end (144 seconds)
          if (currentTimeRef.current >= 144) {
            currentTimeRef.current = 0
          }
        }
      }, chunkDuration * 1000)
    }
    
    const handleInteraction = (): void => {
      if (!autoPlay) {
        playChunk()
      }
    }
    
    const handleKeydown = (): void => {
      if (!autoPlay) {
        playChunk()
      }
    }
    
    // Add global listeners for manual mode
    if (!autoPlay) {
      document.addEventListener('click', handleInteraction)
      document.addEventListener('keydown', handleKeydown)
    }
    
    // Auto play mode
    if (autoPlay && enabled) {
      autoPlayIntervalRef.current = window.setInterval(() => {
        playChunk()
      }, chunkDuration * 1000)
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleKeydown)
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [enabled, chunkDuration, autoPlay])
}
