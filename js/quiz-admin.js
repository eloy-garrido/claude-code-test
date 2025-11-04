/**
 * Panel de administrador para gestionar preguntas
 */

import { getQuestionsByVisibility, createQuestion, updateQuestion, deleteQuestion, updateQuestionVisibility } from './quiz-supabase.js';
import { showToast, validateQuestion } from './quiz-utils.js';

export class AdminPanel {
    constructor() {
        this.questions = [];
        this.editingQuestionId = null;
        this.showingHidden = false; // false = mostrando visibles, true = mostrando ocultas

        this.elements = {
            form: document.getElementById('questionForm'),
            formTitle: document.getElementById('formTitle'),
            questionId: document.getElementById('questionId'),
            questionInput: document.getElementById('questionInput'),
            answersContainer: document.getElementById('answersInputContainer'),
            addAnswerBtn: document.getElementById('addAnswerBtn'),
            saveBtn: document.getElementById('saveQuestionBtn'),
            cancelBtn: document.getElementById('cancelEditBtn'),
            questionsList: document.getElementById('questionsList'),
            questionCount: document.getElementById('questionCount'),
            exportBtn: document.getElementById('exportQuestionsBtn'),
            importBtn: document.getElementById('importQuestionsBtn'),
            importFileInput: document.getElementById('importFileInput'),
            toggleVisibilityBtn: document.getElementById('toggleVisibilityBtn')
        };

        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Formulario de pregunta
        this.elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveQuestion();
        });

        // Botón para agregar respuesta
        this.elements.addAnswerBtn.addEventListener('click', () => {
            this.addAnswerInput();
        });

        // Botón cancelar edición
        this.elements.cancelBtn.addEventListener('click', () => {
            this.cancelEdit();
        });

        // Botón exportar
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportQuestions();
        });

        // Botón importar
        this.elements.importBtn.addEventListener('click', () => {
            this.elements.importFileInput.click();
        });

        // Input de archivo
        this.elements.importFileInput.addEventListener('change', (e) => {
            this.importQuestions(e);
        });

        // Botón toggle visibilidad
        this.elements.toggleVisibilityBtn.addEventListener('click', () => {
            this.toggleVisibilityView();
        });
    }

    /**
     * Carga preguntas según el estado actual (visibles u ocultas)
     */
    async loadQuestions() {
        try {
            // Cargar según si está mostrando ocultas o visibles
            this.questions = await getQuestionsByVisibility(!this.showingHidden);
            this.renderQuestions();
        } catch (error) {
            console.error('Error al cargar preguntas:', error);
            showToast('Error al cargar las preguntas', 'error');
        }
    }

    /**
     * Alterna entre mostrar preguntas visibles y ocultas
     */
    async toggleVisibilityView() {
        this.showingHidden = !this.showingHidden;

        // Actualizar texto del botón
        if (this.showingHidden) {
            this.elements.toggleVisibilityBtn.innerHTML = '👁️ Mostrar Preguntas Visibles';
        } else {
            this.elements.toggleVisibilityBtn.innerHTML = '👁️ Mostrar Preguntas Ocultas';
        }

        // Recargar preguntas
        await this.loadQuestions();
    }

    /**
     * Renderiza la lista de preguntas
     */
    renderQuestions() {
        this.elements.questionsList.innerHTML = '';

        // Actualizar contador
        const count = this.questions.length;
        this.elements.questionCount.textContent = `${count} pregunta${count !== 1 ? 's' : ''}`;

        if (this.questions.length === 0) {
            this.elements.questionsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No hay preguntas todavía. ¡Crea la primera!</p>';
            return;
        }

        this.questions.forEach(question => {
            const item = document.createElement('div');
            item.className = 'question-item';

            const answersHtml = question.answers.map((answer, index) => {
                const isCorrect = index === question.correct_answer;
                return `<div class="answer-item ${isCorrect ? 'correct' : ''}">${answer} ${isCorrect ? '✓' : ''}</div>`;
            }).join('');

            // Determinar el texto del botón de visibilidad
            const visibilityBtnText = this.showingHidden ? '👁️' : '🚫';
            const visibilityBtnTitle = this.showingHidden ? 'Hacer visible' : 'Ocultar pregunta';

            item.innerHTML = `
                <div class="question-item-header">
                    <div class="question-item-text">${question.question_text}</div>
                    <div class="question-item-actions">
                        <button class="btn-icon visibility" data-id="${question.id}" title="${visibilityBtnTitle}">${visibilityBtnText}</button>
                        <button class="btn-icon edit" data-id="${question.id}" title="Editar">✏️</button>
                        <button class="btn-icon delete" data-id="${question.id}" title="Eliminar">🗑️</button>
                    </div>
                </div>
                <div class="question-item-answers">
                    ${answersHtml}
                </div>
            `;

            // Event listeners para visibilidad, editar y eliminar
            item.querySelector('.visibility').addEventListener('click', () => {
                this.toggleQuestionVisibility(question.id);
            });

            item.querySelector('.edit').addEventListener('click', () => {
                this.editQuestion(question.id);
            });

            item.querySelector('.delete').addEventListener('click', () => {
                this.deleteQuestion(question.id);
            });

            this.elements.questionsList.appendChild(item);
        });
    }

    /**
     * Agrega un input para una respuesta adicional
     */
    addAnswerInput() {
        const currentAnswers = this.elements.answersContainer.querySelectorAll('.answer-input');

        if (currentAnswers.length >= 3) {
            showToast('Máximo 3 respuestas permitidas', 'warning');
            return;
        }

        const index = currentAnswers.length;
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-input';

        answerDiv.innerHTML = `
            <input type="text" placeholder="Respuesta ${index + 1}" required>
            <label class="checkbox-label">
                <input type="radio" name="correctAnswer" value="${index}">
                <span>Correcta</span>
            </label>
            <button type="button" class="btn-icon delete" onclick="this.parentElement.remove()">🗑️</button>
        `;

        this.elements.answersContainer.appendChild(answerDiv);
    }

    /**
     * Obtiene los datos del formulario
     */
    getFormData() {
        const questionText = this.elements.questionInput.value.trim();
        const answerInputs = this.elements.answersContainer.querySelectorAll('.answer-input input[type="text"]');
        const correctAnswerRadio = this.elements.answersContainer.querySelector('input[name="correctAnswer"]:checked');

        const answers = Array.from(answerInputs).map(input => input.value.trim());
        const correctAnswer = correctAnswerRadio ? parseInt(correctAnswerRadio.value) : -1;

        return {
            questionText,
            answers,
            correctAnswer
        };
    }

    /**
     * Guarda una pregunta (crear o actualizar)
     */
    async saveQuestion() {
        const data = this.getFormData();

        // Validar
        const validation = validateQuestion(data);
        if (!validation.valid) {
            showToast(validation.error, 'error');
            return;
        }

        try {
            if (this.editingQuestionId) {
                // Actualizar
                await updateQuestion(this.editingQuestionId, data);
                showToast('Pregunta actualizada correctamente', 'success');
            } else {
                // Crear
                await createQuestion(data);
                showToast('Pregunta creada correctamente', 'success');
            }

            // Limpiar formulario y recargar lista
            this.resetForm();
            await this.loadQuestions();

        } catch (error) {
            console.error('Error al guardar pregunta:', error);
            showToast('Error al guardar la pregunta: ' + error.message, 'error');
        }
    }

    /**
     * Edita una pregunta existente
     */
    editQuestion(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;

        this.editingQuestionId = questionId;

        // Cambiar título del formulario
        this.elements.formTitle.textContent = 'Editar Pregunta';
        this.elements.saveBtn.textContent = 'Actualizar Pregunta';
        this.elements.cancelBtn.style.display = 'inline-block';

        // Llenar formulario
        this.elements.questionInput.value = question.question_text;

        // Limpiar respuestas actuales
        this.elements.answersContainer.innerHTML = '';

        // Agregar respuestas
        question.answers.forEach((answer, index) => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-input';

            const isCorrect = index === question.correct_answer;

            answerDiv.innerHTML = `
                <input type="text" placeholder="Respuesta ${index + 1}" value="${answer}" required>
                <label class="checkbox-label">
                    <input type="radio" name="correctAnswer" value="${index}" ${isCorrect ? 'checked' : ''} required>
                    <span>Correcta</span>
                </label>
                ${index >= 2 ? '<button type="button" class="btn-icon delete" onclick="this.parentElement.remove()">🗑️</button>' : ''}
            `;

            this.elements.answersContainer.appendChild(answerDiv);
        });

        // Scroll al formulario
        this.elements.form.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Elimina una pregunta
     */
    async deleteQuestion(questionId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
            return;
        }

        try {
            await deleteQuestion(questionId);
            showToast('Pregunta eliminada correctamente', 'success');
            await this.loadQuestions();
        } catch (error) {
            console.error('Error al eliminar pregunta:', error);
            showToast('Error al eliminar la pregunta: ' + error.message, 'error');
        }
    }

    /**
     * Alterna la visibilidad de una pregunta
     */
    async toggleQuestionVisibility(questionId) {
        try {
            // La nueva visibilidad es opuesta al estado actual
            // Si estamos mostrando ocultas (showingHidden=true), queremos hacer visible=true
            // Si estamos mostrando visibles (showingHidden=false), queremos hacer visible=false
            const newVisibility = this.showingHidden;

            await updateQuestionVisibility(questionId, newVisibility);

            const message = newVisibility
                ? 'Pregunta ahora visible para estudiantes'
                : 'Pregunta ocultada correctamente';

            showToast(message, 'success');
            await this.loadQuestions();
        } catch (error) {
            console.error('Error al cambiar visibilidad:', error);
            showToast('Error al cambiar visibilidad: ' + error.message, 'error');
        }
    }

    /**
     * Cancela la edición
     */
    cancelEdit() {
        this.resetForm();
    }

    /**
     * Resetea el formulario
     */
    resetForm() {
        this.editingQuestionId = null;

        this.elements.formTitle.textContent = 'Nueva Pregunta';
        this.elements.saveBtn.textContent = 'Guardar Pregunta';
        this.elements.cancelBtn.style.display = 'none';

        this.elements.form.reset();

        // Resetear respuestas a 2 por defecto
        this.elements.answersContainer.innerHTML = `
            <div class="answer-input">
                <input type="text" placeholder="Respuesta 1" required>
                <label class="checkbox-label">
                    <input type="radio" name="correctAnswer" value="0" required>
                    <span>Correcta</span>
                </label>
            </div>
            <div class="answer-input">
                <input type="text" placeholder="Respuesta 2" required>
                <label class="checkbox-label">
                    <input type="radio" name="correctAnswer" value="1">
                    <span>Correcta</span>
                </label>
            </div>
        `;
    }

    /**
     * Exporta todas las preguntas a un archivo JSON
     */
    async exportQuestions() {
        try {
            // Obtener todas las preguntas
            const questions = await getAllQuestions();

            if (questions.length === 0) {
                showToast('No hay preguntas para exportar', 'warning');
                return;
            }

            // Formatear preguntas para exportación
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                totalQuestions: questions.length,
                questions: questions.map(q => ({
                    question_text: q.question_text,
                    answers: q.answers,
                    correct_answer: q.correct_answer
                }))
            };

            // Convertir a JSON
            const jsonString = JSON.stringify(exportData, null, 2);

            // Crear blob y descargar
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            // Nombre del archivo con fecha
            const fecha = new Date().toISOString().split('T')[0];
            link.download = `preguntas-medicina-china-${fecha}.json`;
            link.href = url;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            showToast(`${questions.length} preguntas exportadas correctamente`, 'success');
        } catch (error) {
            console.error('Error al exportar preguntas:', error);
            showToast('Error al exportar preguntas: ' + error.message, 'error');
        }
    }

    /**
     * Importa preguntas desde un archivo JSON
     */
    async importQuestions(event) {
        const file = event.target.files[0];

        if (!file) return;

        // Resetear el input para permitir seleccionar el mismo archivo de nuevo
        event.target.value = '';

        try {
            // Leer el archivo
            const fileContent = await this.readFileAsText(file);

            // Parsear JSON
            let importData;
            try {
                importData = JSON.parse(fileContent);
            } catch (e) {
                throw new Error('El archivo no tiene un formato JSON válido');
            }

            // Validar estructura
            const validation = this.validateImportData(importData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Confirmar importación
            const questionsToImport = importData.questions.length;
            const confirmMsg = `¿Deseas importar ${questionsToImport} pregunta${questionsToImport !== 1 ? 's' : ''}?\n\nEsto agregará las preguntas a la base de datos (no eliminará las existentes).`;

            if (!confirm(confirmMsg)) {
                showToast('Importación cancelada', 'warning');
                return;
            }

            // Importar preguntas
            let imported = 0;
            let errors = 0;

            for (const question of importData.questions) {
                try {
                    await createQuestion({
                        questionText: question.question_text,
                        answers: question.answers,
                        correctAnswer: question.correct_answer
                    });
                    imported++;
                } catch (error) {
                    console.error('Error al importar pregunta:', error);
                    errors++;
                }
            }

            // Mostrar resultado
            if (errors === 0) {
                showToast(`${imported} pregunta${imported !== 1 ? 's' : ''} importada${imported !== 1 ? 's' : ''} correctamente`, 'success');
            } else {
                showToast(`${imported} importadas, ${errors} con errores`, 'warning');
            }

            // Recargar lista
            await this.loadQuestions();

        } catch (error) {
            console.error('Error al importar preguntas:', error);
            showToast('Error al importar: ' + error.message, 'error');
        }
    }

    /**
     * Lee un archivo como texto
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Valida los datos importados
     */
    validateImportData(data) {
        // Verificar que sea un objeto
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'El archivo no contiene un objeto JSON válido' };
        }

        // Verificar que tenga el array de preguntas
        if (!Array.isArray(data.questions)) {
            return { valid: false, error: 'El archivo debe contener un array "questions"' };
        }

        // Verificar que haya al menos una pregunta
        if (data.questions.length === 0) {
            return { valid: false, error: 'El archivo no contiene preguntas' };
        }

        // Validar cada pregunta
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];

            // Verificar campos requeridos
            if (!q.question_text || typeof q.question_text !== 'string') {
                return { valid: false, error: `Pregunta ${i + 1}: falta o es inválido "question_text"` };
            }

            if (!Array.isArray(q.answers)) {
                return { valid: false, error: `Pregunta ${i + 1}: "answers" debe ser un array` };
            }

            if (q.answers.length < 2 || q.answers.length > 3) {
                return { valid: false, error: `Pregunta ${i + 1}: debe tener entre 2 y 3 respuestas` };
            }

            if (typeof q.correct_answer !== 'number') {
                return { valid: false, error: `Pregunta ${i + 1}: "correct_answer" debe ser un número` };
            }

            if (q.correct_answer < 0 || q.correct_answer >= q.answers.length) {
                return { valid: false, error: `Pregunta ${i + 1}: "correct_answer" fuera de rango` };
            }

            // Verificar que todas las respuestas sean strings
            for (let j = 0; j < q.answers.length; j++) {
                if (typeof q.answers[j] !== 'string' || q.answers[j].trim() === '') {
                    return { valid: false, error: `Pregunta ${i + 1}, respuesta ${j + 1}: debe ser un texto válido` };
                }
            }
        }

        return { valid: true };
    }
}
