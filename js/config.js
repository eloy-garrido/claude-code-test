/**
 * Configuración del juego Snake
 */

export const CONFIG = {
    // Configuración de Supabase
    // IMPORTANTE: Reemplaza estos valores con tus credenciales de Supabase
    // Obtén tus credenciales en: https://app.supabase.com/project/_/settings/api
    SUPABASE_URL: '', // Ej: 'https://xxxxx.supabase.co'
    SUPABASE_KEY: '', // Ej: 'tu-anon-key-aqui'
    // Configuración del canvas
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 600,
    GRID_SIZE: 20,

    // Velocidad del juego
    INITIAL_SPEED: 100,
    MIN_SPEED: 50,
    SPEED_INCREMENT: 5,

    // Puntuación
    POINTS_PER_FOOD: 10,
    SCORE_THRESHOLD_FOR_SPEED: 50,

    // Vidas
    INITIAL_LIVES: 3,

    // Posición inicial de la serpiente
    INITIAL_SNAKE: [
        { x: 15, y: 15 },
        { x: 14, y: 15 },
        { x: 13, y: 15 }
    ],

    // Dirección inicial
    INITIAL_DIRECTION: { dx: 1, dy: 0 },

    // Ranking
    MAX_RANKING_ENTRIES: 10,
    STORAGE_KEY: 'snakeRankings',

    // Colores
    COLORS: {
        background: '#1a1a2e',
        grid: 'rgba(102, 126, 234, 0.1)',
        snakeHead: {
            start: '#51cf66',
            end: '#37b24d'
        },
        snakeBody: {
            start: 'rgba(81, 207, 102, 1)',
            end: 'rgba(55, 178, 77, 1)'
        },
        food: {
            start: '#ff6b6b',
            end: '#c92a2a'
        },
        foodLeaf: '#51cf66',
        eyes: 'white',
        border: 'rgba(255, 255, 255, 0.3)'
    },

    // Tamaños
    SIZES: {
        eyeSize: 4,
        foodRadius: 0, // Se calculará dinámicamente
        leafWidth: 3,
        leafHeight: 6
    }
};

// Calcular valores derivados
CONFIG.TILE_COUNT = CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE;
CONFIG.SIZES.foodRadius = CONFIG.GRID_SIZE / 2 - 2;
