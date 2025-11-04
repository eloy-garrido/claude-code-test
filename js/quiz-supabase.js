/**
 * Cliente y configuración de Supabase
 */

// Configuración de Supabase (en producción, usar variables de entorno)
const SUPABASE_URL = 'https://mjllipisteslliluhvar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbGxpcGlzdGVzbGxpbHVodmFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzk1ODcsImV4cCI6MjA3Nzg1NTU4N30.1H4O7uEhgKM_DKkv7sf8_w9yUVtnQzJTs2-PNGX3Wuo';

// Crear cliente de Supabase
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Verifica la conexión con Supabase
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function checkConnection() {
    try {
        // Intenta obtener una pregunta para verificar la conexión
        const { data, error } = await supabase
            .from('questions')
            .select('id')
            .limit(1);

        if (error) {
            // Si la tabla no existe, también es válido (significa que la conexión funciona)
            if (error.code === '42P01') {
                return {
                    success: true,
                    message: 'Conexión exitosa. Necesitas crear las tablas en Supabase.'
                };
            }
            throw error;
        }

        return {
            success: true,
            message: 'Conexión exitosa con Supabase'
        };
    } catch (error) {
        console.error('Error al conectar con Supabase:', error);
        return {
            success: false,
            message: 'Error al conectar con Supabase: ' + error.message
        };
    }
}

/**
 * Obtiene todas las preguntas (visible e ocultas, para admin)
 * @returns {Promise<Array>}
 */
export async function getAllQuestions() {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error al obtener preguntas:', error);
        throw error;
    }
}

/**
 * Obtiene preguntas según su visibilidad
 * @param {boolean} visible - true para visibles, false para ocultas
 * @returns {Promise<Array>}
 */
export async function getQuestionsByVisibility(visible = true) {
    try {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('visible', visible)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error al obtener preguntas por visibilidad:', error);
        throw error;
    }
}

/**
 * Obtiene preguntas aleatorias para el juego (solo visibles)
 * @param {number} count - Número de preguntas a obtener
 * @returns {Promise<Array>}
 */
export async function getRandomQuestions(count = 10) {
    try {
        // Obtener solo preguntas visibles
        const visibleQuestions = await getQuestionsByVisibility(true);

        if (visibleQuestions.length === 0) {
            throw new Error('No hay preguntas disponibles en la base de datos');
        }

        // Mezclamos aleatoriamente y tomamos las primeras 'count'
        const shuffled = visibleQuestions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, visibleQuestions.length));
    } catch (error) {
        console.error('Error al obtener preguntas aleatorias:', error);
        throw error;
    }
}

/**
 * Crea una nueva pregunta
 * @param {Object} question - Objeto con la pregunta
 * @returns {Promise<Object>}
 */
export async function createQuestion(question) {
    try {
        const { data, error } = await supabase
            .from('questions')
            .insert([{
                question_text: question.questionText,
                answers: question.answers,
                correct_answer: question.correctAnswer
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al crear pregunta:', error);
        throw error;
    }
}

/**
 * Actualiza una pregunta existente
 * @param {string} id - ID de la pregunta
 * @param {Object} question - Datos actualizados
 * @returns {Promise<Object>}
 */
export async function updateQuestion(id, question) {
    try {
        const { data, error } = await supabase
            .from('questions')
            .update({
                question_text: question.questionText,
                answers: question.answers,
                correct_answer: question.correctAnswer
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al actualizar pregunta:', error);
        throw error;
    }
}

/**
 * Actualiza la visibilidad de una pregunta
 * @param {string} id - ID de la pregunta
 * @param {boolean} visible - true para visible, false para oculta
 * @returns {Promise<Object>}
 */
export async function updateQuestionVisibility(id, visible) {
    try {
        const { data, error } = await supabase
            .from('questions')
            .update({ visible })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al actualizar visibilidad:', error);
        throw error;
    }
}

/**
 * Elimina una pregunta
 * @param {string} id - ID de la pregunta
 * @returns {Promise<void>}
 */
export async function deleteQuestion(id) {
    try {
        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error al eliminar pregunta:', error);
        throw error;
    }
}

/**
 * Guarda un resultado en el ranking
 * @param {Object} result - Objeto con nombre y puntuación
 * @returns {Promise<Object>}
 */
export async function saveScore(result) {
    try {
        const { data, error } = await supabase
            .from('ranking')
            .insert([{
                player_name: result.playerName,
                score: result.score,
                questions_answered: result.questionsAnswered,
                correct_answers: result.correctAnswers
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error al guardar puntuación:', error);
        throw error;
    }
}

/**
 * Obtiene el ranking (top 10)
 * @returns {Promise<Array>}
 */
export async function getRanking() {
    try {
        const { data, error } = await supabase
            .from('ranking')
            .select('*')
            .order('score', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error al obtener ranking:', error);
        throw error;
    }
}
