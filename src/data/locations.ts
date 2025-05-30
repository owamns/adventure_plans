import type { Location } from '@/types'

export const initialLocations: Location[] = [
    {
        id: 1,
        name: 'Inicio',
        position: [0, 0, 0],
        unlocked: true,
        completed: false,
        color: '#4ade80',
        description: 'Punto de partida de tu aventura'
    },
    {
        id: 2,
        name: 'Bosque Místico',
        position: [4, 1, -2],
        unlocked: false,
        completed: false,
        color: '#22c55e',
        description: 'Un bosque lleno de misterios'
    },
    {
        id: 3,
        name: 'Montaña Sagrada',
        position: [-3, 3, 1],
        unlocked: false,
        completed: false,
        color: '#3b82f6',
        description: 'La montaña más alta del reino'
    },
    {
        id: 4,
        name: 'Castillo Final',
        position: [1, 2, 4],
        unlocked: false,
        completed: false,
        color: '#8b5cf6',
        description: 'El destino final de tu viaje'
    }
]