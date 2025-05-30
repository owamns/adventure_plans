import { ref, computed, watch } from 'vue'
import type { GameState, Location } from '@/types'
import { initialLocations } from '@/data/locations'

// Crear una copia profunda de las ubicaciones iniciales
const createInitialState = (): GameState => ({
    locations: initialLocations.map(loc => ({ ...loc })),
    currentLevel: 1
})

const gameState = ref<GameState>(createInitialState())

export function useGameState() {
    const selectedLocation = ref<Location | null>(null)

    const unlockedLocations = computed(() =>
        gameState.value.locations.filter(loc => loc.unlocked)
    )

    const completedLocations = computed(() =>
        gameState.value.locations.filter(loc => loc.completed)
    )

    const completeLocation = (locationId: number) => {
        const locationIndex = gameState.value.locations.findIndex(loc => loc.id === locationId)
        if (locationIndex === -1) return

        // Crear nueva copia para asegurar reactividad
        const newLocations = [...gameState.value.locations]

        // Completar ubicación actual
        newLocations[locationIndex] = {
            ...newLocations[locationIndex],
            completed: true
        }

        // Desbloquear siguiente ubicación
        if (locationIndex < newLocations.length - 1) {
            newLocations[locationIndex + 1] = {
                ...newLocations[locationIndex + 1],
                unlocked: true
            }
        }

        // Actualizar estado
        gameState.value = {
            ...gameState.value,
            locations: newLocations,
            currentLevel: Math.max(gameState.value.currentLevel, locationId + 1)
        }

        selectedLocation.value = null
    }

    const resetGame = () => {
        gameState.value = createInitialState()
        selectedLocation.value = null
    }

    const selectLocation = (location: Location) => {
        if (location.unlocked) {
            selectedLocation.value = location
        }
    }

    // Watch para debug
    watch(gameState, (newState) => {
        console.log('Game state changed:', newState)
    }, { deep: true })

    return {
        gameState,
        selectedLocation,
        unlockedLocations,
        completedLocations,
        completeLocation,
        resetGame,
        selectLocation
    }
}