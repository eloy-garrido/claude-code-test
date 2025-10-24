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

        // Usar renderer 3D en lugar de contexto 2D
        const canvas = document.getElementById('gameCanvas');
        this.renderer3d = new Renderer3D(canvas);

        this.initializeState();
        this.setupEventListeners();
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
     * Dibuja el juego usando el renderer 3D
     */
    draw() {
        this.renderer3d.draw(this.state);
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
    async gameOver() {
        this.state.isRunning = false;
        clearInterval(this.state.gameLoop);

        // Reproducir sonido de game over
        this.soundManager.playGameOverSound();

        // Guardar puntaje
        await this.rankingManager.saveScore(this.state.playerName, this.state.score);

        // Mostrar modal de game over
        await this.ui.showGameOverModal(this.state.score);
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
            // No capturar teclas si el usuario está escribiendo en un input o textarea
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

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
        this.draw();
        this.ui.elements.playerNameInput.focus();
    }
}
