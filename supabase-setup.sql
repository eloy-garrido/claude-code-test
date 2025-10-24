-- Script SQL para crear la tabla de ranking en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear la tabla snake_rankings
CREATE TABLE IF NOT EXISTS snake_rankings (
    id BIGSERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índice para mejorar la velocidad de consultas ordenadas por score
CREATE INDEX IF NOT EXISTS idx_snake_rankings_score
ON snake_rankings(score DESC);

-- Crear índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_snake_rankings_created_at
ON snake_rankings(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE snake_rankings ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (cualquiera puede ver el ranking)
CREATE POLICY "Allow public read access"
ON snake_rankings
FOR SELECT
USING (true);

-- Política para permitir inserción pública (cualquiera puede agregar puntajes)
CREATE POLICY "Allow public insert access"
ON snake_rankings
FOR INSERT
WITH CHECK (true);

-- Opcional: Política para evitar actualizaciones (los puntajes no deben modificarse)
CREATE POLICY "Prevent updates"
ON snake_rankings
FOR UPDATE
USING (false);

-- Opcional: Política para evitar eliminaciones públicas
CREATE POLICY "Prevent public delete"
ON snake_rankings
FOR DELETE
USING (false);

-- Comentarios para documentación
COMMENT ON TABLE snake_rankings IS 'Tabla para almacenar el ranking de puntajes del juego Snake';
COMMENT ON COLUMN snake_rankings.id IS 'Identificador único del registro';
COMMENT ON COLUMN snake_rankings.player_name IS 'Nombre del jugador';
COMMENT ON COLUMN snake_rankings.score IS 'Puntaje obtenido';
COMMENT ON COLUMN snake_rankings.created_at IS 'Fecha y hora en que se creó el registro';

-- Vista opcional para obtener solo el top 10
CREATE OR REPLACE VIEW top_10_rankings AS
SELECT
    id,
    player_name,
    score,
    created_at,
    ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank
FROM snake_rankings
ORDER BY score DESC, created_at ASC
LIMIT 10;

-- Comentario para la vista
COMMENT ON VIEW top_10_rankings IS 'Vista que muestra el top 10 de puntajes más altos';
