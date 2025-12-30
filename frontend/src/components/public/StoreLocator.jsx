import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Fix default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (isSelected) => {
    return L.divIcon({
        className: 'custom-marker-icon',
        html: `
        <div style="
            position: relative;
            width: ${isSelected ? '48px' : '36px'};
            height: ${isSelected ? '48px' : '36px'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        ">
            <svg viewBox="0 0 24 24" fill="${isSelected ? '#ff6600' : '#FF8C00'}" stroke="white" stroke-width="1.5"
                style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); width: 100%; height: 100%;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="3.5" fill="white" />
            </svg>
            ${isSelected ? `
            <div style="
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 12px;
                height: 4px;
                background: rgba(0,0,0,0.2);
                border-radius: 50%;
                filter: blur(2px);
            "></div>` : ''}
        </div>
        `,
        iconSize: [isSelected ? 48 : 36, isSelected ? 48 : 36],
        iconAnchor: [isSelected ? 24 : 18, isSelected ? 48 : 36],
        popupAnchor: [0, isSelected ? -50 : -40]
    });
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Componente para manejar el centro del mapa y efectos
function MapEffect({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 16, {
                duration: 1.2,
                easeLinearity: 0.25
            });
        }
    }, [coords, map]);
    return null;
}

const StoreLocator = () => {
    const navigate = useNavigate();
    const { autenticado, usuario } = useAuth();
    const [tiendas, setTiendas] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [loading, setLoading] = useState(true);

    // Centro inicial (Cantabria)
    const center = [43.3949, -4.0326];

    useEffect(() => {
        fetchPublicStores();
    }, []);

    const fetchPublicStores = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/ubicaciones/publicas`);
            setTiendas(res.data.data || []);
        } catch (error) {
            console.error('Error cargando tiendas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStore = (store) => {
        setSelectedStore(store);
        if (window.innerWidth < 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Helper para iniciales
    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : 'U';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Outfit', sans-serif" }}>

            {/* Header / Nav - Modern White & Clean */}
            <header style={{
                padding: '1rem 2rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000,
                position: 'relative',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={() => navigate('/')}
                >
                    <img
                        src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                        alt="REGMA"
                        style={{ height: '40px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/productos')}
                        className="btn-nav-modern"
                        style={{
                            padding: '0.6rem 1.2rem',
                            border: '1px solid #eee',
                            background: 'white',
                            color: '#555',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                        Catálogo
                    </button>

                    {!autenticado ? (
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-nav-primary"
                            style={{
                                padding: '0.6rem 1.5rem',
                                border: 'none',
                                background: '#ff6600',
                                color: 'white',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 10px rgba(255, 102, 0, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                            Entrar
                        </button>
                    ) : (
                        <div
                            onClick={() => navigate('/perfil')}
                            title="Ir a mi perfil"
                            style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                background: '#ff6600',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '1rem',
                                border: '3px solid white', // Borde blanco prominente como en la imagen
                                boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)', // Sombra con color marca
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                            }}
                        >
                            {getInitials(usuario?.nombre)}
                        </div>
                    )}
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

                {/* 📋 LISTA LATERAL RENOVADA */}
                <div style={{
                    width: '420px',
                    background: '#fff',
                    overflowY: 'auto',
                    boxShadow: '4px 0 25px rgba(0,0,0,0.08)',
                    zIndex: 500,
                    borderRight: '1px solid #eee'
                }}>
                    <div style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '2rem', borderBottom: '2px solid #fff5eb', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.8rem', color: '#1a1a1a', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                                Tiendas <span style={{ color: '#ff6600' }}>Regma</span>
                            </h2>
                            <p style={{ color: '#7f8c8d', fontSize: '0.95rem', lineHeight: '1.4' }}>
                                {tiendas.length} ubicaciones activas cerca de ti
                            </p>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#ff6600' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: '#ff6600', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {tiendas.map(store => {
                                    const isSelected = selectedStore?._id === store._id;
                                    return (
                                        <div
                                            key={store._id}
                                            onClick={() => handleSelectStore(store)}
                                            style={{
                                                padding: '1.5rem',
                                                background: isSelected ? 'linear-gradient(to right, #fff5eb, #fff)' : 'white',
                                                borderRadius: '16px',
                                                cursor: 'pointer',
                                                border: isSelected ? '2px solid #ff6600' : '1px solid #f0f0f0',
                                                boxShadow: isSelected ? '0 10px 25px rgba(255, 102, 0, 0.15)' : '0 4px 10px rgba(0,0,0,0.02)',
                                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                transform: isSelected ? 'scale(1.02) translateX(5px)' : 'scale(1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Decoración lateral naranja si está seleccionado */}
                                            {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#ff6600' }} />}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', paddingLeft: isSelected ? '10px' : '0' }}>
                                                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem', fontWeight: 'bold' }}>{store.nombre}</h3>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '5px 10px',
                                                    borderRadius: '20px',
                                                    background: store.tipo === 'cafeteria' ? '#2c3e50' : '#ff6600',
                                                    color: 'white',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                                }}>
                                                    {store.tipo}
                                                </span>
                                            </div>

                                            <div style={{ paddingLeft: isSelected ? '10px' : '0' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', color: '#555' }}>
                                                    <div style={{ marginTop: '2px', color: '#ff6600' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>
                                                        {store.direccion.calle}, <br />
                                                        <span style={{ color: '#95a5a6', fontSize: '0.85rem' }}>{store.direccion.ciudad}</span>
                                                    </p>
                                                </div>

                                                {store.contacto?.telefono && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', marginBottom: '8px' }}>
                                                        <div style={{ color: '#ff6600' }}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .57 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.57A2 2 0 0 1 22 16.92z"></path>
                                                            </svg>
                                                        </div>
                                                        <span style={{ fontSize: '0.95rem' }}>{store.contacto.telefono}</span>
                                                    </div>
                                                )}

                                                {store.aceptaPedidos && (
                                                    <div style={{ marginTop: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f5e9', padding: '4px 12px', borderRadius: '30px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="3">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                        <span style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: '700' }}>Click & Collect</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 🗺️ MAPA INTERACTIVO */}
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <MapContainer
                        center={center}
                        zoom={10}
                        style={{ width: '100%', height: '100%', background: '#f8f9fa' }} // Fondo claro por si tarda en cargar
                        zoomControl={false}
                    >
                        {/* TileLayer estilo "Voyager" (más limpio) si fuera posible, pero usamos OSM con un filtro cálido */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            className="map-tiles-warm" // Clase para filtrar CSS si se desea
                        />

                        <MapEffect coords={selectedStore?.coordenadas ? [selectedStore.coordenadas.latitud, selectedStore.coordenadas.longitud] : null} />

                        {tiendas.map(store => (
                            store.coordenadas?.latitud && (
                                <Marker
                                    key={store._id}
                                    position={[store.coordenadas.latitud, store.coordenadas.longitud]}
                                    icon={createCustomIcon(selectedStore?._id === store._id)}
                                    eventHandlers={{
                                        click: () => handleSelectStore(store),
                                    }}
                                >
                                    <Popup className="custom-popup" closeButton={false}>
                                        <div style={{ textAlign: 'center', padding: '10px', minWidth: '200px' }}>
                                            <strong style={{ display: 'block', marginBottom: '8px', color: '#ff6600', fontSize: '1.25em', fontFamily: "'Outfit', sans-serif" }}>
                                                {store.nombre}
                                            </strong>
                                            <span style={{ fontSize: '0.95em', color: '#34495e', display: 'block', marginBottom: '5px' }}>
                                                {store.direccion.calle}
                                            </span>
                                            <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
                                                <span style={{ fontSize: '0.85em', fontWeight: '600', color: '#7f8c8d' }}>
                                                    {store.contacto?.horario || 'Abierto hoy'}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>

                    {/* Overlay gradiente sutil sobre el mapa para calidez */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        pointerEvents: 'none',
                        background: 'radial-gradient(circle, transparent 70%, rgba(255,102,0,0.02) 100%)',
                        zIndex: 400
                    }} />
                </div>
            </div>

            {/* Estilos globales para los marcadores y popup */}
            <style>{`
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    padding: 0;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0;
                }
                .leaflet-container {
                    font-family: 'Outfit', sans-serif;
                }
                /* Animación del spinner */
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default StoreLocator;
