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

/**
 * Obtiene el ranking completo (sin límite)
 * @returns {Promise<Array>}
 */
export async function getFullRanking() {
    try {
        const { data, error } = await supabase
            .from('ranking')
            .select('*')
            .order('score', { ascending: false })
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error al obtener ranking completo:', error);
        throw error;
    }
}

/**
 * Archiva el ranking actual al historial y lo reinicia
 * @param {string} periodLabel - Etiqueta opcional para identificar el período (ej: "Enero 2025")
 * @returns {Promise<{archived: number, message: string}>}
 */
export async function archiveAndResetRanking(periodLabel = null) {
    try {
        // 1. Obtener todos los registros del ranking actual
        const currentRanking = await getFullRanking();

        if (currentRanking.length === 0) {
            return {
                archived: 0,
                message: 'No hay datos en el ranking para archivar'
            };
        }

        // 2. Preparar los datos para el historial
        const historyRecords = currentRanking.map(record => ({
            player_name: record.player_name,
            score: record.score,
            correct_answers: record.correct_answers,
            total_questions: record.questions_answered,
            played_at: record.created_at,
            ranking_period: periodLabel || `Ranking hasta ${new Date().toLocaleDateString('es-ES')}`
        }));

        // 3. Insertar en ranking_history
        const { error: insertError } = await supabase
            .from('ranking_history')
            .insert(historyRecords);

        if (insertError) throw insertError;

        // 4. Eliminar todos los registros del ranking actual
        const { error: deleteError } = await supabase
            .from('ranking')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Elimina todos los registros

        if (deleteError) throw deleteError;

        return {
            archived: currentRanking.length,
            message: `Se archivaron ${currentRanking.length} registros correctamente`
        };
    } catch (error) {
        console.error('Error al archivar y reiniciar ranking:', error);
        throw error;
    }
}

/**
 * Obtiene los períodos de rankings históricos disponibles
 * @returns {Promise<Array<{period: string, count: number, firstDate: string, lastDate: string}>>}
 */
export async function getRankingPeriods() {
    try {
        const { data, error } = await supabase
            .from('ranking_history')
            .select('ranking_period, archived_at, player_name')
            .order('archived_at', { ascending: false });

        if (error) throw error;

        // Agrupar por período
        const periodsMap = new Map();

        (data || []).forEach(record => {
            const period = record.ranking_period || 'Sin período';
            if (!periodsMap.has(period)) {
                periodsMap.set(period, {
                    period: period,
                    count: 0,
                    dates: []
                });
            }
            const periodData = periodsMap.get(period);
            periodData.count++;
            periodData.dates.push(record.archived_at);
        });

        // Convertir a array y agregar fechas
        return Array.from(periodsMap.values()).map(p => ({
            period: p.period,
            count: p.count,
            firstDate: p.dates[p.dates.length - 1],
            lastDate: p.dates[0]
        }));
    } catch (error) {
        console.error('Error al obtener períodos de ranking:', error);
        throw error;
    }
}

/**
 * Obtiene el ranking histórico de un período específico
 * @param {string} periodLabel - Etiqueta del período a consultar
 * @returns {Promise<Array>}
 */
export async function getHistoricalRanking(periodLabel) {
    try {
        const { data, error } = await supabase
            .from('ranking_history')
            .select('*')
            .eq('ranking_period', periodLabel)
            .order('score', { ascending: false })
            .order('played_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error al obtener ranking histórico:', error);
        throw error;
    }
}
