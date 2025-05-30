<template>
  <div class="w-full h-screen bg-gray-900 relative">
    <!-- Info panel superior izquierda -->
    <div class="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
      <h2 class="text-xl font-bold mb-2">Mapa de Aventura</h2>
      <p class="text-sm mb-2">Nivel actual: {{ gameState.currentLevel }}</p>
      <p class="text-xs text-gray-300">Haz clic en las ubicaciones desbloqueadas</p>
    </div>

    <!-- Contenedor del mapa 3D -->
    <div
        ref="container"
        class="w-full h-full"
        @click="handleLocationClick"
    />

    <ProgressPanel
        :game-state="gameState"
        class="absolute top-4 right-4"
    />

    <ControlPanel
        :is-rotating="isRotating"
        @toggle-rotation="toggleRotation"
        @reset-game="handleResetGame"
        class="absolute bottom-4 left-4"
    />

    <LocationModal
        v-if="selectedLocation"
        :location="selectedLocation"
        @complete="completeLocation"
        @close="selectedLocation = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useGameState } from '@/composables/useGameState'
import { useThreeJS } from '@/composables/useThreeJS'
import { useLocationManager } from '@/composables/useLocationManager'
import ProgressPanel from './ProgressPanel.vue'
import ControlPanel from './ControlPanel.vue'
import LocationModal from './LocationModal.vue'

const container = ref<HTMLElement | null>(null)

const { gameState, selectedLocation, completeLocation, resetGame, selectLocation } = useGameState()
const { isRotating, toggleRotation, scene, camera, renderer, locationMeshes } = useThreeJS(container)
const { createLocations, handleClick } = useLocationManager(
    scene,
    camera,
    renderer,
    locationMeshes,
    computed(() => gameState.value.locations)
)

const handleLocationClick = (event: MouseEvent) => {
  handleClick(event, selectLocation)
}

const handleResetGame = async () => {
  console.log('Resetting game...')
  resetGame()
  // Esperar a que Vue actualice el DOM y luego recrear las ubicaciones
  await nextTick()
  setTimeout(() => {
    createLocations()
  }, 100)
}

onMounted(() => {
  // Crear ubicaciones después de que la escena esté lista
  setTimeout(() => {
    createLocations()
  }, 100)
})
</script>