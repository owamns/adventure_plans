<template>
  <div class="min-h-screen bg-gradient-to-b from-cyan-200 to-blue-300 p-4 relative overflow-hidden">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-3xl font-bold text-blue-900 mb-2 flex-1">🐧 Deslizador de Pingüinos</h2>
          <button
              @click="closeGame"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
          >
            ✕ Cerrar
          </button>
        </div>
        <p class="text-blue-800">Guía a los pingüinos hacia los peces usando obstáculos estratégicos</p>
        <div class="flex justify-center gap-4 mt-4">
          <div class="bg-white px-4 py-2 rounded-lg shadow">
            <span class="text-sm text-gray-700">Nivel:</span>
            <span class="font-bold text-blue-900"> {{ currentLevel }}</span>
          </div>
          <div class="bg-white px-4 py-2 rounded-lg shadow">
            <span class="text-sm text-gray-700">Peces:</span>
            <span class="font-bold text-orange-700"> 🐟 {{ fishCollected }}/{{ totalFish }}</span>
          </div>
          <div class="bg-white px-4 py-2 rounded-lg shadow">
            <span class="text-sm text-gray-700">Obstáculos:</span>
            <span class="font-bold text-green-700"> 🧊 {{ obstaclesRemaining }}</span>
          </div>
        </div>
      </div>

      <!-- Instrucciones -->
      <div v-if="!gameStarted && !gameOver" class="bg-white rounded-xl shadow-lg p-6 mb-6 text-center" style="margin: 1rem 0;">
        <h3 class="text-xl font-bold mb-4 text-gray-800">🎮 Instrucciones</h3>
        <div class="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <h4 class="font-semibold mb-2 text-gray-800">Cómo Jugar:</h4>
            <ul class="space-y-1 text-sm text-gray-700">
              <li>🖱️ Haz clic para colocar obstáculos de hielo</li>
              <li>🐧 Los pingüinos se deslizan en línea recta</li>
              <li>🧊 Rebotan al chocar con obstáculos</li>
              <li>🐟 Deben recoger todos los peces</li>
              <li>🚪 Luego llegar a la salida</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2 text-gray-800">Objetivos:</h4>
            <ul class="space-y-1 text-sm text-gray-700">
              <li>🎯 Completa 5 niveles para ganar</li>
              <li>🧠 Usa la lógica y física del hielo</li>
              <li>⚡ Los obstáculos son limitados</li>
              <li>🔄 Puedes reiniciar el nivel</li>
              <li>🏆 Cada nivel es más desafiante</li>
            </ul>
          </div>
        </div>
        <button
            @click="startGame"
            class="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors" style="margin: 1rem 0;"
        >
          🚀 ¡Comenzar Aventura!
        </button>
      </div>

      <!-- Área de juego -->
      <div
          v-if="gameStarted"
          class="relative bg-gradient-to-b from-blue-100 to-cyan-100 rounded-xl shadow-lg overflow-hidden border-4 border-blue-200"
          style="height: 500px; width: 100%; margin: 1rem 0;"
          @click="placePiece"
          ref="gameArea"
      >
        <!-- Grid de fondo -->
        <div class="absolute inset-0 opacity-20">
          <div
              v-for="i in 20"
              :key="`h-${i}`"
              class="absolute border-t border-blue-300"
              style="width: 100%;"
              :style="{ top: `${i * 5}%` }"
          ></div>
          <div
              v-for="j in 20"
              :key="`v-${j}`"
              class="absolute border-l border-blue-300"
              style="height: 100%;"
              :style="{ left: `${j * 5}%` }"
          ></div>
        </div>

        <!-- Peces -->
        <div
            v-for="fish in fishes"
            :key="fish.id"
            class="absolute flex items-center justify-center animate-pulse"
            :style="{
            left: `${fish.x}%`,
            top: `${fish.y}%`,
            width: '40px',
            height: '40px',
            transform: 'translate(-50%, -50%)'
          }"
        >
          <span class="text-2xl">{{ fish.collected ? '✨' : '🐟' }}</span>
        </div>

        <!-- Salida -->
        <div
            class="absolute flex items-center justify-center bg-green-200 rounded-full border-2 border-green-400"
            :style="{
              left: `${exit.x}%`,
              top: `${exit.y}%`,
              width: '50px',
              height: '50px',
              transform: 'translate(-50%, -50%)'
            }"
        >
          <span class="text-2xl">🚪</span>
        </div>

        <!-- Punto de inicio -->
        <div
            class="absolute flex items-center justify-center bg-yellow-200 rounded-full border-2 border-yellow-400"
            :style="{
              left: `${startPoint.x}%`,
              top: `${startPoint.y}%`,
              width: '50px',
              height: '50px',
              transform: 'translate(-50%, -50%)'
            }"
        >
          <span class="text-2xl">🏁</span>
        </div>

        <!-- Obstáculos colocados -->
        <div
            v-for="obstacle in placedObstacles"
            :key="obstacle.id"
            class="absolute flex items-center justify-center bg-blue-300 rounded border-2 border-blue-500"
            :style="{
            left: `${obstacle.x}%`,
            top: `${obstacle.y}%`,
            width: '30px',
            height: '30px',
            transform: 'translate(-50%, -50%)'
          }"
        >
          <span class="text-lg">🧊</span>
        </div>

        <!-- Pingüinos -->
        <div
            v-for="penguin in penguins"
            :key="penguin.id"
            class="absolute flex items-center justify-center transition-all duration-300 ease-linear z-10"
            :style="{
            left: `${penguin.x}%`,
            top: `${penguin.y}%`,
            width: '40px',
            height: '40px',
            transform: `translate(-50%, -50%) rotate(${penguin.rotation}deg) ${penguin.isMoving ? 'scale(1.1)' : 'scale(1)'}`
          }"
        >
          <span class="text-2xl">🐧</span>
        </div>

        <!-- Efectos de partículas -->
        <div
            v-for="particle in particles"
            :key="particle.id"
            class="absolute text-xl animate-bounce z-20"
            :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: 'translate(-50%, -50%)',
            opacity: particle.opacity
          }"
        >
          {{ particle.emoji }}
        </div>
      </div>

      <!-- Controles del nivel -->
      <div v-if="gameStarted" class="flex justify-center gap-4 mt-4">
        <!-- Botón de lanzar -->
        <button
            @click.stop="launchPenguins"
            :disabled="penguinsMoving"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {{ penguinsMoving ? '🐧 Deslizando...' : '🚀 ¡Lanzar Pingüinos!' }}
        </button>
        <button
            @click="resetLevel"
            class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          🔄 Reiniciar Nivel
        </button>
      </div>
      <!-- Completar nivel -->
      <div v-if="levelComplete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-2xl font-bold mb-2 text-gray-800">¡Nivel Completado!</h3>
          <p class="text-gray-700 mb-4">Los pingüinos llegaron a salvo</p>
          <button
              @click="nextLevel"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {{ currentLevel >= 5 ? '🏆 ¡Finalizar Juego!' : '➡️ Siguiente Nivel' }}
          </button>
        </div>
      </div>

      <!-- Game Over -->
      <div v-if="gameOver" class="bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="text-6xl mb-4">{{ gameCompleted ? '🏆' : '😢' }}</div>
        <h3 class="text-2xl font-bold mb-2 text-gray-800">
          {{ gameCompleted ? '¡Felicitaciones!' : '¡Fin del Juego!' }}
        </h3>
        <p class="text-gray-700 mb-4">
          {{ gameCompleted ? 'Has completado todos los niveles exitosamente' : 'Los pingüinos necesitan tu ayuda' }}
        </p>
        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="font-bold text-blue-800">{{ gameCompleted ? 5 : currentLevel - 1 }}</div>
            <div class="text-sm text-gray-700">Niveles Completados</div>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <div class="font-bold text-orange-700">{{ totalFishCollected }}</div>
            <div class="text-sm text-gray-700">Peces Rescatados</div>
          </div>
        </div>
        <div class="flex justify-center gap-4">
          <button
              v-if="!gameCompleted"
              @click="resetGame"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Intentar de Nuevo
          </button>
          <button
              @click="handleGameComplete"
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {{ gameCompleted ? '🎉 ¡Continuar Aventura!' : '🏠 Volver al Mapa' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Fish {
  id: number
  x: number
  y: number
  collected: boolean
}

interface Penguin {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  isMoving: boolean
  rotation: number
  hasReachedExit: boolean
}

interface Obstacle {
  id: number
  x: number
  y: number
}

interface Particle {
  id: number
  x: number
  y: number
  emoji: string
  opacity: number
}

interface Level {
  penguins: { x: number, y: number, vx: number, vy: number }[]
  fishes: { x: number, y: number }[]
  exit: { x: number, y: number }
  start: { x: number, y: number }
  maxObstacles: number
}

const emit = defineEmits<{
  complete: []
}>()

// Estado del juego
const gameStarted = ref(false)
const gameOver = ref(false)
const gameCompleted = ref(false)
const levelComplete = ref(false)
const penguinsMoving = ref(false)
const currentLevel = ref(1)
const totalFishCollected = ref(0)

// Elementos del juego
const penguins = ref<Penguin[]>([])
const fishes = ref<Fish[]>([])
const placedObstacles = ref<Obstacle[]>([])
const particles = ref<Particle[]>([])
const exit = ref({ x: 90, y: 50 })
const startPoint = ref({ x: 10, y: 50 })

// Referencias
const gameArea = ref<HTMLElement>()
let gameLoop: number | null = null
let particleIdCounter = 0

// Computed
const fishCollected = computed(() => fishes.value.filter(f => f.collected).length)
const totalFish = computed(() => fishes.value.length)
const obstaclesRemaining = computed(() => Math.max(0, levels[currentLevel.value - 1]?.maxObstacles - placedObstacles.value.length))

// Definición de niveles
const levels: Level[] = [
  {
    penguins: [{ x: 10, y: 50, vx: 3, vy: 0 }],
    fishes: [{ x: 50, y: 30 }, { x: 70, y: 70 }],
    exit: { x: 90, y: 50 },
    start: { x: 10, y: 50 },
    maxObstacles: 3
  },
  {
    penguins: [{ x: 10, y: 30, vx: 3, vy: 0 }, { x: 10, y: 70, vx: 3, vy: 0 }],
    fishes: [{ x: 30, y: 50 }, { x: 60, y: 25 }, { x: 60, y: 75 }],
    exit: { x: 90, y: 50 },
    start: { x: 10, y: 50 },
    maxObstacles: 4
  },
  {
    penguins: [{ x: 50, y: 10, vx: 0, vy: 3 }],
    fishes: [{ x: 20, y: 40 }, { x: 80, y: 40 }, { x: 50, y: 80 }],
    exit: { x: 50, y: 90 },
    start: { x: 50, y: 10 },
    maxObstacles: 5
  },
  {
    penguins: [{ x: 10, y: 50, vx: 2.5, vy: 1.5 }, { x: 90, y: 50, vx: -2.5, vy: -1.5 }],
    fishes: [{ x: 25, y: 25 }, { x: 75, y: 75 }, { x: 50, y: 50 }, { x: 25, y: 75 }],
    exit: { x: 50, y: 10 },
    start: { x: 50, y: 90 },
    maxObstacles: 6
  },
  {
    penguins: [{ x: 20, y: 20, vx: 2, vy: 2 }, { x: 80, y: 20, vx: -2, vy: 2 }, { x: 50, y: 80, vx: 0, vy: -3 }],
    fishes: [{ x: 30, y: 50 }, { x: 70, y: 50 }, { x: 50, y: 30 }, { x: 40, y: 70 }, { x: 60, y: 70 }],
    exit: { x: 50, y: 50 },
    start: { x: 50, y: 10 },
    maxObstacles: 8
  }
]

// Funciones de utilidad
const createParticle = (x: number, y: number, emoji: string) => {
  const particle: Particle = {
    id: particleIdCounter++,
    x,
    y,
    emoji,
    opacity: 1
  }

  particles.value.push(particle)

  setTimeout(() => {
    const index = particles.value.findIndex(p => p.id === particle.id)
    if (index > -1) {
      particles.value.splice(index, 1)
    }
  }, 1500)
}

// Colocación de obstáculos
const placePiece = (event: MouseEvent) => {
  if (penguinsMoving.value || obstaclesRemaining.value <= 0) return

  const rect = gameArea.value?.getBoundingClientRect()
  if (!rect) return

  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  // Verificar que no esté muy cerca de otros elementos
  const tooClose = [
    ...placedObstacles.value,
    ...fishes.value,
    { x: exit.value.x, y: exit.value.y },
    { x: startPoint.value.x, y: startPoint.value.y }
  ].some(item => Math.abs(item.x - x) < 8 && Math.abs(item.y - y) < 8)

  if (tooClose) return

  const newObstacle: Obstacle = {
    id: Date.now() + Math.random(),
    x,
    y
  }

  placedObstacles.value.push(newObstacle)
}

// Lanzamiento de pingüinos
const launchPenguins = () => {
  if (penguinsMoving.value) return

  penguinsMoving.value = true
  penguins.value.forEach(penguin => {
    penguin.isMoving = true
  })

  gameLoop = requestAnimationFrame(updatePenguins)
}

// Actualización de pingüinos
const updatePenguins = () => {

  let allStopped = true

  penguins.value.forEach(penguin => {
    if (!penguin.isMoving) return

    allStopped = false

    // Mover pingüino
    penguin.x += penguin.vx
    penguin.y += penguin.vy

    // Actualizar rotación basada en velocidad
    penguin.rotation = Math.atan2(penguin.vy, penguin.vx) * (180 / Math.PI)

    // Colisión con bordes
    if (penguin.x <= 2 || penguin.x >= 98) {
      penguin.vx *= -1
      penguin.x = Math.max(2, Math.min(98, penguin.x))
      createParticle(penguin.x, penguin.y, '💥')
    }

    if (penguin.y <= 2 || penguin.y >= 98) {
      penguin.vy *= -1
      penguin.y = Math.max(2, Math.min(98, penguin.y))
      createParticle(penguin.x, penguin.y, '💥')
    }

    // Colisión con obstáculos
    placedObstacles.value.forEach(obstacle => {
      const distance = Math.sqrt(
          Math.pow(penguin.x - obstacle.x, 2) + Math.pow(penguin.y - obstacle.y, 2)
      )

      if (distance < 6) {
        // Calcular rebote
        const dx = penguin.x - obstacle.x
        const dy = penguin.y - obstacle.y
        const normalX = dx / distance
        const normalY = dy / distance

        // Reflejar velocidad
        const dot = penguin.vx * normalX + penguin.vy * normalY
        penguin.vx = penguin.vx - 2 * dot * normalX
        penguin.vy = penguin.vy - 2 * dot * normalY

        // Separar pingüino del obstáculo
        penguin.x = obstacle.x + normalX * 6
        penguin.y = obstacle.y + normalY * 6

        createParticle(obstacle.x, obstacle.y, '❄️')
      }
    })

    // Colisión con peces
    fishes.value.forEach(fish => {
      if (fish.collected) return

      const distance = Math.sqrt(
          Math.pow(penguin.x - fish.x, 2) + Math.pow(penguin.y - fish.y, 2)
      )

      if (distance < 5) {
        fish.collected = true
        createParticle(fish.x, fish.y, '✨')
      }
    })

    // Colisión con salida
    const exitDistance = Math.sqrt(
        Math.pow(penguin.x - exit.value.x, 2) + Math.pow(penguin.y - exit.value.y, 2)
    )

    if (exitDistance < 6 && fishCollected.value === totalFish.value) {
      penguin.hasReachedExit = true
      penguin.isMoving = false
      createParticle(exit.value.x, exit.value.y, '🎉')
    }

    // Detener por velocidad baja (fricción)
    if (Math.abs(penguin.vx) < 0.2 && Math.abs(penguin.vy) < 0.2) {
      penguin.isMoving = false
    }

    // Reducir velocidad por fricción
    penguin.vx *= 0.9995
    penguin.vy *= 0.9995
  })

  // Verificar condiciones de fin
  if (allStopped) {
    penguinsMoving.value = false

    const allFishCollected = fishCollected.value === totalFish.value
    const anyPenguinAtExit = penguins.value.some(p => p.hasReachedExit)

    if (allFishCollected && anyPenguinAtExit) {
      setTimeout(() => {
        levelComplete.value = true
      }, 500)
    }
  } else {
    gameLoop = requestAnimationFrame(updatePenguins)
  }
}

// Gestión de niveles
const loadLevel = (levelIndex: number) => {
  const level = levels[levelIndex - 1]
  if (!level) return

  // Limpiar estado
  placedObstacles.value = []
  particles.value = []
  levelComplete.value = false

  // Cargar elementos del nivel
  penguins.value = level.penguins.map((p, index) => ({
    id: index,
    x: p.x,
    y: p.y,
    vx: p.vx,
    vy: p.vy,
    isMoving: false,
    rotation: 0,
    hasReachedExit: false
  }))

  fishes.value = level.fishes.map((f, index) => ({
    id: index,
    x: f.x,
    y: f.y,
    collected: false
  }))

  exit.value = level.exit
  startPoint.value = level.start
}

const nextLevel = () => {
  totalFishCollected.value += fishCollected.value

  if (currentLevel.value >= 5) {
    // Juego completado
    gameCompleted.value = true
    gameOver.value = true
    gameStarted.value = false
    levelComplete.value = false
  } else {
    currentLevel.value++
    loadLevel(currentLevel.value)
    levelComplete.value = false
  }
}

const resetLevel = () => {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop)
    gameLoop = null
  }

  penguinsMoving.value = false
  loadLevel(currentLevel.value)
}

// Funciones de control del juego
const startGame = async () => {
  gameStarted.value = true
  gameOver.value = false
  gameCompleted.value = false
  currentLevel.value = 1
  totalFishCollected.value = 0

  loadLevel(1)

  await nextTick()
  if (gameArea.value) {
    gameArea.value.focus()
  }
}

const resetGame = () => {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop)
    gameLoop = null
  }

  currentLevel.value = 1
  totalFishCollected.value = 0
  penguinsMoving.value = false
  levelComplete.value = false
  gameOver.value = false
  gameCompleted.value = false
  gameStarted.value = false
}

// Función corregida para manejar el botón de finalizar juego
const handleGameComplete = () => {
  console.log('handleGameComplete called', { gameCompleted: gameCompleted.value })

  if (gameCompleted.value) {
    // Juego completado exitosamente - emitir evento
    emit('complete')
  } else {
    // Juego no completado - reiniciar
    resetGame()
  }
}

// Función para completar juego (mantenida por compatibilidad)
const completeGame = () => {
  handleGameComplete()
}

const closeGame = () => {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop)
    gameLoop = null
  }
  emit('complete')
}

// Lifecycle
onMounted(() => {
  // Prevenir scroll con clic derecho
  window.addEventListener('contextmenu', (e) => e.preventDefault())
})

onUnmounted(() => {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop)
  }
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  40%, 43% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
  70% {
    transform: translate(-50%, -50%) translateY(-5px);
  }
  90% {
    transform: translate(-50%, -50%) translateY(-2px);
  }
}
</style>