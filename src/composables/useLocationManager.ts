import { watch, type Ref } from 'vue'
import * as THREE from 'three'
import type { Location } from '@/types/index'

export function useLocationManager(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    getRenderer: () => THREE.WebGLRenderer | null,
    locationMeshes: THREE.Mesh[],
    locations: Ref<Location[]>
) {
    const pathMeshes: THREE.Mesh[] = []
    const platformMeshes: THREE.Mesh[] = []

    const createLocations = () => {
        // Limpiar ubicaciones existentes
        locationMeshes.forEach(mesh => {
            scene.remove(mesh)
        })
        platformMeshes.forEach(mesh => {
            scene.remove(mesh)
        })
        locationMeshes.length = 0
        platformMeshes.length = 0

        locations.value.forEach((location, index) => {
            // Crear esfera principal
            const geometry = new THREE.SphereGeometry(0.5, 16, 16)
            const material = new THREE.MeshPhongMaterial({
                color: location.unlocked ? location.color : '#666666',
                emissive: location.unlocked ? location.color : '#222222',
                emissiveIntensity: location.unlocked ? 0.2 : 0.05,
                transparent: !location.unlocked,
                opacity: location.unlocked ? 1 : 0.5
            })

            const sphere = new THREE.Mesh(geometry, material)
            sphere.position.set(...location.position)
            sphere.castShadow = true
            sphere.userData = { locationId: location.id }

            locationMeshes[index] = sphere
            scene.add(sphere)

            // Agregar halo para ubicaciones desbloqueadas
            if (location.unlocked) {
                const haloGeometry = new THREE.SphereGeometry(0.7, 16, 16)
                const haloMaterial = new THREE.MeshBasicMaterial({
                    color: location.color,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.BackSide
                })
                const halo = new THREE.Mesh(haloGeometry, haloMaterial)
                halo.position.copy(sphere.position)
                scene.add(halo)
            }

            // Plataforma base
            const platformGeometry = new THREE.CylinderGeometry(0.8, 1, 0.1, 8)
            const platformMaterial = new THREE.MeshLambertMaterial({
                color: location.unlocked ? 0x8b4513 : 0x444444
            })
            const platform = new THREE.Mesh(platformGeometry, platformMaterial)
            platform.position.set(location.position[0], location.position[1] - 0.6, location.position[2])
            platform.receiveShadow = true

            platformMeshes[index] = platform
            scene.add(platform)
        })

        // Crear paths después de crear ubicaciones
        createPaths()
    }

    const createPaths = () => {
        // Limpiar paths existentes
        pathMeshes.forEach(mesh => {
            scene.remove(mesh)
        })
        pathMeshes.length = 0

        // Crear paths entre ubicaciones completadas y desbloqueadas
        for (let i = 0; i < locations.value.length - 1; i++) {
            const currentLocation = locations.value[i]
            const nextLocation = locations.value[i + 1]

            if (currentLocation.completed && nextLocation.unlocked) {
                const points = []
                points.push(new THREE.Vector3(...currentLocation.position))

                // Punto intermedio elevado para crear una curva
                const midPoint = new THREE.Vector3(
                    (currentLocation.position[0] + nextLocation.position[0]) / 2,
                    Math.max(currentLocation.position[1], nextLocation.position[1]) + 1,
                    (currentLocation.position[2] + nextLocation.position[2]) / 2
                )
                points.push(midPoint)
                points.push(new THREE.Vector3(...nextLocation.position))

                const curve = new THREE.CatmullRomCurve3(points)
                const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false)
                const material = new THREE.MeshBasicMaterial({
                    color: 0xffd700,
                })

                const pathMesh = new THREE.Mesh(geometry, material)
                pathMeshes.push(pathMesh)
                scene.add(pathMesh)
            }
        }
    }

    const updateLocations = () => {
        locationMeshes.forEach((mesh, index) => {
            if (!mesh) return

            const location = locations.value[index]
            if (!location) return

            const material = mesh.material as THREE.MeshPhongMaterial

            material.color.setHex(location.unlocked ? parseInt(location.color.replace('#', '0x')) : 0x666666)
            material.emissive.setHex(location.unlocked ? parseInt(location.color.replace('#', '0x')) : 0x222222)
            material.emissiveIntensity = location.unlocked ? 0.2 : 0.05
            material.transparent = !location.unlocked
            material.opacity = location.unlocked ? 1 : 0.5
        })

        // Actualizar plataformas
        platformMeshes.forEach((mesh, index) => {
            if (!mesh) return

            const location = locations.value[index]
            if (!location) return

            const material = mesh.material as THREE.MeshLambertMaterial
            material.color.setHex(location.unlocked ? 0x8b4513 : 0x444444)
        })

        // Recrear paths cuando se actualicen las ubicaciones
        createPaths()
    }

    const handleClick = (event: MouseEvent, onLocationClick: (location: Location) => void) => {
        const renderer = getRenderer()
        if (!renderer) return

        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        const rect = renderer.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(locationMeshes)

        if (intersects.length > 0) {
            const locationId = intersects[0].object.userData.locationId
            const location = locations.value.find(loc => loc.id === locationId)
            if (location) {
                onLocationClick(location)
            }
        }
    }

    watch(locations, () => {
        updateLocations()
    }, { deep: true })

    return {
        createLocations,
        updateLocations,
        handleClick
    }
}