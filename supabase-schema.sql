-- Script SQL para crear las tablas necesarias en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    answers TEXT[] NOT NULL,
    correct_answer INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ranking
CREATE TABLE IF NOT EXISTS ranking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    questions_answered INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ranking_score ON ranking(score DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_created_at ON ranking(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para 'questions'
-- Permitir lectura a todos
CREATE POLICY "Enable read access for all users" ON questions
    FOR SELECT
    USING (true);

-- Permitir inserción a todos (para que los usuarios puedan agregar preguntas)
CREATE POLICY "Enable insert for all users" ON questions
    FOR INSERT
    WITH CHECK (true);

-- Permitir actualización a todos
CREATE POLICY "Enable update for all users" ON questions
    FOR UPDATE
    USING (true);

-- Permitir eliminación a todos
CREATE POLICY "Enable delete for all users" ON questions
    FOR DELETE
    USING (true);

-- Políticas de seguridad para 'ranking'
-- Permitir lectura a todos
CREATE POLICY "Enable read access for all users" ON ranking
    FOR SELECT
    USING (true);

-- Permitir inserción a todos
CREATE POLICY "Enable insert for all users" ON ranking
    FOR INSERT
    WITH CHECK (true);

-- Comentarios descriptivos
COMMENT ON TABLE questions IS 'Tabla que almacena las preguntas del quiz';
COMMENT ON TABLE ranking IS 'Tabla que almacena el ranking de puntuaciones';

COMMENT ON COLUMN questions.question_text IS 'Texto de la pregunta';
COMMENT ON COLUMN questions.answers IS 'Array de respuestas posibles (2-3 opciones)';
COMMENT ON COLUMN questions.correct_answer IS 'Índice de la respuesta correcta (0, 1 o 2)';

COMMENT ON COLUMN ranking.player_name IS 'Nombre del jugador';
COMMENT ON COLUMN ranking.score IS 'Puntuación obtenida';
COMMENT ON COLUMN ranking.questions_answered IS 'Número de preguntas respondidas';
COMMENT ON COLUMN ranking.correct_answers IS 'Número de respuestas correctas';
