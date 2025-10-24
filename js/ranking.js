/**
 * Sistema de Ranking
 * Maneja el almacenamiento y recuperación de puntajes usando Supabase
 * con fallback a localStorage
 */

import { CONFIG } from './config.js';
import { SupabaseClient } from './supabase-client.js';

export class RankingManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
        this.maxEntries = CONFIG.MAX_RANKING_ENTRIES;
        this.useSupabase = false;
        this.supabaseClient = null;

        // Inicializar Supabase si está configurado
        if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
            this.supabaseClient = new SupabaseClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_KEY
            );
            this.checkSupabaseConnection();
        } else {
            console.warn('Supabase no configurado, usando localStorage como almacenamiento');
        }
    }

    /**
     * Verifica la conexión con Supabase
     */
    async checkSupabaseConnection() {
        if (this.supabaseClient) {
            try {
                this.useSupabase = await this.supabaseClient.checkConnection();
                if (this.useSupabase) {
                    console.log('Conexión a Supabase establecida correctamente');
                } else {
                    console.warn('No se pudo conectar a Supabase, usando localStorage');
                }
            } catch (error) {
                console.warn('Error al verificar conexión con Supabase:', error);
                this.useSupabase = false;
            }
        }
    }

    /**
     * Guarda un nuevo puntaje en el ranking
     * @param {string} name - Nombre del jugador
     * @param {number} score - Puntaje obtenido
     */
    async saveScore(name, score) {
        if (this.useSupabase && this.supabaseClient) {
            try {
                await this.supabaseClient.insert('snake_rankings', {
                    player_name: name,
                    score: score
                });
                console.log('Puntaje guardado en Supabase');
            } catch (error) {
                console.error('Error al guardar en Supabase, usando localStorage:', error);
                this.saveScoreLocally(name, score);
            }
        } else {
            this.saveScoreLocally(name, score);
        }
    }

    /**
     * Guarda un puntaje en localStorage (fallback)
     * @param {string} name - Nombre del jugador
     * @param {number} score - Puntaje obtenido
     */
    saveScoreLocally(name, score) {
        let rankings = this.getRankingsFromLocalStorage();

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
     * @returns {Promise<Array>} Array de objetos con name, score y date
     */
    async getRankings() {
        if (this.useSupabase && this.supabaseClient) {
            try {
                const rankings = await this.supabaseClient.select('snake_rankings', {
                    order: { column: 'score', ascending: false },
                    limit: this.maxEntries
                });

                // Transformar el formato de Supabase al formato local
                return rankings.map(r => ({
                    name: r.player_name,
                    score: r.score,
                    date: r.created_at
                }));
            } catch (error) {
                console.error('Error al obtener rankings de Supabase, usando localStorage:', error);
                return this.getRankingsFromLocalStorage();
            }
        } else {
            return this.getRankingsFromLocalStorage();
        }
    }

    /**
     * Obtiene rankings desde localStorage
     * @returns {Array} Array de objetos con name, score y date
     */
    getRankingsFromLocalStorage() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Limpia todo el ranking
     */
    clearRankings() {
        localStorage.removeItem(this.storageKey);
        // Nota: No eliminamos de Supabase para mantener el historial
    }

    /**
     * Verifica si un puntaje entra en el top
     * @param {number} score - Puntaje a verificar
     * @returns {Promise<boolean>} true si el puntaje entra en el ranking
     */
    async isTopScore(score) {
        const rankings = await this.getRankings();

        if (rankings.length < this.maxEntries) {
            return true;
        }

        const lowestTopScore = rankings[rankings.length - 1].score;
        return score > lowestTopScore;
    }

    /**
     * Obtiene la posición de un puntaje en el ranking
     * @param {number} score - Puntaje a verificar
     * @returns {Promise<number>} Posición en el ranking (1-based), o -1 si no está
     */
    async getScorePosition(score) {
        const rankings = await this.getRankings();

        for (let i = 0; i < rankings.length; i++) {
            if (score >= rankings[i].score) {
                return i + 1;
            }
        }

        return rankings.length < this.maxEntries ? rankings.length + 1 : -1;
    }
}
