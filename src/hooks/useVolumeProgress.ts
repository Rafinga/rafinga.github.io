import { useEffect, useRef } from 'react'

interface VolumeProgressOptions {
  enabled: boolean
  decayRate: number
  autoPlay: boolean
  onVolumeChange?: (volume: number) => void
}

export const useVolumeProgress = ({ enabled, decayRate, autoPlay, onVolumeChange }: VolumeProgressOptions): void => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const volumeRef = useRef<number>(0)
  const decayIntervalRef = useRef<number | null>(null)
  const autoPlayIntervalRef = useRef<number | null>(null)
  const audioStartedRef = useRef<boolean>(false)

  useEffect(() => {
    audioRef.current = new Audio('/in-the-sea.mp3')
    audioRef.current.loop = true
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 0
    
    const startAudio = (): void => {
      if (!audioStartedRef.current && audioRef.current && enabled) {
        audioRef.current.play().catch(() => {})
        audioStartedRef.current = true
      }
    }
    
    const increaseVolume = (): void => {
      startAudio()
      volumeRef.current = Math.min(1, volumeRef.current + decayRate)
      if (audioRef.current) {
        audioRef.current.volume = volumeRef.current
      }
      if (onVolumeChange) {
        onVolumeChange(volumeRef.current)
      }
    }
    
    const handleInteraction = (): void => {
      if (!autoPlay) {
        increaseVolume()
      }
    }
    
    // Add global listeners for manual mode (including touch events)
    if (!autoPlay) {
      document.addEventListener('click', handleInteraction)
      document.addEventListener('touchstart', handleInteraction)
      document.addEventListener('keydown', handleInteraction)
    }
    
    // Auto play mode - increase volume continuously
    if (autoPlay && enabled) {
      // Start audio on first user interaction in autoplay mode
      const startAutoPlay = (): void => {
        startAudio()
        document.removeEventListener('click', startAutoPlay)
        document.removeEventListener('touchstart', startAutoPlay)
      }
      
      document.addEventListener('click', startAutoPlay)
      document.addEventListener('touchstart', startAutoPlay)
      
      autoPlayIntervalRef.current = window.setInterval(() => {
        increaseVolume()
      }, 1000)
    }
    
    // Smooth volume decay - update 100 times per second
    if (enabled) {
      const decayPerTick = decayRate / 100
      decayIntervalRef.current = window.setInterval(() => {
        volumeRef.current = Math.max(0, volumeRef.current - decayPerTick)
        if (audioRef.current) {
          audioRef.current.volume = volumeRef.current
        }
        if (onVolumeChange) {
          onVolumeChange(volumeRef.current)
        }
      }, 10) // 10ms = 1/100 second
    }
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      audioStartedRef.current = false
    }
  }, [enabled, decayRate, autoPlay, onVolumeChange])
}
