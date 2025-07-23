# Ecommerce TIKNO Project

Proyecto de ecommerce desarrollado con React y Django, utilizando Supabase para almacenamiento de imágenes y base de datos PostgreSQL.

## Estado Actual del Proyecto

Actualmente el proyecto se encuentra en la **Fase 5 completada** según el plan de desarrollo. Se han implementado:

- ✅ **FASE 1**: Configuración Inicial del Backend Django
- ✅ **FASE 2**: Sistema de Autenticación
- ✅ **FASE 3**: Modelos de Ecommerce
- ✅ **FASE 4**: Gestión de Imágenes con Supabase Storage
- ✅ **FASE 5**: API REST con Django REST Framework

En progreso:
- 🔄 **FASE 6-11**: Desarrollo del Frontend y funcionalidades avanzadas

## Estructura del Proyecto

```
ecommerce-project/
├── frontend/           # React + Tailwind + Framer Motion + PNPM
├── backend/            # Django + DRF + Supabase
├── requirements.txt    # Dependencias Python
└── README.md
```

## Tecnologías Utilizadas

### Backend
- Django
- Django REST Framework
- PostgreSQL (Supabase)
- Supabase Storage para imágenes
- JWT Authentication

### Frontend
- React
- Tailwind CSS
- Framer Motion para animaciones
- Axios para peticiones HTTP
- React Router para navegación
- React Hook Form para formularios

## Configuración del Proyecto

### Requisitos Previos
- Python 3.8+
- Node.js 14+
- PNPM (recomendado) o NPM
- Cuenta en Supabase

### Configuración del Backend

1. Navegar al directorio del backend:
   ```
   cd backend
   ```

2. Crear un entorno virtual:
   ```
   python -m venv venv
   ```

3. Activar el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Instalar dependencias:
   ```
   pip install -r requirements.txt
   ```

5. Crear archivo `.env` con las siguientes variables:
   ```
   SECRET_KEY=your_secret_key
   DEBUG=True
   DB_PASSWORD=your_supabase_db_password
   DB_HOST=your_supabase_db_host
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

6. Ejecutar migraciones:
   ```
   python manage.py migrate
   ```

7. Iniciar el servidor:
   ```
   python manage.py runserver
   ```

### Configuración del Frontend

1. Navegar al directorio del frontend:
   ```
   cd frontend
   ```

2. Instalar dependencias:
   ```
   pnpm install
   # o
   npm install
   ```

3. Crear archivo `.env` con las siguientes variables:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Iniciar el servidor de desarrollo:
   ```
   pnpm start
   # o
   npm start
   ```

## Características Implementadas

### Backend
- Sistema de autenticación completo con JWT
- Modelos para productos, categorías, carrito y órdenes
- API REST para todas las entidades
- Gestión de imágenes con Supabase Storage
- Permisos personalizados y validaciones robustas
- Manejo de errores consistente

### Frontend
- Autenticación de usuarios
- Visualización de productos y categorías
- Carrito de compras
- Lista de deseos
- Perfil de usuario
- Checkout
- Animaciones fluidas con Framer Motion

## Próximos Pasos

- Completar el panel de administración
- Implementar optimizaciones de imágenes
- Añadir funcionalidades avanzadas de UX
- Configurar para producción
- Implementar tests y documentación

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.