<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-md">
      <h3 class="text-2xl font-bold mb-4" :style="{ color: location.color }">
        {{ location.name }}
      </h3>
      <p class="text-gray-600 mb-4">{{ location.description }}</p>

      <div v-if="!location.completed" class="space-y-2">
        <p class="text-sm text-gray-500">¿Completar esta ubicación?</p>
        <button
            @click="$emit('complete', location.id)"
            class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Completar Misión
        </button>
      </div>

      <div v-else class="text-green-600 font-semibold">
        ✓ Misión Completada
      </div>

      <button
          @click="$emit('close')"
          class="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
      >
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Location } from '@/types'

defineProps<{
  location: Location
}>()

defineEmits<{
  complete: [locationId: number]
  close: []
}>()
</script>