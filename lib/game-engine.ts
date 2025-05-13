export interface GameOptions {
  onScore: (score: number) => void
  onGameOver: () => void
  onJump: () => void
}

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  type: "large" | "small"
  rotation: number
  jaggedness: number
  points: number[]
}

export interface StarLayer {
  stars: {
    x: number
    y: number
    size: number
    brightness: number
    twinkleSpeed: number
    twinkleOffset: number
  }[]
  speed: number
}

export interface DustParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  life: number
  color: string
}

export interface MountainLayer {
  points: number[]
  color: string
  height: number
  speed: number
  x: number
  width: number
}

interface TerrainSegment {
  height: number
  color: string
  detail: number
}

interface Crater {
  x: number
  y: number
  radius: number
  depth: number
}

export class Buggy {
  public x: number
  public y: number
  public width = 50 // Slightly wider for more details
  public height = 35 // Slightly taller for better proportions
  public velocity = 0
  public isJumping = false
  public wasJumping = false
  private gravity = 980
  private jumpForce = -450
  private image: HTMLImageElement | null = null
  private imageLoaded = false
  private wheelRotation = 0
  private flagWave = 0
  private suspensionOffset = 0
  private engineGlow = 0
  private astronautBob = 0
  private time = 0
  public brakeJumping = false // Track if the jump started while braking

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public loadImage(callback?: () => void) {
    // We're not using an external image anymore, just calling the callback
    if (callback) callback()
  }

  public reset(x: number, y: number) {
    this.x = x
    this.y = y
    this.velocity = 0
    this.isJumping = false
    this.wasJumping = false
    this.brakeJumping = false
    this.wheelRotation = 0
    this.flagWave = 0
    this.suspensionOffset = 0
    this.engineGlow = 0
    this.astronautBob = 0
    this.time = 0
  }

  public jump(braking = false): boolean {
    if (this.isJumping) return false

    // Use the same jump force, but track if it was a brake-jump
    this.velocity = this.jumpForce
    this.isJumping = true
    this.wasJumping = true
    this.brakeJumping = braking // Track if this jump started while braking
    return true
  }

  public update(deltaTime: number, braking = false) {
    // Update time
    this.time += deltaTime

    if (this.isJumping) {
      // Apply reduced gravity when brake-jumping for a longer jump arc
      const gravityModifier = this.brakeJumping ? 0.7 : 1.0
      this.velocity += this.gravity * deltaTime * gravityModifier
      this.y += this.velocity * deltaTime
    }

    // Animate wheels and flag
    // Wheels rotate slower when braking
    const wheelSpeed = braking ? 1 : 5
    this.wheelRotation = (this.wheelRotation + deltaTime * wheelSpeed) % (Math.PI * 2)
    this.flagWave = Math.sin(this.time * 5) * 2

    // Animate suspension
    if (!this.isJumping) {
      // More suspension movement when braking
      const suspensionIntensity = braking ? 1.5 : 0.5
      this.suspensionOffset = Math.sin(this.time * 10) * suspensionIntensity
    }

    // Engine glow pulsing - more intense when not braking
    this.engineGlow = braking ? 0.3 : 0.6 + Math.sin(this.time * 8) * 0.4

    // Astronaut bobbing
    this.astronautBob = Math.sin(this.time * 3) * 0.8
  }

  public render(ctx: CanvasRenderingContext2D, braking = false) {
    // Always render our custom buggy
    this.renderEnhancedBuggy(ctx, braking)
  }

  private renderEnhancedBuggy(ctx: CanvasRenderingContext2D, braking = false) {
    const x = this.x
    const y = this.y + this.suspensionOffset
    const width = this.width
    const height = this.height

    // Save context for transformations
    ctx.save()

    // Draw shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.beginPath()
    ctx.ellipse(x + width / 2, y + height - 2, width / 2, height / 6, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw rear engine glow
    const engineGlowRadius = 6 * this.engineGlow
    const engineGlowGradient = ctx.createRadialGradient(
      x + 5,
      y + height - 12,
      0,
      x + 5,
      y + height - 12,
      engineGlowRadius,
    )
    engineGlowGradient.addColorStop(0, "rgba(255, 160, 50, 0.8)")
    engineGlowGradient.addColorStop(0.6, "rgba(255, 100, 50, 0.4)")
    engineGlowGradient.addColorStop(1, "rgba(255, 50, 0, 0)")

    ctx.fillStyle = engineGlowGradient
    ctx.beginPath()
    ctx.arc(x + 5, y + height - 12, engineGlowRadius, 0, Math.PI * 2)
    ctx.fill()

    // Brake lights when braking
    if (braking) {
      const brakeGlowRadius = 4
      const brakeGlowGradient = ctx.createRadialGradient(
        x + width - 5,
        y + height - 12,
        0,
        x + width - 5,
        y + height - 12,
        brakeGlowRadius,
      )
      brakeGlowGradient.addColorStop(0, "rgba(255, 50, 50, 0.9)")
      brakeGlowGradient.addColorStop(0.6, "rgba(255, 0, 0, 0.6)")
      brakeGlowGradient.addColorStop(1, "rgba(255, 0, 0, 0)")

      ctx.fillStyle = brakeGlowGradient
      ctx.beginPath()
      ctx.arc(x + width - 5, y + height - 12, brakeGlowRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Special effect for brake-jumping
    if (this.brakeJumping && this.isJumping) {
      // Add a subtle trail effect when brake-jumping
      const trailGradient = ctx.createLinearGradient(x - 10, y, x, y + height)
      trailGradient.addColorStop(0, "rgba(255, 100, 50, 0)")
      trailGradient.addColorStop(0.5, "rgba(255, 100, 50, 0.2)")
      trailGradient.addColorStop(1, "rgba(255, 100, 50, 0)")

      ctx.fillStyle = trailGradient
      ctx.beginPath()
      ctx.ellipse(x - 5, y + height / 2, 10, height / 1.5, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    // Chassis/frame - metallic silver with gradient
    const chassisGradient = ctx.createLinearGradient(x, y + 8, x, y + height - 8)
    chassisGradient.addColorStop(0, "#CCC")
    chassisGradient.addColorStop(0.5, "#EEE")
    chassisGradient.addColorStop(1, "#AAA")

    ctx.fillStyle = chassisGradient
    ctx.beginPath()
    ctx.roundRect(x + 8, y + 8, width - 16, height - 16, 3)
    ctx.fill()

    // Chassis outline
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Main body - more detailed with panels
    const bodyGradient = ctx.createLinearGradient(x, y + 4, x, y + height - 8)
    bodyGradient.addColorStop(0, "#DDD")
    bodyGradient.addColorStop(1, "#BBB")

    ctx.fillStyle = bodyGradient

    // Main cabin
    ctx.beginPath()
    ctx.roundRect(x + 12, y + 4, width - 24, height - 18, 4)
    ctx.fill()

    ctx.strokeStyle = "#999"
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Equipment boxes on sides
    ctx.fillStyle = "#AAA"

    // Left equipment box
    ctx.beginPath()
    ctx.roundRect(x + 4, y + 12, 6, 10, 1)
    ctx.fill()
    ctx.strokeStyle = "#888"
    ctx.stroke()

    // Right equipment box
    ctx.beginPath()
    ctx.roundRect(x + width - 10, y + 12, 6, 10, 1)
    ctx.fill()
    ctx.strokeStyle = "#888"
    ctx.stroke()

    // Draw astronaut in the buggy
    this.drawAstronaut(ctx, x + width / 2 - 5, y + 10 + this.astronautBob)

    // Windows - blue gradient for glass effect with reflections
    const windowGradient = ctx.createLinearGradient(x, y + 6, x, y + 16)
    windowGradient.addColorStop(0, "#99F")
    windowGradient.addColorStop(0.7, "#66C")
    windowGradient.addColorStop(1, "#55A")

    ctx.fillStyle = windowGradient

    // Front windshield (angled)
    ctx.beginPath()
    ctx.moveTo(x + 18, y + 6)
    ctx.lineTo(x + 28, y + 6)
    ctx.lineTo(x + 30, y + 12)
    ctx.lineTo(x + 16, y + 12)
    ctx.closePath()
    ctx.fill()

    // Window frames
    ctx.strokeStyle = "#777"
    ctx.lineWidth = 0.7
    ctx.stroke()

    // Window reflection highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(x + 19, y + 7)
    ctx.lineTo(x + 27, y + 7)
    ctx.stroke()

    // Antenna with flag
    ctx.strokeStyle = "#DDD"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + width - 12, y - 14)
    ctx.lineTo(x + width - 12, y + 6)
    ctx.stroke()

    // American flag with gradient and wave effect
    const flagRedGradient = ctx.createLinearGradient(
      x + width - 11,
      y - 14 + this.flagWave,
      x + width - 11,
      y - 11 + this.flagWave,
    )
    flagRedGradient.addColorStop(0, "#F55")
    flagRedGradient.addColorStop(1, "#D33")

    ctx.fillStyle = flagRedGradient
    ctx.fillRect(x + width - 11, y - 14 + this.flagWave, 8, 3)

    // White stripes with slight shadow
    ctx.fillStyle = "#FFF"
    ctx.fillRect(x + width - 11, y - 11 + this.flagWave, 8, 1)

    // Blue corner with gradient
    const flagBlueGradient = ctx.createLinearGradient(
      x + width - 11,
      y - 14 + this.flagWave,
      x + width - 8,
      y - 12 + this.flagWave,
    )
    flagBlueGradient.addColorStop(0, "#55F")
    flagBlueGradient.addColorStop(1, "#33D")

    ctx.fillStyle = flagBlueGradient
    ctx.fillRect(x + width - 11, y - 14 + this.flagWave, 4, 2)

    // Communication dish
    ctx.fillStyle = "#CCC"
    ctx.beginPath()
    ctx.arc(x + width - 18, y + 2, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#999"
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Dish details
    ctx.beginPath()
    ctx.arc(x + width - 18, y + 2, 2, 0, Math.PI * 2)
    ctx.stroke()

    // Dish stem
    ctx.strokeStyle = "#AAA"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + width - 18, y + 5)
    ctx.lineTo(x + width - 18, y + 8)
    ctx.stroke()

    // Front lights with glow effect
    // Yellow gradient for lights
    const lightGradient = ctx.createRadialGradient(x + 6, y + 10, 0, x + 6, y + 10, 4)
    lightGradient.addColorStop(0, "#FFA")
    lightGradient.addColorStop(0.6, "#FF5")
    lightGradient.addColorStop(1, "#DD3")

    ctx.fillStyle = lightGradient
    ctx.beginPath()
    ctx.arc(x + 6, y + 10, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x + width - 6, y + 10, 2, 0, Math.PI * 2)
    ctx.fill()

    // Light glow
    ctx.fillStyle = "rgba(255, 255, 100, 0.2)"
    ctx.beginPath()
    ctx.arc(x + 6, y + 10, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x + width - 6, y + 10, 4, 0, Math.PI * 2)
    ctx.fill()

    // Solar panels on top with reflection
    const solarGradient = ctx.createLinearGradient(x + 16, y + 2, x + width - 16, y + 5)
    solarGradient.addColorStop(0, "#55F")
    solarGradient.addColorStop(0.5, "#99F")
    solarGradient.addColorStop(1, "#55F")

    ctx.fillStyle = solarGradient
    ctx.beginPath()
    ctx.roundRect(x + 16, y, width - 32, 4, 1)
    ctx.fill()

    // Solar panel grid lines
    ctx.strokeStyle = "#33D"
    ctx.lineWidth = 0.5
    ctx.beginPath()

    // Vertical lines
    for (let i = 1; i < 6; i++) {
      const lineX = x + 16 + (width - 32) * (i / 6)
      ctx.moveTo(lineX, y)
      ctx.lineTo(lineX, y + 4)
    }

    // Horizontal line
    ctx.moveTo(x + 16, y + 2)
    ctx.lineTo(x + width - 16, y + 2)

    ctx.stroke()

    // Draw detailed wheels with suspension
    this.drawEnhancedWheel(ctx, x + 10, y + height - 8, 8)
    this.drawEnhancedWheel(ctx, x + width - 10, y + height - 8, 8)

    // Middle wheel
    this.drawEnhancedWheel(ctx, x + width / 2, y + height - 6, 6)

    // Draw suspension arms and details
    ctx.strokeStyle = "#999"
    ctx.lineWidth = 1.5

    // Front suspension
    ctx.beginPath()
    ctx.moveTo(x + 10, y + height - 14)
    ctx.lineTo(x + 10, y + height - 8)
    ctx.stroke()

    // Rear suspension
    ctx.beginPath()
    ctx.moveTo(x + width - 10, y + height - 14)
    ctx.lineTo(x + width - 10, y + height - 8)
    ctx.stroke()

    // Middle suspension
    ctx.beginPath()
    ctx.moveTo(x + width / 2, y + height - 12)
    ctx.lineTo(x + width / 2, y + height - 6)
    ctx.stroke()

    // Chassis details - rivets and panels
    ctx.fillStyle = "#888"

    // Rivets along the chassis
    for (let i = 0; i < 5; i++) {
      const rivetX = x + 12 + i * 8
      ctx.beginPath()
      ctx.arc(rivetX, y + 8, 0.8, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(rivetX, y + height - 10, 0.8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Engine exhaust
    ctx.fillStyle = "#666"
    ctx.beginPath()
    ctx.roundRect(x + 3, y + height - 14, 4, 4, 1)
    ctx.fill()

    ctx.strokeStyle = "#555"
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Restore context
    ctx.restore()
  }

  private drawAstronaut(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Astronaut helmet
    const helmetGradient = ctx.createRadialGradient(x, y, 0, x, y, 6)
    helmetGradient.addColorStop(0, "#FFF")
    helmetGradient.addColorStop(1, "#DDD")

    ctx.fillStyle = helmetGradient
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()

    // Helmet visor
    const visorGradient = ctx.createLinearGradient(x - 3, y - 2, x + 3, y + 2)
    visorGradient.addColorStop(0, "#99F")
    visorGradient.addColorStop(1, "#55A")

    ctx.fillStyle = visorGradient
    ctx.beginPath()
    ctx.ellipse(x + 1, y, 3, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Helmet outline
    ctx.strokeStyle = "#AAA"
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.stroke()

    // Spacesuit body (just a hint as most is inside the buggy)
    ctx.fillStyle = "#CCC"
    ctx.beginPath()
    ctx.roundRect(x - 4, y + 5, 8, 4, 1)
    ctx.fill()
  }

  private drawEnhancedWheel(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    // Wheel shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.beginPath()
    ctx.arc(x + 1, y + 1, radius, 0, Math.PI * 2)
    ctx.fill()

    // Wheel tire - gradient for 3D effect
    const tireGradient = ctx.createRadialGradient(x, y, radius - 2, x, y, radius)
    tireGradient.addColorStop(0, "#555")
    tireGradient.addColorStop(1, "#222")

    ctx.fillStyle = tireGradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Tire treads
    ctx.strokeStyle = "#111"
    ctx.lineWidth = 0.5

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + this.wheelRotation
      ctx.beginPath()
      ctx.arc(x, y, radius, angle, angle + 0.2)
      ctx.stroke()
    }

    // Wheel inner part - gradient for metallic look
    const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, radius - 2)
    innerGradient.addColorStop(0, "#DDD")
    innerGradient.addColorStop(1, "#999")

    ctx.fillStyle = innerGradient
    ctx.beginPath()
    ctx.arc(x, y, radius - 2, 0, Math.PI * 2)
    ctx.fill()

    // Wheel spokes (animated) with metallic look
    ctx.strokeStyle = "#777"
    ctx.lineWidth = 1
    ctx.beginPath()

    // Rotate context for spokes
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(this.wheelRotation)

    // Draw 6 spokes for more detail
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(angle) * (radius - 3), Math.sin(angle) * (radius - 3))
    }

    ctx.restore()
    ctx.stroke()

    // Wheel center with highlight
    const centerGradient = ctx.createRadialGradient(x - 0.5, y - 0.5, 0, x, y, 2)
    centerGradient.addColorStop(0, "#FFF")
    centerGradient.addColorStop(1, "#AAA")

    ctx.fillStyle = centerGradient
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()

    // Center bolt
    ctx.fillStyle = "#666"
    ctx.beginPath()
    ctx.arc(x, y, 0.8, 0, Math.PI * 2)
    ctx.fill()
  }
}

export class Terrain {
  private width: number
  private height: number
  private segments: TerrainSegment[]
  private segmentWidth = 20
  private craters: Crater[]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.segments = this.generateTerrain()
    this.craters = this.generateCraters()
  }

  private generateTerrain(): TerrainSegment[] {
    const numSegments = Math.ceil(this.width / this.segmentWidth) + 1
    const segments: TerrainSegment[] = []

    for (let i = 0; i < numSegments; i++) {
      segments.push({
        height: 0,
        color: this.getRandomTerrainColor(),
        detail: Math.random(),
      })
    }

    return segments
  }

  private generateCraters(): Crater[] {
    const craters: Crater[] = []
    const numCraters = Math.floor(this.width / 100)

    for (let i = 0; i < numCraters; i++) {
      craters.push({
        x: Math.random() * this.width,
        y: this.height - 40 + Math.random() * 10,
        radius: Math.random() * 15 + 5,
        depth: Math.random() * 0.5 + 0.2,
      })
    }

    return craters
  }

  private getRandomTerrainColor(): string {
    // Generate slightly varying shades of gray for the terrain
    const baseColor = 85 // Base gray value
    const variance = 15 // How much the color can vary
    const colorValue = baseColor + Math.floor(Math.random() * variance - variance / 2)
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`
  }

  public update(deltaTime: number, gameSpeed: number) {
    // Shift terrain segments to create scrolling effect
    const pixelsToShift = gameSpeed * deltaTime * 60
    const segmentsToShift = Math.floor(pixelsToShift / this.segmentWidth)

    if (segmentsToShift > 0) {
      this.segments.splice(0, segmentsToShift)

      // Add new segments
      for (let i = 0; i < segmentsToShift; i++) {
        this.segments.push({
          height: 0,
          color: this.getRandomTerrainColor(),
          detail: Math.random(),
        })
      }

      // Update crater positions
      for (const crater of this.craters) {
        crater.x -= pixelsToShift

        // If crater is off-screen, reset it to the right side
        if (crater.x < -crater.radius * 2) {
          crater.x = this.width + Math.random() * 100
          crater.y = this.height - 40 + Math.random() * 10
          crater.radius = Math.random() * 15 + 5
          crater.depth = Math.random() * 0.5 + 0.2
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Draw main terrain with gradient
    const terrainGradient = ctx.createLinearGradient(0, this.height - 40, 0, this.height)
    terrainGradient.addColorStop(0, "#666")
    terrainGradient.addColorStop(1, "#444")

    ctx.fillStyle = terrainGradient
    ctx.fillRect(0, this.height - 40, this.width, 40)

    // Draw terrain segments with varying colors
    for (let i = 0; i < this.segments.length; i++) {
      const x = i * this.segmentWidth
      const y = this.height - 40 + this.segments[i].height

      // Draw segment with its color
      ctx.fillStyle = this.segments[i].color
      ctx.fillRect(x, y, this.segmentWidth, 2)

      // Add terrain details (small rocks, etc.)
      if (this.segments[i].detail > 0.7) {
        ctx.fillStyle = "#777"
        ctx.beginPath()
        ctx.arc(x + Math.random() * this.segmentWidth, y - 1, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw craters
    for (const crater of this.craters) {
      // Create crater gradient for 3D effect
      const craterGradient = ctx.createRadialGradient(crater.x, crater.y, 0, crater.x, crater.y, crater.radius)

      craterGradient.addColorStop(0, `rgba(50, 50, 50, ${crater.depth})`)
      craterGradient.addColorStop(0.7, `rgba(60, 60, 60, ${crater.depth * 0.7})`)
      craterGradient.addColorStop(1, "rgba(70, 70, 70, 0)")

      ctx.fillStyle = craterGradient
      ctx.beginPath()
      ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2)
      ctx.fill()

      // Add crater rim highlight
      ctx.strokeStyle = "#777"
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(crater.x, crater.y, crater.radius * 0.9, Math.PI * 0.8, Math.PI * 1.5)
      ctx.stroke()
    }
  }
}

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private options: GameOptions

  private buggy: Buggy
  private terrain: Terrain
  private obstacles: Obstacle[]
  private starLayers: StarLayer[]
  private dustParticles: DustParticle[]
  private mountainLayers: MountainLayer[]

  private animationFrameId: number | null = null
  private lastFrameTime = 0
  private gameSpeed = 5
  private originalSpeed = 5 // Store original speed before braking
  private score = 0
  private running = false
  private assetsLoaded = false
  private braking = false

  constructor(canvas: HTMLCanvasElement, options: GameOptions) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.options = options

    this.buggy = new Buggy(50, this.canvas.height - 70)
    this.terrain = new Terrain(this.canvas.width, this.canvas.height)
    this.obstacles = []
    this.starLayers = this.createStarLayers()
    this.dustParticles = []
    this.mountainLayers = this.createMountainLayers()

    this.preloadAssets()
  }

  private createStarLayers(): StarLayer[] {
    // Create multiple star layers with different speeds for parallax effect
    const layers: StarLayer[] = [
      { stars: [], speed: 0.3 }, // Distant stars (slow)
      { stars: [], speed: 0.6 }, // Middle stars (medium)
      { stars: [], speed: 1.0 }, // Close stars (fast)
    ]

    // Populate each layer with stars
    layers.forEach((layer, layerIndex) => {
      const count = 40 - layerIndex * 10 // More stars in distant layers
      for (let i = 0; i < count; i++) {
        layer.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * (this.canvas.height - 100),
          size: 0.5 + layerIndex * 0.8 + Math.random() * 1.2, // Larger stars in closer layers
          brightness: 0.5 + Math.random() * 0.5,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        })
      }
    })

    return layers
  }

  // Update the createMountainLayers method to increase the parallax speeds
  private createMountainLayers(): MountainLayer[] {
    // Create two mountain layers with different characteristics
    return [
      {
        // Far mountains (slower, darker but still visible)
        points: this.generateMountainPoints(this.canvas.width, 40, 0.3),
        color: "#444", // Slightly lighter dark gray for better visibility against space
        height: 100, // Increased height
        speed: 0.5, // Increased from 0.15 to 0.5 for faster parallax
        x: 0,
        width: this.canvas.width * 2, // Make wider to avoid visible seams
      },
      {
        // Near mountains (faster, lighter color, now in front)
        points: this.generateMountainPoints(this.canvas.width, 30, 0.5),
        color: "#666", // Lighter gray for closer mountains
        height: 120, // Increased height even more for front mountains
        speed: 0.8, // Increased from 0.25 to 0.8 for faster parallax
        x: 0,
        width: this.canvas.width * 2, // Make wider to avoid visible seams
      },
    ]
  }

  private generateMountainPoints(width: number, segments: number, jaggedness: number): number[] {
    // Generate points for a jagged mountain silhouette
    const points: number[] = []
    const segmentWidth = width / segments

    // Start with 0 height
    points.push(0)

    // Generate random heights for each segment
    for (let i = 1; i < segments; i++) {
      // More jagged means more extreme height differences
      const height = Math.random() * jaggedness
      points.push(height)
    }

    // End with 0 height
    points.push(0)

    return points
  }

  private preloadAssets() {
    // Only preload buggy image now that we're using canvas-drawn mountains
    this.buggy.loadImage(() => {
      this.assetsLoaded = true
      console.log("All assets loaded successfully")
    })
  }

  public start() {
    if (this.running) return

    this.running = true
    this.lastFrameTime = performance.now()
    this.gameLoop(this.lastFrameTime)
  }

  public pause() {
    this.running = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  public resume() {
    if (this.running) return

    this.running = true
    this.lastFrameTime = performance.now()
    this.gameLoop(this.lastFrameTime)
  }

  public reset() {
    this.score = 0
    this.gameSpeed = 5
    this.originalSpeed = 5
    this.obstacles = []
    this.dustParticles = []
    this.buggy.reset(50, this.canvas.height - 70)
    this.braking = false
    this.options.onScore(this.score)
  }

  public destroy() {
    this.pause()
  }

  public jump() {
    if (this.buggy.jump(this.braking)) {
      this.options.onJump()
      // Add dust particles when jumping
      this.createDustParticles(this.buggy.x + this.buggy.width / 2, this.buggy.y + this.buggy.height, 10)

      // Add extra dust particles when brake-jumping
      if (this.braking) {
        this.createDustParticles(this.buggy.x + this.buggy.width / 4, this.buggy.y + this.buggy.height, 5)
        this.createDustParticles(this.buggy.x + (this.buggy.width * 3) / 4, this.buggy.y + this.buggy.height, 5)
      }
    }
  }

  public brake(isBraking: boolean) {
    // If the buggy is in the air, ignore brake activation attempts
    // But allow brake release even in the air
    if (isBraking && this.buggy.isJumping) {
      return
    }

    // If starting to brake, store the current speed
    if (isBraking && !this.braking) {
      this.originalSpeed = this.gameSpeed
      this.createDustParticles(this.buggy.x + this.buggy.width / 4, this.buggy.y + this.buggy.height, 10)
      this.createDustParticles(this.buggy.x + (this.buggy.width * 3) / 4, this.buggy.y + this.buggy.height, 10)
    }

    // If releasing brake, restore the original speed
    if (!isBraking && this.braking) {
      // Create dust particles when accelerating from stop
      if (this.gameSpeed < 1) {
        this.createDustParticles(this.buggy.x + this.buggy.width / 4, this.buggy.y + this.buggy.height, 15)
        this.createDustParticles(this.buggy.x + (this.buggy.width * 3) / 4, this.buggy.y + this.buggy.height, 15)
      }

      // Immediately restore original speed
      this.gameSpeed = this.originalSpeed
    }

    this.braking = isBraking
  }

  private createDustParticles(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.dustParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 2 + 1),
        size: Math.random() * 3 + 1,
        alpha: 1,
        life: 1,
        color: "#d3d3d3",
      })
    }
  }

  private gameLoop(timestamp: number) {
    if (!this.running) return

    const deltaTime = timestamp - this.lastFrameTime
    this.lastFrameTime = timestamp

    this.update(deltaTime / 1000)
    this.render()

    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))
  }

  private update(deltaTime: number) {
    // If the buggy is jumping and braking, automatically release the brake
    if (this.buggy.isJumping && this.braking) {
      // Keep the brake-jumping state but release the actual brake
      this.brake(false)
    }

    // Update game speed (gradually increases unless braking)
    if (this.braking) {
      // When braking, rapidly slow down to a complete stop
      this.gameSpeed = Math.max(0, this.gameSpeed - deltaTime * 10)

      // Create dust particles while braking (occasionally)
      if (Math.random() < 0.2) {
        this.createDustParticles(this.buggy.x + this.buggy.width / 4, this.buggy.y + this.buggy.height, 2)
      }
    } else {
      // Normal speed increase - but only if we're below the original speed + some margin
      // This prevents the game from speeding up too much after long periods
      const maxSpeed = this.originalSpeed + 2 // Allow some natural increase
      if (this.gameSpeed < maxSpeed) {
        this.gameSpeed += deltaTime * 0.1

        // Update the original speed if we're not recovering from braking
        if (this.gameSpeed > this.originalSpeed) {
          this.originalSpeed = this.gameSpeed
        }
      }
    }

    // Update buggy
    this.buggy.update(deltaTime, this.braking)

    // Only update terrain and background elements if not at a complete stop
    if (this.gameSpeed > 0) {
      // Update stars with parallax effect
      this.updateStars(deltaTime)

      // Update mountain layers
      this.updateMountains(deltaTime)

      // Update terrain
      this.terrain.update(deltaTime, this.gameSpeed)

      // Update obstacles
      this.updateObstacles(deltaTime)
    }

    // Update dust particles (always update these for visual feedback)
    this.updateDustParticles(deltaTime)

    // Generate new obstacles (only if moving)
    if (this.gameSpeed > 0) {
      this.generateObstacles()
    }

    // Check collisions
    this.checkCollisions()

    // Update score (slower when braking, no score when stopped)
    const scoreMultiplier = this.braking ? (this.gameSpeed > 0 ? 0.5 : 0) : 1
    this.score += deltaTime * 10 * scoreMultiplier
    this.options.onScore(Math.floor(this.score))
  }

  private updateStars(deltaTime: number) {
    // Update each star layer with its own speed (parallax effect)
    this.starLayers.forEach((layer) => {
      layer.stars.forEach((star) => {
        // Move stars based on layer speed and game speed
        star.x -= layer.speed * this.gameSpeed * deltaTime

        // Reset star position when it moves off-screen
        if (star.x < 0) {
          star.x = this.canvas.width
          star.y = Math.random() * (this.canvas.height - 100)
        }
      })
    })
  }

  private updateMountains(deltaTime: number) {
    // Update each mountain layer with its own speed (parallax effect)
    this.mountainLayers.forEach((layer) => {
      // Move the layer based on its speed and game speed
      layer.x -= layer.speed * this.gameSpeed * deltaTime

      // Reset position when the layer has scrolled completely
      if (layer.x <= -layer.width / 2) {
        layer.x = 0
      }
    })
  }

  private updateDustParticles(deltaTime: number) {
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const particle = this.dustParticles[i]

      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Apply gravity
      particle.vy += 0.1

      // Fade out
      particle.life -= deltaTime * 2
      particle.alpha = particle.life

      // Remove dead particles
      if (particle.life <= 0) {
        this.dustParticles.splice(i, 1)
      }
    }
  }

  private updateObstacles(deltaTime: number) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i]
      obstacle.x -= this.gameSpeed * deltaTime * 60

      // Remove obstacles that are off-screen
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1)
      }
    }
  }

  private generateObstacles() {
    // Generate new obstacles randomly
    if (this.obstacles.length < 3 && Math.random() < 0.01 * this.gameSpeed) {
      const minGap = 300 - this.gameSpeed * 5 // Gap gets smaller as speed increases
      const lastObstacleX = this.obstacles.length > 0 ? this.obstacles[this.obstacles.length - 1].x : 0

      if (lastObstacleX < this.canvas.width - minGap) {
        // Updated to match buggy dimensions more closely
        const width = this.buggy.width * (Math.random() * 0.3 + 0.7) // 70-100% of buggy width
        const height = this.buggy.height * (Math.random() * 0.2 + 0.8) // 80-100% of buggy height

        // Generate jagged points for the trapezoid
        const jaggedness = Math.random() * 0.3 + 0.1 // How jagged the rock is
        const points = []

        // Generate 4-8 jagged points for the top of the rock
        const numPoints = Math.floor(Math.random() * 5) + 4
        for (let i = 0; i < numPoints; i++) {
          points.push(Math.random() * jaggedness)
        }

        this.obstacles.push({
          x: this.canvas.width,
          y: this.canvas.height - 40 - height, // Position on the terrain
          width,
          height,
          type: Math.random() > 0.5 ? "large" : "small",
          rotation: Math.random() * 0.2 - 0.1, // Slight rotation
          jaggedness,
          points,
        })
      }
    }
  }

  private checkCollisions() {
    const groundY = this.canvas.height - 40 - this.buggy.height

    if (this.buggy.y > groundY) {
      // Ensure buggy doesn't fall through the ground
      this.buggy.y = groundY
      this.buggy.isJumping = false
      this.buggy.velocity = 0
      this.buggy.brakeJumping = false // Reset brake-jumping state when landing

      // Create dust particles when landing
      if (this.buggy.wasJumping) {
        this.createDustParticles(this.buggy.x + this.buggy.width / 2, this.buggy.y + this.buggy.height, 15)
        this.buggy.wasJumping = false
      }
    }

    // Check collision with obstacles
    for (const obstacle of this.obstacles) {
      if (this.isColliding(this.buggy, obstacle)) {
        this.gameOver()
        break
      }
    }
  }

  private isColliding(buggy: Buggy, obstacle: Obstacle): boolean {
    // Use a slightly smaller hitbox for better gameplay feel
    const hitboxPadding = 4
    return (
      buggy.x + hitboxPadding < obstacle.x + obstacle.width &&
      buggy.x + buggy.width - hitboxPadding > obstacle.x &&
      buggy.y + hitboxPadding < obstacle.y + obstacle.height &&
      buggy.y + buggy.height - hitboxPadding > obstacle.y
    )
  }

  private gameOver() {
    this.running = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.options.onGameOver()
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#111"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw background gradient (space)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, "#000")
    gradient.addColorStop(0.5, "#111")
    gradient.addColorStop(1, "#222")
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw stars with parallax effect and twinkling
    this.renderStars()

    // Draw mountain layers
    this.renderMountains()

    // Draw terrain
    this.terrain.render(this.ctx)

    // Draw obstacles
    this.renderObstacles()

    // Draw dust particles
    this.renderDustParticles()

    // Draw buggy
    this.buggy.render(this.ctx, this.braking)

    // Debug info for asset loading (can be removed in production)
    if (!this.assetsLoaded) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      this.ctx.font = "12px Arial"
      this.ctx.fillText("Loading assets...", 10, 20)
    }

    // Show braking indicator
    if (this.braking) {
      // Show a more prominent indicator when completely stopped
      if (this.gameSpeed <= 0.1) {
        this.ctx.fillStyle = "rgba(255, 50, 50, 0.8)"
        this.ctx.font = "bold 16px Arial"
        this.ctx.fillText("STOPPED", 10, 20)
      } else {
        this.ctx.fillStyle = "rgba(255, 100, 100, 0.7)"
        this.ctx.font = "14px Arial"
        this.ctx.fillText("BRAKING", 10, 20)
      }
    }

    // Show brake-jump indicator
    if (this.buggy.brakeJumping && this.buggy.isJumping) {
      this.ctx.fillStyle = "rgba(255, 150, 50, 0.7)"
      this.ctx.font = "12px Arial"
      this.ctx.fillText("LONG JUMP", 10, 40)
    }
  }

  private renderStars() {
    // Render each star layer
    this.starLayers.forEach((layer) => {
      layer.stars.forEach((star) => {
        const twinkle = Math.sin(performance.now() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`

        // Draw stars as small circles for a more refined look
        this.ctx.beginPath()
        this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        this.ctx.fill()
      })
    })
  }

  private renderMountains() {
    // Render mountain layers in correct order (back to front)
    this.mountainLayers.forEach((layer) => {
      // Create a gradient for the mountains
      const gradient = this.ctx.createLinearGradient(
        0,
        this.canvas.height - layer.height - 40,
        0,
        this.canvas.height - 40,
      )
      gradient.addColorStop(0, layer.color)
      gradient.addColorStop(1, this.adjustColor(layer.color, -20)) // Darker at the bottom

      this.ctx.fillStyle = gradient

      // Draw the mountains
      this.ctx.beginPath()

      // Start at the bottom left
      this.ctx.moveTo(layer.x, this.canvas.height - 40)

      // Draw the mountain silhouette
      const segmentWidth = layer.width / (layer.points.length - 1)
      for (let i = 0; i < layer.points.length; i++) {
        const x = layer.x + i * segmentWidth
        const y = this.canvas.height - 40 - layer.points[i] * layer.height
        this.ctx.lineTo(x, y)
      }

      // Complete the path back to the bottom
      this.ctx.lineTo(layer.x + layer.width, this.canvas.height - 40)
      this.ctx.closePath()
      this.ctx.fill()

      // Add some subtle details to the mountains
      this.ctx.strokeStyle = this.adjustColor(layer.color, 10) // Slightly lighter for highlights
      this.ctx.lineWidth = 0.5

      // Draw a few random highlight lines
      for (let i = 0; i < 10; i++) {
        const startX = layer.x + Math.random() * layer.width
        const startY = this.canvas.height - 40 - Math.random() * layer.height * 0.8

        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)
        this.ctx.lineTo(startX + 10 + Math.random() * 20, startY + 5 + Math.random() * 10)
        this.ctx.stroke()
      }
    })
  }

  // Update the adjustColor method to handle the new colors
  private adjustColor(color: string, amount: number): string {
    // For simplicity, let's work with RGB values directly
    if (color === "#444") {
      // Darker gray for distant mountains
      const r = Math.max(0, Math.min(255, 68 + amount))
      const g = Math.max(0, Math.min(255, 68 + amount))
      const b = Math.max(0, Math.min(255, 68 + amount))
      return `rgb(${r}, ${g}, ${b})`
    } else if (color === "#666") {
      // Lighter gray for closer mountains
      const r = Math.max(0, Math.min(255, 102 + amount))
      const g = Math.max(0, Math.min(255, 102 + amount))
      const b = Math.max(0, Math.min(255, 102 + amount))
      return `rgb(${r}, ${g}, ${b})`
    } else {
      // Default case - return the original color
      return color
    }
  }

  private renderObstacles() {
    for (const obstacle of this.obstacles) {
      // Save context for rotation
      this.ctx.save()

      // Translate to the center of the obstacle
      this.ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)

      // Apply rotation
      this.ctx.rotate(obstacle.rotation)

      // Draw the rock with gradient for 3D effect
      const gradient = this.ctx.createLinearGradient(
        -obstacle.width / 2,
        -obstacle.height / 2,
        obstacle.width / 2,
        obstacle.height / 2,
      )

      // Create a more realistic rock gradient
      if (obstacle.type === "large") {
        gradient.addColorStop(0, "#888")
        gradient.addColorStop(0.4, "#777")
        gradient.addColorStop(0.6, "#666")
        gradient.addColorStop(1, "#555")
      } else {
        gradient.addColorStop(0, "#999")
        gradient.addColorStop(0.5, "#888")
        gradient.addColorStop(1, "#666")
      }

      this.ctx.fillStyle = gradient

      // Draw a jagged trapezoid shape
      this.ctx.beginPath()

      // Bottom left corner
      this.ctx.moveTo(-obstacle.width / 2, obstacle.height / 2)

      // Left side (slightly angled)
      this.ctx.lineTo((-obstacle.width / 2) * 0.9, -obstacle.height / 2)

      // Top side with jagged points
      const topWidth = obstacle.width * 0.8 // Top is narrower than bottom
      const pointSpacing = topWidth / (obstacle.points.length - 1)

      for (let i = 0; i < obstacle.points.length; i++) {
        const x = -topWidth / 2 + i * pointSpacing
        const y = -obstacle.height / 2 - obstacle.points[i] * obstacle.height * 0.2
        this.ctx.lineTo(x, y)
      }

      // Right side (slightly angled)
      this.ctx.lineTo((obstacle.width / 2) * 0.9, -obstacle.height / 2)
      this.ctx.lineTo(obstacle.width / 2, obstacle.height / 2)

      // Close the path
      this.ctx.closePath()
      this.ctx.fill()

      // Add rock details - cracks and texture
      this.ctx.strokeStyle = "#444"
      this.ctx.lineWidth = 0.8

      // Draw 2-3 random cracks
      const numCracks = obstacle.type === "large" ? 3 : 2
      for (let i = 0; i < numCracks; i++) {
        const startX = Math.random() * obstacle.width - obstacle.width / 2
        const startY = Math.random() * obstacle.height - obstacle.height / 2

        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)

        // Create a jagged crack with 2-3 segments
        let currentX = startX
        let currentY = startY
        const segments = Math.floor(Math.random() * 2) + 2

        for (let j = 0; j < segments; j++) {
          const nextX = currentX + (Math.random() * obstacle.width * 0.3 - obstacle.width * 0.15)
          const nextY = currentY + (Math.random() * obstacle.height * 0.3 - obstacle.height * 0.15)
          this.ctx.lineTo(nextX, nextY)
          currentX = nextX
          currentY = nextY
        }

        this.ctx.stroke()
      }

      // Add some small dots for texture
      this.ctx.fillStyle = "#555"
      for (let i = 0; i < 5; i++) {
        const dotX = Math.random() * obstacle.width - obstacle.width / 2
        const dotY = Math.random() * obstacle.height - obstacle.height / 2
        const dotSize = Math.random() * 1.5 + 0.5

        this.ctx.beginPath()
        this.ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2)
        this.ctx.fill()
      }

      // Draw shadow
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      this.ctx.beginPath()
      this.ctx.ellipse(2, obstacle.height / 2 - 2, obstacle.width / 2 - 2, obstacle.height / 6, 0, 0, Math.PI * 2)
      this.ctx.fill()

      // Restore context
      this.ctx.restore()
    }
  }

  private renderDustParticles() {
    for (const particle of this.dustParticles) {
      this.ctx.fillStyle = `rgba(211, 211, 211, ${particle.alpha})`
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
}
