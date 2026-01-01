import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import '../../styles/common/Navbar.css';

export default function Navbar({ transparent = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { autenticado, usuario, logout } = useAuth();
    const { cantidadTotal } = useCarrito();

    const [scrolled, setScrolled] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);

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

    // Determine container class: 
    // If 'transparent' prop is true, it starts transparent and becomes solid on scroll (glass effect).
    // If 'transparent' prop is false, it is always solid/dark.
    const navbarClass = transparent
        ? `navbar-container ${scrolled ? 'scrolled' : ''}`
        : 'navbar-container solid-mode';

    // Helper for active link class
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className={navbarClass}>
            <div className="navbar-content">

                {/* LOGO */}
                <img
                    src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                    alt="REGMA"
                    className="nav-logo-img"
                    onClick={() => navigate('/')}
                />

                {/* CENTER LINKS */}
                <div className="nav-links">
                    <a onClick={() => navigate('/')} className={`nav-link ${isActive('/')}`}>Inicio</a>
                    <a onClick={() => navigate('/historia')} className={`nav-link ${isActive('/historia')}`}>Historia</a>
                    <a onClick={() => navigate('/tiendas')} className={`nav-link ${isActive('/tiendas')}`}>Tiendas</a>
                    <a onClick={() => navigate('/productos')} className={`btn-nav-catalog ${location.pathname === '/productos' ? 'active-catalog' : ''}`}>Catálogo</a>
                </div>

                {/* RIGHT ACTIONS (AUTH & CART) */}
                <div className="nav-actions">

                    {/* CART ICON */}
                    <div
                        className="nav-cart-container"
                        onClick={() => navigate('/carrito')}
                        title="Ver mi carrito"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
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
                                        const path = usuario?.rol === 'admin' ? '/admin' : usuario?.rol === 'trabajador' ? '/trabajador' : '/perfil';
                                        navigate(path);
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="14" width="7" height="7"></rect>
                                            <rect x="3" y="14" width="7" height="7"></rect>
                                        </svg>
                                        {usuario?.rol === 'publico' ? 'Mi Perfil' : 'Dashboard'}
                                    </div>

                                    {(usuario?.rol === 'admin' || usuario?.rol === 'trabajador') && (
                                        <div className="nav-dropdown-item" onClick={() => navigate('/perfil')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            Mi Cuenta
                                        </div>
                                    )}

                                    <div className="nav-dropdown-divider"></div>

                                    <div className="nav-dropdown-item logout" onClick={logout}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        Cerrar Sesión
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
