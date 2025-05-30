import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import * as THREE from 'three'
import type { ThreeJSRefs } from '@/types'

export function useThreeJS(container: Ref<HTMLElement | null>) {
    // Usar objetos normales en lugar de reactive para Three.js
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    let renderer: THREE.WebGLRenderer | null = null
    const locationMeshes: THREE.Mesh[] = []

    const refs = ref<ThreeJSRefs>({
        scene,
        camera,
        renderer,
        locationMeshes
    })

    const isRotating = ref(true)
    let animationId: number | null = null
    let controls: any = null
    let rotationTime = 0
    let lastFrameTime = Date.now()

    const initScene = async () => {
        await nextTick()
        if (!container.value) return

        // Configurar escena
        const skyboxLoader = new THREE.CubeTextureLoader()
        scene.background = skyboxLoader.load([
            'src/assets/texturas/sky.png', 'src/assets/texturas/sky.png',
            'src/assets/texturas/sky.png', 'src/assets/texturas/sky.png',
            'src/assets/texturas/sky.png', 'src/assets/texturas/sky.png'
        ])

        // Configurar cámara
        camera.aspect = container.value.clientWidth / container.value.clientHeight
        camera.position.set(8, 6, 8)
        camera.lookAt(0, 2, 0)
        camera.updateProjectionMatrix()

        // Configurar renderer
        renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(container.value.clientWidth, container.value.clientHeight)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        refs.value.renderer = renderer
        container.value.appendChild(renderer.domElement)

        // Agregar luces
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 4)
        directionalLight.position.set(5, 10, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        scene.add(directionalLight)

        // Crear terreno
        createTerrain()

        // Configurar controles
        setupOrbitControls()

        // Iniciar animación
        animate()
    }

    const createTerrain = () => {
        const loader = new THREE.TextureLoader()
        const texture = loader.load('src/assets/texturas/mapa.png')
        const geometry = new THREE.PlaneGeometry(80, 80, 64, 64)
        const material = new THREE.MeshLambertMaterial({ map: texture })

        const terrain = new THREE.Mesh(geometry, material)
        terrain.rotation.x = -Math.PI / 2
        terrain.receiveShadow = true
        terrain.position.y = -0.9

        // Agregar algo de ruido al terreno
        const vertices = geometry.attributes.position.array
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] += Math.sin(vertices[i] * 0.3) * 0.3 + Math.cos(vertices[i + 1] * 0.3) * 0.2
        }
        geometry.attributes.position.needsUpdate = true
        geometry.computeVertexNormals()

        scene.add(terrain)
    }

    const setupOrbitControls = () => {
        if (!renderer) return

        let isDragging = false
        let previousPosition = { x: 0, y: 0 }
        let cameraMoveTimeout: number | null = null

        const resetCameraMoveTimeout = () => {
            if (cameraMoveTimeout) clearTimeout(cameraMoveTimeout)
            cameraMoveTimeout = window.setTimeout(() => {
                isRotating.value = true
            }, 500)
        }

        // Mouse events
        const onMouseDown = (event: MouseEvent) => {
            isDragging = true
            previousPosition = { x: event.clientX, y: event.clientY }
            resetCameraMoveTimeout()
        }
        const onMouseUp = () => { isDragging = false }
        const onMouseMove = (event: MouseEvent) => {
            if (!isDragging || !camera) return
            const deltaMove = {
                x: event.clientX - previousPosition.x,
                y: event.clientY - previousPosition.y
            }
            updateCamera(deltaMove)
            previousPosition = { x: event.clientX, y: event.clientY }
            isRotating.value = false
            resetCameraMoveTimeout()
        }

        // Touch events
        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) return
            isDragging = true
            previousPosition = { x: event.touches[0].clientX, y: event.touches[0].clientY }
            resetCameraMoveTimeout()
        }
        const onTouchEnd = () => { isDragging = false }
        const onTouchMove = (event: TouchEvent) => {
            if (!isDragging || !camera || event.touches.length !== 1) return
            const touch = event.touches[0]
            const deltaMove = {
                x: touch.clientX - previousPosition.x,
                y: touch.clientY - previousPosition.y
            }
            updateCamera(deltaMove)
            previousPosition = { x: touch.clientX, y: touch.clientY }
            isRotating.value = false
            resetCameraMoveTimeout()
        }

        // Camera update logic
        const updateCamera = (deltaMove: { x: number, y: number }) => {
            const spherical = new THREE.Spherical()
            spherical.setFromVector3(camera.position)
            spherical.theta -= deltaMove.x * 0.01
            spherical.phi += deltaMove.y * 0.01
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
            camera.position.setFromSpherical(spherical)
            camera.lookAt(0, 0, 0)
        }

        renderer.domElement.addEventListener('mousedown', onMouseDown)
        renderer.domElement.addEventListener('mouseup', onMouseUp)
        renderer.domElement.addEventListener('mousemove', onMouseMove)
        renderer.domElement.addEventListener('mouseleave', onMouseUp)

        renderer.domElement.addEventListener('touchstart', onTouchStart)
        renderer.domElement.addEventListener('touchend', onTouchEnd)
        renderer.domElement.addEventListener('touchmove', onTouchMove)

        controls = {
            dispose: () => {
                renderer?.domElement.removeEventListener('mousedown', onMouseDown)
                renderer?.domElement.removeEventListener('mouseup', onMouseUp)
                renderer?.domElement.removeEventListener('mousemove', onMouseMove)
                renderer?.domElement.removeEventListener('mouseleave', onMouseUp)
                renderer?.domElement.removeEventListener('touchstart', onTouchStart)
                renderer?.domElement.removeEventListener('touchend', onTouchEnd)
                renderer?.domElement.removeEventListener('touchmove', onTouchMove)
            }
        }
    }

    const animate = () => {
        animationId = requestAnimationFrame(animate)

        const currentTime = Date.now()

        if (isRotating.value) {
            // Incrementar el tiempo de rotación solo cuando está rotando
            rotationTime += (currentTime - lastFrameTime) * 0.0005

            const radius = 10
            camera.position.x = Math.cos(rotationTime) * radius
            camera.position.z = Math.sin(rotationTime) * radius
            camera.position.y = 6
            camera.lookAt(0, 0, 0)
        } else {
            // Cuando no está rotando, actualizar el tiempo de rotación basado en la posición actual
            // para que cuando se reanude, continúe desde donde estaba
            const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)
            if (currentRadius > 0) {
                rotationTime = Math.atan2(camera.position.z, camera.position.x)
            }
        }

        lastFrameTime = currentTime

        // Animar ubicaciones
        locationMeshes.forEach((mesh, index) => {
            if (mesh) {
                mesh.rotation.y += 0.01
                // Animación de flotación para ubicaciones desbloqueadas
                const baseY = mesh.userData.baseY || mesh.position.y
                mesh.position.y = baseY + Math.sin(Date.now() * 0.001 + index) * 0.1
                if (!mesh.userData.baseY) {
                    mesh.userData.baseY = mesh.position.y
                }
            }
        })

        if (renderer) {
            renderer.render(scene, camera)
        }
    }

    const toggleRotation = () => {
        isRotating.value = !isRotating.value
    }

    const handleResize = () => {
        if (!container.value || !renderer) return

        camera.aspect = container.value.clientWidth / container.value.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(container.value.clientWidth, container.value.clientHeight)
    }

    onMounted(() => {
        initScene()
        window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
        if (animationId) {
            cancelAnimationFrame(animationId)
        }

        if (controls) {
            controls.dispose()
        }

        window.removeEventListener('resize', handleResize)

        if (renderer && container.value) {
            container.value.removeChild(renderer.domElement)
            renderer.dispose()
        }
    })

    return {
        refs,
        isRotating,
        toggleRotation,
        scene,
        camera,
        renderer: () => renderer,
        locationMeshes
    }
}