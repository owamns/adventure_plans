<template>
  <div class="space-x-2">
    <button
        @click="$emit('toggle-rotation')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      {{ isRotating ? 'Pausar' : 'Rotar' }}
    </button>
    <button
        @click="$emit('reset-game')"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
    >
      Reiniciar
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isRotating: boolean
}>()

defineEmits<{
  'toggle-rotation': []
  'reset-game': []
}>()
</script>