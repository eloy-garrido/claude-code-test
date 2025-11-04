/**
 * Punto de entrada principal del juego de preguntas
 */

import { checkConnection } from './quiz-supabase.js';
import { QuizGame } from './quiz-game.js';
import { AdminPanel } from './quiz-admin.js';
import { showToast } from './quiz-utils.js';

// Constantes
const ADMIN_USERNAME = 'taiyangadm';

// Variables globales
let game = null;
let adminPanel = null;
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
    backToGameBtn: document.getElementById('backToGameBtn')
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
    game = new QuizGame();
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

    // Botón volver al juego desde admin
    elements.backToGameBtn.addEventListener('click', () => {
        switchScreen('resultsScreen');
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
    }

    // Iniciar juego
    startGame();
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
