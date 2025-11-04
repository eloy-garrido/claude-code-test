/**
 * Punto de entrada principal del juego de preguntas
 */

import { checkConnection, getRanking } from './quiz-supabase.js';
import { QuizGame } from './quiz-game.js';
import { AdminPanel } from './quiz-admin.js';
import { QuizSoundManager } from './quiz-sound.js';
import { showToast } from './quiz-utils.js';

// Constantes
const ADMIN_USERNAME = 'taiyangadm';

// Variables globales
let game = null;
let adminPanel = null;
let soundManager = null;
let playerName = '';
let isAdmin = false;

// Elementos del DOM
const elements = {
    // Login screen
    loginScreen: document.getElementById('loginScreen'),
    connectionStatus: document.getElementById('connectionStatus'),
    loginForm: document.getElementById('loginForm'),
    playerNameInput: document.getElementById('playerName'),
    startBtn: document.getElementById('startBtn'),

    // Game screen
    gameScreen: document.getElementById('gameScreen'),

    // Results screen
    resultsScreen: document.getElementById('resultsScreen'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    viewAdminBtn: document.getElementById('viewAdminBtn'),

    // Admin screen
    adminScreen: document.getElementById('adminScreen'),
    backToGameBtn: document.getElementById('backToGameBtn'),
    playQuizFromAdminBtn: document.getElementById('playQuizFromAdminBtn'),

    // Ranking screen
    rankingScreen: document.getElementById('rankingScreen'),
    viewRankingBtn: document.getElementById('viewRankingBtn'),
    backToLoginBtn: document.getElementById('backToLoginBtn'),
    rankingListFull: document.getElementById('rankingListFull')
};

/**
 * Inicializa la aplicación
 */
async function init() {
    // Verificar conexión con Supabase
    const connection = await checkConnection();

    if (connection.success) {
        elements.connectionStatus.innerHTML = `
            <div style="color: var(--success); font-size: 1.2rem;">✓</div>
            <span style="color: var(--success);">${connection.message}</span>
        `;

        // Mostrar formulario de login después de 1 segundo
        setTimeout(() => {
            elements.loginForm.style.display = 'block';
            elements.connectionStatus.style.display = 'none';
        }, 1000);

    } else {
        elements.connectionStatus.innerHTML = `
            <div style="color: var(--danger); font-size: 1.2rem;">✗</div>
            <span style="color: var(--danger);">${connection.message}</span>
        `;
        showToast('Error de conexión con Supabase', 'error');
    }

    // Configurar event listeners
    setupEventListeners();

    // Inicializar instancias
    soundManager = new QuizSoundManager();
    game = new QuizGame(soundManager);
    adminPanel = new AdminPanel();
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Botón de inicio
    elements.startBtn.addEventListener('click', handleStart);

    // Enter en el input de nombre
    elements.playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleStart();
        }
    });

    // Botón jugar de nuevo
    elements.playAgainBtn.addEventListener('click', () => {
        startGame();
    });

    // Botón ver admin
    elements.viewAdminBtn.addEventListener('click', () => {
        showAdminPanel();
    });

    // Botón volver desde admin
    elements.backToGameBtn.addEventListener('click', () => {
        switchScreen('loginScreen');
    });

    // Botón jugar quiz desde admin
    elements.playQuizFromAdminBtn.addEventListener('click', () => {
        startGame();
    });

    // Botón ver ranking
    elements.viewRankingBtn.addEventListener('click', () => {
        showRanking();
    });

    // Botón volver al login desde ranking
    elements.backToLoginBtn.addEventListener('click', () => {
        switchScreen('loginScreen');
    });
}

/**
 * Maneja el inicio del juego
 */
function handleStart() {
    playerName = elements.playerNameInput.value.trim();

    if (!playerName) {
        showToast('Por favor ingresa tu nombre', 'warning');
        elements.playerNameInput.focus();
        return;
    }

    // Verificar si es administrador
    isAdmin = playerName.toLowerCase() === ADMIN_USERNAME.toLowerCase();

    if (isAdmin) {
        showToast('¡Bienvenido Administrador!', 'success');
        // Ir directo al panel de administrador
        setTimeout(() => showAdminPanel(), 500);
    } else {
        // Iniciar juego para usuarios normales
        startGame();
    }
}

/**
 * Inicia el juego
 */
async function startGame() {
    switchScreen('gameScreen');

    try {
        await game.start(playerName, isAdmin);
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        showToast('Error al iniciar el juego: ' + error.message, 'error');
        switchScreen('loginScreen');
    }
}

/**
 * Muestra el panel de administrador
 */
async function showAdminPanel() {
    switchScreen('adminScreen');
    await adminPanel.loadQuestions();
}

/**
 * Muestra la pantalla de ranking
 */
async function showRanking() {
    switchScreen('rankingScreen');

    try {
        const ranking = await getRanking();
        elements.rankingListFull.innerHTML = '';

        if (ranking.length === 0) {
            elements.rankingListFull.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No hay jugadores en el ranking todavía. ¡Sé el primero!</p>';
        } else {
            ranking.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';

                // Medallas para los primeros 3
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                else medal = `${index + 1}.`;

                // Fecha de la jugada
                const date = new Date(entry.created_at);
                const dateStr = date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                item.innerHTML = `
                    <span class="ranking-position">${medal}</span>
                    <div style="flex: 1;">
                        <div class="ranking-name">${entry.player_name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-light);">
                            ${entry.correct_answers}/${entry.questions_answered} correctas · ${dateStr}
                        </div>
                    </div>
                    <span class="ranking-score">${entry.score} pts</span>
                `;

                elements.rankingListFull.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error al cargar ranking:', error);
        elements.rankingListFull.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 40px;">Error al cargar el ranking</p>';
    }
}

/**
 * Cambia entre pantallas
 */
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
