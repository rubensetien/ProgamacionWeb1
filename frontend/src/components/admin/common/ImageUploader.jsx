import { useState } from 'react';
import '../../../styles/admin/ImageUploader.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ImageUploader = ({ 
  tipo, // 'producto', 'variante', 'categoria'
  imagenActual, 
  onImagenCargada,
  nombre // Nombre del producto/sabor para el archivo
}) => {
  const [previsualizacion, setPrevisualizacion] = useState(imagenActual || null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setError(null);

    // Mostrar previsualización
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrevisualizacion(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir imagen
    await subirImagen(file);
  };

  const subirImagen = async (file) => {
    setCargando(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('imagen', file);
      formData.append('nombre', nombre || 'archivo');

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/upload/${tipo}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onImagenCargada(data.data.url);
      } else {
        setError(data.message || 'Error al subir la imagen');
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setError('Error al subir la imagen');
    } finally {
      setCargando(false);
    }
  };

  const eliminarImagen = () => {
    setPrevisualizacion(null);
    onImagenCargada(null);
  };

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">Imagen</label>
      
      <div className="image-uploader-container">
        {previsualizacion ? (
          <div className="image-preview">
            <img src={previsualizacion} alt="Previsualización" />
            <button
              type="button"
              className="btn-eliminar-imagen"
              onClick={eliminarImagen}
              disabled={cargando}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <label className="upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={cargando}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="upload-text">
              {cargando ? 'Subiendo...' : 'Haz clic o arrastra una imagen'}
            </p>
            <p className="upload-hint">PNG, JPG, WEBP (máx. 5MB)</p>
          </label>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
};

export default ImageUploader;
