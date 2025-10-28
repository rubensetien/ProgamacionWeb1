import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear carpeta uploads si no existe
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Obtener nombre del producto del body
    const nombreProducto = req.body.nombre || 'producto';
    
    // Limpiar el nombre
    const nombreLimpio = limpiarNombre(nombreProducto);
    
    // Obtener extensión
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Añadir timestamp para evitar duplicados si hay dos productos con mismo nombre
    const timestamp = Date.now();
    
    // Nombre final: nata-1234567890.jpg
    cb(null, `${nombreLimpio}-${timestamp}${ext}`);
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
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