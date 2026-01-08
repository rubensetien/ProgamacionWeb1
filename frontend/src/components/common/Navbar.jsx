import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { LogOut, User, LayoutDashboard, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import '../../styles/common/Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Navbar({ transparent = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { autenticado, usuario, logout } = useAuth();
    const { cantidadTotal } = useCarrito();

    const [scrolled, setScrolled] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [showProfMenu, setShowProfMenu] = useState(false);

    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper for Initials
    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : 'U';
    };

    // Determine container class
    const navbarClass = transparent
        ? `navbar-container ${scrolled ? 'scrolled' : ''}`
        : 'navbar-container solid-mode';

    // Helper for active link class
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const isB2B = location.pathname.startsWith('/profesionales');

    return (
        <nav className={`${navbarClass} ${isB2B ? 'navbar-b2b' : ''}`} onMouseLeave={() => setShowProfMenu(false)}>
            <div className="navbar-content">
                {/* LOGO */}
                <div className="nav-logo-container" onClick={() => navigate(isB2B ? '/profesionales' : '/')}>
                    <img
                        src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                        alt="Regma"
                        className="nav-logo-img"
                    />

                </div>

                {/* CENTER LINKS */}
                <div className="nav-links">
                    <>
                        <a onClick={() => navigate('/')} className={`nav-link ${isActive('/')}`}>Inicio</a>

                        {/* PROFESIONALES DROPDOWN TRIGGER */}
                        <div
                            className="nav-item-dropdown"
                            onMouseEnter={() => setShowProfMenu(true)}
                            onClick={() => navigate('/profesionales')}
                        >
                            <span className={`nav-link ${isActive('/profesionales')}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Regma para Profesionales <ChevronDown size={14} />
                            </span>
                        </div>

                        <a onClick={() => navigate('/historia')} className={`nav-link ${isActive('/historia')}`}>Sobre Regma</a>
                        <a onClick={() => navigate('/tiendas')} className={`nav-link ${isActive('/tiendas')}`}>Tiendas</a>
                        <a onClick={() => navigate('/productos')} className={`btn-nav-catalog ${location.pathname === '/productos' ? 'active-catalog' : ''}`}>Catálogo</a>
                    </>
                </div>

                {/* RIGHT ACTIONS (AUTH & CART) */}
                <div className="nav-actions">

                    {/* CART ICON */}
                    <div
                        className="nav-cart-container"
                        onClick={() => navigate('/carrito')}
                        title="Ver mi carrito"
                    >
                        <ShoppingCart size={24} />
                        {cantidadTotal() > 0 && (
                            <span className="nav-cart-badge">{cantidadTotal()}</span>
                        )}
                    </div>

                    {!autenticado ? (
                        <a onClick={() => navigate('/login')} className="btn-nav-login" style={{ cursor: 'pointer' }}>Entrar</a>
                    ) : (
                        <div className="user-avatar-container">
                            <div
                                className="user-avatar"
                                onClick={() => setMenuAbierto(!menuAbierto)}
                                title="Mi Cuenta"
                            >
                                {getInitials(usuario?.nombre)}
                            </div>

                            {/* DROPDOWN MENU */}
                            {menuAbierto && (
                                <div className="nav-dropdown-menu" onMouseLeave={() => setMenuAbierto(false)}>
                                    <div className="nav-dropdown-item" onClick={() => {
                                        let path = '/perfil';
                                        if (usuario?.rol === 'admin') path = '/admin';
                                        else if (usuario?.rol === 'trabajador') path = '/trabajador';
                                        else if (usuario?.rol === 'profesional') path = '/profesional';
                                        else if (usuario?.rol === 'tienda' || usuario?.rol === 'gestor-tienda') path = '/tienda';

                                        navigate(path);
                                    }}>
                                        <LayoutDashboard size={18} />
                                        {usuario?.rol === 'publico' ? 'Mi Perfil' : 'Dashboard'}
                                    </div>

                                    {(usuario?.rol === 'admin' || usuario?.rol === 'trabajador' || usuario?.rol === 'profesional' || usuario?.rol === 'tienda' || usuario?.rol === 'gestor-tienda') && (
                                        <div className="nav-dropdown-item" onClick={() => navigate('/perfil')}>
                                            <User size={18} />
                                            Mi Cuenta
                                        </div>
                                    )}

                                    <div className="nav-dropdown-divider"></div>

                                    <div className="nav-dropdown-item logout" onClick={logout}>
                                        <LogOut size={18} />
                                        Cerrar Sesión
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* VIDEO MEGA MENU OVERLAY */}
            <div
                className={`nav-mega-overlay ${showProfMenu ? 'active' : ''}`}
                onMouseEnter={() => setShowProfMenu(true)}
            >
                <div className="nav-mega-grid">
                    {/* COL 1: HOSTELERÍA */}
                    <div className="nav-mega-col" onClick={() => { navigate('/profesionales/hosteleria'); setShowProfMenu(false); }}>
                        <video autoPlay loop muted playsInline>
                            <source src={`${API_URL}/uploads/PreparacionCucurucho.mp4`} type="video/mp4" />
                        </video>
                        <div className="nav-mega-content">
                            <h3>Helados artesanales para<br />hostelería y restauración</h3>
                            <p>El mejor postre para tus clientes.</p>
                        </div>
                    </div>

                    {/* COL 2: SUPERMERCADOS */}
                    <div className="nav-mega-col" onClick={() => { navigate('/profesionales/retail'); setShowProfMenu(false); }}>
                        <video autoPlay loop muted playsInline>
                            <source src={`${API_URL}/uploads/helados_para_supermercados.mp4`} type="video/mp4" />
                        </video>
                        <div className="nav-mega-content">
                            <h3>Helados para<br />supermercados</h3>
                            <p>Los 14 sabores de helados ya disponibles.</p>
                        </div>
                    </div>

                    {/* COL 3: CORNER */}
                    <div className="nav-mega-col" onClick={() => { navigate('/profesionales/corner'); setShowProfMenu(false); }}>
                        <video autoPlay loop muted playsInline>
                            <source src={`${API_URL}/uploads/preparacionHelado.mp4`} type="video/mp4" />
                        </video>
                        <div className="nav-mega-content">
                            <h3>Córner Regma</h3>
                            <p>Un córner refrigerado para tu negocio.</p>
                        </div>
                    </div>

                    {/* COL 4: EVENTOS */}
                    <div className="nav-mega-col" onClick={() => { navigate('/profesionales/eventos'); setShowProfMenu(false); }}>
                        <video autoPlay loop muted playsInline>
                            <source src={`${API_URL}/uploads/videoParejaDandoseHelado.mp4`} type="video/mp4" />
                        </video>
                        <div className="nav-mega-content">
                            <h3>Helados para eventos</h3>
                            <p>Catering y helados para tus invitados.</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav >
    );
}
