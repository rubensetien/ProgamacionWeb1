import { useState, useEffect } from 'react';
import '../../../styles/admin/gestion/GestionProductos.css'; // Reutilizamos estilos
import Pagination from '../../common/Pagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function GestionTrabajadores() {
    const [trabajadores, setTrabajadores] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [trabajadorEditando, setTrabajadorEditando] = useState(null);

    // Filtros y Paginación
    const [busqueda, setBusqueda] = useState('');
    const [rolFiltro, setRolFiltro] = useState('todos');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(3);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [formulario, setFormulario] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        rol: 'trabajador',
        tipoTrabajador: '',
        ubicacionAsignada: {
            tipo: '',
            referencia: ''
        },
        activo: true
    });

    useEffect(() => {
        cargarDatos();
    }, [page, limit, rolFiltro]);

    // Debounce para búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            cargarDatos();
        }, 500);
        return () => clearTimeout(timer);
    }, [busqueda]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');

            // Construir query params
            const queryParams = new URLSearchParams({
                page,
                limit,
                rol: rolFiltro
            });

            if (busqueda) queryParams.append('search', busqueda);

            // Cargar trabajadores y ubicaciones (para el modal)
            const [usuariosRes, ubicacionesRes] = await Promise.all([
                fetch(`${API_URL}/api/usuarios/trabajadores?${queryParams}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/ubicaciones?activo=true&limit=100`, { // Traer suficientes ubicaciones
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const usuariosData = await usuariosRes.json();
            const ubicacionesData = await ubicacionesRes.json();

            if (usuariosData.success) {
                setTrabajadores(usuariosData.data);
                setTotal(usuariosData.total || 0);
                setTotalPages(usuariosData.pages || 1);
            } else {
                setError(usuariosData.message || 'Error al cargar trabajadores');
            }

            if (ubicacionesData.success) {
                setUbicaciones(ubicacionesData.data);
            }

        } catch (err) {
            setError('Error al cargar datos: ' + err.message);
        } finally {
            setCargando(false);
        }
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setTrabajadorEditando(null);
        setFormulario({
            nombre: '',
            email: '',
            password: '',
            telefono: '',
            rol: 'trabajador',
            tipoTrabajador: '',
            ubicacionAsignada: {
                tipo: '',
                referencia: ''
            },
            activo: true
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (trabajador) => {
        setModoEdicion(true);
        setTrabajadorEditando(trabajador);
        setFormulario({
            nombre: trabajador.nombre,
            email: trabajador.email,
            password: '',
            telefono: trabajador.telefono || '',
            rol: trabajador.rol,
            tipoTrabajador: trabajador.tipoTrabajador || '',
            ubicacionAsignada: {
                tipo: trabajador.ubicacionAsignada?.tipo || '',
                referencia: trabajador.ubicacionAsignada?.referencia?._id || trabajador.ubicacionAsignada?.referencia || ''
            },
            activo: trabajador.activo !== false
        });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const url = modoEdicion
                ? `${API_URL}/api/usuarios/${trabajadorEditando._id}`
                : `${API_URL}/api/usuarios`;

            const method = modoEdicion ? 'PUT' : 'POST';

            // Preparar payload
            const payload = {
                nombre: formulario.nombre,
                email: formulario.email,
                telefono: formulario.telefono,
                rol: formulario.rol,
                activo: formulario.activo
            };

            // Password solo si es nuevo o si se escribió algo al editar
            if (!modoEdicion || (modoEdicion && formulario.password)) {
                payload.password = formulario.password;
            }

            // Ubicación asignada solo si se seleccionó una
            if (formulario.ubicacionAsignada.referencia) {
                const ubicacionSel = ubicaciones.find(u => u._id === formulario.ubicacionAsignada.referencia);
                if (ubicacionSel) {
                    // Mapear tipos de ubicación a tipos de asignación permitidos en Usuario
                    let tipoAsignacion = 'tienda';

                    if (ubicacionSel.tipo === 'punto-venta' || ubicacionSel.tipo === 'cafeteria') {
                        tipoAsignacion = 'tienda';
                    } else if (ubicacionSel.tipo === 'obrador') {
                        tipoAsignacion = 'obrador';
                    } else if (ubicacionSel.tipo === 'oficina') {
                        tipoAsignacion = 'oficina';
                    }

                    payload.ubicacionAsignada = {
                        tipo: tipoAsignacion, // El tipo de la ubicación física
                        referencia: ubicacionSel._id
                    };

                    // Si es trabajador, usamos el sub-rol seleccionado explícitamente
                    if (formulario.rol === 'trabajador' && formulario.tipoTrabajador) {
                        payload.tipoTrabajador = formulario.tipoTrabajador;
                    } else {
                        // Fallback lógica anterior (inferir de ubicación) si no se seleccionó nada (ej: gestor)
                        payload.tipoTrabajador = tipoAsignacion;
                    }
                }
            } else {
                payload.ubicacionAsignada = null;
                // Si no hay ubicación y es trabajador, mantenemos el tipo seleccionado si existe
                if (formulario.rol === 'trabajador' && formulario.tipoTrabajador) {
                    payload.tipoTrabajador = formulario.tipoTrabajador;
                }
            }

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
                throw new Error(data.message || 'Error al guardar trabajador');
            }

            setMostrarModal(false);
            cargarDatos(); // Recargar lista
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEliminar = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este trabajador?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
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
        } catch (err) {
            setError(err.message);
        }
    };

    // No cliente-side filter
    const trabajadoresList = trabajadores;

    // Obtener nombre de ubicación de forma segura
    const getNombreUbicacion = (trabajador) => {
        // Intentar obtener del objeto poblado
        if (trabajador.ubicacionAsignada?.referencia?.nombre) {
            return trabajador.ubicacionAsignada.referencia.nombre;
        }
        // O quizás está en el campo legacy tiendaAsignada
        if (trabajador.tiendaAsignada?.nombre) {
            return trabajador.tiendaAsignada.nombre;
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>Sin asignar</span>;
    };

    if (cargando && page === 1 && !trabajadores.length) {
        return (
            <div className="gestion-productos" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: '#666', fontWeight: 500 }}>Cargando trabajadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>Gestión de Trabajadores</h2>
                    <p className="header-description">
                        Administra el personal, roles y asignaciones
                    </p>
                </div>
                <button className="btn-nuevo" onClick={abrirModalNuevo}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nuevo Trabajador
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

            <div className="filtros-bar">
                <div className="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    value={rolFiltro}
                    onChange={(e) => {
                        setRolFiltro(e.target.value);
                        setPage(1);
                    }}
                    className="select-filter"
                >
                    <option value="todos">Todos los roles</option>
                    <option value="trabajador">Trabajador</option>
                    <option value="tienda">Cuenta de Tienda</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>

            <div className="tabla-container">
                <table className="tabla-productos">
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>EMAIL</th>
                            <th>ROL</th>
                            <th>UBICACIÓN ASIGNADA</th>
                            <th>TELÉFONO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trabajadoresList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    <p>No se encontraron trabajadores</p>
                                </td>
                            </tr>
                        ) : (
                            trabajadoresList.map(trabajador => (
                                <tr key={trabajador._id}>
                                    <td className="td-producto">
                                        <span style={{ fontWeight: 600 }}>{trabajador.nombre}</span>
                                    </td>
                                    <td>{trabajador.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className={`badge`} style={{
                                                background: trabajador.rol === 'admin' ? '#fecaca' : trabajador.rol === 'tienda' ? '#ddd6fe' : '#dbeafe',
                                                color: trabajador.rol === 'admin' ? '#991b1b' : trabajador.rol === 'tienda' ? '#5b21b6' : '#1e40af',
                                                textTransform: 'capitalize'
                                            }}>
                                                {trabajador.rol === 'tienda' ? 'CUENTA TIENDA' : trabajador.rol.replace('-', ' ')}
                                            </span>
                                            {trabajador.tipoTrabajador && (
                                                <span style={{ fontSize: '0.8em', color: '#666', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                                    {trabajador.tipoTrabajador}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{getNombreUbicacion(trabajador)}</td>
                                    <td>{trabajador.telefono || '-'}</td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="btn-icono btn-editar"
                                                onClick={() => abrirModalEditar(trabajador)}
                                                title="Editar"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-icono btn-eliminar"
                                                onClick={() => handleEliminar(trabajador._id)}
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

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                itemsPerPage={limit}
                onItemsPerPageChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
                totalItems={total}
            />

            {mostrarModal && (
                <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modoEdicion ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h3>
                            <button className="btn-close" onClick={() => setMostrarModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={formulario.nombre}
                                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formulario.email}
                                        onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                                        required
                                        disabled={modoEdicion} // Email suele ser inmutable o check unico
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formulario.telefono}
                                        onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    {modoEdicion ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *'}
                                </label>
                                <input
                                    type="password"
                                    value={formulario.password}
                                    onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                                    required={!modoEdicion}
                                    minLength={6}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Rol *</label>
                                    <select
                                        value={formulario.rol}
                                        onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}
                                    >
                                        <option value="trabajador">Trabajador</option>
                                        <option value="tienda">Cuenta de Tienda (Entidad)</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                {formulario.rol === 'trabajador' && (
                                    <div className="form-group">
                                        <label>Tipo (Sub-rol) *</label>
                                        <select
                                            value={formulario.tipoTrabajador || ''}
                                            onChange={(e) => setFormulario({ ...formulario, tipoTrabajador: e.target.value })}
                                            required
                                        >
                                            <option value="">-- Seleccionar Función --</option>
                                            <option value="tienda">Personal de Tienda</option>
                                            <option value="obrador">Personal de Obrador</option>
                                            <option value="repartidor">Repartidor</option>
                                            <option value="oficina">Personal de Oficina</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Asignar a Base/Ubicación *</label>
                                <select
                                    value={formulario.ubicacionAsignada.referencia}
                                    onChange={(e) => setFormulario({
                                        ...formulario,
                                        ubicacionAsignada: { ...formulario.ubicacionAsignada, referencia: e.target.value }
                                    })}
                                    required={formulario.rol !== 'admin'}
                                >
                                    <option value="">-- Seleccionar Ubicación --</option>
                                    {ubicaciones.map(u => (
                                        <option key={u._id} value={u._id}>
                                            {u.nombre} ({u.tipo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formulario.activo}
                                        onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                                    />
                                    <span>Usuario Activo</span>
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-guardar">
                                    {modoEdicion ? 'Actualizar' : 'Crear'} Trabajador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
