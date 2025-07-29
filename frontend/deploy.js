#!/usr/bin/env node

/**
 * Script de despliegue automatizado para el frontend
 * Prepara el proyecto para despliegue en Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando proceso de despliegue del frontend...');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: No se encontró package.json. Ejecuta este script desde el directorio frontend.');
  process.exit(1);
}

// Verificar variables de entorno de producción
if (!fs.existsSync('.env.production')) {
  console.error('❌ Error: No se encontró .env.production');
  process.exit(1);
}

console.log('✅ Archivos de configuración encontrados');

// Limpiar build anterior
if (fs.existsSync('build')) {
  console.log('🧹 Limpiando build anterior...');
  execSync('rm -rf build', { stdio: 'inherit' });
}

// Instalar dependencias
console.log('📦 Instalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias:', error.message);
  process.exit(1);
}

// Ejecutar tests (opcional)
console.log('🧪 Ejecutando tests...');
try {
  execSync('npm test -- --coverage --watchAll=false', { stdio: 'inherit' });
  console.log('✅ Tests pasaron correctamente');
} catch (error) {
  console.warn('⚠️  Advertencia: Algunos tests fallaron, pero continuando...');
}

// Construir para producción
console.log('🏗️  Construyendo para producción...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completado');
} catch (error) {
  console.error('❌ Error en el build:', error.message);
  process.exit(1);
}

// Verificar que el build se creó correctamente
if (!fs.existsSync('build/index.html')) {
  console.error('❌ Error: El build no se completó correctamente');
  process.exit(1);
}

console.log('🎉 ¡Frontend listo para despliegue en Vercel!');
console.log('📋 Próximos pasos:');
console.log('   1. Sube los cambios a tu repositorio Git');
console.log('   2. Ve a vercel.com y conecta tu repositorio');
console.log('   3. Selecciona la carpeta "frontend" como Root Directory');
console.log('   4. Configura las variables de entorno según DESPLIEGUE_FRONTEND.md');
console.log('   5. Actualiza CORS en el backend con la nueva URL de Vercel');
console.log('');
console.log('🚀 Alternativamente, usa Vercel CLI:');
console.log('   npm i -g vercel');
console.log('   vercel --prod');
console.log('');
console.log('📖 Más info en: DESPLIEGUE_FRONTEND.md');