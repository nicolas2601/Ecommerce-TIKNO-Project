# Frontend - Ecommerce Tikno

## 🚀 Configuración del Proyecto

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Backend desplegado en Render

### Instalación

```bash
cd frontend
npm install
```

## 🛠️ Desarrollo Local

### Configuración de Variables de Entorno

El proyecto usa diferentes archivos de entorno:

- `.env.local` - Desarrollo local (apunta a localhost:8000)
- `.env.production` - Producción (apunta a Render)
- `.env` - Configuración actual (modificada para producción)

### Comandos Disponibles

```bash
# Desarrollo local
npm start                 # Inicia servidor de desarrollo
npm run start:prod       # Inicia con variables de producción

# Testing
npm test                 # Ejecuta tests en modo watch
npm run test:coverage    # Ejecuta tests con coverage

# Build
npm run build            # Construye para producción
npm run build:analyze    # Construye y sirve localmente

# Calidad de código
npm run lint             # Verifica código con ESLint
npm run lint:fix         # Corrige errores automáticamente

# Despliegue
npm run deploy:prepare   # Prepara proyecto para despliegue
```

## 🚀 Despliegue en Vercel

### ¿Por qué Vercel?

- ✅ **Optimizado para React**: Zero-config deployment
- ✅ **Deploy automático**: Conecta con GitHub
- ✅ **CDN Global**: Rendimiento superior
- ✅ **Preview URLs**: Para cada PR automáticamente
- ✅ **Gratis**: Para proyectos personales

### Pasos para Desplegar

1. **Preparar el Proyecto**
   ```bash
   npm run build  # Verificar que funcione
   git push       # Subir a GitHub
   ```

2. **Desplegar en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `Ecommerce-tikno`
   - Configura:
     - **Framework**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Variables de Entorno en Vercel**
   En Settings → Environment Variables:
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

4. **Actualizar CORS en Backend**
   Una vez obtengas la URL de Vercel (ej: `https://ecommerce-tikno-frontend.vercel.app`), actualiza `CORS_ALLOWED_ORIGINS` en el backend.

### Comandos Vercel CLI

```bash
# Instalar CLI
npm i -g vercel

# Deploy desde terminal
vercel --prod

# Ver logs
vercel logs
```

## 📁 Estructura del Proyecto

```
frontend/
├── public/              # Archivos públicos
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── contexts/        # Contextos de React
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Páginas principales
│   ├── services/       # Servicios API
│   ├── styles/         # Estilos globales
│   └── utils/          # Utilidades
├── .env.local          # Variables desarrollo local
├── .env.production     # Variables producción
├── deploy.js           # Script de despliegue
└── render.yaml         # Configuración Render
```

## 🔧 Tecnologías Utilizadas

- **React 19** - Framework principal
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Framer Motion** - Animaciones
- **Supabase** - Autenticación y storage
- **EmailJS** - Envío de emails

## 🔐 Configuración de Servicios

### Supabase
- URL: `https://zhpoebrhphrtraeoooxx.supabase.co`
- Usado para autenticación y almacenamiento de archivos

### EmailJS
- Service ID: `service_xyedtcf`
- Usado para formularios de contacto

### Backend API
- Desarrollo: `http://localhost:8000/api`
- Producción: `https://ecommerce-tikno-project.onrender.com/api`

### URLs del Proyecto
- **Frontend**: `https://ecommerce-tikno-frontend.vercel.app`
- **Backend**: `https://ecommerce-tikno-project.onrender.com`
- **Admin**: `https://ecommerce-tikno-project.onrender.com/admin`

## 🚨 Solución de Problemas

### Error de CORS
Si ves errores de CORS, verifica que:
1. El backend incluya la URL del frontend en `CORS_ALLOWED_ORIGINS`
2. Las variables de entorno estén configuradas correctamente

### Error de Build
Si el build falla:
1. Ejecuta `npm run lint:fix`
2. Verifica que todas las variables de entorno estén definidas
3. Ejecuta `npm run test:coverage` para verificar tests

### Variables de Entorno no Funcionan
Recuerda que en React:
- Las variables deben empezar con `REACT_APP_`
- Reinicia el servidor después de cambiar variables
- En producción, configúralas en el dashboard de Render

## 📝 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Crear proyecto en Vercel
3. ⏳ Actualizar CORS en backend con URL de Vercel
4. ⏳ Probar integración completa
5. ⏳ Configurar dominio personalizado (opcional)
6. ⏳ Configurar analytics y monitoring

## 🎯 Arquitectura Final

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │────│   Backend       │────│   Database      │
│   (Vercel)      │    │   (Render)      │    │   (Supabase)    │
│                 │    │                 │    │                 │
│ • React App     │    │ • Django API    │    │ • PostgreSQL    │
│ • Static Files  │    │ • Admin Panel   │    │ • Auth          │
│ • CDN Global    │    │ • File Storage  │    │ • File Storage  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Ventajas de esta arquitectura:**
- 🚀 **Performance**: Frontend optimizado en Vercel
- 🔧 **Mantenimiento**: Backend robusto en Render
- 💾 **Datos**: Base de datos confiable en Supabase
- 💰 **Costo**: Aprovecha planes gratuitos
- 📈 **Escalabilidad**: Cada servicio puede crecer independientemente

## 🤝 Contribución

Para contribuir al proyecto:
1. Ejecuta `npm run lint` antes de hacer commit
2. Asegúrate de que todos los tests pasen
3. Usa commits descriptivos
4. Prueba en desarrollo local antes de desplegar