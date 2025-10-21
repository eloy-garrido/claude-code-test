/**
 * Lógica Principal del Juego Snake
 */

import { CONFIG } from './config.js';
import { RankingManager } from './ranking.js';
import { UIManager } from './ui.js';
import { SoundManager } from './sound.js';
import { Renderer3D } from './renderer3d.js';

export class SnakeGame {
    constructor() {
        this.rankingManager = new RankingManager();
        this.ui = new UIManager(this.rankingManager);
        this.soundManager = new SoundManager();
        this.renderer3D = new Renderer3D();
        this.ctx = this.ui.getContext();

        this.initializeState();
        this.setupEventListeners();

        // Inicializar el renderizador 3D
        this.renderer3D.init();
    }

    /**
     * Inicializa el estado del juego
     */
    initializeState() {
        this.state = {
            snake: [...CONFIG.INITIAL_SNAKE],
            dx: CONFIG.INITIAL_DIRECTION.dx,
            dy: CONFIG.INITIAL_DIRECTION.dy,
            food: { x: 0, y: 0 },
            score: 0,
            lives: CONFIG.INITIAL_LIVES,
            playerName: '',
            isRunning: false,
            isPaused: false,
            gameLoop: null,
            speed: CONFIG.INITIAL_SPEED
        };

        this.placeFood();
        this.updateUI();
    }

    /**
     * Reinicia el juego manteniendo el nombre y vidas
     */
    resetGame() {
        this.state.snake = [...CONFIG.INITIAL_SNAKE];
        this.state.dx = CONFIG.INITIAL_DIRECTION.dx;
        this.state.dy = CONFIG.INITIAL_DIRECTION.dy;
        this.state.score = 0;
        this.state.lives = CONFIG.INITIAL_LIVES;
        this.state.speed = CONFIG.INITIAL_SPEED;
        this.placeFood();
        this.updateUI();
    }

    /**
     * Reinicia la posición de la serpiente (cuando pierde una vida)
     */
    resetSnakePosition() {
        this.state.snake = [...CONFIG.INITIAL_SNAKE];
        this.state.dx = CONFIG.INITIAL_DIRECTION.dx;
        this.state.dy = CONFIG.INITIAL_DIRECTION.dy;
        this.placeFood();
    }

    /**
     * Coloca la comida en una posición aleatoria
     */
    placeFood() {
        do {
            this.state.food.x = Math.floor(Math.random() * CONFIG.TILE_COUNT);
            this.state.food.y = Math.floor(Math.random() * CONFIG.TILE_COUNT);
        } while (this.isOnSnake(this.state.food.x, this.state.food.y));

        // Actualizar posición de la fruta 3D
        if (this.renderer3D.initialized) {
            if (!this.renderer3D.foodMesh) {
                this.renderer3D.createFoodSprite();
            }
            this.renderer3D.updateFoodPosition(this.state.food.x, this.state.food.y);
        }
    }

    /**
     * Verifica si una posición está ocupada por la serpiente
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {boolean}
     */
    isOnSnake(x, y) {
        return this.state.snake.some(segment => segment.x === x && segment.y === y);
    }

    /**
     * Actualiza la interfaz de usuario
     */
    updateUI() {
        this.ui.updateScore(this.state.score);
        this.ui.updateLives(this.state.lives, CONFIG.INITIAL_LIVES);
        this.ui.updatePlayerName(this.state.playerName);
    }

    /**
     * Dibuja el juego en el canvas
     */
    draw() {
        this.drawBackground();
        this.drawGrid();
        this.drawFood();
        this.drawSnake();

        // Renderizar escena 3D
        if (this.renderer3D.initialized) {
            this.renderer3D.updateSnakePositions(this.state.snake, this.state.dx, this.state.dy);
            this.renderer3D.render();
        }
    }

    /**
     * Dibuja el fondo del canvas
     */
    drawBackground() {
        this.ctx.fillStyle = CONFIG.COLORS.background;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    /**
     * Dibuja la cuadrícula
     */
    drawGrid() {
        this.ctx.strokeStyle = CONFIG.COLORS.grid;
        this.ctx.lineWidth = 1;

        for (let i = 0; i < CONFIG.TILE_COUNT; i++) {
            // Líneas verticales
            this.ctx.beginPath();
            this.ctx.moveTo(i * CONFIG.GRID_SIZE, 0);
            this.ctx.lineTo(i * CONFIG.GRID_SIZE, CONFIG.CANVAS_HEIGHT);
            this.ctx.stroke();

            // Líneas horizontales
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CONFIG.GRID_SIZE);
            this.ctx.lineTo(CONFIG.CANVAS_WIDTH, i * CONFIG.GRID_SIZE);
            this.ctx.stroke();
        }
    }

    /**
     * Dibuja la comida (manzana)
     */
    drawFood() {
        const x = this.state.food.x * CONFIG.GRID_SIZE;
        const y = this.state.food.y * CONFIG.GRID_SIZE;
        const centerX = x + CONFIG.GRID_SIZE / 2;
        const centerY = y + CONFIG.GRID_SIZE / 2;

        // Manzana con gradiente radial
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, CONFIG.SIZES.foodRadius
        );
        gradient.addColorStop(0, CONFIG.COLORS.food.start);
        gradient.addColorStop(1, CONFIG.COLORS.food.end);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, CONFIG.SIZES.foodRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Hoja de la manzana
        this.ctx.fillStyle = CONFIG.COLORS.foodLeaf;
        this.ctx.beginPath();
        this.ctx.ellipse(
            centerX + 4, y + 4,
            CONFIG.SIZES.leafWidth,
            CONFIG.SIZES.leafHeight,
            Math.PI / 4, 0, Math.PI * 2
        );
        this.ctx.fill();
    }

    /**
     * Dibuja la serpiente
     */
    drawSnake() {
        this.state.snake.forEach((segment, index) => {
            const x = segment.x * CONFIG.GRID_SIZE;
            const y = segment.y * CONFIG.GRID_SIZE;

            if (index === 0) {
                this.drawSnakeHead(x, y);
            } else {
                this.drawSnakeBody(x, y, index);
            }
        });
    }

    /**
     * Dibuja la cabeza de la serpiente
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     */
    drawSnakeHead(x, y) {
        // Gradiente de la cabeza
        const gradient = this.ctx.createLinearGradient(
            x, y,
            x + CONFIG.GRID_SIZE,
            y + CONFIG.GRID_SIZE
        );
        gradient.addColorStop(0, CONFIG.COLORS.snakeHead.start);
        gradient.addColorStop(1, CONFIG.COLORS.snakeHead.end);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 1, y + 1, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);

        // Dibujar ojos según la dirección
        this.drawEyes(x, y);

        // Borde brillante
        this.ctx.strokeStyle = CONFIG.COLORS.border;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, CONFIG.GRID_SIZE - 4, CONFIG.GRID_SIZE - 4);
    }

    /**
     * Dibuja los ojos de la serpiente
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     */
    drawEyes(x, y) {
        this.ctx.fillStyle = CONFIG.COLORS.eyes;
        const eyeSize = CONFIG.SIZES.eyeSize;

        if (this.state.dx === 1) { // Derecha
            this.ctx.fillRect(x + CONFIG.GRID_SIZE - 8, y + 4, eyeSize, eyeSize);
            this.ctx.fillRect(x + CONFIG.GRID_SIZE - 8, y + CONFIG.GRID_SIZE - 8, eyeSize, eyeSize);
        } else if (this.state.dx === -1) { // Izquierda
            this.ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);
            this.ctx.fillRect(x + 4, y + CONFIG.GRID_SIZE - 8, eyeSize, eyeSize);
        } else if (this.state.dy === -1) { // Arriba
            this.ctx.fillRect(x + 4, y + 4, eyeSize, eyeSize);
            this.ctx.fillRect(x + CONFIG.GRID_SIZE - 8, y + 4, eyeSize, eyeSize);
        } else { // Abajo
            this.ctx.fillRect(x + 4, y + CONFIG.GRID_SIZE - 8, eyeSize, eyeSize);
            this.ctx.fillRect(x + CONFIG.GRID_SIZE - 8, y + CONFIG.GRID_SIZE - 8, eyeSize, eyeSize);
        }
    }

    /**
     * Dibuja un segmento del cuerpo de la serpiente
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @param {number} index - Índice del segmento
     */
    drawSnakeBody(x, y, index) {
        const gradient = this.ctx.createLinearGradient(
            x, y,
            x + CONFIG.GRID_SIZE,
            y + CONFIG.GRID_SIZE
        );

        const intensity = 1 - (index / this.state.snake.length) * 0.3;
        gradient.addColorStop(0, CONFIG.COLORS.snakeBody.start.replace('1)', `${intensity})`));
        gradient.addColorStop(1, CONFIG.COLORS.snakeBody.end.replace('1)', `${intensity})`));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, CONFIG.GRID_SIZE - 4, CONFIG.GRID_SIZE - 4);

        // Borde brillante
        this.ctx.strokeStyle = CONFIG.COLORS.border;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, CONFIG.GRID_SIZE - 4, CONFIG.GRID_SIZE - 4);
    }

    /**
     * Actualiza el estado del juego
     */
    update() {
        if (!this.state.isRunning || this.state.isPaused) return;

        // Nueva posición de la cabeza
        const head = {
            x: this.state.snake[0].x + this.state.dx,
            y: this.state.snake[0].y + this.state.dy
        };

        // Verificar colisión con paredes
        if (head.x < 0 || head.x >= CONFIG.TILE_COUNT ||
            head.y < 0 || head.y >= CONFIG.TILE_COUNT) {
            this.loseLife();
            return;
        }

        // Verificar colisión con el cuerpo
        if (this.isOnSnake(head.x, head.y)) {
            this.loseLife();
            return;
        }

        // Agregar nueva cabeza
        this.state.snake.unshift(head);

        // Verificar si comió
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            this.eatFood();
        } else {
            // Quitar la cola si no comió
            this.state.snake.pop();
        }

        this.draw();
    }

    /**
     * Maneja cuando la serpiente come
     */
    eatFood() {
        this.state.score += CONFIG.POINTS_PER_FOOD;
        this.placeFood();
        this.updateUI();

        // Reproducir sonido de comer
        this.soundManager.playEatSound();

        // Aumentar velocidad gradualmente
        if (this.state.score % CONFIG.SCORE_THRESHOLD_FOR_SPEED === 0 &&
            this.state.speed > CONFIG.MIN_SPEED) {
            this.state.speed -= CONFIG.SPEED_INCREMENT;
            this.restartGameLoop();
            // Reproducir sonido de aumento de velocidad
            this.soundManager.playSpeedUpSound();
        }
    }

    /**
     * Reinicia el loop del juego con nueva velocidad
     */
    restartGameLoop() {
        clearInterval(this.state.gameLoop);
        this.state.gameLoop = setInterval(() => this.update(), this.state.speed);
    }

    /**
     * Maneja cuando se pierde una vida
     */
    loseLife() {
        this.state.lives--;
        this.updateUI();

        if (this.state.lives <= 0) {
            this.gameOver();
        } else {
            // Reproducir sonido de perder vida
            this.soundManager.playLoseLifeSound();
            this.resetSnakePosition();
        }
    }

    /**
     * Termina el juego
     */
    gameOver() {
        this.state.isRunning = false;
        clearInterval(this.state.gameLoop);

        // Reproducir sonido de game over
        this.soundManager.playGameOverSound();

        // Guardar puntaje
        this.rankingManager.saveScore(this.state.playerName, this.state.score);

        // Mostrar modal de game over
        this.ui.showGameOverModal(this.state.score);
    }

    /**
     * Inicia el juego
     */
    async start() {
        if (this.state.isRunning) {
            this.togglePause();
            return;
        }

        // Inicializar audio si no está inicializado (requiere interacción del usuario)
        if (!this.soundManager.initialized) {
            await this.soundManager.init();
        }

        this.resetGame();
        this.state.isRunning = true;
        this.state.isPaused = false;

        if (this.state.gameLoop) clearInterval(this.state.gameLoop);
        this.state.gameLoop = setInterval(() => this.update(), this.state.speed);

        this.ui.showPauseButton();
        this.draw();

        // Reproducir sonido de inicio
        this.soundManager.playStartSound();
    }

    /**
     * Pausa/reanuda el juego
     */
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        this.ui.updatePauseButton(this.state.isPaused);
    }

    /**
     * Cambia la dirección de la serpiente
     * @param {number} dx - Cambio en X
     * @param {number} dy - Cambio en Y
     */
    changeDirection(dx, dy) {
        if (!this.state.isRunning || this.state.isPaused) return;

        // Cambio horizontal (izquierda/derecha)
        if (dx !== 0) {
            // Solo permitir si actualmente NO se está moviendo horizontalmente
            // (es decir, se está moviendo verticalmente)
            if (this.state.dy !== 0) {
                this.state.dx = dx;
                this.state.dy = 0;
            }
        }

        // Cambio vertical (arriba/abajo)
        if (dy !== 0) {
            // Solo permitir si actualmente NO se está moviendo verticalmente
            // (es decir, se está moviendo horizontalmente)
            if (this.state.dx !== 0) {
                this.state.dx = 0;
                this.state.dy = dy;
            }
        }
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Botón para iniciar el juego desde el modal
        this.ui.elements.startGameBtn.addEventListener('click', () => {
            const name = this.ui.getPlayerName();
            if (name) {
                this.state.playerName = name;
                this.ui.hideNameModal();
                this.updateUI();
            } else {
                this.ui.showAlert('Por favor ingresa tu nombre');
            }
        });

        // Enter en el input de nombre
        this.ui.elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.ui.elements.startGameBtn.click();
            }
        });

        // Botón de inicio
        this.ui.elements.startBtn.addEventListener('click', () => this.start());

        // Botón de pausa
        this.ui.elements.pauseBtn.addEventListener('click', () => this.start());

        // Botón de jugar de nuevo
        this.ui.elements.playAgainBtn.addEventListener('click', () => {
            this.ui.hideGameOverModal();
            this.ui.showStartButton();
            this.resetGame();
            this.draw();
        });

        // Botón de mute/unmute
        this.ui.elements.muteBtn.addEventListener('click', () => {
            const isMuted = this.soundManager.toggleMute();
            this.ui.elements.muteBtn.textContent = isMuted ? '🔇 Silencio' : '🔊 Sonido';
        });

        // Controles del teclado (Flechas y WASD)
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.changeDirection(0, -1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.changeDirection(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.changeDirection(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.changeDirection(1, 0);
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * Inicializa el juego
     */
    init() {
        // Crear sprites 3D iniciales
        if (this.renderer3D.initialized) {
            this.renderer3D.createSnakeSprites(this.state.snake.length);
            this.renderer3D.createFoodSprite();
            this.renderer3D.updateFoodPosition(this.state.food.x, this.state.food.y);
        }

        this.draw();
        this.ui.elements.playerNameInput.focus();
    }
}
