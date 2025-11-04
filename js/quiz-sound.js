/**
 * Sistema de sonidos para el quiz usando Tone.js
 */

export class QuizSoundManager {
    constructor() {
        this.synth = null;
        this.isInitialized = false;
        this.isMuted = false;
    }

    /**
     * Inicializa el sistema de audio
     * Debe llamarse después de una interacción del usuario
     */
    async init() {
        if (this.isInitialized) return;

        try {
            await Tone.start();
            this.synth = new Tone.Synth({
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.005,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.3
                }
            }).toDestination();

            this.isInitialized = true;
            console.log('Sistema de audio inicializado');
        } catch (error) {
            console.error('Error al inicializar audio:', error);
        }
    }

    /**
     * Reproduce sonido de respuesta correcta
     */
    async playCorrect() {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const now = Tone.now();
            // Secuencia ascendente alegre: C5 → E5 → G5
            this.synth.triggerAttackRelease('C5', '0.1', now);
            this.synth.triggerAttackRelease('E5', '0.1', now + 0.1);
            this.synth.triggerAttackRelease('G5', '0.2', now + 0.2);
        } catch (error) {
            console.error('Error al reproducir sonido correcto:', error);
        }
    }

    /**
     * Reproduce sonido de respuesta incorrecta
     */
    async playIncorrect() {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const now = Tone.now();
            // Secuencia descendente: E4 → C4 → A3
            this.synth.triggerAttackRelease('E4', '0.1', now);
            this.synth.triggerAttackRelease('C4', '0.1', now + 0.1);
            this.synth.triggerAttackRelease('A3', '0.3', now + 0.2);
        } catch (error) {
            console.error('Error al reproducir sonido incorrecto:', error);
        }
    }

    /**
     * Reproduce sonido de timeout
     */
    async playTimeout() {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const now = Tone.now();
            // Tono de advertencia
            this.synth.triggerAttackRelease('G3', '0.15', now);
            this.synth.triggerAttackRelease('G3', '0.15', now + 0.2);
        } catch (error) {
            console.error('Error al reproducir sonido timeout:', error);
        }
    }

    /**
     * Reproduce sonido de inicio de juego
     */
    async playStart() {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const now = Tone.now();
            // Arpeggio ascendente: C4 → E4 → G4 → C5
            this.synth.triggerAttackRelease('C4', '0.1', now);
            this.synth.triggerAttackRelease('E4', '0.1', now + 0.1);
            this.synth.triggerAttackRelease('G4', '0.1', now + 0.2);
            this.synth.triggerAttackRelease('C5', '0.2', now + 0.3);
        } catch (error) {
            console.error('Error al reproducir sonido inicio:', error);
        }
    }

    /**
     * Reproduce sonido de fin de juego
     */
    async playGameOver() {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const now = Tone.now();
            // Melodía de finalización: G4 → E4 → C4 → G3 → C3
            this.synth.triggerAttackRelease('G4', '0.15', now);
            this.synth.triggerAttackRelease('E4', '0.15', now + 0.15);
            this.synth.triggerAttackRelease('C4', '0.15', now + 0.3);
            this.synth.triggerAttackRelease('G3', '0.15', now + 0.45);
            this.synth.triggerAttackRelease('C3', '0.4', now + 0.6);
        } catch (error) {
            console.error('Error al reproducir sonido game over:', error);
        }
    }

    /**
     * Activa/desactiva el sonido
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    /**
     * Obtiene el estado del sonido
     */
    getMuteStatus() {
        return this.isMuted;
    }
}
