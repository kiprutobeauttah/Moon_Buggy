"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { GameEngine } from "@/lib/game-engine" // Fixed import path without extension
import { useSound } from "@/hooks/use-sound"
import { useMobile } from "@/hooks/use-mobile"
import { useController } from "@/hooks/use-controller"

export default function MoonBuggyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [touchFeedback, setTouchFeedback] = useState(false)
  const [isBraking, setIsBraking] = useState(false)
  const isMobile = useMobile()
  const controller = useController()

  // Track previous button states to detect button press events
  const prevJumpButtonRef = useRef(false)
  const prevPauseButtonRef = useRef(false)
  const prevBrakeButtonRef = useRef(false)

  const jumpSound = useSound("/sounds/jump.mp3")
  const crashSound = useSound("/sounds/crash.mp3")
  const bgMusic = useSound("/sounds/background.mp3", { loop: true })

  useEffect(() => {
    if (!canvasRef.current || gameEngine) return

    // Make sure canvas is properly sized for the device
    if (canvasRef.current) {
      // For mobile devices, adjust canvas size to fit screen better
      if (isMobile && window.innerWidth < 640) {
        canvasRef.current.width = window.innerWidth - 32 // Account for padding
        // Keep aspect ratio
        canvasRef.current.height = Math.floor(canvasRef.current.width * 0.375) // 240/640 = 0.375
      }
    }

    const engine = new GameEngine(canvasRef.current, {
      onScore: (newScore) => setScore(newScore),
      onGameOver: () => {
        setGameOver(true)
        crashSound.play()
        bgMusic.stop()
      },
      onJump: () => jumpSound.play(),
    })

    setGameEngine(engine)

    return () => {
      engine.destroy()
    }
  }, [canvasRef, gameEngine, jumpSound, crashSound, bgMusic, isMobile])

  // Update the handleKeyDown function to prevent braking when jumping
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!gameEngine || gameOver || !isStarted || isPaused) return

    if (e.code === "Space") {
      gameEngine.jump()
    } else if (e.code === "KeyP") {
      togglePause()
    } else if (e.code === "ControlLeft" || e.code === "ControlRight") {
      gameEngine.brake(true)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameEngine || gameOver || !isStarted || isPaused) return

      if (e.code === "Space") {
        gameEngine.jump()
      } else if (e.code === "KeyP") {
        togglePause()
      } else if (e.code === "ControlLeft" || e.code === "ControlRight") {
        setIsBraking(true)
        gameEngine.brake(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameEngine || gameOver || !isStarted) return

      if (e.code === "ControlLeft" || e.code === "ControlRight") {
        setIsBraking(false)
        gameEngine.brake(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameEngine, gameOver, isStarted, isPaused])

  // Update the controller effect to prevent braking when jumping
  useEffect(() => {
    if (!gameEngine || !controller.isConnected) return

    // Check for jump button press (detect rising edge)
    if (controller.buttonPressed.jump && !prevJumpButtonRef.current && isStarted && !gameOver && !isPaused) {
      gameEngine.jump()
    }
    prevJumpButtonRef.current = controller.buttonPressed.jump

    // Check for pause button press (detect rising edge)
    if (controller.buttonPressed.pause && !prevPauseButtonRef.current && isStarted && !gameOver) {
      togglePause()
    }
    prevPauseButtonRef.current = controller.buttonPressed.pause

    // Handle brake button (B or L2/ZL)
    if (controller.buttonPressed.brake !== prevBrakeButtonRef.current) {
      gameEngine.brake(controller.buttonPressed.brake)
    }
    prevBrakeButtonRef.current = controller.buttonPressed.brake
  }, [gameEngine, controller, isStarted, gameOver, isPaused])

  // Handle controller input
  useEffect(() => {
    if (!gameEngine || !controller.isConnected) return

    // Check for jump button press (detect rising edge)
    if (controller.buttonPressed.jump && !prevJumpButtonRef.current && isStarted && !gameOver && !isPaused) {
      gameEngine.jump()
    }
    prevJumpButtonRef.current = controller.buttonPressed.jump

    // Check for pause button press (detect rising edge)
    if (controller.buttonPressed.pause && !prevPauseButtonRef.current && isStarted && !gameOver) {
      togglePause()
    }
    prevPauseButtonRef.current = controller.buttonPressed.pause

    // Handle brake button (B or L2/ZL)
    if (controller.buttonPressed.brake !== prevBrakeButtonRef.current) {
      setIsBraking(controller.buttonPressed.brake)
      gameEngine.brake(controller.buttonPressed.brake)
    }
    prevBrakeButtonRef.current = controller.buttonPressed.brake
  }, [gameEngine, controller, isStarted, gameOver, isPaused])

  // Handle touch events for mobile
  useEffect(() => {
    if (!gameContainerRef.current || !gameEngine) return

    const handleTouchStart = (e: TouchEvent) => {
      if (gameOver || isPaused || !isStarted) return

      // Prevent default to avoid scrolling
      e.preventDefault()

      // Show touch feedback
      setTouchFeedback(true)

      // Make the buggy jump
      gameEngine.jump()
    }

    const handleTouchEnd = () => {
      // Hide touch feedback
      setTouchFeedback(false)
    }

    const container = gameContainerRef.current
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [gameEngine, gameOver, isPaused, isStarted])

  const startGame = () => {
    if (!gameEngine) return

    // Initialize audio first
    jumpSound.initialize()
    crashSound.initialize()
    bgMusic.initialize()

    setIsStarted(true)
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
    setIsBraking(false)
    gameEngine.reset()
    gameEngine.start()

    // Try to play background music after user interaction
    setTimeout(() => {
      bgMusic.play()
    }, 100)
  }

  const restartGame = () => {
    if (!gameEngine) return

    gameEngine.reset()
    setGameOver(false)
    setScore(0)
    setIsBraking(false)
    startGame()
  }

  const togglePause = () => {
    if (!gameEngine || !isStarted) return

    if (isPaused) {
      gameEngine.resume()
      bgMusic.play()
    } else {
      gameEngine.pause()
      bgMusic.pause()
    }

    setIsPaused(!isPaused)
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-4 flex items-center justify-between w-full px-4">
        <div className="text-xl font-bold text-white">SCORE: {score}</div>
        {isStarted && !gameOver && (
          <Button
            variant="default"
            className="bg-white text-black hover:bg-gray-300 font-bold border-2 border-white"
            onClick={togglePause}
          >
            {isPaused ? "RESUME" : "PAUSE"}
          </Button>
        )}
      </div>

      <div
        ref={gameContainerRef}
        className={`relative border-4 border-white overflow-hidden ${touchFeedback ? "bg-gray-700" : ""}`}
      >
        <canvas ref={canvasRef} width={640} height={240} className="bg-gray-900" />

        {!isStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <h2 className="mb-4 text-2xl font-bold text-white">MOON BUGGY</h2>
            <Button
              variant="default"
              className="bg-white text-black hover:bg-gray-300 font-bold border-2 border-white"
              onClick={startGame}
            >
              START GAME
            </Button>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <h2 className="text-2xl font-bold text-white">PAUSED</h2>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <h2 className="mb-2 text-2xl font-bold text-white">GAME OVER</h2>
            <p className="mb-4 text-xl text-white">SCORE: {score}</p>
            <Button
              variant="default"
              className="bg-white text-black hover:bg-gray-300 font-bold border-2 border-white"
              onClick={restartGame}
            >
              PLAY AGAIN
            </Button>
          </div>
        )}

        {isStarted && !gameOver && !isPaused && isMobile && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-70">TAP TO JUMP</div>
        )}

        {controller.isConnected && (
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 px-2 py-1 rounded text-xs text-white">Controller Connected</div>
          </div>
        )}

        {isBraking && isStarted && !gameOver && !isPaused && (
          <div className="absolute top-4 left-4">
            <div className="bg-red-500/70 px-2 py-1 rounded text-xs text-white font-bold">
              {score > 0 && score === Math.floor(score) ? "STOPPED" : "BRAKING"}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
