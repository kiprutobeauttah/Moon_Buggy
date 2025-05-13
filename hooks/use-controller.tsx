"use client"

import { useState, useEffect, useCallback } from "react"

interface ControllerState {
  isConnected: boolean
  buttonPressed: {
    jump: boolean
    pause: boolean
    brake: boolean
  }
}

export function useController() {
  const [controllerState, setControllerState] = useState<ControllerState>({
    isConnected: false,
    buttonPressed: {
      jump: false,
      pause: false,
      brake: false,
    },
  })

  // Check if controllers are supported in this browser
  const isGamepadSupported = typeof navigator !== "undefined" && "getGamepads" in navigator

  // Function to get connected gamepads
  const getGamepads = useCallback(() => {
    if (!isGamepadSupported) return []

    // Convert gamepad object to array and filter out null values
    return Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[]
  }, [isGamepadSupported])

  // Update controller connection state
  useEffect(() => {
    if (!isGamepadSupported) return

    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log("Gamepad connected:", e.gamepad.id)
      setControllerState((prev) => ({
        ...prev,
        isConnected: true,
      }))
    }

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log("Gamepad disconnected:", e.gamepad.id)
      setControllerState((prev) => ({
        ...prev,
        isConnected: false,
      }))
    }

    // Check if a gamepad is already connected
    const gamepads = getGamepads()
    if (gamepads.length > 0) {
      setControllerState((prev) => ({
        ...prev,
        isConnected: true,
      }))
    }

    window.addEventListener("gamepadconnected", handleGamepadConnected)
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected)

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected)
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected)
    }
  }, [isGamepadSupported, getGamepads])

  // Poll for controller button presses
  useEffect(() => {
    if (!isGamepadSupported || !controllerState.isConnected) return

    let animationFrameId: number

    const checkButtons = () => {
      const gamepads = getGamepads()
      if (gamepads.length > 0) {
        const gamepad = gamepads[0] // Use the first connected gamepad

        // Common button mappings:
        // A button (Xbox) / X button (PlayStation) - usually index 0
        // B button (Xbox) / Circle button (PlayStation) - usually index 1
        // Start button - usually index 9
        // R2 button (PlayStation) / RT (Xbox) / ZR (Switch) - usually index 7
        // L2 button (PlayStation) / LT (Xbox) / ZL (Switch) - usually index 6
        const jumpButton = gamepad.buttons[0]?.pressed || false
        const bButton = gamepad.buttons[1]?.pressed || false
        const pauseButton = gamepad.buttons[9]?.pressed || false

        // R2/ZR button check (right trigger)
        const r2Pressed = gamepad.buttons[7]?.pressed || gamepad.buttons[7]?.value > 0.5

        // L2/ZL button check (left trigger)
        const l2Pressed = gamepad.buttons[6]?.pressed || gamepad.buttons[6]?.value > 0.5

        // Also check D-pad up or left stick up for jump
        const dpadUpPressed = gamepad.buttons[12]?.pressed || false
        const leftStickUp = gamepad.axes[1] < -0.5 // Y-axis, negative is up

        setControllerState((prev) => ({
          ...prev,
          buttonPressed: {
            jump: jumpButton || dpadUpPressed || leftStickUp || r2Pressed,
            pause: pauseButton,
            brake: bButton || l2Pressed,
          },
        }))
      }

      animationFrameId = requestAnimationFrame(checkButtons)
    }

    animationFrameId = requestAnimationFrame(checkButtons)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isGamepadSupported, controllerState.isConnected, getGamepads])

  return {
    ...controllerState,
    isSupported: isGamepadSupported,
  }
}
