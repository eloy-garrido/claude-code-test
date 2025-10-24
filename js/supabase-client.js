/**
 * Cliente de Supabase
 * Maneja la conexión con la base de datos de Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// IMPORTANTE: Estas variables deben ser configuradas en tu proyecto
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

/**
 * Obtiene o crea la instancia del cliente de Supabase
 * @returns {object} Cliente de Supabase
 */
export function getSupabaseClient() {
    if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

/**
 * Verifica si Supabase está configurado correctamente
 * @returns {boolean} true si está configurado
 */
export function isSupabaseConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Muestra un mensaje de advertencia si Supabase no está configurado
 */
export function warnIfNotConfigured() {
    if (!isSupabaseConfigured()) {
        console.warn(
            '⚠️  Supabase no está configurado. El ranking usará localStorage.\n' +
            'Para usar Supabase, configura las variables de entorno:\n' +
            '- VITE_SUPABASE_URL\n' +
            '- VITE_SUPABASE_ANON_KEY\n' +
            'Ver SUPABASE_SETUP.md para más información.'
        );
        return true;
    }
    return false;
}
