<template>
  <div class="min-h-screen bg-gradient-to-b from-pink-900 via-purple-800 to-indigo-900 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Botón cerrar -->
      <div class="flex justify-end" style="margin-bottom: 1rem;">
        <button
            @click="$emit('close')"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ✕ Cerrar
        </button>
      </div>
      <!-- Header -->
      <div class="text-center" style="margin-bottom: 2rem;">
        <h2 class="text-4xl font-bold text-white" style="margin-bottom: 0.5rem;">🎬 Cine Stitch</h2>
        <p class="text-pink-200">¡Último desafío! Encuentra las parejas de Stitch</p>

        <div class="flex justify-center gap-4" style="margin-top: 1rem;">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 bg-opacity-90 px-4 py-2 rounded-lg border border-pink-300">
            <span class="text-pink-100">Movimientos:</span>
            <span class="font-bold text-white" style="margin-left: 0.5rem;">{{ moves }}</span>
          </div>
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-opacity-90 px-4 py-2 rounded-lg border border-purple-300">
            <span class="text-purple-100">Parejas:</span>
            <span class="font-bold text-white" style="margin-left: 0.5rem;">{{ matchedPairs.length }}/6</span>
          </div>
        </div>
      </div>

      <!-- Botón de inicio -->
      <div v-if="!gameStarted && !showingAll" class="text-center" style="margin-bottom: 2rem;">
        <button
            @click="startGame"
            class="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg border border-pink-400"
        >
          🎮 ¡Empezar Último Desafío!
        </button>
        <p class="text-pink-200 text-sm" style="margin-top: 0.5rem;">
          Se mostrarán todas las cartas por 3 segundos para este nivel final
        </p>
      </div>

      <!-- Contador de mostrar cartas -->
      <div v-if="showingAll" class="text-center" style="margin-bottom: 2rem;">
        <div class="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-bounce">
          ¡MEMORIZA TODO!
        </div>
        <div class="text-2xl text-pink-200 font-semibold" style="margin-top: 0.5rem;">
          Este es tu momento de brillar ⭐
        </div>
      </div>

      <!-- Tablero de juego -->
      <div class="bg-black bg-opacity-40 rounded-xl p-6 border border-purple-500 shadow-2xl" style="margin-bottom: 2rem;">
        <div class="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div
              v-for="card in cards"
              :key="card.id"
              @click="flipCard(card.id)"
              class="aspect-square rounded-lg cursor-pointer transition-all duration-500 transform shadow-lg"
              :class="[
              card.flipped || card.matched
                ? 'bg-gradient-to-br from-white to-pink-100 border-4 border-yellow-400 shadow-yellow-400/50'
                : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:scale-105 border-4 border-purple-400 hover:border-pink-400 hover:shadow-purple-500/50',
              !gameStarted && !showingAll ? 'cursor-not-allowed opacity-50' : '',
              card.matched ? 'animate-pulse border-green-400 shadow-green-400/50' : ''
            ]"
          >
            <div class="w-full h-full flex items-center justify-center">
              <span v-if="card.flipped || card.matched" class="text-4xl animate-bounce filter drop-shadow-lg">
                {{ card.image }}
              </span>
              <div v-else class="text-white text-2xl filter drop-shadow-lg">🎭</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultado -->
      <div v-if="gameCompleted" class="bg-gradient-to-r from-green-500 to-emerald-600 bg-opacity-20 border-2 border-green-400 rounded-xl p-6 text-center shadow-2xl">
        <div class="text-8xl animate-bounce" style="margin-bottom: 1rem;">🏆</div>
        <h3 class="text-3xl font-bold text-white" style="margin-bottom: 1rem;">¡FELICITACIONES!</h3>

        <p class="text-green-200" style="margin-bottom: 1rem;">
          Completaste el último nivel en {{ moves }} movimientos
        </p>
        <div class="flex justify-center gap-2" style="margin-bottom: 1.5rem;">
          <span
              v-for="(image, index) in matchedPairs"
              :key="index"
              class="text-4xl animate-bounce filter drop-shadow-lg"
              :style="{ animationDelay: `${index * 0.1}s`, margin: '0 0.25rem' }"
          >
            {{ image }}
          </span>
        </div>
        <button
            @click="initializeGame"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 Jugar de Nuevo
        </button>
      </div>

      <!-- Mensaje Final Especial (separado) -->
      <div v-if="showFinalMessage" class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold p-6 rounded-xl text-center shadow-2xl border-4 border-yellow-300" style="margin-top: 2rem;">
        <div class="text-6xl animate-bounce" style="margin-bottom: 1rem;">🎊</div>
        <div class="text-2xl" style="margin-bottom: 0.5rem;">¡MISIÓN CUMPLIDA!</div>
        <div class="text-xl" style="margin-bottom: 0.5rem;">¡Has completado TODOS los desafíos de Lima!</div>
        <div class="text-lg">Eres un verdadero explorador de la ciudad ⭐</div>
        <div class="text-sm" style="margin-top: 1rem;">¡Felicitaciones por tu increíble aventura! 🌟</div>
      </div>

      <!-- Instrucciones -->
      <div v-if="!gameStarted && !showingAll" class="bg-gradient-to-r from-purple-600 to-indigo-600 bg-opacity-20 rounded-lg p-4 text-center border border-purple-400">
        <h4 class="font-bold text-white" style="margin-bottom: 0.5rem;">📝 Instrucciones del Nivel Final</h4>
        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2 rounded-lg inline-block animate-pulse" style="margin-bottom: 1rem;">
          ✨ ¡NIVEL FINAL! ✨ ¡Demuestra todo lo que has aprendido!
        </div>
        <p class="text-purple-200 text-sm">
          Este es tu último desafío en Lima. Encuentra todas las parejas de cartas de Stitch.
          Haz clic en las cartas para voltearlas. Solo puedes voltear 2 cartas a la vez.
          ¡Demuestra que eres el mejor explorador de la ciudad! 🌟
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Card {
  id: number
  image: string
  matched: boolean
  flipped: boolean
}

const emit = defineEmits<{
  complete: []
  close: []
}>()

// Estado del juego
const cards = ref<Card[]>([])
const flippedCards = ref<number[]>([])
const matchedPairs = ref<string[]>([])
const moves = ref(0)
const gameStarted = ref(false)
const gameCompleted = ref(false)
const showingAll = ref(false)
const showFinalMessage = ref(false)

// Imágenes de Stitch usando emojis más variados para el nivel final
const stitchImages = ['💙', '👽', '🌺', '🏝️', '🎬', '🍿', '🎭', '🎪']

// Inicializar juego
const initializeGame = () => {
  const gameCards: Card[] = []
  const cardPairs = stitchImages.slice(0, 6) // Usar 6 pares = 12 cartas

  // Crear pares de cartas
  cardPairs.forEach((image, index) => {
    gameCards.push(
        { id: index * 2, image, matched: false, flipped: false },
        { id: index * 2 + 1, image, matched: false, flipped: false }
    )
  })

  // Mezclar cartas
  const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
  cards.value = shuffledCards
  flippedCards.value = []
  matchedPairs.value = []
  moves.value = 0
  gameCompleted.value = false
  gameStarted.value = false
}

// Mostrar todas las cartas al inicio
const startGame = async () => {
  showingAll.value = true

  // Mostrar todas las cartas por 3 segundos
  cards.value = cards.value.map(card => ({ ...card, flipped: true }))

  setTimeout(() => {
    cards.value = cards.value.map(card => ({ ...card, flipped: false }))
    showingAll.value = false
    gameStarted.value = true
  }, 3000)
}

// Voltear carta
const flipCard = (cardId: number) => {
  if (!gameStarted.value || showingAll.value || flippedCards.value.length >= 2) return

  const card = cards.value.find(c => c.id === cardId)
  if (!card || card.flipped || card.matched) return

  cards.value = cards.value.map(c =>
      c.id === cardId ? { ...c, flipped: true } : c
  )
  flippedCards.value = [...flippedCards.value, cardId]
}

// Verificar coincidencias
watch(flippedCards, (newFlippedCards) => {
  if (newFlippedCards.length === 2) {
    const [firstId, secondId] = newFlippedCards
    const firstCard = cards.value.find(c => c.id === firstId)
    const secondCard = cards.value.find(c => c.id === secondId)

    moves.value++

    if (firstCard?.image === secondCard?.image) {
      // ¡Coincidencia!
      setTimeout(() => {
        cards.value = cards.value.map(c =>
            c.id === firstId || c.id === secondId
                ? { ...c, matched: true }
                : c
        )
        matchedPairs.value = [...matchedPairs.value, firstCard.image]
        flippedCards.value = []
      }, 1000)
    } else {
      // No coinciden
      setTimeout(() => {
        cards.value = cards.value.map(c =>
            c.id === firstId || c.id === secondId
                ? { ...c, flipped: false }
                : c
        )
        flippedCards.value = []
      }, 1500)
    }
  }
}, { deep: true })

// Verificar si el juego está completo
watch(matchedPairs, (newMatchedPairs) => {
  if (gameStarted.value && newMatchedPairs.length === 6) {
    gameCompleted.value = true
    setTimeout(() => {
      emit('complete')
      showFinalMessage.value = true
    }, 2000)
  }
}, { deep: true })

// Inicializar al montar
onMounted(() => {
  initializeGame()
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
    opacity: .5;
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

/* Efecto de texto degradado */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Sombras más dramáticas para el nivel final */
.filter {
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}
</style>