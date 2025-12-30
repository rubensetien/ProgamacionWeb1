import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // ✅ Correct path
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/admin/gestion/GestionProductos.css';
import '../../../styles/admin/gestion/GestionTurnos.css'; // ✅ Correct path

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionTurnos = () => {
    const { token } = useAuth(); // Usar token del contexto
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionSel, setUbicacionSel] = useState('');
    const [trabajadores, setTrabajadores] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [fechaInicioSemana, setFechaInicioSemana] = useState(getLunesActual());
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);
    // const [mensaje, setMensaje] = useState(null);

    // Obtener el lunes de la semana actual
    function getLunesActual() {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar al lunes
        const lunes = new Date(d.setDate(diff));
        lunes.setHours(0, 0, 0, 0);
        return lunes;
    }

    // Generar días de la semana seleccionada
    const diasSemana = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(fechaInicioSemana);
        d.setDate(d.getDate() + i);
        return d;
    });

    useEffect(() => {
        if (token) fetchUbicaciones();
    }, [token]);

    useEffect(() => {
        if (ubicacionSel) {
            fetchTrabajadoresYTurnos();
        }
    }, [ubicacionSel, fechaInicioSemana]);

    const fetchUbicaciones = async () => {
        try {
            if (!token) return;
            const res = await axios.get(`${API_URL}/api/ubicaciones`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Ubicaciones cargadas:', res.data); // Debug

            const data = res.data.data || [];
            if (Array.isArray(data)) {
                setUbicaciones(data);
                if (data.length > 0) {
                    setUbicacionSel(data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error cargando ubicaciones:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error cargando tiendas',
                toast: true,
                position: 'top-end',
                timer: 4000
            });
        }
    };

    // ... (rest of code)



    const fetchTrabajadoresYTurnos = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // 1. Obtener trabajadores de esta ubicación
            // Nota: Podríamos filtrar en cliente si la API devuelve todos, 
            // pero idealmente deberíamos tener un endpoint para esto. 
            // Usamos el endpoint de trabajadores y filtramos por ahora.
            const resTrabajadores = await axios.get(`${API_URL}/api/usuarios/trabajadores`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filtrar solo los de la ubicación seleccionada
            const dataTrabajadores = resTrabajadores.data.data || [];
            console.log('👷 Trabajadores cargados (Total):', dataTrabajadores.length, dataTrabajadores);
            console.log('🏪 Ubicación seleccionada:', ubicacionSel);

            const trabajadoresDeTienda = Array.isArray(dataTrabajadores)
                ? dataTrabajadores.filter(t => {
                    const ubicacionRefId = t.ubicacionAsignada?.referencia?._id || t.ubicacionAsignada?.referencia;
                    const tiendaRefId = t.tiendaAsignada?._id || t.tiendaAsignada;

                    const matchUbicacion = String(ubicacionRefId || '') === String(ubicacionSel || '');
                    const matchTienda = String(tiendaRefId || '') === String(ubicacionSel || '');

                    if (matchUbicacion || matchTienda) return true;
                    return false;
                })
                : [];

            console.log('✅ Trabajadores filtrados para esta tienda:', trabajadoresDeTienda.length);
            setTrabajadores(trabajadoresDeTienda);

            // 2. Obtener turnos existentes
            const fechaFin = new Date(fechaInicioSemana);
            fechaFin.setDate(fechaFin.getDate() + 6);
            fechaFin.setHours(23, 59, 59, 999);

            const resTurnos = await axios.get(`${API_URL}/api/turnos`, {
                params: {
                    ubicacion: ubicacionSel,
                    inicio: fechaInicioSemana.toISOString(),
                    fin: fechaFin.toISOString()
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setTurnos(resTurnos.data.data || []);

        } catch (error) {
            console.error('Error cargando datos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error cargando datos',
                toast: true,
                position: 'top-end',
                timer: 4000
            });
        } finally {
            setLoading(false);
        }
    };

    const cambiarSemana = (dias) => {
        const nuevaFecha = new Date(fechaInicioSemana);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        setFechaInicioSemana(nuevaFecha);
    };

    const getTurno = (usuarioId, fecha) => {
        const fechaStr = fecha.toISOString().split('T')[0];
        return turnos.find(t =>
            t.usuario._id === usuarioId &&
            new Date(t.fecha).toISOString().split('T')[0] === fechaStr
        );
    };

    const handleTurnoChange = (usuarioId, fecha, nuevoTipo) => {
        const fechaStr = fecha.toISOString().split('T')[0];

        // Actualizar estado local optimistamente
        const index = turnos.findIndex(t =>
            t.usuario._id === usuarioId &&
            new Date(t.fecha).toISOString().split('T')[0] === fechaStr
        );

        const newTurnos = [...turnos];
        if (index >= 0) {
            newTurnos[index] = { ...newTurnos[index], tipo: nuevoTipo };
        } else {
            newTurnos.push({
                usuario: { _id: usuarioId }, // Estructura mínima para busqueda local
                fecha: fecha,
                tipo: nuevoTipo
            });
        }
        setTurnos(newTurnos);
    };

    const guardarCambios = async () => {
        setGuardando(true);
        try {
            // Preparar payload
            // Filtramos solo los turnos que corresponden a la semana y ubicación actuales
            // Y formateamos correctamente para el backend

            // PRECAUCIÓN: El estado 'turnos' tiene objetos mezclados (del backend y nuevos locales).
            // Necesitamos normalizar.

            const payload = turnos.map(t => ({
                usuario: t.usuario._id || t.usuario, // Puede ser objeto o ID
                ubicacion: ubicacionSel,
                fecha: t.fecha,
                tipo: t.tipo
            }));

            await axios.post(`${API_URL}/api/turnos/batch`,
                { turnos: payload },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: 'Turnos guardados correctamente',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            // Recargar para asegurar consistencia
            fetchTrabajadoresYTurnos();

        } catch (error) {
            console.error('Error guardando turnos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar cambios',
                toast: true,
                position: 'top-end',
                timer: 4000
            });
        } finally {
            setGuardando(false);
        }
    };

    const tiposTurno = [
        { id: 'mañana', label: 'Mañana', color: '#ffecbd', texto: '#d35400' },
        { id: 'tarde', label: 'Tarde', color: '#ffcc80', texto: '#e67e22' }, /* Naranja más fuerte */
        { id: 'noche', label: 'Noche', color: '#34495e', texto: '#ecf0f1' },
        { id: 'libre', label: 'Libre', color: '#e8f8f5', texto: '#27ae60' },
        { id: 'vacaciones', label: 'Vacaciones', color: '#fadbd8', texto: '#c0392b' },
    ];

    const getEstiloTurno = (tipo) => {
        const config = tiposTurno.find(t => t.id === tipo);
        return config ? { backgroundColor: config.color, color: config.texto } : {};
    };

    return (
        <div className="gestion-container fade-in">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>Gestión de Turnos</h2>
                    <p className="header-description">Administra el calendario laboral y turnos por tienda</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-nuevo"
                        onClick={guardarCambios}
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* Alerta eliminada, reemplazada con SweetAlert2 */}

            <div className="filtros-bar">
                <div className="select-container">
                    <label>Seleccionar Tienda:</label>
                    <select
                        className="select-filter"
                        value={ubicacionSel}
                        onChange={(e) => setUbicacionSel(e.target.value)}
                    >
                        {Array.isArray(ubicaciones) && ubicaciones.map(u => (
                            <option key={u._id} value={u._id}>{u.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="week-selector">
                    <button className="btn-nav-week" onClick={() => cambiarSemana(-7)}>← Anterior</button>
                    <span className="current-week">
                        {fechaInicioSemana.toLocaleDateString()} -
                        {new Date(new Date(fechaInicioSemana).setDate(fechaInicioSemana.getDate() + 6)).toLocaleDateString()}
                    </span>
                    <button className="btn-nav-week" onClick={() => cambiarSemana(7)}>Siguiente →</button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div className="tabla-container">
                    <div className="grid-turnos">
                        {/* Header Días */}
                        <div className="grid-header-row">
                            <div className="grid-cell-header worker-col">Trabajador</div>
                            {diasSemana.map((dia, index) => (
                                <div key={index} className="grid-cell-header day-col">
                                    <div className="day-name">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][index]}</div>
                                    <div className="day-date">{dia.getDate()}</div>
                                </div>
                            ))}
                        </div>

                        {/* Filas Trabajadores */}
                        {trabajadores.length === 0 ? (
                            <div className="empty-state-row">No hay trabajadores asignados a esta tienda.</div>
                        ) : (
                            trabajadores.map(trabajador => (
                                <div key={trabajador._id} className="grid-row">
                                    <div className="grid-cell worker-name">
                                        <div className="avatar-mini">
                                            {trabajador.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{trabajador.nombre}</span>
                                    </div>
                                    {diasSemana.map((dia, index) => {
                                        const turno = getTurno(trabajador._id, dia);
                                        const tipoActual = turno?.tipo || 'libre'; // Default a libre visualmente si no hay registro? O null?

                                        return (
                                            <div key={index} className="grid-cell turno-cell">
                                                <select
                                                    className="turno-select"
                                                    value={tipoActual || ''}
                                                    onChange={(e) => handleTurnoChange(trabajador._id, dia, e.target.value)}
                                                    style={getEstiloTurno(tipoActual)}
                                                >
                                                    <option value="">--</option>
                                                    {tiposTurno.map(t => (
                                                        <option key={t.id} value={t.id}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTurnos;
