/**
 * Punto de entrada principal del juego Snake
 */

import { SnakeGame } from './game.js';

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    game.init();
});
