<template>
  <div class="bg-gradient-to-b from-blue-50 to-green-50 min-h-screen flex flex-col relative">
    <!-- Botón de cerrar -->
    <button
        @click="closeGame"
        class="absolute top-2 right-2 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
    >
      <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <div class="flex-1 p-2 sm:p-4 md:p-6 lg:p-8">
      <!-- Header responsive -->
      <div class="text-center mb-3 sm:mb-4 lg:mb-6 pt-8 sm:pt-4">
        <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-800 mb-2 sm:mb-3">🍣 Arma el Sushi</h2>
        <div class="flex flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
          <span class="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded shadow">
            <span class="text-gray-600">Progreso:</span>
            <span class="font-bold text-green-600"> {{ completedSushi }}/{{ totalSushi }}</span>
          </span>
          <span class="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded shadow">
            <span class="text-gray-600">Tiempo:</span>
            <span class="font-bold text-blue-600"> {{ timer }}s</span>
          </span>
          <span class="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded shadow">
            <span class="text-gray-600">Vidas:</span>
            <span class="font-bold text-red-600"> {{ lives }} ❤️</span>
          </span>
        </div>
      </div>

      <!-- Layout responsive principal -->
      <div class="max-w-6xl mx-auto" style="margin: 1rem 0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">

          <!-- Zona de construcción del sushi -->
          <div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 order-1">
            <h3 class="text-sm sm:text-lg md:text-xl font-bold text-center mb-3 sm:mb-4 text-blue-800">{{ currentRecipe.name }}</h3>
            <div class="flex flex-wrap justify-center gap-1">
              <!-- Plato del sushi escalable -->
              <div
                  class="relative bg-blue-50 rounded-full mx-auto border-4 border-blue-300 mb-3 sm:mb-4"
                  :class="plateSize"
                  @drop="handleDrop"
                  @dragover.prevent
                  @dragenter.prevent
                  @touchstart="handleTouchStart"
                  @touchmove.prevent="handleTouchMove"
                  @touchend="handleTouchEnd"
              >
                <!-- Ingredientes colocados -->
                <div
                    v-for="(ingredient, index) in placedIngredients"
                    :key="index"
                    class="absolute rounded-lg transition-all duration-300"
                    :style="getIngredientStyle(index, ingredient)"
                >
                  <span :class="ingredientEmojiSize">{{ ingredient.emoji }}</span>
                  <span class="text-xs sm:text-sm block text-center text-blue-800 font-medium">{{ ingredient.name }}</span>
                </div>

                <!-- Indicador de zona de drop -->
                <div v-if="isDragging" class="absolute inset-0 border-4 border-dashed border-green-400 rounded-full bg-green-100 opacity-50"></div>
              </div>
            </div>
            <!-- Receta visual responsive -->
            <div class="flex justify-center gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
              <div
                  v-for="(ingredient, index) in currentRecipe.ingredients"
                  :key="index"
                  :class="[
                    recipeBoxSize,
                    'bg-blue-100 rounded-lg flex items-center justify-center border-2 transition-all duration-200',
                    placedIngredients[index] ? 'border-green-400 bg-green-50' : 'border-blue-300'
                  ]"
              >
                <span :class="recipeEmojiSize">{{ placedIngredients[index] ? placedIngredients[index].emoji : '?' }}</span>
              </div>
            </div>
          </div>

          <!-- Ingredientes disponibles -->
          <div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 order-2">
            <h3 class="text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 text-blue-800">Ingredientes Disponibles</h3>
            <div :class="ingredientsGridCols" class="gap-2 sm:gap-3">
              <div
                  v-for="ingredient in availableIngredients"
                  :key="ingredient.id"
                  :class="ingredientItemSize"
                  class="ingredient-item bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-300 active:scale-95"
                  :draggable="true"
                  @dragstart="handleDragStart($event, ingredient)"
                  @dragend="handleDragEnd"
                  @touchstart="handleTouchStart($event, ingredient)"
              >
                <span :class="availableEmojiSize">{{ ingredient.emoji }}</span>
                <span class="text-xs sm:text-sm text-blue-800 text-center leading-tight font-medium px-1">{{ ingredient.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de acción reposicionados -->
      <div class="max-w-6xl mx-auto mt-4 sm:mt-6">
        <div class="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex justify-center gap-2 sm:gap-4">
          <button
              @click="clearSushi"
              class="flex-1 max-w-32 sm:max-w-36 px-3 sm:px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors text-xs sm:text-sm md:text-base font-medium"
          >
            🗑️ Limpiar
          </button>
          <button
              @click="checkSushi"
              :disabled="placedIngredients.length !== currentRecipe.ingredients.length"
              class="flex-1 max-w-32 sm:max-w-36 px-3 sm:px-4 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base font-medium"
          >
            ✅ Verificar
          </button>
          <button
              @click="addLife"
              :disabled="lives >= 5"
              class="flex-1 max-w-32 sm:max-w-36 px-3 sm:px-4 py-2 sm:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base font-medium"
          >
            ➕ Vida
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de resultado responsive -->
    <div v-if="showResult" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-4 sm:p-6 lg:p-8 text-center max-w-sm sm:max-w-md lg:max-w-lg w-full">
        <div class="text-4xl sm:text-5xl lg:text-6xl mb-4">{{ resultCorrect ? '🎉' : '😅' }}</div>
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-blue-800">
          {{ resultCorrect ? '¡Perfecto!' : '¡Inténtalo de nuevo!' }}
        </h3>
        <p class="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          {{ resultCorrect ? 'Has creado un sushi delicioso' : `Tienes ${correctCount} ingrediente${correctCount === 1 ? '' : 's'} correcto${correctCount === 1 ? '' : 's'}` }}
        </p>
        <button
            @click="nextSushi"
            class="px-6 sm:px-8 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
        >
          {{ resultCorrect ? 'Siguiente' : 'Reintentar' }}
        </button>
      </div>
    </div>

    <!-- Modal de victoria responsive -->
    <div v-if="gameCompleted" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-4 sm:p-6 lg:p-8 text-center max-w-sm sm:max-w-md lg:max-w-lg w-full">
        <div class="text-4xl sm:text-5xl lg:text-6xl mb-4">🏆</div>
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-blue-800">¡Felicidades!</h3>
        <p class="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">Has completado todos los sushi</p>
        <p class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Tiempo total: {{ timer }}s</p>
        <button
            @click="completeGame"
            class="px-6 sm:px-8 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors text-sm sm:text-base font-medium"
        >
          ¡Continuar Aventura!
        </button>
      </div>
    </div>

    <!-- Modal de game over responsive -->
    <div v-if="gameOver" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-4 sm:p-6 lg:p-8 text-center max-w-sm sm:max-w-md lg:max-w-lg w-full">
        <div class="text-4xl sm:text-5xl lg:text-6xl mb-4">😔</div>
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-blue-800">¡Juego Terminado!</h3>
        <p class="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">Te has quedado sin vidas</p>
        <p class="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Sushi completados: {{ completedSushi }}/{{ totalSushi }}</p>
        <button
            @click="resetGame"
            class="px-6 sm:px-8 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
        >
          Jugar de Nuevo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Ingredient {
  id: string
  name: string
  emoji: string
}

interface Recipe {
  name: string
  ingredients: Ingredient[]
}

const emit = defineEmits<{
  complete: []
  close: []
}>()

// Ingredientes disponibles
const availableIngredients: Ingredient[] = [
  { id: 'rice', name: 'Arroz', emoji: '🍚' },
  { id: 'fish', name: 'Pescado', emoji: '🐟' },
  { id: 'salmon', name: 'Salmón', emoji: '🍣' },
  { id: 'avocado', name: 'Aguacate', emoji: '🥑' },
  { id: 'cucumber', name: 'Pepino', emoji: '🥒' },
  { id: 'nori', name: 'Alga', emoji: '🟢' },
  { id: 'wasabi', name: 'Wasabi', emoji: '🟩' },
  { id: 'ginger', name: 'Jengibre', emoji: '🫚' }
]

// Recetas de sushi
const recipes: Recipe[] = [
  {
    name: 'Maki Clásico',
    ingredients: [
      { id: 'nori', name: 'Alga', emoji: '🟢' },
      { id: 'rice', name: 'Arroz', emoji: '🍚' },
      { id: 'fish', name: 'Pescado', emoji: '🐟' }
    ]
  },
  {
    name: 'California Roll',
    ingredients: [
      { id: 'nori', name: 'Alga', emoji: '🟢' },
      { id: 'rice', name: 'Arroz', emoji: '🍚' },
      { id: 'avocado', name: 'Aguacate', emoji: '🥑' },
      { id: 'cucumber', name: 'Pepino', emoji: '🥒' }
    ]
  },
  {
    name: 'Salmón Roll',
    ingredients: [
      { id: 'nori', name: 'Alga', emoji: '🟢' },
      { id: 'rice', name: 'Arroz', emoji: '🍚' },
      { id: 'salmon', name: 'Salmón', emoji: '🍣' },
      { id: 'avocado', name: 'Aguacate', emoji: '🥑' }
    ]
  }
]

// Estado del juego
const currentRecipeIndex = ref(0)
const placedIngredients = ref<Ingredient[]>([])
const isDragging = ref(false)
const showResult = ref(false)
const resultCorrect = ref(false)
const correctCount = ref(0)
const completedSushi = ref(0)
const timer = ref(0)
const lives = ref(3)
const gameCompleted = ref(false)
const gameOver = ref(false)
let timerInterval: number | null = null
let touchIngredient: Ingredient | null = null
let touchElement: HTMLElement | null = null

// Computed para clases responsivas
const plateSize = computed(() => {
  return 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64'
})

const ingredientEmojiSize = computed(() => {
  return 'text-lg sm:text-xl md:text-2xl'
})

const recipeBoxSize = computed(() => {
  return 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'
})

const recipeEmojiSize = computed(() => {
  return 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
})

const ingredientsGridCols = computed(() => {
  return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
})

const ingredientItemSize = computed(() => {
  return 'w-16 h-20 sm:w-20 sm:h-24 md:w-18 md:h-22 lg:w-20 lg:h-24 xl:w-22 xl:h-26'
})

const availableEmojiSize = computed(() => {
  return 'text-xl sm:text-2xl md:text-xl lg:text-2xl'
})

const currentRecipe = computed(() => recipes[currentRecipeIndex.value])
const totalSushi = computed(() => recipes.length)

// Función para cerrar el juego
const closeGame = () => {
  emit('close')
}

// Funciones de drag and drop
const handleDragStart = (event: DragEvent, ingredient: Ingredient) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', JSON.stringify(ingredient))
    event.dataTransfer.effectAllowed = 'copy'
  }
  isDragging.value = true
}

const handleDragEnd = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer) {
    const ingredientData = event.dataTransfer.getData('text/plain')
    const ingredient = JSON.parse(ingredientData) as Ingredient

    if (placedIngredients.value.length < currentRecipe.value.ingredients.length) {
      placedIngredients.value.push(ingredient)
    }
  }
}

// Funciones de touch mejoradas
const handleTouchStart = (event: TouchEvent, ingredient?: Ingredient) => {
  if (ingredient) {
    touchIngredient = ingredient
    touchElement = event.currentTarget as HTMLElement
    isDragging.value = true

    // Prevenir scroll en mobile
    event.preventDefault()
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (touchElement && touchIngredient) {
    const touch = event.touches[0]
    touchElement.style.position = 'fixed'
    touchElement.style.left = `${touch.clientX - 32}px`
    touchElement.style.top = `${touch.clientY - 40}px`
    touchElement.style.zIndex = '1000'
    touchElement.style.pointerEvents = 'none'
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  if (touchIngredient && placedIngredients.value.length < currentRecipe.value.ingredients.length) {
    const touch = event.changedTouches[0]
    const dropZone = document.querySelector('.relative.bg-blue-50.rounded-full')
    if (dropZone) {
      const rect = dropZone.getBoundingClientRect()
      if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
      ) {
        placedIngredients.value.push(touchIngredient)
      }
    }
  }
  isDragging.value = false
  touchIngredient = null
  if (touchElement) {
    touchElement.style.position = ''
    touchElement.style.left = ''
    touchElement.style.top = ''
    touchElement.style.zIndex = ''
    touchElement.style.pointerEvents = ''
    touchElement = null
  }
}

// Estilos para ingredientes colocados mejorados
const getIngredientStyle = (index: number, ingredient: Ingredient) => {
  const total = currentRecipe.value.ingredients.length
  const angle = (index / total) * 360

  // Responsivo para diferentes tamaños
  let radius = 50
  let divisor = 2.56

  if (window.innerWidth < 640) { // sm
    radius = 45
    divisor = 2.8
  } else if (window.innerWidth < 768) { // md
    radius = 55
    divisor = 2.6
  } else if (window.innerWidth < 1024) { // lg
    radius = 65
    divisor = 2.4
  } else { // xl
    radius = 75
    divisor = 2.2
  }

  const x = 50 + (radius * Math.cos(angle * Math.PI / 180)) / divisor
  const y = 50 + (radius * Math.sin(angle * Math.PI / 180)) / divisor

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
    width: window.innerWidth < 640 ? '36px' : window.innerWidth < 768 ? '40px' : '44px',
    height: window.innerWidth < 640 ? '48px' : window.innerWidth < 768 ? '52px' : '56px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    border: '2px solid #3b82f6',
    borderRadius: '8px'
  }
}

// Funciones del juego
const clearSushi = () => {
  placedIngredients.value = []
}

const addLife = () => {
  if (lives.value < 5) {
    lives.value++
  }
}

const checkSushi = () => {
  const recipeIds = currentRecipe.value.ingredients.map(ing => ing.id)
  const placedIds = placedIngredients.value.map(ing => ing.id)

  // Contar ingredientes correctos
  correctCount.value = placedIds.filter(id => recipeIds.includes(id)).length

  // Verificar si todos los ingredientes necesarios están presentes
  const correct = recipeIds.every(id => placedIds.includes(id)) &&
      placedIds.every(id => recipeIds.includes(id))

  resultCorrect.value = correct
  showResult.value = true

  if (correct) {
    completedSushi.value++
  } else {
    lives.value--
    if (lives.value <= 0) {
      gameOver.value = true
      showResult.value = false
    }
  }
}

const nextSushi = () => {
  showResult.value = false
  correctCount.value = 0

  if (resultCorrect.value) {
    if (currentRecipeIndex.value < recipes.length - 1) {
      currentRecipeIndex.value++
      placedIngredients.value = []
    } else {
      gameCompleted.value = true
    }
  } else {
    placedIngredients.value = []
  }
}

const resetGame = () => {
  currentRecipeIndex.value = 0
  placedIngredients.value = []
  completedSushi.value = 0
  lives.value = 3
  timer.value = 0
  gameOver.value = false
  gameCompleted.value = false
  startTimer()
}

const completeGame = () => {
  emit('complete')
}

// Timer
const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  timerInterval = setInterval(() => {
    timer.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Lifecycle
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.ingredient-item {
  user-select: none;
  touch-action: none;
}

/* Prevenir scroll bounce en iOS */
html, body {
  overscroll-behavior: none;
  overflow-x: hidden;
}

/* Mejorar la experiencia touch */
@media (pointer: coarse) {
  .ingredient-item:active {
    transform: scale(0.95);
  }

  button:active {
    transform: scale(0.95);
  }
}

/* Asegurar que los elementos sean táctiles en móvil */
@media (max-width: 640px) {
  .ingredient-item {
    min-height: 80px;
    min-width: 64px;
  }

  button {
    min-height: 44px;
  }
}
</style>