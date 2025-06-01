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
    const showCompletionMessage = ref(false)
    const completionMessage = ref('')

    const unlockedLocations = computed(() =>
        gameState.value.locations.filter(loc => loc.unlocked)
    )

    const completedLocations = computed(() =>
        gameState.value.locations.filter(loc => loc.completed)
    )

    const totalProgress = computed(() => {
        const total = gameState.value.locations.length
        const completed = completedLocations.value.length
        return Math.round((completed / total) * 100)
    })

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

        // Actualizar estado primero
        gameState.value = {
            ...gameState.value,
            locations: newLocations,
            currentLevel: Math.max(gameState.value.currentLevel, locationId + 1)
        }

        // Verificar si hay siguiente ubicación para desbloquear
        if (locationIndex < newLocations.length - 1) {
            const nextLocation = newLocations[locationIndex + 1]
            newLocations[locationIndex + 1] = {
                ...nextLocation,
                unlocked: true
            }

            // Actualizar estado con la nueva ubicación desbloqueada
            gameState.value = {
                ...gameState.value,
                locations: newLocations
            }

            // Mostrar mensaje de nueva ubicación desbloqueada
            completionMessage.value = `¡Nuevo nivel desbloqueado: ${nextLocation.name}!`
            showCompletionMessage.value = true

            // Ocultar mensaje después de 3 segundos
            setTimeout(() => {
                showCompletionMessage.value = false
            }, 3000)
        }

        // Verificar si se completó el juego (todos los niveles completados)
        const allCompleted = newLocations.every(loc => loc.completed)
        if (allCompleted) {
            // Mostrar mensaje de juego completado
            setTimeout(() => {
                completionMessage.value = '¡Felicitaciones! Has completado todos los niveles.'
                showCompletionMessage.value = true

                setTimeout(() => {
                    showCompletionMessage.value = false
                }, 5000)
            }, 500) // Pequeño delay para que se vea la transición
        }

        selectedLocation.value = null
    }

    const resetGame = () => {
        gameState.value = createInitialState()
        selectedLocation.value = null
        showCompletionMessage.value = false
        completionMessage.value = ''
    }

    const selectLocation = (location: Location) => {
        if (location.unlocked) {
            selectedLocation.value = location
        }
    }

    // Watch para debug
    watch(gameState, (newState) => {
        console.log('Game state changed:', newState)
        console.log('Progress:', totalProgress.value + '%')
    }, { deep: true })

    return {
        gameState,
        selectedLocation,
        unlockedLocations,
        completedLocations,
        totalProgress,
        showCompletionMessage,
        completionMessage,
        completeLocation,
        resetGame,
        selectLocation
    }
}