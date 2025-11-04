# 🏥 Quiz de Medicina China

Un juego interactivo de preguntas y respuestas sobre Medicina Tradicional China con sistema de ranking global, panel de administración y efectos de sonido.

## 🎯 Características Principales

### 🎮 Sistema de Juego
- **10 preguntas aleatorias** por partida
- **Sistema de puntuación dinámico**: hasta 10 puntos por pregunta según velocidad de respuesta
- **Temporizador inteligente**: tiempo base de 15 segundos + tiempo extra según longitud de la pregunta
- **3 segundos de gracia** para leer la pregunta sin penalización de tiempo
- **Sonidos envolventes** para respuestas correctas, incorrectas y eventos del juego

### 🏆 Sistema de Ranking
- **Ranking global persistente** con los mejores jugadores
- **Podio visual** para los top 3 jugadores
- **Visualización completa** del ranking con todos los participantes
- **Puntuaciones históricas** almacenadas en base de datos

### 👨‍💻 Panel de Administrador
- **Acceso especial** con el nombre "taiyangadm"
- **CRUD completo** de preguntas (Crear, Leer, Actualizar, Eliminar)
- **Gestión de visibilidad** de preguntas (ocultar/mostrar)
- **Importación/Exportación** de preguntas en formato JSON
- **Validación en tiempo real** de preguntas y respuestas

### 📊 Características Técnicas
- **Base de datos Supabase** para almacenamiento persistente
- **Diseño responsivo** y moderno con CSS personalizado
- **Sistema de sonido** con Tone.js para efectos de audio
- **Sin dependencias pesadas** - implementación ligera y eficiente
- **Interfaz intuitiva** con transiciones suaves y animaciones

## 🚀 Cómo Jugar

1. **Acceso al Juego**: Ingresa tu nombre en la pantalla de inicio
2. **Modo Administrador**: Usa "taiyangadm" para acceder al panel de administración
3. **Comenzar Partida**: El sistema cargará 10 preguntas aleatorias sobre Medicina China
4. **Responder Preguntas**: 
   - Selecciona la respuesta correcta antes de que se acabe el tiempo
   - Cuanto más rápido respondas, más puntos obtendrás
   - Las respuestas correctas se destacan en verde, las incorrectas en rojo
5. **Ver Resultados**: Al finalizar, verás tu puntuación y posición en el ranking global
6. **Volver a Jugar**: Puedes jugar nuevamente para mejorar tu puntuación

## 📋 Estructura del Proyecto

```
quiz-medicina-china/
├── index.html              # Página principal con todas las pantallas
├── css/
│   ├── quiz-styles.css    # Estilos principales del juego
│   └── styles.css         # Estilos adicionales
├── js/
│   ├── quiz-game.js       # Lógica principal del juego
│   ├── quiz-admin.js      # Panel de administrador
│   ├── quiz-supabase.js   # Conexión con base de datos
│   ├── quiz-sound.js      # Gestión de sonidos
│   ├── quiz-utils.js      # Utilidades y validaciones
│   ├── quiz-main.js       # Punto de entrada y navegación
│   └── ...                # Otros módulos auxiliares
└── README.md             # Este archivo
```

## 🎨 Pantallas del Juego

### 🏠 Pantalla de Inicio
- Campo para ingresar nombre del jugador
- Acceso al ranking global
- Indicador de conexión con la base de datos

### 🎮 Pantalla de Juego
- Información del jugador y rol (administrador/jugador)
- Contador de preguntas y puntuación actual
- Pregunta con temporizador visual
- Opciones de respuesta (2-3 opciones)
- Barra de tiempo con cambio de colores

### 🏆 Pantalla de Resultados
- Puntuación final obtenida
- Detalle de respuestas correctas
- Ranking global con posición actual
- Opciones para jugar de nuevo o acceder al panel admin

### ⚙️ Panel de Administrador
- Formulario para crear/editar preguntas
- Lista de preguntas existentes con opciones de edición
- Botones para importar/exportar preguntas
- Toggle para mostrar preguntas visibles/ocultas

## 📊 Formato de Preguntas

Las preguntas siguen este formato JSON:

```json
{
  "version": "1.0",
  "exportDate": "2025-01-04T12:00:00.000Z",
  "totalQuestions": 5,
  "questions": [
    {
      "question_text": "¿Cuál es uno de los cinco elementos en la Medicina Tradicional China?",
      "answers": ["Fuego", "Hierro", "Cristal"],
      "correct_answer": 0
    }
  ]
}
```

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura y semántica
- **CSS3**: Estilos modernos con variables CSS y animaciones
- **JavaScript ES6+**: Lógica del juego con clases y módulos
- **Supabase**: Base de datos en la nube para persistencia de datos
- **Tone.js**: Biblioteca de audio para efectos de sonido

## 🎯 Temas de Medicina China

El juego incluye preguntas sobre:
- 🌿 **Teoría de los Cinco Elementos** (Madera, Fuego, Tierra, Metal, Agua)
- ☯️ **Concepto de Yin-Yang** y equilibrio energético
- 🧭 **Meridianos y Canales** energéticos del cuerpo
- 🏥 **Órganos y Vísceras** y sus correspondencias
- ⚡ **Qi (Chi)** - energía vital y su flujo
- 🌡️ **Principios de Diagnóstico** y patrón de síndromes

## 📱 Compatibilidad

- ✅ **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- ✅ **Dispositivos móviles** y tablets
- ✅ **Diseño responsivo** que se adapta a diferentes tamaños
- ✅ **Sin instalación** requerida - juega directamente en el navegador

## 🎵 Efectos de Sonido

El juego incluye efectos de sonido para:
- **Inicio de partida**: Sonido energizante
- **Respuesta correcta**: Tono positivo y satisfactorio
- **Respuesta incorrecta**: Tono suave de error
- **Fin del juego**: Melodía de celebración

---

¡Prepárate para poner a prueba tus conocimientos sobre la Medicina Tradicional China y compite por el primer lugar en el ranking global! 🏆