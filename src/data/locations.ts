import type { Location } from '@/types'

export const initialLocations: Location[] = [
    {
        id: 1,
        name: 'Makis',
        position: [0, 0, 0],
        unlocked: true,
        completed: false,
        color: '#4ade80',
        description: 'Arma el sushi correctamente',
        gameComponent: 'MakisGame'
    },
    {
        id: 2,
        name: 'Hipódromo',
        position: [4, 1, -2],
        unlocked: false,
        completed: false,
        color: '#22c55e',
        description: 'Apuesta y mira correr a los caballos',
        gameComponent: 'HipodromoGame'
    },
    {
        id: 3,
        name: 'Patinaje',
        position: [-3, 3, 1],
        unlocked: false,
        completed: false,
        color: '#3b82f6',
        description: 'Esquiva obstáculos mientras patinas',
        gameComponent: 'PatinajeGame'
    },
    {
        id: 4,
        name: 'Cine',
        position: [1, 2, 4],
        unlocked: false,
        completed: false,
        color: '#8b5cf6',
        description: 'Encuentra las parejas de Stitch',
        gameComponent: 'CineGame'
    }
]