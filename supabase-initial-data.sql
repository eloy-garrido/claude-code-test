-- Script SQL para insertar 10 preguntas iniciales de Medicina China
-- Ejecuta este script DESPUÉS de crear las tablas con supabase-schema.sql

-- Limpiar preguntas existentes (opcional, comentar si no deseas eliminar)
-- DELETE FROM questions;

-- Insertar 10 preguntas de Medicina China
INSERT INTO questions (question_text, answers, correct_answer) VALUES

-- Pregunta 1
('¿Cuál es uno de los cinco elementos en la Medicina Tradicional China?',
 ARRAY['Fuego', 'Hierro', 'Cristal'],
 0),

-- Pregunta 2
('¿Qué significa el concepto de Yin en la Medicina China?',
 ARRAY['Energía activa y caliente', 'Energía pasiva y fría', 'Energía neutral'],
 1),

-- Pregunta 3
('¿Cuántos meridianos principales existen en el cuerpo según la Medicina China?',
 ARRAY['12 meridianos', '8 meridianos', '24 meridianos'],
 0),

-- Pregunta 4
('¿Qué órgano se asocia con el elemento Madera en la teoría de los cinco elementos?',
 ARRAY['Corazón', 'Hígado', 'Riñón'],
 1),

-- Pregunta 5
('¿Cuál es la energía vital que fluye por los meridianos del cuerpo?',
 ARRAY['Qi (Chi)', 'Prana', 'Kundalini'],
 0),

-- Pregunta 6
('¿Qué técnica de la Medicina China utiliza agujas finas en puntos específicos del cuerpo?',
 ARRAY['Masaje Tui Na', 'Acupuntura'],
 1),

-- Pregunta 7
('¿Qué emoción se asocia principalmente con el órgano del Corazón en MTC?',
 ARRAY['Alegría', 'Miedo', 'Ira'],
 0),

-- Pregunta 8
('¿Cuál es el órgano Yin asociado con el elemento Agua?',
 ARRAY['Riñón', 'Pulmón', 'Bazo'],
 0),

-- Pregunta 9
('¿Qué práctica de la Medicina China combina movimientos suaves, respiración y meditación?',
 ARRAY['Kung Fu', 'Qi Gong', 'Tai Boxing'],
 1),

-- Pregunta 10
('¿Qué diagnóstico es fundamental en la Medicina China para evaluar el estado de salud?',
 ARRAY['Análisis de sangre', 'Pulso y lengua'],
 1);

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_preguntas FROM questions;

-- Mostrar todas las preguntas insertadas
SELECT
    question_text,
    answers,
    correct_answer,
    created_at
FROM questions
ORDER BY created_at DESC;
