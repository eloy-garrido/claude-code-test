# Snake Game - Juego de la Serpiente

Un juego clásico de Snake con gráficos modernos, sistema de vidas, puntaje y ranking. Desarrollado con arquitectura modular y buenas prácticas de JavaScript.

## Características

- **Gráficos atractivos**: Diseño moderno con gradientes, sombras y animaciones
- **Sistema de 3 vidas**: Tienes 3 oportunidades antes de que termine el juego
- **Sistema de puntaje**: Gana 10 puntos por cada manzana que comas
- **Ranking persistente**: Los mejores puntajes se guardan y se muestran en un top 10
- **Dificultad progresiva**: El juego se vuelve más rápido a medida que subes tu puntaje
- **Interfaz intuitiva**: Controles simples con las flechas del teclado
- **Código modular**: Arquitectura organizada en módulos ES6

## Estructura del Proyecto

```
snake-game/
├── index.html              # Página principal del juego
├── css/
│   └── styles.css         # Estilos y diseño visual
├── js/
│   ├── main.js            # Punto de entrada de la aplicación
│   ├── game.js            # Lógica principal del juego
│   ├── config.js          # Configuración y constantes
│   ├── ranking.js         # Sistema de ranking y localStorage
│   └── ui.js              # Gestión de interfaz de usuario
└── README.md              # Documentación
```

### Descripción de archivos

#### `index.html`
Estructura HTML del juego con elementos del DOM para el canvas, modales y controles.

#### `css/styles.css`
Estilos completos del juego incluyendo:
- Diseño responsive
- Gradientes y animaciones
- Estilos de modales y ranking
- Efectos hover y transiciones

#### `js/main.js`
Punto de entrada que inicializa el juego cuando el DOM está listo.

#### `js/config.js`
Archivo de configuración centralizada con:
- Dimensiones del canvas y grid
- Velocidades del juego
- Puntuación y vidas
- Paleta de colores
- Tamaños de elementos

#### `js/game.js`
Clase principal `SnakeGame` que contiene:
- Lógica del juego (movimiento, colisiones, puntuación)
- Renderizado del canvas (serpiente, comida, grid)
- Gestión del estado del juego
- Manejo de eventos del teclado

#### `js/ranking.js`
Clase `RankingManager` para:
- Guardar y recuperar puntajes
- Gestión de localStorage
- Ordenamiento y filtrado del top 10
- Validación de posiciones

#### `js/ui.js`
Clase `UIManager` que maneja:
- Referencias a elementos del DOM
- Actualización de displays (puntaje, vidas, nombre)
- Gestión de modales
- Visualización del ranking
- Interacciones de UI

## Cómo jugar

1. Abre el archivo `index.html` en tu navegador web
2. Ingresa tu nombre cuando se te solicite
3. Haz clic en "Comenzar" o "Iniciar Juego"
4. Usa las flechas del teclado para controlar la serpiente:
   - ⬆️ Flecha arriba: Mover hacia arriba
   - ⬇️ Flecha abajo: Mover hacia abajo
   - ⬅️ Flecha izquierda: Mover hacia la izquierda
   - ➡️ Flecha derecha: Mover hacia la derecha
5. Come las manzanas rojas para crecer y ganar puntos
6. Evita chocar con las paredes o con tu propio cuerpo

## Objetivo

Obtén el puntaje más alto posible comiendo manzanas. Cada manzana vale 10 puntos. Tienes 3 vidas, así que puedes cometer errores, pero cada colisión te costará una vida.

## Sistema de ranking

El juego guarda automáticamente los 10 mejores puntajes en el almacenamiento local de tu navegador. Al terminar una partida, verás el ranking completo con medallas para los 3 primeros lugares:

- 🥇 Primer lugar
- 🥈 Segundo lugar
- 🥉 Tercer lugar

## Tecnologías utilizadas

- **HTML5 Canvas**: Para renderizado de gráficos 2D
- **CSS3**: Diseño moderno con gradientes, flexbox y animaciones
- **JavaScript ES6+**: Módulos, clases, arrow functions
- **LocalStorage API**: Persistencia de datos del ranking

## Instalación

No requiere instalación ni dependencias. Simplemente abre el archivo `index.html` en cualquier navegador web moderno.

### Servidor local (opcional)

Si prefieres usar un servidor local:

```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve

# Con PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Compatibilidad

El juego es compatible con todos los navegadores modernos que soporten:
- HTML5 Canvas
- ES6 Modules
- LocalStorage

Navegadores probados:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Personalización

Puedes personalizar el juego modificando `js/config.js`:

```javascript
export const CONFIG = {
    CANVAS_WIDTH: 600,        // Ancho del canvas
    CANVAS_HEIGHT: 600,       // Alto del canvas
    GRID_SIZE: 20,            // Tamaño de cada celda
    INITIAL_SPEED: 100,       // Velocidad inicial (ms)
    POINTS_PER_FOOD: 10,      // Puntos por manzana
    INITIAL_LIVES: 3,         // Número de vidas
    // ... más opciones
};
```

## Desarrollo

### Arquitectura

El proyecto sigue principios de:
- **Separación de responsabilidades**: Cada módulo tiene una función específica
- **Encapsulación**: Uso de clases para agrupar lógica relacionada
- **Modularidad**: Código dividido en módulos reutilizables
- **Configuración centralizada**: Constantes en un solo lugar

### Flujo de la aplicación

1. `main.js` inicializa el juego
2. `SnakeGame` crea instancias de `RankingManager` y `UIManager`
3. Se configura el estado inicial desde `config.js`
4. Se establecen event listeners
5. El loop del juego actualiza y renderiza cada frame
6. Los puntajes se guardan en `RankingManager` al terminar

## Licencia

Este proyecto es de código abierto y está disponible para uso educativo y personal.

---

¡Diviértete jugando y que consigas el mejor puntaje! 🐍🎮
