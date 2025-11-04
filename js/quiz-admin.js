/**
 * Panel de administrador para gestionar preguntas
 */

import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from './quiz-supabase.js';
import { showToast, validateQuestion } from './quiz-utils.js';

export class AdminPanel {
    constructor() {
        this.questions = [];
        this.editingQuestionId = null;

        this.elements = {
            form: document.getElementById('questionForm'),
            formTitle: document.getElementById('formTitle'),
            questionId: document.getElementById('questionId'),
            questionInput: document.getElementById('questionInput'),
            answersContainer: document.getElementById('answersInputContainer'),
            addAnswerBtn: document.getElementById('addAnswerBtn'),
            saveBtn: document.getElementById('saveQuestionBtn'),
            cancelBtn: document.getElementById('cancelEditBtn'),
            questionsList: document.getElementById('questionsList')
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
    }

    /**
     * Carga todas las preguntas
     */
    async loadQuestions() {
        try {
            this.questions = await getAllQuestions();
            this.renderQuestions();
        } catch (error) {
            console.error('Error al cargar preguntas:', error);
            showToast('Error al cargar las preguntas', 'error');
        }
    }

    /**
     * Renderiza la lista de preguntas
     */
    renderQuestions() {
        this.elements.questionsList.innerHTML = '';

        if (this.questions.length === 0) {
            this.elements.questionsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No hay preguntas todavía</p>';
            return;
        }

        this.questions.forEach(question => {
            const item = document.createElement('div');
            item.className = 'question-item';

            const answersHtml = question.answers.map((answer, index) => {
                const isCorrect = index === question.correct_answer;
                return `<div class="answer-item ${isCorrect ? 'correct' : ''}">${answer} ${isCorrect ? '✓' : ''}</div>`;
            }).join('');

            item.innerHTML = `
                <div class="question-item-header">
                    <div class="question-item-text">${question.question_text}</div>
                    <div class="question-item-actions">
                        <button class="btn-icon edit" data-id="${question.id}">✏️</button>
                        <button class="btn-icon delete" data-id="${question.id}">🗑️</button>
                    </div>
                </div>
                <div class="question-item-answers">
                    ${answersHtml}
                </div>
            `;

            // Event listeners para editar y eliminar
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
}
