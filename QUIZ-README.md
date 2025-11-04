# Quiz de Medicina China

Juego de preguntas interactivo sobre Medicina Tradicional China con sistema de puntuación, ranking global y panel de administración.

## 🎮 Características

### Funcionalidades Principales

- **Sistema de Login**: Ingresa tu nombre para comenzar
- **Modo Administrador**: Usa el nombre "taiyangadm" para acceder al panel admin
- **10 Preguntas por Juego**: Cada partida incluye 10 preguntas aleatorias
- **Sistema de Puntuación Inteligente**:
  - 10 puntos por respuesta correcta
  - -1 punto por cada segundo transcurrido
  - 3 segundos de gracia para leer la pregunta
  - Mínimo 1 punto por respuesta correcta
- **Preguntas con 2-3 Alternativas**: Variedad en las opciones de respuesta
- **Ranking Global**: Los mejores puntajes se guardan en Supabase
- **Panel de Administrador**: Crear, editar y eliminar preguntas
- **Diseño Responsivo**: Optimizado para móvil y escritorio
- **Animaciones y Gradientes**: Interfaz visual atractiva

### Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Animaciones, gradientes y diseño responsivo
- **JavaScript ES6+**: Módulos, clases y async/await
- **Supabase**: Base de datos PostgreSQL en la nube
- **LocalStorage**: Para futuras mejoras

## 📋 Requisitos Previos

1. **Cuenta de Supabase**: [Crear cuenta gratuita](https://supabase.com)
2. **Navegador Moderno**: Chrome, Firefox, Safari o Edge
3. **Servidor Local**: Para ejecutar la aplicación (Python, Node.js o PHP)

## 🚀 Instalación

### 1. Clonar o Descargar el Proyecto

```bash
git clone <tu-repositorio>
cd claude-code-test
```

### 2. Configurar Supabase

#### a) Crear las Tablas

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **SQL Editor**
3. Copia y ejecuta el contenido de `supabase-schema.sql`

Este script creará:
- Tabla `questions`: Para almacenar las preguntas
- Tabla `ranking`: Para almacenar las puntuaciones
- Índices para optimizar consultas
- Políticas de seguridad (RLS)

#### b) Insertar Preguntas Iniciales

1. En el mismo **SQL Editor**
2. Copia y ejecuta el contenido de `supabase-initial-data.sql`

Esto insertará 10 preguntas de medicina china para comenzar.

### 3. Configurar Variables de Entorno

El archivo `.env` ya está configurado con tus credenciales. Si necesitas actualizarlo:

```env
SUPABASE_URL=https://mjllipisteslliluhvar.supabase.co
SUPABASE_ANON_KEY=tu_clave_aqui
```

**IMPORTANTE**: El archivo `.env` está en `.gitignore` para proteger tus credenciales.

### 4. Iniciar Servidor Local

Elige uno de los siguientes métodos:

#### Con Python 3:
```bash
python -m http.server 8000
```

#### Con Node.js:
```bash
npx serve
```

#### Con PHP:
```bash
php -S localhost:8000
```

### 5. Abrir la Aplicación

Navega a: `http://localhost:8000/quiz.html`

## 🎯 Cómo Jugar

### Modo Jugador

1. **Login**: Ingresa tu nombre en la pantalla inicial
2. **Espera**: La app verifica la conexión con Supabase
3. **Juega**: Responde las 10 preguntas lo más rápido posible
4. **Puntuación**:
   - Cada respuesta correcta vale 10 puntos
   - Se resta 1 punto por cada segundo después de los 3 segundos de gracia
   - Ejemplo: Si respondes correctamente en 8 segundos → 10 - (8-3) = 5 puntos
5. **Ranking**: Al finalizar, ve tu posición en el ranking global

### Modo Administrador

1. **Login**: Ingresa "taiyangadm" como nombre
2. **Juega**: Completa el juego normalmente
3. **Panel Admin**: Al finalizar, haz clic en "Panel Admin"
4. **Gestión de Preguntas**:
   - **Crear**: Completa el formulario y guarda
   - **Editar**: Haz clic en el botón ✏️ de cualquier pregunta
   - **Eliminar**: Haz clic en el botón 🗑️ (requiere confirmación)

### Reglas de Preguntas

- El texto de la pregunta no puede estar vacío
- Debe haber entre 2 y 3 respuestas
- Todas las respuestas deben tener texto
- Debe marcarse una respuesta como correcta

## 📁 Estructura del Proyecto

```
claude-code-test/
├── quiz.html                      # Página principal del quiz
├── css/
│   └── quiz-styles.css           # Estilos con animaciones
├── js/
│   ├── quiz-main.js              # Punto de entrada
│   ├── quiz-game.js              # Lógica del juego
│   ├── quiz-admin.js             # Panel de administrador
│   ├── quiz-supabase.js          # Cliente de Supabase
│   └── quiz-utils.js             # Utilidades (toasts, validaciones)
├── supabase-schema.sql           # Script para crear tablas
├── supabase-initial-data.sql     # 10 preguntas iniciales
├── .env                          # Variables de entorno (NO subir a git)
├── .gitignore                    # Archivos ignorados por git
└── QUIZ-README.md                # Este archivo
```

## 🎨 Características de Diseño

### Colores y Gradientes

- **Primario**: Gradiente púrpura-azul (#667eea → #764ba2)
- **Éxito**: Verde (#10b981)
- **Error**: Rojo (#ef4444)
- **Advertencia**: Naranja (#f59e0b)

### Animaciones

- **FadeIn**: Transición suave al cargar pantallas
- **SlideUp**: Animación de entrada de tarjetas
- **Pulse**: Efecto en respuestas correctas
- **Shake**: Efecto en respuestas incorrectas
- **Gradient Shift**: Fondo animado

### Responsive

- **Desktop**: Diseño completo con sidebar
- **Tablet**: Layout adaptado
- **Móvil**: Vista optimizada para pantallas pequeñas

## 🔒 Seguridad

### Supabase Row Level Security (RLS)

Las políticas configuradas permiten:
- ✅ Lectura de preguntas y ranking para todos
- ✅ Inserción de nuevas preguntas y puntuaciones
- ✅ Actualización y eliminación de preguntas

### Protección de Credenciales

- El archivo `.env` está en `.gitignore`
- Las credenciales se cargan desde el archivo JS (en producción, usar variables de entorno del servidor)

## 🐛 Solución de Problemas

### Error de Conexión con Supabase

**Problema**: "Error al conectar con Supabase"

**Soluciones**:
1. Verifica que las credenciales en `.env` y `quiz-supabase.js` sean correctas
2. Asegúrate de que las tablas estén creadas
3. Revisa que RLS esté configurado correctamente
4. Verifica tu conexión a internet

### No hay Preguntas Disponibles

**Problema**: "No hay preguntas disponibles en la base de datos"

**Soluciones**:
1. Ejecuta el script `supabase-initial-data.sql`
2. Usa el panel de administrador para agregar preguntas manualmente
3. Verifica que la tabla `questions` exista

### El Timer no Funciona Correctamente

**Problema**: El contador de tiempo se comporta extraño

**Soluciones**:
1. Recarga la página
2. Limpia la caché del navegador
3. Verifica la consola del navegador para errores JavaScript

## 📝 Preguntas de Medicina China Incluidas

1. Los cinco elementos
2. Concepto de Yin
3. Meridianos principales
4. Órgano asociado al elemento Madera
5. Energía vital Qi
6. Técnica de acupuntura
7. Emoción del Corazón
8. Órgano Yin del elemento Agua
9. Práctica de Qi Gong
10. Diagnóstico por pulso y lengua

## 🚀 Próximas Mejoras

- [ ] Categorías de preguntas
- [ ] Dificultad variable
- [ ] Modo multijugador
- [ ] Estadísticas detalladas por jugador
- [ ] Compartir resultados en redes sociales
- [ ] Sonidos y efectos de audio
- [ ] Modo oscuro

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## 👥 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

¡Diviértete jugando y aprendiendo sobre Medicina Tradicional China! 🏥🎮
