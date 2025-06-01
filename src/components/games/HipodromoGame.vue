<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-100 via-green-100 to-amber-50 p-2 md:p-4 pb-32 scroll-smooth">
    <div class="max-w-6xl mx-auto relative">
      <!-- Botón Cerrar -->
      <button
          @click="closeGame"
          class="fixed top-4 right-4 z-50 bg-red-700 hover:bg-red-800 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors font-bold text-lg"
          title="Cerrar juego"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="text-center mb-4 md:mb-6">
        <h2 class="text-2xl md:text-3xl font-bold text-amber-900 mb-2">🏇 Hipódromo Real</h2>
        <p class="text-amber-800 font-medium">Apuesta sabiamente y observa la carrera</p>
        <div class="flex justify-center gap-2 md:gap-4 mt-4">
          <div class="bg-white px-3 md:px-4 py-2 rounded-lg shadow-md border-2 border-amber-400">
            <span class="text-xs md:text-sm text-amber-900 font-medium">Dinero:</span>
            <span class="font-bold text-green-800 text-lg"> ${{ money }}</span>
          </div>
          <div class="bg-white px-3 md:px-4 py-2 rounded-lg shadow-md border-2 border-amber-400">
            <span class="text-xs md:text-sm text-amber-900 font-medium">Carrera:</span>
            <span class="font-bold text-amber-800 text-lg"> {{ currentRace }}/{{ totalRaces }}</span>
          </div>
        </div>
      </div>
      <!-- Panel de apuestas -->
      <div v-if="!raceStarted && !raceFinished" class="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 border-2 border-amber-300" style="margin: 1rem 0">
        <h3 class="text-lg md:text-xl font-bold mb-4 text-amber-900">💰 Realiza tu Apuesta</h3>
        <div class="grid md:grid-cols-2 gap-4 md:gap-6">
          <!-- Lista de caballos -->
          <div>
            <h4 class="font-semibold mb-3 text-amber-800 text-base">Selecciona tu Caballo:</h4>
            <div class="space-y-2">
              <div
                  v-for="horse in horses"
                  :key="horse.id"
                  class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
                  :class="selectedHorse?.id === horse.id ? 'border-amber-600 bg-amber-100' : 'border-amber-400 hover:border-amber-600 hover:bg-amber-50'"
                  @click="selectHorse(horse)"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ horse.emoji }}</span>
                  <div>
                    <div class="font-bold text-amber-900">{{ horse.name }}</div>
                    <div class="text-sm text-amber-800 font-semibold">Prob: {{ horse.winChance }}%</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-green-800 text-lg">{{ horse.odds }}x</div>
                  <div class="text-xs text-amber-700 font-medium">multiplicador</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Panel de apuesta -->
          <div>
            <h4 class="font-semibold mb-3 text-amber-800 text-base">Monto de Apuesta:</h4>
            <div class="space-y-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                    v-for="amount in [10, 25, 50, 100]"
                    :key="amount"
                    @click="setBetAmount(amount)"
                    :disabled="amount > money"
                    class="py-2 px-2 md:px-4 border-2 rounded-lg transition-colors text-sm font-bold"
                    :class="betAmount === amount ? 'border-amber-600 bg-amber-200 text-amber-900' : 'border-amber-400 hover:border-amber-600 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 text-amber-800'"
                >
                  ${{ amount }}
                </button>
              </div>
              <div class="flex items-center gap-2">
                <input
                    v-model.number="customBetAmount"
                    type="number"
                    :max="money"
                    min="1"
                    placeholder="Cantidad personalizada"
                    class="flex-1 px-3 py-2 border-2 border-amber-400 rounded-lg focus:border-amber-600 focus:outline-none text-amber-900 font-semibold"
                >
                <button
                    @click="setBetAmount(customBetAmount)"
                    :disabled="!customBetAmount || customBetAmount > money || customBetAmount < 1"
                    class="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold"
                >
                  OK
                </button>
              </div>
              <div v-if="selectedHorse && betAmount" class="p-4 bg-amber-100 rounded-lg border-2 border-amber-400 mt-4" style="margin-top: 1rem">
                <div class="text-sm text-amber-800 font-semibold">Resumen de apuesta:</div>
                <div class="font-bold text-amber-900 text-lg">{{ selectedHorse.name }} - ${{ betAmount }}</div>
                <div class="text-sm text-green-800 font-bold">Ganancia potencial: ${{ (betAmount * selectedHorse.odds).toFixed(0) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center mt-6">
          <button
              @click="startRace"
              :disabled="!selectedHorse || !betAmount || betAmount > money"
              class="px-6 md:px-8 py-3 bg-green-700 text-white rounded-lg font-bold text-lg hover:bg-green-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors shadow-md"
              style="margin-top: 1rem;"
          >
            🏁 ¡Iniciar Carrera!
          </button>
        </div>
      </div>
      <!-- Pista de carreras -->
      <div v-if="raceStarted || raceFinished || countdown > 0" class="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 border-2 border-green-400" style="margin: 1rem 0">
        <h3 class="text-lg md:text-xl font-bold mb-4 text-green-800">🏁 Pista de Carreras</h3>
        <!-- Contador regresivo -->
        <div v-if="countdown > 0" class="text-center mb-6">
          <div class="text-4xl md:text-6xl font-bold text-red-600 animate-bounce">{{ countdown }}</div>
          <div class="text-base md:text-lg text-green-800 font-semibold">¡La carrera comenzará!</div>
        </div>
        <!-- Pista -->
        <div class="relative bg-gradient-to-r from-green-400 to-green-300 rounded-lg p-2 md:p-4 min-h-[200px] md:min-h-[300px] border-2 border-green-600">
          <!-- Líneas de carril -->
          <div class="absolute inset-0">
            <div
                v-for="i in horses.length"
                :key="i"
                class="border-b border-green-700"
                :style="{ height: `${100 / horses.length}%` }"
            ></div>
          </div>
          <!-- Meta -->
          <div class="absolute right-2 md:right-4 top-0 bottom-0 w-2 bg-red-700"></div>
          <div class="absolute right-0 md:right-2 top-2 text-red-800 font-bold text-xs transform -rotate-90 origin-top-left">META</div>
          <!-- Caballos -->
          <div
              v-for="(horse, index) in horses"
              :key="horse.id"
              class="relative flex items-center mb-1 h-8 md:h-16"
          >
            <div class="flex items-center gap-1 w-12 md:w-20">
              <span class="text-xs font-bold text-green-900">#{{ index + 1 }}</span>
              <span class="text-xs hidden md:inline text-green-800 font-semibold">{{ horse.name.substring(0, 4) }}</span>
            </div>
            <div class="flex-1 relative">
              <div
                  class="absolute top-1/2 transform -translate-y-1/2 text-lg md:text-3xl transition-all duration-100 ease-linear"
                  :style="{ left: `${horse.position}%` }"
                  :class="{ 'animate-bounce': raceStarted && !raceFinished }"
              >
                {{ horse.emoji }}
              </div>
            </div>
          </div>
        </div>
        <!-- Estado de la carrera -->
        <div class="text-center mt-2 md:mt-4">
          <div v-if="raceStarted && !raceFinished" class="text-sm md:text-lg font-bold text-green-800">
            🏃‍♂️ ¡Carrera en progreso!
          </div>
          <div v-if="raceFinished && winner" class="text-base md:text-xl font-bold">
            <span v-if="won" class="text-green-800">🎉 ¡Ganaste! {{ winner.name }} llegó primero</span>
            <span v-else class="text-red-800">😔 Perdiste. {{ winner.name }} ganó la carrera</span>
          </div>
        </div>
      </div>
      <!-- Resultados -->
      <div v-if="raceFinished" class="bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-lg p-3 md:p-6 mb-4 md:mb-6 border-2 border-yellow-400">
        <h3 class="text-base md:text-xl font-bold mb-3 text-yellow-800">📊 Resultados</h3>
        <!-- Versión móvil compacta -->
        <div class="block md:hidden space-y-3">
          <div class="flex items-center justify-between p-3 bg-yellow-200 rounded-lg border-2 border-yellow-600">
            <div class="flex items-center gap-2">
              <span class="text-xl">🥇</span>
              <div>
                <div class="font-bold text-yellow-900 text-sm">{{ winner?.name }}</div>
                <div class="text-xs text-yellow-800 font-semibold">Ganador</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-base" :class="won ? 'text-green-800' : 'text-red-800'">
                {{ won ? '+' : '-' }}${{ Math.abs(winnings) }}
              </div>
              <div class="text-xs text-yellow-800 font-semibold">{{ won ? 'Ganaste' : 'Perdiste' }}</div>
            </div>
          </div>
          <div class="flex justify-between items-center p-3 bg-green-200 rounded-lg border-2 border-green-600">
            <span class="font-bold text-green-900 text-sm">💵 Dinero actual:</span>
            <span class="font-bold text-green-800 text-lg">${{ money }}</span>
          </div>
        </div>
        <!-- Versión desktop original -->
        <div class="hidden md:grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-yellow-200 rounded-lg border-2 border-yellow-600">
            <div class="text-2xl md:text-3xl mb-2">🥇</div>
            <div class="font-bold text-yellow-900">{{ winner?.name }}</div>
            <div class="text-sm text-yellow-800 font-semibold">Primer lugar</div>
          </div>
          <div class="text-center p-4 bg-gray-200 rounded-lg border-2 border-gray-500">
            <div class="text-2xl mb-2">💰</div>
            <div class="font-bold text-lg" :class="won ? 'text-green-800' : 'text-red-800'">
              {{ won ? '+' : '-' }}${{ Math.abs(winnings) }}
            </div>
            <div class="text-sm text-gray-800 font-semibold">{{ won ? 'Ganancia' : 'Pérdida' }}</div>
          </div>
          <div class="text-center p-4 bg-green-200 rounded-lg border-2 border-green-600">
            <div class="text-2xl mb-2">💵</div>
            <div class="font-bold text-green-800 text-lg">${{ money }}</div>
            <div class="text-sm text-green-800 font-semibold">Dinero actual</div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
          <button
              v-if="currentRace < totalRaces && money > 0"
              @click="nextRace"
              class="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors w-full sm:w-auto font-bold shadow-md" style="margin-top: 1rem"
          >
            ➡️ Siguiente Carrera
          </button>
          <button
              v-else-if="money >= 200"
              @click="completeGame"
              class="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors w-full sm:w-auto font-bold shadow-md"
          >
            🏆 ¡Completar Nivel!
          </button>
          <button
              v-else
              @click="resetGame"
              class="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors w-full sm:w-auto font-bold shadow-md"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
      <!-- Game Over -->
      <div v-if="money <= 0 && raceFinished" class="bg-red-100 border-2 border-red-500 rounded-xl p-4 md:p-6 text-center mb-32">
        <div class="text-3xl md:text-4xl mb-4">💸</div>
        <h3 class="text-lg md:text-xl font-bold text-red-800 mb-2">¡Te quedaste sin dinero!</h3>
        <p class="text-red-800 mb-4 font-semibold">Necesitas al menos $200 para completar el nivel</p>
        <button
            @click="resetGame"
            class="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-bold shadow-md"
        >
          🔄 Reiniciar Juego
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
interface Horse {
  id: number
  name: string
  emoji: string
  odds: number
  winChance: number
  position: number
  speed: number
}
const emit = defineEmits<{
  complete: []
  close: []
}>()
// Estado del juego
const money = ref(100)
const currentRace = ref(1)
const totalRaces = ref(3)
const selectedHorse = ref<Horse | null>(null)
const betAmount = ref(0)
const customBetAmount = ref<number>()
const raceStarted = ref(false)
const raceFinished = ref(false)
const countdown = ref(0)
const winner = ref<Horse | null>(null)
const won = ref(false)
const winnings = ref(0)
// Caballos
const horses = ref<Horse[]>([])
// Función para cerrar el juego
const closeGame = () => {
  emit('close')
}
// Generar caballos aleatorios
const generateHorses = () => {
  const horseNames = ['Rayo', 'Trueno', 'Viento', 'Estrella', 'Fuego']
  const horseEmojis = ['🐎', '🦄', '🐴', '🏇', '🦓']
  horses.value = horseNames.map((name, index) => {
    const winChance = Math.floor(Math.random() * 30) + 10 // 10-40%
    return {
      id: index + 1,
      name,
      emoji: horseEmojis[index],
      odds: parseFloat((100 / winChance * 0.8).toFixed(1)), // Odds basadas en probabilidad
      winChance,
      position: 0,
      speed: 0
    }
  })
}
// Funciones de apuesta
const selectHorse = (horse: Horse) => {
  selectedHorse.value = horse
}
const setBetAmount = (amount: number) => {
  if (amount <= money.value && amount > 0) {
    betAmount.value = amount
    customBetAmount.value = amount
  }
}
// Iniciar carrera
const startRace = async () => {
  if (!selectedHorse.value || betAmount.value > money.value) return
  // Deducir apuesta
  money.value -= betAmount.value
  raceStarted.value = true
  raceFinished.value = false
  // Countdown
  for (let i = 3; i > 0; i--) {
    countdown.value = i
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  countdown.value = 0
  // Reiniciar posiciones
  horses.value.forEach(horse => {
    horse.position = 0
    horse.speed = Math.random() * 2 + 1 // Velocidad base
  })
  // Simular carrera
  const raceInterval = setInterval(() => {
    let raceFinish = false
    horses.value.forEach(horse => {
      // Variación aleatoria en velocidad
      const speedVariation = (Math.random() - 0.5) * 0.5
      horse.speed = Math.max(0.5, horse.speed + speedVariation)
      // Avanzar caballo
      horse.position += horse.speed
      // Verificar si llegó a la meta
      if (horse.position >= 95) {
        horse.position = 95
        if (!winner.value) {
          winner.value = horse
          raceFinish = true
        }
      }
    })
    if (raceFinish) {
      clearInterval(raceInterval)
      finishRace()
    }
  }, 100)
}
// Finalizar carrera
const finishRace = () => {
  raceFinished.value = true
  raceStarted.value = false
  if (winner.value && selectedHorse.value) {
    won.value = winner.value.id === selectedHorse.value.id
    if (won.value) {
      winnings.value = Math.floor(betAmount.value * selectedHorse.value.odds)
      money.value += winnings.value
    } else {
      winnings.value = -betAmount.value
    }
  }
}
// Siguiente carrera
const nextRace = () => {
  currentRace.value++
  resetRaceState()
  generateHorses()
}
// Resetear estado de carrera
const resetRaceState = () => {
  selectedHorse.value = null
  betAmount.value = 0
  customBetAmount.value = undefined
  raceStarted.value = false
  raceFinished.value = false
  countdown.value = 0
  winner.value = null
  won.value = false
  winnings.value = 0
}
// Resetear juego completo
const resetGame = () => {
  money.value = 100
  currentRace.value = 1
  resetRaceState()
  generateHorses()
}
// Completar juego
const completeGame = () => {
  if (money.value >= 200) {
    emit('complete')
  } else {
    resetGame()
  }
}
// Lifecycle
onMounted(() => {
  generateHorses()
})
</script>
<style scoped>
.animate-bounce {
  animation: bounce 0.5s infinite alternate;
}
@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}
/* Evitar scroll automático cuando aparece contenido */
* {
  scroll-behavior: smooth;
}
/* Mantener posición de scroll estable */
.min-h-screen {
  scroll-behavior: smooth;
  position: relative;
}
/* Evitar que los elementos que aparecen causen scroll */
.space-y-4 > * {
  scroll-margin-top: 0;
}
/* Mejorar estabilidad en móviles */
@media (max-width: 640px) {
  .min-h-screen {
    padding-bottom: 120px !important;
    min-height: 100vh;
    scroll-behavior: smooth;
    overflow-anchor: none;
  }
  /* Evitar scroll automático en elementos que aparecen */
  [v-if] {
    scroll-margin: 0;
  }
}
</style>