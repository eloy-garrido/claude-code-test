-- Script SQL para agregar el campo 'visible' a la tabla questions
-- Ejecuta este script en el SQL Editor de Supabase DESPUÉS de crear las tablas

-- Agregar columna visible (por defecto TRUE para todas las preguntas existentes)
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;

-- Crear índice para mejorar el rendimiento al filtrar por visible
CREATE INDEX IF NOT EXISTS idx_questions_visible ON questions(visible);

-- Comentario descriptivo
COMMENT ON COLUMN questions.visible IS 'Indica si la pregunta está visible (true) u oculta (false). Solo las visibles aparecen en el juego';
