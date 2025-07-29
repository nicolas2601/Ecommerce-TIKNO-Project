# Despliegue del Frontend en Vercel 🚀

## ¿Por qué Vercel?

Vercel es la plataforma ideal para aplicaciones React porque:
- ✅ **Optimizado para React**: Creado por el equipo de Next.js
- ✅ **Deploy automático**: Se conecta directamente con GitHub
- ✅ **CDN global**: Rendimiento superior
- ✅ **Configuración cero**: Detecta automáticamente React
- ✅ **Gratis para proyectos personales**
- ✅ **Mejor DX (Developer Experience)**

## Pasos para el Despliegue

### 1. Preparar el Proyecto

1. Asegúrate de que tu código esté en GitHub
2. El frontend debe estar en la carpeta `frontend/`
3. Verifica que el build funcione localmente:
   ```bash
   cd frontend
   npm run build
   ```

### 2. Desplegar en Vercel

#### Opción A: Desde la Web (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign up" y conecta tu cuenta de GitHub
3. Haz clic en "New Project"
4. Selecciona tu repositorio `Ecommerce-tikno`
5. Configura el proyecto:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (se detecta automáticamente)
   - **Output Directory**: `build` (se detecta automáticamente)
   - **Install Command**: `npm install` (se detecta automáticamente)

#### Opción B: Desde la CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde el directorio frontend
cd frontend
vercel

# Seguir las instrucciones en pantalla
```

### 3. Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto → Settings → Environment Variables:

```
REACT_APP_API_URL=https://ecommerce-tikno-project.onrender.com/api
REACT_APP_BACKEND_URL=https://ecommerce-tikno-project.onrender.com
REACT_APP_EMAILJS_SERVICE_ID=service_xyedtcf
REACT_APP_EMAILJS_TEMPLATE_ID=template_spa9mzi
REACT_APP_EMAILJS_PUBLIC_KEY=fIaYfvRPFP9q1xd6f
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_yoyhrrg
REACT_APP_SUPABASE_URL=https://zhpoebrhphrtraeoooxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocG9lYnJocGhydHJhZW9vb3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODc0NTcsImV4cCI6MjA2NjM2MzQ1N30.hK61usDKGVJjsLQlc3yubrqBzfjI5_4TA3iNL7nH8is
GENERATE_SOURCEMAP=false
REACT_APP_NODE_ENV=production
```

**💡 Tip**: Puedes configurar diferentes valores para Production, Preview y Development.

### 4. Configuración CORS en el Backend

Una vez desplegado en Vercel, obtendrás una URL como `https://ecommerce-tikno-frontend.vercel.app`

Actualiza el backend en `backend/ecommerce_backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://ecommerce-tikno-frontend.vercel.app",  # Tu URL de Vercel
    "https://tu-dominio-personalizado.com",  # Si usas dominio custom
]
```

### 5. Configuración Automática con vercel.json

Vercel detecta automáticamente React, pero puedes crear un `vercel.json` para configuraciones avanzadas:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 6. Ventajas de Vercel vs Render

| Característica | Vercel | Render |
|---|---|---|
| **Velocidad de deploy** | ⚡ 30-60 segundos | 🐌 2-5 minutos |
| **CDN Global** | ✅ Edge Network | ✅ CDN básico |
| **Configuración** | 🎯 Zero-config | ⚙️ Manual |
| **React optimizado** | ✅ Nativo | ❌ Genérico |
| **Preview deploys** | ✅ Automático | ❌ Manual |
| **Dominio custom** | ✅ Gratis | ✅ Gratis |
| **Analytics** | ✅ Incluido | ❌ No |

### 7. URLs Finales

- **Backend**: https://ecommerce-tikno-project.onrender.com
- **Frontend**: https://ecommerce-tikno-frontend.vercel.app
- **Admin Panel**: https://ecommerce-tikno-project.onrender.com/admin
- **Preview URLs**: Automáticas en cada PR

### 8. Flujo de Desarrollo

1. **Desarrollo local**: `npm start` (apunta a localhost:8000)
2. **Push a GitHub**: Vercel despliega automáticamente
3. **Preview**: Cada PR genera una URL de preview
4. **Producción**: Merge a main despliega a producción

### 9. Comandos Útiles

```bash
# Deploy manual
vercel --prod

# Ver logs
vercel logs

# Ver dominios
vercel domains

# Configurar dominio custom
vercel domains add tu-dominio.com
```

## 🚀 Ventajas de esta Arquitectura

✅ **Frontend en Vercel**: Optimizado para React, deploy rápido, CDN global
✅ **Backend en Render**: Ideal para Django, base de datos PostgreSQL
✅ **Separación de responsabilidades**: Cada servicio optimizado para su propósito
✅ **Escalabilidad**: Cada parte puede escalar independientemente
✅ **Costo-efectivo**: Aprovecha lo mejor de cada plataforma

## 📝 Próximos Pasos

1. ✅ Subir código a GitHub
2. ⏳ Crear proyecto en Vercel
3. ⏳ Configurar variables de entorno
4. ⏳ Actualizar CORS en backend
5. ⏳ Probar integración completa
6. ⏳ Configurar dominio personalizado (opcional)

## 🔧 Troubleshooting

### Error de Build
- Verifica que `npm run build` funcione localmente
- Revisa las variables de entorno en Vercel
- Checa los logs en el dashboard de Vercel

### Error de CORS
- Asegúrate de añadir la URL de Vercel al backend
- Redespliega el backend después de cambiar CORS
- Verifica que las URLs no tengan trailing slash

### Variables de Entorno
- Deben empezar con `REACT_APP_`
- Se configuran en Vercel dashboard
- Requieren redeploy para aplicarse