/**
 * Lógica principal del juego de preguntas
 */

import { getRandomQuestions, saveScore, getRanking } from './quiz-supabase.js';
import { showToast } from './quiz-utils.js';

export class QuizGame {
    constructor() {
        this.playerName = '';
        this.isAdmin = false;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.timer = null;
        this.timeLeft = 0;
        this.graceTime = 3; // 3 segundos de gracia para leer
        this.maxPointsPerQuestion = 10;
        this.isAnswering = false;

        this.elements = {
            gamePlayerName: document.getElementById('gamePlayerName'),
            playerRole: document.getElementById('playerRole'),
            questionNumber: document.getElementById('questionNumber'),
            score: document.getElementById('score'),
            questionText: document.getElementById('questionText'),
            answersContainer: document.getElementById('answersContainer'),
            timeLeft: document.getElementById('timeLeft'),
            timerFill: document.getElementById('timerFill')
        };
    }

    /**
     * Inicia el juego
     */
    async start(playerName, isAdmin = false) {
        this.playerName = playerName;
        this.isAdmin = isAdmin;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;

        // Actualizar información del jugador
        this.elements.gamePlayerName.textContent = playerName;
        this.elements.playerRole.textContent = isAdmin ? '👑 Administrador' : '🎮 Jugador';

        try {
            // Cargar preguntas aleatorias
            this.questions = await getRandomQuestions(10);

            if (this.questions.length === 0) {
                throw new Error('No hay preguntas disponibles');
            }

            // Mostrar primera pregunta
            this.showQuestion();

        } catch (error) {
            console.error('Error al iniciar el juego:', error);
            showToast('Error al cargar las preguntas: ' + error.message, 'error');
        }
    }

    /**
     * Muestra la pregunta actual
     */
    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        this.isAnswering = false;

        // Actualizar número de pregunta
        this.elements.questionNumber.textContent =
            `${this.currentQuestionIndex + 1}/${this.questions.length}`;

        // Actualizar texto de la pregunta
        this.elements.questionText.textContent = question.question_text;

        // Limpiar respuestas anteriores
        this.elements.answersContainer.innerHTML = '';

        // Crear botones de respuestas
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.addEventListener('click', () => this.selectAnswer(index));
            this.elements.answersContainer.appendChild(button);
        });

        // Iniciar timer
        this.startTimer();
    }

    /**
     * Inicia el temporizador para la pregunta
     */
    startTimer() {
        // Calcular tiempo basado en la longitud de la pregunta
        const question = this.questions[this.currentQuestionIndex];
        const baseTime = 15; // 15 segundos base
        const extraTime = Math.floor(question.question_text.length / 20); // +1 seg cada 20 caracteres
        const totalTime = baseTime + extraTime;

        this.timeLeft = totalTime;
        this.elements.timeLeft.textContent = this.timeLeft;
        this.elements.timerFill.style.width = '100%';

        // Limpiar timer anterior si existe
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Iniciar nuevo timer
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.elements.timeLeft.textContent = this.timeLeft;

            // Actualizar barra de progreso
            const percentage = (this.timeLeft / totalTime) * 100;
            this.elements.timerFill.style.width = percentage + '%';

            // Cambiar color según el tiempo restante
            if (percentage < 30) {
                this.elements.timerFill.style.background =
                    'linear-gradient(90deg, var(--danger), var(--danger))';
            } else if (percentage < 60) {
                this.elements.timerFill.style.background =
                    'linear-gradient(90deg, var(--warning), var(--danger))';
            }

            // Si se acaba el tiempo
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.handleTimeout();
            }
        }, 1000);
    }

    /**
     * Maneja cuando se selecciona una respuesta
     */
    selectAnswer(selectedIndex) {
        if (this.isAnswering) return;

        this.isAnswering = true;
        clearInterval(this.timer);

        const question = this.questions[this.currentQuestionIndex];
        const buttons = this.elements.answersContainer.querySelectorAll('.answer-btn');
        const isCorrect = selectedIndex === question.correct_answer;

        // Calcular puntos
        let points = 0;
        if (isCorrect) {
            // Tiempo total de la pregunta
            const totalTime = parseInt(this.elements.timerFill.parentElement.dataset.totalTime || 15);

            // Tiempo transcurrido (sin contar los 3 segundos de gracia)
            const timeElapsed = Math.max(0, totalTime - this.timeLeft - this.graceTime);

            // Puntos = 10 - tiempo transcurrido (sin gracia)
            points = Math.max(1, this.maxPointsPerQuestion - timeElapsed);

            this.score += points;
            this.correctAnswers++;
        }

        // Actualizar puntuación
        this.elements.score.textContent = this.score;

        // Mostrar respuesta correcta e incorrecta
        buttons.forEach((button, index) => {
            button.disabled = true;
            if (index === question.correct_answer) {
                button.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                button.classList.add('incorrect');
            }
        });

        // Mostrar mensaje
        if (isCorrect) {
            showToast(`¡Correcto! +${points} puntos`, 'success');
        } else {
            showToast('Respuesta incorrecta', 'error');
        }

        // Siguiente pregunta después de 2 segundos
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 2000);
    }

    /**
     * Maneja cuando se acaba el tiempo
     */
    handleTimeout() {
        if (this.isAnswering) return;

        this.isAnswering = true;

        const question = this.questions[this.currentQuestionIndex];
        const buttons = this.elements.answersContainer.querySelectorAll('.answer-btn');

        // Mostrar respuesta correcta
        buttons.forEach((button, index) => {
            button.disabled = true;
            if (index === question.correct_answer) {
                button.classList.add('correct');
            }
        });

        showToast('¡Se acabó el tiempo!', 'warning');

        // Siguiente pregunta después de 2 segundos
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showQuestion();
        }, 2000);
    }

    /**
     * Finaliza el juego
     */
    async endGame() {
        // Limpiar timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Guardar puntuación
        try {
            await saveScore({
                playerName: this.playerName,
                score: this.score,
                questionsAnswered: this.questions.length,
                correctAnswers: this.correctAnswers
            });
        } catch (error) {
            console.error('Error al guardar puntuación:', error);
            showToast('Error al guardar la puntuación', 'error');
        }

        // Mostrar pantalla de resultados
        this.showResults();
    }

    /**
     * Muestra la pantalla de resultados
     */
    async showResults() {
        const finalScoreElement = document.getElementById('finalScore');
        const scoreDetailElement = document.getElementById('scoreDetail');
        const rankingListElement = document.getElementById('rankingList');
        const viewAdminBtn = document.getElementById('viewAdminBtn');

        // Mostrar puntuación final
        finalScoreElement.textContent = this.score;
        scoreDetailElement.textContent =
            `${this.correctAnswers} de ${this.questions.length} respuestas correctas`;

        // Cargar y mostrar ranking
        try {
            const ranking = await getRanking();
            rankingListElement.innerHTML = '';

            if (ranking.length === 0) {
                rankingListElement.innerHTML = '<p style="text-align: center; color: var(--text-light);">No hay ranking todavía</p>';
            } else {
                ranking.forEach((entry, index) => {
                    const item = document.createElement('div');
                    item.className = 'ranking-item';

                    // Resaltar si es el jugador actual
                    if (entry.player_name === this.playerName && entry.score === this.score) {
                        item.classList.add('highlight');
                    }

                    // Medallas para los primeros 3
                    let medal = '';
                    if (index === 0) medal = '🥇';
                    else if (index === 1) medal = '🥈';
                    else if (index === 2) medal = '🥉';
                    else medal = `${index + 1}.`;

                    item.innerHTML = `
                        <span class="ranking-position">${medal}</span>
                        <span class="ranking-name">${entry.player_name}</span>
                        <span class="ranking-score">${entry.score} pts</span>
                    `;

                    rankingListElement.appendChild(item);
                });
            }
        } catch (error) {
            console.error('Error al cargar ranking:', error);
            rankingListElement.innerHTML = '<p style="text-align: center; color: var(--danger);">Error al cargar el ranking</p>';
        }

        // Mostrar botón de admin si es administrador
        if (this.isAdmin) {
            viewAdminBtn.style.display = 'inline-block';
        }

        // Cambiar a pantalla de resultados
        this.switchScreen('resultsScreen');
    }

    /**
     * Cambia entre pantallas
     */
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}
