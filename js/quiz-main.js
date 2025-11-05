/**
 * Punto de entrada principal del juego de preguntas
 */

import { checkConnection, getRanking, archiveAndResetRanking, getRankingPeriods, getHistoricalRanking } from './quiz-supabase.js';
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
    resetRankingBtn: document.getElementById('resetRankingBtn'),
    viewHistoryBtn: document.getElementById('viewHistoryBtn'),

    // Ranking screen
    rankingScreen: document.getElementById('rankingScreen'),
    viewRankingBtn: document.getElementById('viewRankingBtn'),
    backToLoginBtn: document.getElementById('backToLoginBtn'),
    rankingListFull: document.getElementById('rankingListFull'),

    // History screen
    historyScreen: document.getElementById('historyScreen'),
    rankingPeriodsContainer: document.getElementById('rankingPeriodsContainer'),
    backFromHistoryBtn: document.getElementById('backFromHistoryBtn')
};

/**
 * Inicializa la aplicación
 */
async function init() {
    // Verificar conexión con la base de datos
    const connection = await checkConnection();

    if (connection.success) {
        // Ocultar spinner y mostrar formulario
        setTimeout(() => {
            elements.loginForm.style.display = 'block';
            elements.connectionStatus.style.display = 'none';
        }, 800);

    } else {
        elements.connectionStatus.innerHTML = `
            <div style="color: var(--danger); font-size: 1.2rem;">✗</div>
            <span style="color: var(--danger);">Error de conexión. Por favor, intenta más tarde.</span>
        `;
        showToast('Error de conexión', 'error');
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

    // Botón reiniciar ranking
    elements.resetRankingBtn.addEventListener('click', () => {
        handleResetRanking();
    });

    // Botón ver historial
    elements.viewHistoryBtn.addEventListener('click', () => {
        showHistory();
    });

    // Botón volver desde historial
    elements.backFromHistoryBtn.addEventListener('click', () => {
        showAdminPanel();
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

    const podiumContainer = document.getElementById('podiumContainer');
    const rankingRestSection = document.getElementById('rankingRestSection');
    const rankingListFull = elements.rankingListFull;

    podiumContainer.innerHTML = '';
    rankingListFull.innerHTML = '';

    try {
        const ranking = await getRanking();

        if (ranking.length === 0) {
            podiumContainer.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px; width: 100%;">No hay jugadores en el ranking todavía. ¡Sé el primero!</p>';
            rankingRestSection.style.display = 'none';
            return;
        }

        // Top 3 en el podio
        const top3 = ranking.slice(0, 3);
        const rest = ranking.slice(3);

        // Renderizar podio
        top3.forEach((entry, index) => {
            const place = document.createElement('div');
            const positions = ['first', 'second', 'third'];
            const medals = ['🥇', '🥈', '🥉'];

            place.className = `podium-place ${positions[index]}`;

            const date = new Date(entry.created_at);
            const dateStr = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            place.innerHTML = `
                <div class="podium-avatar">
                    ${index === 0 ? '<div class="podium-crown">👑</div>' : ''}
                    ${medals[index]}
                </div>
                <div class="podium-base">
                    <div class="podium-name" title="${entry.player_name}">${entry.player_name}</div>
                    <div class="podium-score">${entry.score} pts</div>
                    <div class="podium-details">
                        ${entry.correct_answers}/${entry.questions_answered} correctas
                    </div>
                    <div class="podium-details" style="margin-top: 3px;">
                        ${dateStr}
                    </div>
                </div>
            `;

            podiumContainer.appendChild(place);
        });

        // Renderizar el resto
        if (rest.length > 0) {
            rankingRestSection.style.display = 'block';

            rest.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';

                const position = index + 4; // Empieza desde el 4to lugar

                const date = new Date(entry.created_at);
                const dateStr = date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                item.innerHTML = `
                    <span class="ranking-position">${position}.</span>
                    <div style="flex: 1;">
                        <div class="ranking-name">${entry.player_name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-light);">
                            ${entry.correct_answers}/${entry.questions_answered} correctas · ${dateStr}
                        </div>
                    </div>
                    <span class="ranking-score">${entry.score} pts</span>
                `;

                rankingListFull.appendChild(item);
            });
        } else {
            rankingRestSection.style.display = 'none';
        }

    } catch (error) {
        console.error('Error al cargar ranking:', error);
        podiumContainer.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 40px; width: 100%;">Error al cargar el ranking</p>';
        rankingRestSection.style.display = 'none';
    }
}

/**
 * Maneja el reinicio del ranking
 */
async function handleResetRanking() {
    const confirmed = confirm('¿Estás seguro de que deseas reiniciar el ranking? Los datos actuales se archivarán en el historial.');

    if (!confirmed) return;

    const periodLabel = prompt('Ingresa un nombre para identificar este período (ej: "Enero 2025", "Semestre 1"):',
        `Ranking hasta ${new Date().toLocaleDateString('es-ES')}`);

    if (periodLabel === null) return; // Usuario canceló

    try {
        showToast('Archivando ranking...', 'info');
        const result = await archiveAndResetRanking(periodLabel || undefined);

        showToast(`✓ ${result.message}. Ranking reiniciado.`, 'success');

        // Recargar el panel de admin para reflejar cambios
        if (adminPanel) {
            await adminPanel.loadQuestions();
        }
    } catch (error) {
        console.error('Error al reiniciar ranking:', error);
        showToast('Error al reiniciar el ranking: ' + error.message, 'error');
    }
}

/**
 * Muestra el historial de rankings
 */
async function showHistory() {
    switchScreen('historyScreen');

    try {
        const periods = await getRankingPeriods();

        if (periods.length === 0) {
            elements.rankingPeriodsContainer.innerHTML = `
                <p style="text-align: center; color: var(--text-light); padding: 40px;">
                    No hay rankings históricos todavía.
                    <br><br>
                    Usa el botón "Reiniciar Ranking" para archivar el ranking actual.
                </p>
            `;
            return;
        }

        // Renderizar períodos
        const periodsHTML = periods.map(period => {
            const firstDate = new Date(period.firstDate).toLocaleDateString('es-ES');
            const lastDate = new Date(period.lastDate).toLocaleDateString('es-ES');

            return `
                <div class="period-card" data-period="${period.period}">
                    <div class="period-card-header">
                        <div class="period-name">${period.period}</div>
                        <div class="period-count">${period.count} registros</div>
                    </div>
                    <div class="period-dates">
                        Archivado: ${lastDate}
                    </div>
                </div>
            `;
        }).join('');

        elements.rankingPeriodsContainer.innerHTML = `
            <div class="ranking-periods">
                ${periodsHTML}
            </div>
        `;

        // Agregar event listeners a cada tarjeta de período
        document.querySelectorAll('.period-card').forEach(card => {
            card.addEventListener('click', async () => {
                const periodLabel = card.dataset.period;
                await showPeriodRanking(periodLabel);
            });
        });

    } catch (error) {
        console.error('Error al cargar historial:', error);
        elements.rankingPeriodsContainer.innerHTML = `
            <p style="text-align: center; color: var(--danger); padding: 40px;">
                Error al cargar el historial de rankings
            </p>
        `;
    }
}

/**
 * Muestra el ranking de un período específico
 */
async function showPeriodRanking(periodLabel) {
    try {
        const ranking = await getHistoricalRanking(periodLabel);

        if (ranking.length === 0) {
            showToast('No hay datos para este período', 'warning');
            return;
        }

        // Crear modal o vista en el mismo contenedor
        const rankingHTML = ranking.map((entry, index) => {
            const date = new Date(entry.played_at).toLocaleDateString('es-ES');

            return `
                <div class="historical-ranking-item">
                    <div class="rank">${index + 1}</div>
                    <div class="info">
                        <div class="name">${entry.player_name}</div>
                        <div class="details">
                            ${entry.correct_answers}/${entry.total_questions} correctas · ${date}
                        </div>
                    </div>
                    <div class="score">${entry.score} pts</div>
                </div>
            `;
        }).join('');

        elements.rankingPeriodsContainer.innerHTML = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-secondary" id="backToPeriods">← Volver a períodos</button>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: var(--text-dark);">${periodLabel}</h2>
                <p style="color: var(--text-light);">Total de ${ranking.length} participantes</p>
            </div>
            <div class="historical-ranking-list">
                ${rankingHTML}
            </div>
        `;

        // Botón para volver a la lista de períodos
        document.getElementById('backToPeriods').addEventListener('click', () => {
            showHistory();
        });

    } catch (error) {
        console.error('Error al cargar ranking del período:', error);
        showToast('Error al cargar el ranking', 'error');
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
