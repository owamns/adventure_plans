<template>
  <div class="bg-black bg-opacity-50 text-white p-4 rounded-lg">
    <h3 class="font-bold mb-2">Progreso</h3>
    <p class="text-sm mb-3">Nivel: {{ gameState.currentLevel }}</p>

    <div
        v-for="location in gameState.locations"
        :key="location.id"
        class="flex items-center mb-1"
    >
      <div
          class="w-3 h-3 rounded-full mr-2"
          :class="getStatusClass(location)"
      />
      <span
          class="text-sm"
          :class="location.unlocked ? 'text-white' : 'text-gray-500'"
      >
        {{ location.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameState, Location } from '@/types'

defineProps<{
  gameState: GameState
}>()

const getStatusClass = (location: Location) => {
  if (location.completed) return 'bg-yellow-400'
  if (location.unlocked) return 'bg-green-400'
  return 'bg-gray-600'
}
</script>