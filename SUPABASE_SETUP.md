# Configuración de Supabase para el Sistema de Ranking

Este documento explica cómo configurar Supabase para el sistema de ranking del juego Snake.

## Requisitos previos

1. Una cuenta en [Supabase](https://supabase.com) (gratuita)
2. Un proyecto creado en Supabase

## Paso 1: Crear un proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Completa los detalles del proyecto:
   - Nombre del proyecto
   - Contraseña de la base de datos (guárdala en un lugar seguro)
   - Región (elige la más cercana a tus usuarios)
5. Haz clic en "Create new project"

## Paso 2: Crear la tabla de ranking

1. En tu proyecto de Supabase, ve a la sección **SQL Editor**
2. Copia todo el contenido del archivo `supabase-setup.sql`
3. Pégalo en el editor SQL
4. Haz clic en "Run" para ejecutar el script

Esto creará:
- La tabla `snake_rankings` con las columnas necesarias
- Índices para optimizar las consultas
- Políticas de Row Level Security (RLS) para permitir lectura e inserción públicas
- Una vista `top_10_rankings` para obtener fácilmente el top 10

## Paso 3: Obtener las credenciales de API

1. En tu proyecto de Supabase, ve a **Settings** (icono de engranaje)
2. Selecciona **API** en el menú lateral
3. Encontrarás dos valores importantes:
   - **Project URL**: La URL de tu proyecto (ej: `https://xxxxx.supabase.co`)
   - **anon public**: La clave pública (API Key)

## Paso 4: Configurar el juego

Abre el archivo `js/config.js` y reemplaza los valores vacíos con tus credenciales:

```javascript
export const CONFIG = {
    // Configuración de Supabase
    SUPABASE_URL: 'https://tu-proyecto.supabase.co', // Reemplaza con tu URL
    SUPABASE_KEY: 'tu-anon-key-aqui', // Reemplaza con tu anon key

    // ... resto de la configuración
}
```

## Paso 5: Probar la conexión

1. Abre el juego en tu navegador
2. Abre la consola del navegador (F12)
3. Si ves el mensaje "Conexión a Supabase establecida correctamente", ¡todo está funcionando!
4. Si ves "No se pudo conectar a Supabase, usando localStorage", verifica:
   - Que las credenciales sean correctas
   - Que la tabla `snake_rankings` exista
   - Que las políticas de RLS estén habilitadas

## Funcionalidades del Sistema de Ranking

### Almacenamiento dual

El sistema funciona con dos modos:

1. **Modo Supabase (preferido)**:
   - Guarda los puntajes en la nube
   - Los rankings son compartidos entre todos los usuarios
   - Permanecen aunque se cierre el navegador

2. **Modo localStorage (fallback)**:
   - Si Supabase no está configurado o hay un error de conexión
   - Los puntajes se guardan localmente en el navegador
   - Solo visibles en ese navegador específico

### Características

- **Top 10**: Solo se muestran los 10 mejores puntajes
- **Medallas**: Los 3 primeros lugares tienen medallas 🥇🥈🥉
- **Tiempo real**: Los puntajes se actualizan inmediatamente
- **Ordenamiento**: Ordenados por puntaje descendente

## Verificar los datos en Supabase

1. Ve a tu proyecto en Supabase
2. Selecciona **Table Editor**
3. Haz clic en la tabla `snake_rankings`
4. Verás todos los puntajes guardados

Puedes:
- Ver todos los registros
- Filtrar por jugador
- Ordenar por puntaje o fecha
- Exportar los datos

## Seguridad

El sistema usa Row Level Security (RLS) de Supabase:

- ✅ **Lectura pública**: Cualquiera puede ver el ranking
- ✅ **Inserción pública**: Cualquiera puede agregar puntajes
- ❌ **Actualización bloqueada**: No se pueden modificar puntajes existentes
- ❌ **Eliminación bloqueada**: Solo los administradores pueden eliminar registros

## Solución de problemas

### Error: "HTTP 401 Unauthorized"
- Verifica que la `SUPABASE_KEY` sea correcta
- Asegúrate de usar la "anon public" key, no la "service_role" key

### Error: "HTTP 404 Not Found"
- Verifica que la `SUPABASE_URL` sea correcta
- Asegúrate de que no tenga espacios o caracteres extra

### Error: "HTTP 406 Not Acceptable"
- La tabla `snake_rankings` no existe
- Ejecuta el script `supabase-setup.sql`

### Los puntajes no se guardan
- Verifica las políticas de RLS
- Abre la consola del navegador para ver errores
- Verifica que la tabla tenga las columnas correctas

## Consultas útiles

### Ver el top 10
```sql
SELECT * FROM top_10_rankings;
```

### Ver todos los puntajes de un jugador
```sql
SELECT * FROM snake_rankings
WHERE player_name = 'NombreDelJugador'
ORDER BY score DESC;
```

### Ver estadísticas
```sql
SELECT
    COUNT(*) as total_games,
    AVG(score) as average_score,
    MAX(score) as high_score,
    MIN(score) as low_score
FROM snake_rankings;
```

### Eliminar todos los puntajes (úsalo con cuidado)
```sql
DELETE FROM snake_rankings;
```

## Próximos pasos

Ahora que el sistema de ranking está configurado, puedes:

1. Personalizar los estilos del ranking en `css/styles.css`
2. Agregar más estadísticas (racha más larga, promedio de puntos, etc.)
3. Implementar un sistema de autenticación para jugadores registrados
4. Agregar rankings por período de tiempo (día, semana, mes)
5. Crear tablas de clasificación adicionales por región o categoría

## Soporte

Si tienes problemas con la configuración:

1. Revisa la consola del navegador para mensajes de error
2. Verifica la documentación oficial de Supabase: https://supabase.com/docs
3. Abre un issue en el repositorio del proyecto

¡Disfruta tu juego Snake con ranking en la nube! 🐍🏆
