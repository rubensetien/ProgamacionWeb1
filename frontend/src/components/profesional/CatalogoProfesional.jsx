
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import Swal from 'sweetalert2';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import '../../styles/cliente/ProductosListModern.css'; // Reusing Modern Styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CatalogoProfesional = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { agregarAlCarrito } = useCarrito();

    useEffect(() => {
        // Only professionals allowed
        if (usuario && usuario.rol !== 'profesional') {
            navigate('/productos'); // Redirect others to public catalog
        }
        fetchProductosB2B();
    }, [usuario]);

    const fetchProductosB2B = async () => {
        try {
            // Fetch ONLY B2B items
            const res = await axios.get(`${API_URL}/api/productos`, {
                params: {
                    canal: 'b2b',
                    activo: true
                }
            });
            setProductos(res.data.data);
        } catch (error) {
            console.error('Error loading B2B catalog:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos del catálogo profesional.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (prod) => {
        agregarAlCarrito(prod, prod.variante, prod.formato, 1);
        Swal.fire({
            icon: 'success',
            title: 'Añadido al pedido',
            text: `${prod.nombre} ha sido añadido.`,
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            background: '#e64a19', // Terracotta for pros
            color: '#fff'
        });
    };

    return (
        <div className="catalogo-pro-container" style={{ backgroundColor: '#f9f5f0', minHeight: '100vh' }}>
            <Navbar />

            <div className="pro-header" style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                color: 'white',
                padding: '80px 5%',
                marginBottom: '40px'
            }}>
                <button onClick={() => navigate('/profesional/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '4px', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Volver al Panel
                </button>
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: '10px' }}>Catálogo para Hostelería</h1>
                <p style={{ opacity: 0.8 }}>Formatos exclusivos de 4L para tu negocio.</p>
            </div>

            <div className="pro-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '30px',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 5% 80px'
            }}>
                {loading ? (
                    <p>Cargando referencias...</p>
                ) : productos.map(prod => (
                    <div key={prod._id} className="pro-card" style={{
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ height: '220px', overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {prod.imagenPrincipal ? (
                                <img src={`${API_URL}${prod.imagenPrincipal}`} alt={prod.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Package size={64} color="#ccc" />
                            )}
                        </div>
                        <div style={{ padding: '24px' }}>
                            <span style={{
                                background: '#e64a19',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                Formato 4L
                            </span>
                            <h3 style={{ margin: '15px 0 10px', fontSize: '1.2rem', color: '#333' }}>{prod.nombre}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
                                {prod.descripcionCorta || prod.descripcionLarga || 'Helado artesanal Regma calidad premium.'}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e64a19' }}>
                                    {prod.precioBase?.toFixed(2)}€
                                </span>
                                <button
                                    onClick={() => handleAddToCart(prod)}
                                    style={{
                                        background: '#1a1a1a',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <ShoppingCart size={18} /> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {productos.length === 0 && !loading && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
                        No se encontraron productos en el canal B2B.
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CatalogoProfesional;
