# Configuración de Variables de Entorno en Render

## Problema Identificado
El error 500 en el admin de producción se debe a que la aplicación está intentando conectarse al puerto 5432 (PostgreSQL directo) en lugar del puerto 6543 (Transaction Pooler de Supabase).

## Solución

### 1. Variables de Entorno Requeridas en Render

Ve al dashboard de Render → Tu servicio → Environment y configura estas variables:

```
PYTHON_VERSION=3.9.16
DEBUG=False
SECRET_KEY=z$be)cj5h1v8h9m_fc3h@ds6^^i0en=bl!zgeve5i5aassvn80
DATABASE_URL=postgresql://postgres.zhpoebrhphrtraeoooxx:Santi2601nimm246ok@aws-0-us-east-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://zhpoebrhphrtraeoooxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocG9lYnJocGhydHJhZW9vb3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODc0NTcsImV4cCI6MjA2NjM2MzQ1N30.hK61usDKGVJjsLQlc3yubrqBzfjI5_4TA3iNL7nH8is
SUPABASE_BUCKET=productos
```

### 2. Punto Clave: DATABASE_URL

La variable más importante es `DATABASE_URL` que debe apuntar al **Transaction Pooler** (puerto 6543) de Supabase, no al puerto directo 5432.

**Formato correcto:**
```
postgresql://[usuario]:[contraseña]@[host]:6543/[base_de_datos]
```

### 3. Pasos para Aplicar los Cambios

1. **Actualizar variables de entorno en Render:**
   - Ve a tu dashboard de Render
   - Selecciona tu servicio
   - Ve a "Environment"
   - Agrega/actualiza las variables listadas arriba

2. **Hacer redeploy:**
   - Después de actualizar las variables, haz un nuevo deploy
   - O simplemente haz push de los cambios al repositorio

3. **Verificar logs:**
   - Revisa los logs de deploy para asegurar que las migraciones se ejecuten correctamente
   - Verifica que no haya errores de conexión a la base de datos

### 4. Archivos Actualizados

- `render.yaml`: Incluye todas las variables de entorno necesarias
- `.env.production`: Documentación de las variables para referencia
- `settings.py`: Ya configurado para usar DATABASE_URL en producción

### 5. Verificación

Después del deploy, el admin debería funcionar correctamente en:
`https://tu-app-name.onrender.com/admin/`

## Notas Importantes

- **Seguridad:** Las credenciales están hardcodeadas en render.yaml para simplicidad, pero en un entorno real deberías usar variables de entorno secretas
- **Transaction Pooler:** Siempre usa el puerto 6543 para Supabase en producción
- **Migraciones:** El buildCommand ahora incluye `python manage.py migrate` para asegurar que la base de datos esté actualizada