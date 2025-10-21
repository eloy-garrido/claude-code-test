/**
 * Renderizador 3D con Three.js para sprites del juego Snake
 */

import { CONFIG } from './config.js';

export class Renderer3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.foodMesh = null;
        this.snakeSegments = [];
        this.initialized = false;
    }

    /**
     * Inicializa la escena 3D
     */
    init() {
        // Crear escena
        this.scene = new THREE.Scene();

        // Crear cámara ortográfica para coincidir con el grid 2D
        const aspect = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
        const frustumSize = CONFIG.CANVAS_HEIGHT;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );
        this.camera.position.z = 500;

        // Crear renderer
        const canvas = document.getElementById('gameCanvas3D');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.renderer.setClearColor(0x000000, 0); // Transparente

        // Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 50);
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-10, -10, 50);
        this.scene.add(directionalLight2);

        this.initialized = true;
    }

    /**
     * Crea un sprite 3D de la fruta (esfera roja con textura)
     */
    createFoodSprite() {
        // Crear geometría de esfera con más detalles
        const geometry = new THREE.SphereGeometry(CONFIG.GRID_SIZE * 0.35, 32, 32);

        // Material con color rojo brillante
        const material = new THREE.MeshPhongMaterial({
            color: 0xff3333,
            shininess: 100,
            specular: 0xffffff,
            emissive: 0x330000
        });

        this.foodMesh = new THREE.Mesh(geometry, material);

        // Agregar una pequeña esfera verde para simular la hoja
        const leafGeometry = new THREE.SphereGeometry(CONFIG.GRID_SIZE * 0.1, 16, 16);
        const leafMaterial = new THREE.MeshPhongMaterial({
            color: 0x33cc33,
            shininess: 50
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.set(
            CONFIG.GRID_SIZE * 0.2,
            CONFIG.GRID_SIZE * 0.3,
            CONFIG.GRID_SIZE * 0.1
        );
        leaf.scale.set(1, 2, 0.5);
        this.foodMesh.add(leaf);

        this.scene.add(this.foodMesh);
    }

    /**
     * Crea sprites 3D para cada segmento de la serpiente
     * @param {number} count - Número de segmentos
     */
    createSnakeSprites(count) {
        // Limpiar segmentos anteriores
        this.snakeSegments.forEach(segment => {
            this.scene.remove(segment);
        });
        this.snakeSegments = [];

        for (let i = 0; i < count; i++) {
            const isHead = i === 0;
            const geometry = new THREE.BoxGeometry(
                CONFIG.GRID_SIZE * 0.8,
                CONFIG.GRID_SIZE * 0.8,
                CONFIG.GRID_SIZE * 0.6
            );

            const material = new THREE.MeshPhongMaterial({
                color: isHead ? 0x00ff00 : 0x00cc00,
                shininess: isHead ? 100 : 50,
                specular: 0xffffff,
                emissive: isHead ? 0x003300 : 0x002200
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Agregar ojos a la cabeza
            if (isHead) {
                const eyeGeometry = new THREE.SphereGeometry(CONFIG.GRID_SIZE * 0.08, 8, 8);
                const eyeMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: 0xffff00,
                    shininess: 100
                });

                const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                leftEye.position.set(-CONFIG.GRID_SIZE * 0.15, CONFIG.GRID_SIZE * 0.15, CONFIG.GRID_SIZE * 0.3);
                mesh.add(leftEye);

                const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                rightEye.position.set(CONFIG.GRID_SIZE * 0.15, CONFIG.GRID_SIZE * 0.15, CONFIG.GRID_SIZE * 0.3);
                mesh.add(rightEye);
            }

            this.snakeSegments.push(mesh);
            this.scene.add(mesh);
        }
    }

    /**
     * Actualiza la posición de la fruta
     * @param {number} x - Coordenada X en el grid
     * @param {number} y - Coordenada Y en el grid
     */
    updateFoodPosition(x, y) {
        if (!this.foodMesh) return;

        const posX = (x * CONFIG.GRID_SIZE) - (CONFIG.CANVAS_WIDTH / 2) + (CONFIG.GRID_SIZE / 2);
        const posY = -(y * CONFIG.GRID_SIZE) + (CONFIG.CANVAS_HEIGHT / 2) - (CONFIG.GRID_SIZE / 2);

        this.foodMesh.position.set(posX, posY, 0);
    }

    /**
     * Actualiza las posiciones de los segmentos de la serpiente
     * @param {Array} snake - Array de segmentos {x, y}
     * @param {number} dx - Dirección X
     * @param {number} dy - Dirección Y
     */
    updateSnakePositions(snake, dx, dy) {
        // Ajustar número de segmentos si cambió
        if (this.snakeSegments.length !== snake.length) {
            this.createSnakeSprites(snake.length);
        }

        snake.forEach((segment, index) => {
            if (this.snakeSegments[index]) {
                const posX = (segment.x * CONFIG.GRID_SIZE) - (CONFIG.CANVAS_WIDTH / 2) + (CONFIG.GRID_SIZE / 2);
                const posY = -(segment.y * CONFIG.GRID_SIZE) + (CONFIG.CANVAS_HEIGHT / 2) - (CONFIG.GRID_SIZE / 2);

                this.snakeSegments[index].position.set(posX, posY, 0);

                // Rotar la cabeza según la dirección
                if (index === 0) {
                    let rotation = 0;
                    if (dx === 1) rotation = -Math.PI / 2;
                    else if (dx === -1) rotation = Math.PI / 2;
                    else if (dy === 1) rotation = Math.PI;

                    this.snakeSegments[index].rotation.z = rotation;
                }
            }
        });
    }

    /**
     * Anima la fruta (rotación continua)
     */
    animateFood() {
        if (this.foodMesh) {
            this.foodMesh.rotation.x += 0.01;
            this.foodMesh.rotation.y += 0.02;
        }
    }

    /**
     * Renderiza la escena
     */
    render() {
        if (!this.initialized) return;

        this.animateFood();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Limpia todos los objetos 3D
     */
    clear() {
        // Limpiar segmentos de serpiente
        this.snakeSegments.forEach(segment => {
            this.scene.remove(segment);
            segment.geometry.dispose();
            segment.material.dispose();
        });
        this.snakeSegments = [];

        // Limpiar fruta
        if (this.foodMesh) {
            this.scene.remove(this.foodMesh);
            this.foodMesh.geometry.dispose();
            this.foodMesh.material.dispose();
            this.foodMesh = null;
        }
    }
}
