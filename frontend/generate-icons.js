// generate-icons.js - Generador automático de iconos PWA
// Uso: node generate-icons.js <ruta-imagen-base>

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tamaños de iconos requeridos para PWA
const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Tamaños de splash screens para iOS
const SPLASH_SIZES = [
  { width: 640, height: 1136, name: 'iphone5_splash.png' },
  { width: 750, height: 1334, name: 'iphone6_splash.png' },
  { width: 1242, height: 2208, name: 'iphoneplus_splash.png' },
  { width: 1125, height: 2436, name: 'iphonex_splash.png' },
  { width: 828, height: 1792, name: 'iphonexr_splash.png' },
  { width: 1242, height: 2688, name: 'iphonexsmax_splash.png' },
  { width: 1536, height: 2048, name: 'ipad_splash.png' },
  { width: 1668, height: 2224, name: 'ipadpro1_splash.png' },
  { width: 2048, height: 2732, name: 'ipadpro2_splash.png' }
];

async function generateIcons(inputPath) {
  try {
    console.log('🎨 Generando iconos PWA...\n');

    // Crear directorios
    const iconsDir = join(__dirname, 'public', 'icons');
    const splashDir = join(__dirname, 'public', 'splash');
    
    await mkdir(iconsDir, { recursive: true });
    await mkdir(splashDir, { recursive: true });

    // Cargar imagen base
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`📐 Imagen base: ${metadata.width}x${metadata.height}px\n`);

    // Generar iconos
    console.log('🖼️  Generando iconos...');
    for (const { size, name } of ICON_SIZES) {
      const outputPath = join(iconsDir, name);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✅ ${name} (${size}x${size}px)`);
    }

    // Generar splash screens
    console.log('\n📱 Generando splash screens...');
    for (const { width, height, name } of SPLASH_SIZES) {
      const outputPath = join(splashDir, name);
      
      // Crear un canvas con el color de fondo
      const canvas = sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 102, g: 126, b: 234, alpha: 1 } // Color tema
        }
      });

      // Calcular tamaño del logo (30% del ancho)
      const logoSize = Math.floor(width * 0.3);
      
      // Redimensionar logo
      const resizedLogo = await sharp(inputPath)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      // Centrar el logo en el canvas
      await canvas
        .composite([{
          input: resizedLogo,
          top: Math.floor((height - logoSize) / 2),
          left: Math.floor((width - logoSize) / 2)
        }])
        .png()
        .toFile(outputPath);
      
      console.log(`  ✅ ${name} (${width}x${height}px)`);
    }

    console.log('\n✨ ¡Iconos generados exitosamente!');
    console.log(`\n📁 Ubicación:`);
    console.log(`   - Iconos: ${iconsDir}`);
    console.log(`   - Splash: ${splashDir}`);

  } catch (error) {
    console.error('❌ Error al generar iconos:', error.message);
    process.exit(1);
  }
}

// Ejecutar
const inputPath = process.argv[2];

if (!inputPath) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║          Generador de Iconos PWA - Catálogo Regma        ║
╚═══════════════════════════════════════════════════════════╝

Uso:
  node generate-icons.js <ruta-imagen-base>

Ejemplo:
  node generate-icons.js ./logo.png

Requisitos:
  - Imagen cuadrada recomendada (mínimo 512x512px)
  - Formato: PNG, JPG, SVG o WebP
  - Fondo transparente recomendado

Genera:
  ✅ 8 iconos de diferentes tamaños (72px - 512px)
  ✅ 9 splash screens para iOS
  
`);
  process.exit(1);
}

generateIcons(inputPath);