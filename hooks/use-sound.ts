"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface SoundOptions {
  loop?: boolean
  volume?: number
}

export function useSound(soundUrl: string, options: SoundOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize the audio element
  const initialize = useCallback(() => {
    if (typeof window === "undefined") return

    if (!audioRef.current) {
      const audio = new Audio()
      audio.src = soundUrl
      audio.loop = options.loop || false
      audio.volume = options.volume !== undefined ? options.volume : 0.5
      audio.preload = "auto"

      audio.addEventListener("canplaythrough", () => {
        setIsLoaded(true)
      })

      audioRef.current = audio
    }
  }, [soundUrl, options.loop, options.volume])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
    }
  }, [])

  // Play sound
  const play = useCallback(() => {
    if (!audioRef.current) {
      initialize()
    }

    if (audioRef.current) {
      // Reset the audio to the beginning if it was already playing
      if (isPlaying) {
        audioRef.current.currentTime = 0
      } else {
        // Start playing
        const playPromise = audioRef.current.play()

        // Handle play promise to avoid DOMException
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              // Auto-play was prevented, likely due to browser policy
              console.log("Audio play prevented:", error)
            })
        }
      }
    }
  }, [initialize, isPlaying])

  // Pause sound
  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [isPlaying])

  // Stop sound (pause and reset to beginning)
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume))
    }
  }, [])

  return {
    initialize,
    play,
    pause,
    stop,
    setVolume,
    isLoaded,
    isPlaying,
  }
}
