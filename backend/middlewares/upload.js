import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear carpetas si no existen
const uploadsDir = path.join(__dirname, '../uploads');
const subdirs = ['productos', 'sabores', 'categorias', 'formatos', 'usuarios', 'brand', 'landing'];

subdirs.forEach(subdir => {
  const dirPath = path.join(uploadsDir, subdir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Función para limpiar el nombre (quitar tildes, espacios, caracteres especiales)
const limpiarNombre = (nombre) => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales por guiones
    .replace(/-+/g, '-') // Evitar guiones múltiples
    .replace(/^-|-$/g, ''); // Quitar guiones al inicio y final
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar carpeta según la ruta
    let folder = 'uploads/productos/'; // Default

    if (req.baseUrl.includes('variante') || req.path.includes('variante')) {
      folder = 'uploads/sabores/';
    } else if (req.baseUrl.includes('categoria') || req.path.includes('categoria')) {
      folder = 'uploads/categorias/';
    } else if (req.baseUrl.includes('formato') || req.path.includes('formato')) {
      folder = 'uploads/formatos/';
    } else if (req.baseUrl.includes('usuario') || req.path.includes('usuario')) {
      folder = 'uploads/usuarios/';
    }

    // [FIX] Validar existencia de la carpeta, si no crearla (aunque el inicio del script lo hace, nuevas categorias dinámicas podrian fallar si usaramos nombres dinámicos)
    // Por ahora todo va a productos si es un producto. 
    // El usuario dice "no se carga... se guarda en productos pero no en dulces".
    // Esto implica que QUIZAS el frontend espera 'uploads/dulces' o la ruta estática falla.

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Obtener nombre del body
    const nombre = req.body.nombre || 'archivo';

    // Limpiar el nombre
    const nombreLimpio = limpiarNombre(nombre);

    // Obtener extensión
    const ext = path.extname(file.originalname).toLowerCase();

    // Añadir timestamp
    const timestamp = Date.now();

    // Nombre final: chocolate-1234567890.jpg
    cb(null, `${nombreLimpio}-${timestamp}${ext}`);
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter,
});

export default upload;
