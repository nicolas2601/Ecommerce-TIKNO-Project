# E-commerce Frontend

Frontend de la aplicación de e-commerce construido con React, Tailwind CSS y Supabase.

## Características

- ✅ Autenticación completa con Supabase
- ✅ Formularios con validación usando React Hook Form + Yup
- ✅ Diseño moderno y responsivo con Tailwind CSS
- ✅ Rutas protegidas
- ✅ Dashboard de usuario
- ✅ Gestión de estado con Context API

## Tecnologías utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **React Router DOM** - Enrutamiento
- **Supabase** - Backend como servicio (autenticación, base de datos)
- **Tailwind CSS** - Framework de CSS utilitario
- **React Hook Form** - Gestión de formularios
- **Yup** - Validación de esquemas
- **Axios** - Cliente HTTP

## Configuración

### 1. Variables de entorno

Configura las siguientes variables en el archivo `.env`:

```env
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
REACT_APP_API_URL=http://localhost:8000/api
```

### 2. Instalación de dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   └── ForgotPasswordForm.js
│   ├── Dashboard.js
│   └── ProtectedRoute.js
├── contexts/
│   └── AuthContext.js
├── lib/
│   └── supabase.js
├── App.js
├── index.js
└── index.css
```

## Funcionalidades implementadas

### Autenticación
- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Recuperación de contraseña
- ✅ Cierre de sesión
- ✅ Rutas protegidas

### Formularios
- ✅ Validación en tiempo real
- ✅ Mensajes de error personalizados
- ✅ Estados de carga
- ✅ Diseño responsivo

## Scripts disponibles

### `npm start`

Ejecuta la aplicación en modo desarrollo.
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

### `npm test`

Ejecuta las pruebas en modo interactivo.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.

### `npm run eject`

**Nota: esta es una operación irreversible. Una vez que hagas `eject`, ¡no puedes volver atrás!**

Si no estás satisfecho con las herramientas de construcción y las opciones de configuración, puedes hacer `eject` en cualquier momento.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
