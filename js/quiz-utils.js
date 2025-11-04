/**
 * Utilidades para el juego de preguntas
 */

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success, error, warning)
 */
export function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✓' :
                 type === 'error' ? '✗' :
                 type === 'warning' ? '⚠' : 'ℹ';

    toast.innerHTML = `
        <span style="font-size: 1.2rem;">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Valida que una pregunta tenga el formato correcto
 * @param {Object} question - Pregunta a validar
 * @returns {Object} - {valid: boolean, error: string}
 */
export function validateQuestion(question) {
    if (!question.questionText || question.questionText.trim() === '') {
        return { valid: false, error: 'La pregunta no puede estar vacía' };
    }

    if (!question.answers || question.answers.length < 2 || question.answers.length > 3) {
        return { valid: false, error: 'Debe haber entre 2 y 3 respuestas' };
    }

    // Verificar que todas las respuestas tengan contenido
    for (let i = 0; i < question.answers.length; i++) {
        if (!question.answers[i] || question.answers[i].trim() === '') {
            return { valid: false, error: `La respuesta ${i + 1} no puede estar vacía` };
        }
    }

    if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.answers.length) {
        return { valid: false, error: 'Debe seleccionar una respuesta correcta válida' };
    }

    return { valid: true };
}
