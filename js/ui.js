/**
 * Módulo de Interfaz de Usuario
 * Maneja todas las interacciones con el DOM y la visualización
 */

export class UIManager {
    constructor(rankingManager) {
        this.rankingManager = rankingManager;
        this.initializeElements();
    }

    /**
     * Inicializa las referencias a elementos del DOM
     */
    initializeElements() {
        this.elements = {
            canvas: document.getElementById('gameCanvas'),
            scoreDisplay: document.getElementById('score'),
            livesDisplay: document.getElementById('lives'),
            playerNameDisplay: document.getElementById('playerName'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            muteBtn: document.getElementById('muteBtn'),
            nameModal: document.getElementById('nameModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            playerNameInput: document.getElementById('playerNameInput'),
            startGameBtn: document.getElementById('startGameBtn'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            finalScoreDisplay: document.getElementById('finalScore'),
            rankingList: document.getElementById('rankingList')
        };

        this.ctx = this.elements.canvas.getContext('2d');
    }

    /**
     * Obtiene el contexto del canvas
     * @returns {CanvasRenderingContext2D}
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Actualiza el display del puntaje
     * @param {number} score - Puntaje actual
     */
    updateScore(score) {
        this.elements.scoreDisplay.textContent = score;
    }

    /**
     * Actualiza el display de vidas
     * @param {number} lives - Vidas restantes
     * @param {number} maxLives - Máximo de vidas
     */
    updateLives(lives, maxLives) {
        const hearts = '❤️'.repeat(lives) + '🖤'.repeat(maxLives - lives);
        this.elements.livesDisplay.textContent = hearts;
    }

    /**
     * Actualiza el nombre del jugador
     * @param {string} name - Nombre del jugador
     */
    updatePlayerName(name) {
        this.elements.playerNameDisplay.textContent = name;
    }

    /**
     * Muestra el modal de nombre
     */
    showNameModal() {
        this.elements.nameModal.classList.add('active');
        this.elements.playerNameInput.focus();
    }

    /**
     * Oculta el modal de nombre
     */
    hideNameModal() {
        this.elements.nameModal.classList.remove('active');
    }

    /**
     * Muestra el modal de game over con el puntaje final
     * @param {number} score - Puntaje final
     */
    showGameOverModal(score) {
        this.elements.finalScoreDisplay.textContent = score;
        this.displayRanking();
        this.elements.gameOverModal.classList.add('active');
    }

    /**
     * Oculta el modal de game over
     */
    hideGameOverModal() {
        this.elements.gameOverModal.classList.remove('active');
    }

    /**
     * Muestra el ranking actualizado
     */
    displayRanking() {
        const rankings = this.rankingManager.getRankings();
        this.elements.rankingList.innerHTML = '';

        if (rankings.length === 0) {
            this.elements.rankingList.innerHTML =
                '<li class="ranking-item">No hay puntajes aún</li>';
            return;
        }

        rankings.forEach((entry, index) => {
            const li = document.createElement('li');
            li.className = 'ranking-item';

            // Agregar clase especial para los top 3
            if (index === 0) li.classList.add('top-1');
            else if (index === 1) li.classList.add('top-2');
            else if (index === 2) li.classList.add('top-3');

            // Agregar medalla para los top 3
            const medal = index === 0 ? '🥇' :
                         index === 1 ? '🥈' :
                         index === 2 ? '🥉' : '';

            li.innerHTML = `
                <span>
                    <span class="rank-position">${index + 1}.</span>
                    ${medal} ${entry.name}
                </span>
                <span><strong>${entry.score}</strong> puntos</span>
            `;

            this.elements.rankingList.appendChild(li);
        });
    }

    /**
     * Muestra/oculta botones de control
     */
    showStartButton() {
        this.elements.startBtn.style.display = 'inline-block';
        this.elements.pauseBtn.style.display = 'none';
    }

    showPauseButton() {
        this.elements.startBtn.style.display = 'none';
        this.elements.pauseBtn.style.display = 'inline-block';
    }

    /**
     * Actualiza el texto del botón de pausa
     * @param {boolean} isPaused - Si el juego está pausado
     */
    updatePauseButton(isPaused) {
        this.elements.pauseBtn.textContent = isPaused ? 'Reanudar' : 'Pausar';
    }

    /**
     * Obtiene el nombre ingresado por el usuario
     * @returns {string} Nombre del jugador
     */
    getPlayerName() {
        return this.elements.playerNameInput.value.trim();
    }

    /**
     * Muestra un mensaje de alerta
     * @param {string} message - Mensaje a mostrar
     */
    showAlert(message) {
        alert(message);
    }
}
