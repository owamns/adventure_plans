<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <!-- Mostrar el juego si está en modo juego -->
    <div v-if="playingGame" class="bg-white rounded-lg max-w-3xl w-full relative overflow-visible">
      <div class="overflow-y-auto max-h-screen">
        <component
            :is="gameComponent"
            @complete="handleGameComplete"
            @close="handleGameClose"
        />
      </div>
    </div>

    <!-- Mensaje Final Especial (solo para nivel final) -->
    <div v-else-if="showCompletionMessage" class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold p-8 rounded-xl text-center shadow-2xl border-4 border-yellow-300 max-w-md">
      <div class="text-6xl animate-bounce mb-4">🎊</div>
      <div class="text-2xl mb-2">¡MISIÓN CUMPLIDA!</div>
      <div class="text-xl mb-2">¡Has completado TODOS los desafíos de Lima!</div>
      <div class="text-lg mb-4">Eres un verdadero explorador de la ciudad ⭐</div>
      <div class="text-sm mb-4">¡Felicitaciones por tu increíble aventura! 🌟</div>
      <button
          @click="closeCompletionMessage"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-bold"
      >
        ✨ ¡Continuar Aventura!
      </button>
    </div>

    <!-- Modal de información de la ubicación -->
    <div v-else class="bg-white rounded-lg p-6 max-w-md relative">
      <h3 class="text-2xl font-bold mb-4" :style="{ color: location.color }">
        {{ location.name }}
      </h3>
      <p class="text-gray-600 mb-4">{{ location.description }}</p>

      <div v-if="!location.completed" class="space-y-2">
        <p class="text-sm text-gray-500">¡Juega para completar esta ubicación!</p>
        <button
            @click="startGame"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
        >
          🎮 Jugar
        </button>
      </div>

      <div v-else class="text-green-600 font-semibold">
        ✓ Misión Completada
        <button
            @click="startGame"
            class="block w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors" style="margin: 1rem 0;"
        >
          🔄 Jugar de Nuevo
        </button>
      </div>

      <button
          @click="$emit('close')"
          class="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors"
      >
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Location } from '@/types'
import CineGame from '@/components/games/CineGame.vue'
import HipodromoGame from '@/components/games/HipodromoGame.vue'
import MakisGame from '@/components/games/MakisGame.vue'
import PatinajeGame from '@/components/games/PatinajeGame.vue'

const props = defineProps<{
  location: Location
}>()

const emit = defineEmits<{
  complete: [locationId: number]
  close: []
}>()

const playingGame = ref(false)
const showCompletionMessage = ref(false)

const gameComponents = {
  CineGame,
  HipodromoGame,
  MakisGame,
  PatinajeGame
}

const gameComponent = computed(() => {
  return gameComponents[props.location.gameComponent as keyof typeof gameComponents]
})

const startGame = () => {
  playingGame.value = true
  showCompletionMessage.value = false
}

const handleGameComplete = () => {
  playingGame.value = false

  // Solo completar si no estaba completado antes
  if (!props.location.completed) {
    emit('complete', props.location.id)
  }

  // Solo mostrar mensaje especial para el nivel final (CineGame)
  if (props.location.gameComponent === 'CineGame') {
    setTimeout(() => {
      showCompletionMessage.value = true
    }, 2000)
  } else {
    emit('close')
  }
}

const handleGameClose = () => {
  playingGame.value = false
}

const closeCompletionMessage = () => {
  showCompletionMessage.value = false
  // Opcionalmente cerrar todo el modal
  emit('close')
}
</script>

<style scoped>
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
</style>