import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { LogOut, User, LayoutDashboard, ShoppingCart, Menu, X } from 'lucide-react';
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

    // Determine container class
    const navbarClass = transparent
        ? `navbar-container ${scrolled ? 'scrolled' : ''}`
        : 'navbar-container solid-mode';

    // Helper for active link class
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const isB2B = location.pathname.startsWith('/profesionales');

    return (
        <nav className={`${navbarClass} ${isB2B ? 'navbar-b2b' : ''}`}>
            <div className="navbar-content">
                {/* LOGO */}
                <div className="nav-logo-container" onClick={() => navigate(isB2B ? '/profesionales' : '/')}>
                    <img
                        src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                        alt="Regma"
                        className="nav-logo-img"
                    />
                    {isB2B && <span className="nav-logo-badge">PROFESIONAL</span>}
                </div>

                {/* CENTER LINKS */}
                <div className="nav-links">
                    {isB2B ? (
                        <>
                            <a onClick={() => navigate('/')} className={`nav-link`}>Volver a Regma</a>
                            <a onClick={() => navigate('/profesionales')} className={`nav-link ${isActive('/profesionales') && location.pathname === '/profesionales' ? 'active' : ''}`}>Inicio</a>
                            <a onClick={() => navigate('/profesionales/hosteleria')} className={`nav-link ${isActive('/profesionales/hosteleria')}`}>Hostelería</a>
                            <a onClick={() => navigate('/profesionales/retail')} className={`nav-link ${isActive('/profesionales/retail')}`}>Retail</a>
                            <a onClick={() => navigate('/contacto')} className={`nav-link ${isActive('/contacto')}`}>Contacto</a>
                        </>
                    ) : (
                        <>
                            <a onClick={() => navigate('/')} className={`nav-link ${isActive('/')}`}>Inicio</a>
                            <a onClick={() => navigate('/historia')} className={`nav-link ${isActive('/historia')}`}>Historia</a>
                            <a onClick={() => navigate('/tiendas')} className={`nav-link ${isActive('/tiendas')}`}>Tiendas</a>
                            <a onClick={() => navigate('/productos')} className={`btn-nav-catalog ${location.pathname === '/productos' ? 'active-catalog' : ''}`}>Catálogo</a>
                        </>
                    )}
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
        </nav>
    );
}
