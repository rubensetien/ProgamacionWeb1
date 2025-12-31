import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';

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
    return null;
}

// Helper: Haversine Distance (km)
const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const StoreLocator = () => {
    const navigate = useNavigate();
    const { autenticado, usuario } = useAuth();
    const [tiendas, setTiendas] = useState([]);
    const [filteredTiendas, setFilteredTiendas] = useState([]); // List to display
    const [selectedStore, setSelectedStore] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Todas'); // Todas, heladeria, cafeteria
    const [userLocation, setUserLocation] = useState(null);

    // Centro inicial (Cantabria)
    const center = [43.3949, -4.0326];

    useEffect(() => {
        fetchPublicStores();
    }, []);

    // Logic: Filter & Sort
    useEffect(() => {
        let result = [...tiendas];

        // 1. Text Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.nombre.toLowerCase().includes(term) ||
                (s.direccion?.calle || '').toLowerCase().includes(term) ||
                (s.direccion?.ciudad || '').toLowerCase().includes(term)
            );
        }

        // 2. Type Filter
        if (filterType !== 'Todas') {
            result = result.filter(s => s.tipo?.toLowerCase() === filterType.toLowerCase());
        }

        // 3. Sort (Distance or Alpha)
        if (userLocation) {
            result = result.map(store => {
                const dist = (store.coordenadas?.latitud && store.coordenadas?.longitud)
                    ? haversineDistance(
                        { lat: userLocation.lat, lng: userLocation.lng },
                        { lat: store.coordenadas.latitud, lng: store.coordenadas.longitud }
                    )
                    : Infinity;
                return { ...store, distance: dist };
            }).sort((a, b) => a.distance - b.distance);
        } else {
            result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        }

        setFilteredTiendas(result);
    }, [tiendas, searchTerm, filterType, userLocation]);

    const handleGeolocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy // Store accuracy
                    });
                },
                (error) => {
                    console.error("Geo error:", error);
                    alert("No pudimos obtener tu ubicación.");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Request high accuracy
            );
        } else {
            alert("La geolocalización no es soportada por este navegador.");
        }
    };

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

    // Helper para iniciales moved to Navbar

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Outfit', sans-serif" }}>

            {/* Header / Nav - Modern White & Clean */}
            <Navbar transparent={false} />

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
                    <div style={{ padding: '2rem', position: 'sticky', top: 0, background: 'white', zIndex: 10, borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                                Tiendas <span style={{ color: '#ff6600' }}>Regma</span>
                            </h2>
                        </div>

                        {/* Search Bar */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Buscar calle, ciudad..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 15px 12px 40px', borderRadius: '12px',
                                    border: '1px solid #eee', background: '#f9f9f9', fontSize: '0.95rem', outline: 'none',
                                    fontFamily: "'Outfit', sans-serif"
                                }}
                            />
                            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        {/* Filter Chips */}
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                            {['Todas', 'Heladeria', 'Cafeteria'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    style={{
                                        border: 'none',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        background: filterType === type ? '#ff6600' : '#f0f0f0', // CHANGE: Orange active
                                        color: filterType === type ? 'white' : '#555',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                            {filteredTiendas.length} resultados encontrados
                        </p>
                    </div>

                    <div style={{ padding: '0 2rem 2rem 2rem' }}>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#ff6600' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTopColor: '#ff6600', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {filteredTiendas.map(store => {
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

                                            {/* Distance Badge */}
                                            {/* Distance Badge REMOVED from top-right, moving to content */}

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
                                                    {store.tipo === 'heladeria' ? 'Heladería' : store.tipo === 'cafeteria' ? 'Cafetería' : store.tipo}
                                                </span>
                                            </div>

                                            {/* Distance Integration in Card Content */}
                                            {store.distance && store.distance !== Infinity && (
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    marginBottom: '10px', fontSize: '0.9rem', color: '#ff6600', fontWeight: '600'
                                                }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
                                                    <span>A {store.distance.toFixed(2)} km de ti</span>
                                                </div>
                                            )}

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

                        {/* ✅ User Location Marker */}
                        {userLocation && (
                            <>
                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={userLocation.accuracy || 100}
                                    pathOptions={{ fillColor: '#4285F4', fillOpacity: 0.1, color: '#4285F4', weight: 1 }}
                                />
                                <CircleMarker
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={8}
                                    pathOptions={{ fillColor: '#4285F4', fillOpacity: 1, color: 'white', weight: 3 }}
                                >
                                    <Popup>Estás aquí</Popup>
                                </CircleMarker>
                            </>
                        )}

                        {filteredTiendas.map(store => (
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

                    {/* Botón Flotante de Geolocalización (FAB) */}
                    <button
                        onClick={handleGeolocation}
                        style={{
                            position: 'absolute',
                            bottom: '30px',
                            right: '30px',
                            zIndex: 1000,
                            background: 'white',
                            color: '#ff6600',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"></path>
                            <circle cx="12" cy="9" r="2.5"></circle>
                        </svg>
                        Cerca de mí
                    </button>
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
