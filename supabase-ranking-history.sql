-- ============================================
-- Script para crear tabla de historial de rankings
-- ============================================

-- Crear tabla para almacenar rankings históricos
CREATE TABLE IF NOT EXISTS ranking_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ranking_period VARCHAR(100),

    CONSTRAINT ranking_history_score_check CHECK (score >= 0),
    CONSTRAINT ranking_history_correct_check CHECK (correct_answers >= 0),
    CONSTRAINT ranking_history_total_check CHECK (total_questions > 0)
);

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_ranking_history_archived_at ON ranking_history(archived_at DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_history_player ON ranking_history(player_name);
CREATE INDEX IF NOT EXISTS idx_ranking_history_period ON ranking_history(ranking_period);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ranking_history ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer el historial de rankings
CREATE POLICY "Anyone can view ranking history"
    ON ranking_history
    FOR SELECT
    USING (true);

-- Política: Solo se permite insertar (para archivar rankings)
CREATE POLICY "Enable insert for archiving"
    ON ranking_history
    FOR INSERT
    WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE ranking_history IS 'Almacena el historial de rankings archivados cuando se reinicia el ranking actual';
COMMENT ON COLUMN ranking_history.player_name IS 'Nombre del jugador';
COMMENT ON COLUMN ranking_history.score IS 'Puntuación obtenida';
COMMENT ON COLUMN ranking_history.correct_answers IS 'Cantidad de respuestas correctas';
COMMENT ON COLUMN ranking_history.total_questions IS 'Total de preguntas respondidas';
COMMENT ON COLUMN ranking_history.played_at IS 'Fecha y hora cuando se jugó la partida';
COMMENT ON COLUMN ranking_history.archived_at IS 'Fecha y hora cuando se archivó este registro';
COMMENT ON COLUMN ranking_history.ranking_period IS 'Etiqueta opcional para identificar el período del ranking (ej: "Enero 2025", "Semestre 1")';
