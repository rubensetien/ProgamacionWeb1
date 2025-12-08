import { useState, useEffect } from 'react';
import '../../../styles/admin/gestion/GestionProductos.css'; // Reutilizamos estilos por ahora

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function GestionUbicaciones() {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [ubicacionEditando, setUbicacionEditando] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('todos');

    const [formulario, setFormulario] = useState({
        nombre: '',
        codigo: '',
        tipo: 'punto-venta',
        direccion: { calle: '', ciudad: '', codigoPostal: '', provincia: '' },
        contacto: { telefono: '', email: '', horario: '' },
        coordenadas: { latitud: '', longitud: '' },
        aceptaPedidos: true,
        capacidadDiaria: 50,
        activo: true,
        descripcion: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL}/api/ubicaciones`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setUbicaciones(data.data);
            } else {
                setError(data.message || 'Error al cargar ubicaciones');
            }
        } catch (err) {
            setError('Error al cargar datos: ' + err.message);
        } finally {
            setCargando(false);
        }
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setUbicacionEditando(null);
        setFormulario({
            nombre: '',
            codigo: '',
            tipo: 'punto-venta',
            direccion: { calle: '', ciudad: '', codigoPostal: '', provincia: '' },
            contacto: { telefono: '', email: '', horario: '' },
            coordenadas: { latitud: '', longitud: '' },
            aceptaPedidos: true,
            capacidadDiaria: 50,
            activo: true,
            descripcion: ''
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (ubicacion) => {
        setModoEdicion(true);
        setUbicacionEditando(ubicacion);
        setFormulario({
            nombre: ubicacion.nombre,
            codigo: ubicacion.codigo,
            tipo: ubicacion.tipo,
            direccion: {
                calle: ubicacion.direccion?.calle || '',
                ciudad: ubicacion.direccion?.ciudad || '',
                codigoPostal: ubicacion.direccion?.codigoPostal || '',
                provincia: ubicacion.direccion?.provincia || ''
            },
            contacto: {
                telefono: ubicacion.contacto?.telefono || '',
                email: ubicacion.contacto?.email || '',
                horario: ubicacion.contacto?.horario || ''
            },
            coordenadas: {
                latitud: ubicacion.coordenadas?.latitud || '',
                longitud: ubicacion.coordenadas?.longitud || ''
            },
            aceptaPedidos: ubicacion.aceptaPedidos,
            capacidadDiaria: ubicacion.capacidadDiaria || 50,
            activo: ubicacion.activo,
            descripcion: ubicacion.descripcion || ''
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const url = modoEdicion
                ? `${API_URL}/api/ubicaciones/${ubicacionEditando._id}`
                : `${API_URL}/api/ubicaciones`;

            const method = modoEdicion ? 'PUT' : 'POST';

            // Limpiar datos vacíos antes de enviar
            const payload = { ...formulario };
            if (!payload.coordenadas.latitud || !payload.coordenadas.longitud) {
                delete payload.coordenadas;
            }
            // Asegurar que codigoPostal y otros no sean null string
            if (!payload.direccion.codigoPostal) payload.direccion.codigoPostal = '';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Error al guardar ubicación');
            }

            setMostrarModal(false);
            cargarDatos();
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Estás seguro de eliminar/desactivar esta ubicación?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/ubicaciones/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Error al eliminar');
            }

            cargarDatos();
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const ubicacionesFiltradas = ubicaciones.filter(u => {
        const matchBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.codigo.toLowerCase().includes(busqueda.toLowerCase());
        const matchTipo = tipoFiltro === 'todos' || u.tipo === tipoFiltro;
        return matchBusqueda && matchTipo;
    });

    if (cargando) {
        return (
            <div className="gestion-productos">
                <div className="loading-spinner">Cargando ubicaciones...</div>
            </div>
        );
    }

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>Gestión de Tiendas y Ubicaciones</h2>
                    <p className="header-description">
                        Administra las tiendas, obradores y puntos de venta
                    </p>
                </div>
                <button className="btn-nuevo" onClick={abrirModalNuevo}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nueva Ubicación
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-value">{ubicaciones.length}</div>
                    <div className="stat-label">ubicaciones totales</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {ubicaciones.filter(u => u.activo).length}
                    </div>
                    <div className="stat-label">activas</div>
                </div>
            </div>

            <div className="filtros-bar">
                <div className="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    className="select-filter"
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="punto-venta">Punto de Venta</option>
                    <option value="cafeteria">Cafetería</option>
                    <option value="obrador">Obrador</option>
                    <option value="oficina">Oficina</option>
                </select>
            </div>

            <div className="tabla-container">
                <table className="tabla-productos">
                    <thead>
                        <tr>
                            <th>CÓDIGO</th>
                            <th>NOMBRE</th>
                            <th>TIPO</th>
                            <th>DIRECCIÓN</th>
                            <th>CONTACTO</th>
                            <th>PEDIDOS</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ubicacionesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    <p>No se encontraron ubicaciones</p>
                                </td>
                            </tr>
                        ) : (
                            ubicacionesFiltradas.map(ubicacion => (
                                <tr key={ubicacion._id}>
                                    <td className="td-sku">{ubicacion.codigo}</td>
                                    <td className="td-producto">
                                        <span style={{ fontWeight: 600 }}>{ubicacion.nombre}</span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            fontSize: '0.85rem',
                                            textTransform: 'capitalize'
                                        }}>
                                            {ubicacion.tipo}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {ubicacion.direccion?.calle}, {ubicacion.direccion?.ciudad}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                            {ubicacion.contacto?.telefono}
                                        </div>
                                    </td>
                                    <td>
                                        {ubicacion.aceptaPedidos ? (
                                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>SÍ</span>
                                        ) : (
                                            <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280', fontSize: '0.7rem' }}>NO</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${ubicacion.activo ? 'badge-success' : 'badge-inactive'}`}>
                                            {ubicacion.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="btn-icono btn-editar"
                                                onClick={() => abrirModalEditar(ubicacion)}
                                                title="Editar"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-icono btn-eliminar"
                                                onClick={() => handleEliminar(ubicacion._id)}
                                                title="Eliminar"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>{modoEdicion ? 'Editar Ubicación' : 'Nueva Ubicación'}</h3>
                            <button className="btn-close" onClick={() => setMostrarModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input
                                        type="text"
                                        value={formulario.nombre}
                                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Código *</label>
                                    <input
                                        type="text"
                                        value={formulario.codigo}
                                        onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                                        required
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo *</label>
                                    <select
                                        value={formulario.tipo}
                                        onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                                        required
                                    >
                                        <option value="punto-venta">Punto de Venta</option>
                                        <option value="cafeteria">Cafetería</option>
                                        <option value="obrador">Obrador</option>
                                        <option value="oficina">Oficina</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label" style={{ marginTop: '28px' }}>
                                        <input
                                            type="checkbox"
                                            checked={formulario.aceptaPedidos}
                                            onChange={(e) => setFormulario({ ...formulario, aceptaPedidos: e.target.checked })}
                                        />
                                        <span>Acepta Pedidos (Recogida)</span>
                                    </label>
                                </div>
                            </div>

                            <h4>Dirección</h4>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Calle</label>
                                    <input
                                        type="text"
                                        value={formulario.direccion.calle}
                                        onChange={(e) => setFormulario({
                                            ...formulario,
                                            direccion: { ...formulario.direccion, calle: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ciudad</label>
                                    <input
                                        type="text"
                                        value={formulario.direccion.ciudad}
                                        onChange={(e) => setFormulario({
                                            ...formulario,
                                            direccion: { ...formulario.direccion, ciudad: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Código Postal</label>
                                    <input
                                        type="text"
                                        value={formulario.direccion.codigoPostal}
                                        onChange={(e) => setFormulario({
                                            ...formulario,
                                            direccion: { ...formulario.direccion, codigoPostal: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Provincia</label>
                                    <input
                                        type="text"
                                        value={formulario.direccion.provincia}
                                        onChange={(e) => setFormulario({
                                            ...formulario,
                                            direccion: { ...formulario.direccion, provincia: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <h4>Contacto</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        value={formulario.contacto.telefono}
                                        onChange={(e) => setFormulario({
                                            ...formulario,
                                            contacto: { ...formulario.contacto, telefono: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formulario.contacto.email}
                                        onChange={(e) => setFormulario({
                                            ...formulario,
                                            contacto: { ...formulario.contacto, email: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Horario</label>
                                <input
                                    type="text"
                                    value={formulario.contacto.horario}
                                    onChange={(e) => setFormulario({
                                        ...formulario,
                                        contacto: { ...formulario.contacto, horario: e.target.value }
                                    })}
                                    placeholder="Ej: L-D: 10:00 - 22:00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formulario.descripcion}
                                    onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formulario.activo}
                                        onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                                    />
                                    <span>Ubicación Activa</span>
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    {modoEdicion ? 'Actualizar' : 'Crear'} Ubicación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
