/**
 * Módulo de Efectos de Sonido
 * Maneja todos los sonidos del juego usando Tone.js
 */

export class SoundManager {
    constructor() {
        this.initialized = false;
        this.muted = false;
        this.synth = null;
    }

    /**
     * Inicializa el contexto de audio de Tone.js
     * Debe ser llamado después de una interacción del usuario
     */
    async init() {
        if (this.initialized) return;

        try {
            // Verificar que Tone.js esté disponible
            if (typeof Tone === 'undefined') {
                console.warn('Tone.js no está disponible');
                return;
            }

            await Tone.start();

            // Crear sintetizador con un sonido agradable
            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: 'triangle'
                },
                envelope: {
                    attack: 0.005,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.3
                }
            }).toDestination();

            this.synth.volume.value = -10; // Ajustar volumen

            this.initialized = true;
            console.log('Sistema de audio inicializado');
        } catch (error) {
            console.warn('No se pudo inicializar el audio:', error);
        }
    }

    /**
     * Sonido cuando la serpiente come una manzana
     */
    playEatSound() {
        if (!this.initialized || this.muted) return;

        try {
            // Secuencia de notas ascendentes alegres
            const now = Tone.now();
            this.synth.triggerAttackRelease('C5', '0.1', now);
            this.synth.triggerAttackRelease('E5', '0.1', now + 0.05);
        } catch (error) {
            console.warn('Error reproduciendo sonido de comer:', error);
        }
    }

    /**
     * Sonido cuando la serpiente pierde una vida
     */
    playLoseLifeSound() {
        if (!this.initialized || this.muted) return;

        try {
            // Secuencia descendente
            const now = Tone.now();
            this.synth.triggerAttackRelease('E4', '0.15', now);
            this.synth.triggerAttackRelease('C4', '0.15', now + 0.1);
            this.synth.triggerAttackRelease('A3', '0.2', now + 0.2);
        } catch (error) {
            console.warn('Error reproduciendo sonido de perder vida:', error);
        }
    }

    /**
     * Sonido cuando termina el juego
     */
    playGameOverSound() {
        if (!this.initialized || this.muted) return;

        try {
            // Secuencia dramática
            const now = Tone.now();
            this.synth.triggerAttackRelease('E4', '0.2', now);
            this.synth.triggerAttackRelease('D4', '0.2', now + 0.15);
            this.synth.triggerAttackRelease('C4', '0.2', now + 0.3);
            this.synth.triggerAttackRelease('B3', '0.3', now + 0.45);
            this.synth.triggerAttackRelease('A3', '0.5', now + 0.6);
        } catch (error) {
            console.warn('Error reproduciendo sonido de game over:', error);
        }
    }

    /**
     * Sonido cuando inicia el juego
     */
    playStartSound() {
        if (!this.initialized || this.muted) return;

        try {
            // Secuencia ascendente energética
            const now = Tone.now();
            this.synth.triggerAttackRelease('C4', '0.1', now);
            this.synth.triggerAttackRelease('E4', '0.1', now + 0.08);
            this.synth.triggerAttackRelease('G4', '0.15', now + 0.16);
        } catch (error) {
            console.warn('Error reproduciendo sonido de inicio:', error);
        }
    }

    /**
     * Sonido sutil al cambiar de dirección
     */
    playDirectionSound() {
        if (!this.initialized || this.muted) return;

        try {
            // Nota corta y sutil
            this.synth.triggerAttackRelease('A4', '0.05', Tone.now());
        } catch (error) {
            console.warn('Error reproduciendo sonido de dirección:', error);
        }
    }

    /**
     * Sonido cuando alcanza un nuevo nivel de velocidad
     */
    playSpeedUpSound() {
        if (!this.initialized || this.muted) return;

        try {
            // Arpeggio rápido
            const now = Tone.now();
            this.synth.triggerAttackRelease('C5', '0.08', now);
            this.synth.triggerAttackRelease('E5', '0.08', now + 0.05);
            this.synth.triggerAttackRelease('G5', '0.08', now + 0.1);
            this.synth.triggerAttackRelease('C6', '0.12', now + 0.15);
        } catch (error) {
            console.warn('Error reproduciendo sonido de velocidad:', error);
        }
    }

    /**
     * Alterna el estado de silencio
     * @returns {boolean} Nuevo estado de mute
     */
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    /**
     * Establece el estado de silencio
     * @param {boolean} muted - Si debe silenciarse
     */
    setMuted(muted) {
        this.muted = muted;
    }

    /**
     * Obtiene el estado de silencio
     * @returns {boolean}
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Limpia los recursos de audio
     */
    dispose() {
        if (this.synth) {
            this.synth.dispose();
            this.synth = null;
        }
        this.initialized = false;
    }
}
