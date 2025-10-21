/**
 * Renderer 3D usando Three.js para el juego Snake
 */

import { CONFIG } from './config.js';

export class Renderer3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.snakeMeshes = [];
        this.foodMesh = null;
        this.foodRotation = 0;
        this.gridHelper = null;

        this.init();
    }

    /**
     * Inicializa Three.js
     */
    init() {
        // Crear la escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.COLORS.background);

        // Configurar la cámara
        const aspect = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
        this.camera = new THREE.PerspectiveCamera(
            60,  // FOV
            aspect,
            0.1,
            1000
        );

        // Posicionar la cámara para vista isométrica superior
        const gridCenter = CONFIG.TILE_COUNT / 2;
        this.camera.position.set(
            gridCenter * 1.2,
            gridCenter * 1.8,
            gridCenter * 1.5
        );
        this.camera.lookAt(gridCenter, 0, gridCenter);

        // Crear el renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Agregar iluminación
        this.setupLights();

        // Crear el grid (plano de juego)
        this.createGrid();

        // Iniciar loop de animación
        this.animate();
    }

    /**
     * Configura las luces de la escena
     */
    setupLights() {
        // Luz ambiental suave
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x667eea, 0.3);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);

        // Luz puntual sobre la comida (se moverá con la comida)
        this.foodLight = new THREE.PointLight(0xff6b6b, 0.8, 10);
        this.foodLight.position.set(0, 3, 0);
        this.scene.add(this.foodLight);
    }

    /**
     * Crea el grid/plano de juego
     */
    createGrid() {
        // Plano base
        const planeGeometry = new THREE.PlaneGeometry(
            CONFIG.TILE_COUNT,
            CONFIG.TILE_COUNT
        );
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(CONFIG.TILE_COUNT / 2, 0, CONFIG.TILE_COUNT / 2);
        plane.receiveShadow = true;
        this.scene.add(plane);

        // Grid helper
        const gridHelper = new THREE.GridHelper(
            CONFIG.TILE_COUNT,
            CONFIG.TILE_COUNT,
            0x667eea,
            0x667eea
        );
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        gridHelper.position.set(CONFIG.TILE_COUNT / 2, 0.01, CONFIG.TILE_COUNT / 2);
        this.scene.add(gridHelper);
    }

    /**
     * Dibuja el snake en 3D
     * @param {Array} snake - Array de segmentos del snake
     * @param {number} dx - Dirección X
     * @param {number} dy - Dirección Y
     */
    drawSnake(snake, dx, dy) {
        // Limpiar meshes anteriores del snake
        this.snakeMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.snakeMeshes = [];

        snake.forEach((segment, index) => {
            const isHead = index === 0;

            // Crear geometría del segmento (cubo redondeado)
            const geometry = new THREE.BoxGeometry(0.9, 0.6, 0.9);

            // Material con color degradado
            const intensity = 1 - (index / snake.length) * 0.3;
            let color;
            if (isHead) {
                color = new THREE.Color(CONFIG.COLORS.snakeHead.start);
            } else {
                color = new THREE.Color(CONFIG.COLORS.snakeBody.start);
                color.multiplyScalar(intensity);
            }

            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.4,
                metalness: 0.6,
                emissive: color,
                emissiveIntensity: 0.2
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Posicionar el segmento
            mesh.position.set(
                segment.x + 0.5,
                0.3,
                segment.y + 0.5
            );

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.scene.add(mesh);
            this.snakeMeshes.push(mesh);

            // Agregar ojos si es la cabeza
            if (isHead) {
                this.drawEyes(mesh, dx, dy);
            }
        });
    }

    /**
     * Dibuja los ojos en la cabeza del snake
     * @param {THREE.Mesh} headMesh - Mesh de la cabeza
     * @param {number} dx - Dirección X
     * @param {number} dy - Dirección Y
     */
    drawEyes(headMesh, dx, dy) {
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });

        // Posición de los ojos según la dirección
        let eye1Pos, eye2Pos;

        if (dx === 1) { // Derecha
            eye1Pos = { x: 0.4, y: 0.15, z: 0.2 };
            eye2Pos = { x: 0.4, y: 0.15, z: -0.2 };
        } else if (dx === -1) { // Izquierda
            eye1Pos = { x: -0.4, y: 0.15, z: 0.2 };
            eye2Pos = { x: -0.4, y: 0.15, z: -0.2 };
        } else if (dy === -1) { // Arriba
            eye1Pos = { x: 0.2, y: 0.15, z: -0.4 };
            eye2Pos = { x: -0.2, y: 0.15, z: -0.4 };
        } else { // Abajo
            eye1Pos = { x: 0.2, y: 0.15, z: 0.4 };
            eye2Pos = { x: -0.2, y: 0.15, z: 0.4 };
        }

        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(eye1Pos.x, eye1Pos.y, eye1Pos.z);
        headMesh.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(eye2Pos.x, eye2Pos.y, eye2Pos.z);
        headMesh.add(eye2);
    }

    /**
     * Dibuja la comida en 3D con rotación
     * @param {Object} food - Posición de la comida {x, y}
     */
    drawFood(food) {
        // Eliminar comida anterior si existe
        if (this.foodMesh) {
            this.scene.remove(this.foodMesh);
            this.foodMesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        // Crear grupo para la manzana
        const appleGroup = new THREE.Group();

        // Cuerpo de la manzana (esfera)
        const appleGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const appleMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(CONFIG.COLORS.food.start),
            roughness: 0.3,
            metalness: 0.4,
            emissive: new THREE.Color(CONFIG.COLORS.food.end),
            emissiveIntensity: 0.3
        });
        const apple = new THREE.Mesh(appleGeometry, appleMaterial);
        apple.castShadow = true;
        apple.receiveShadow = true;
        apple.position.y = 0.4;
        appleGroup.add(apple);

        // Tallo de la manzana
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3222,
            roughness: 0.8
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.85;
        stem.castShadow = true;
        appleGroup.add(stem);

        // Hoja
        const leafGeometry = new THREE.CircleGeometry(0.15, 8);
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(CONFIG.COLORS.foodLeaf),
            roughness: 0.6,
            side: THREE.DoubleSide
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.set(0.1, 0.95, 0);
        leaf.rotation.x = Math.PI / 4;
        leaf.rotation.z = Math.PI / 6;
        leaf.castShadow = true;
        appleGroup.add(leaf);

        // Posicionar el grupo
        appleGroup.position.set(
            food.x + 0.5,
            0,
            food.y + 0.5
        );

        this.scene.add(appleGroup);
        this.foodMesh = appleGroup;

        // Actualizar posición de la luz de la comida
        this.foodLight.position.set(
            food.x + 0.5,
            3,
            food.y + 0.5
        );
    }

    /**
     * Loop de animación
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotar la comida si existe
        if (this.foodMesh) {
            this.foodRotation += 0.02;
            this.foodMesh.rotation.y = this.foodRotation;

            // Animación de flotación sutil
            this.foodMesh.position.y = Math.sin(this.foodRotation * 2) * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Dibuja la escena completa
     * @param {Object} state - Estado del juego
     */
    draw(state) {
        this.drawSnake(state.snake, state.dx, state.dy);
        this.drawFood(state.food);
    }

    /**
     * Limpia recursos
     */
    dispose() {
        // Limpiar snake meshes
        this.snakeMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });

        // Limpiar food mesh
        if (this.foodMesh) {
            this.scene.remove(this.foodMesh);
            this.foodMesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        this.renderer.dispose();
    }
}
