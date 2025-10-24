/**
 * Cliente de Supabase
 * Maneja la conexión y operaciones con Supabase
 */

export class SupabaseClient {
    constructor(supabaseUrl, supabaseKey) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    /**
     * Realiza una petición GET a Supabase
     * @param {string} table - Nombre de la tabla
     * @param {object} options - Opciones de consulta
     * @returns {Promise<Array>} - Array de resultados
     */
    async select(table, options = {}) {
        let url = `${this.supabaseUrl}/rest/v1/${table}?`;

        // Agregar filtros
        if (options.filter) {
            Object.keys(options.filter).forEach(key => {
                url += `${key}=eq.${options.filter[key]}&`;
            });
        }

        // Agregar ordenamiento
        if (options.order) {
            url += `order=${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}&`;
        }

        // Agregar límite
        if (options.limit) {
            url += `limit=${options.limit}&`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching from Supabase:', error);
            throw error;
        }
    }

    /**
     * Inserta un registro en Supabase
     * @param {string} table - Nombre de la tabla
     * @param {object} data - Datos a insertar
     * @returns {Promise<object>} - Registro insertado
     */
    async insert(table, data) {
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('Error inserting to Supabase:', error);
            throw error;
        }
    }

    /**
     * Elimina registros de Supabase
     * @param {string} table - Nombre de la tabla
     * @param {object} filter - Filtros para la eliminación
     * @returns {Promise<void>}
     */
    async delete(table, filter) {
        let url = `${this.supabaseUrl}/rest/v1/${table}?`;

        Object.keys(filter).forEach(key => {
            url += `${key}=eq.${filter[key]}&`;
        });

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting from Supabase:', error);
            throw error;
        }
    }

    /**
     * Verifica la conexión con Supabase
     * @returns {Promise<boolean>} - true si la conexión es exitosa
     */
    async checkConnection() {
        try {
            await this.select('snake_rankings', { limit: 1 });
            return true;
        } catch (error) {
            return false;
        }
    }
}
