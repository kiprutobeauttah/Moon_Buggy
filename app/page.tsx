"use client"

import MoonBuggyGame from "@/components/moon-buggy-game"
import { GamepadIcon } from "lucide-react"
import { useController } from "@/hooks/use-controller"

export default function Home() {
  const controller = useController()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <h1 className="mb-6 text-4xl font-bold text-white">MOON BUGGY</h1>
      <MoonBuggyGame />
      <div className="mt-6 text-white">
        {/* Desktop instructions */}
        <div className="hidden md:block">
          <p>Press SPACE to jump</p>
          <p>Press CTRL to brake</p>
          <p>Press P to pause</p>

          {/* Only show controller instructions if a controller is connected */}
          {controller.isConnected && (
            <div className="mt-2 flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              <p>Controller: A/X to jump, B or L2/ZL to brake, Start to pause</p>
            </div>
          )}
        </div>

        {/* Mobile instructions */}
        <div className="block md:hidden">
          <p>Tap to start</p>
          <p>Tap to jump</p>

          {/* Only show controller instructions if a controller is connected */}
          {controller.isConnected && (
            <div className="mt-2 flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              <p>Controller supported</p>
            </div>
          )}
        </div>

        <p className="mt-2 text-yellow-300">Click START GAME to enable sound</p>
      </div>
    </main>
  )
}
