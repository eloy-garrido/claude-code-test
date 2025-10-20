/**
 * Sistema de Ranking
 * Maneja el almacenamiento y recuperación de puntajes
 */

import { CONFIG } from './config.js';

export class RankingManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
        this.maxEntries = CONFIG.MAX_RANKING_ENTRIES;
    }

    /**
     * Guarda un nuevo puntaje en el ranking
     * @param {string} name - Nombre del jugador
     * @param {number} score - Puntaje obtenido
     */
    saveScore(name, score) {
        let rankings = this.getRankings();

        rankings.push({
            name: name,
            score: score,
            date: new Date().toISOString()
        });

        // Ordenar por puntaje descendente
        rankings.sort((a, b) => b.score - a.score);

        // Mantener solo el top N
        rankings = rankings.slice(0, this.maxEntries);

        // Guardar en localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(rankings));
    }

    /**
     * Obtiene todos los puntajes del ranking
     * @returns {Array} Array de objetos con name, score y date
     */
    getRankings() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Limpia todo el ranking
     */
    clearRankings() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Verifica si un puntaje entra en el top
     * @param {number} score - Puntaje a verificar
     * @returns {boolean} true si el puntaje entra en el ranking
     */
    isTopScore(score) {
        const rankings = this.getRankings();

        if (rankings.length < this.maxEntries) {
            return true;
        }

        const lowestTopScore = rankings[rankings.length - 1].score;
        return score > lowestTopScore;
    }

    /**
     * Obtiene la posición de un puntaje en el ranking
     * @param {number} score - Puntaje a verificar
     * @returns {number} Posición en el ranking (1-based), o -1 si no está
     */
    getScorePosition(score) {
        const rankings = this.getRankings();

        for (let i = 0; i < rankings.length; i++) {
            if (score >= rankings[i].score) {
                return i + 1;
            }
        }

        return rankings.length < this.maxEntries ? rankings.length + 1 : -1;
    }
}
