import * as THREE from 'three'

export interface Location {
    id: number
    name: string
    position: [number, number, number]
    unlocked: boolean
    completed: boolean
    color: string
    description: string
}

export interface GameState {
    locations: Location[]
    currentLevel: number
}

export interface ThreeJSRefs {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer | null
    locationMeshes: THREE.Mesh[]
}