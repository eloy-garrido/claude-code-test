/**
 * Punto de entrada principal del juego Snake
 */

import { SnakeGame } from './game.js';

// Función para verificar si THREE.js está cargado
function waitForThree() {
    return new Promise((resolve) => {
        if (typeof THREE !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof THREE !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        }
    });
}

// Inicializar el juego cuando el DOM y THREE.js estén listos
document.addEventListener('DOMContentLoaded', async () => {
    await waitForThree();
    const game = new SnakeGame();
    game.init();
});
