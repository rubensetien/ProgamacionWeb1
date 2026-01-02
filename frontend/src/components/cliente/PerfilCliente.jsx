import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    User, Package, LogOut, MapPin
} from 'lucide-react';
import '../../styles/cliente/PerfilCliente.css';

export default function PerfilCliente() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab for styling if needed, though NavLink adds 'active' class automatically
    // The CSS expects .nav-item.active so NavLink is perfect.

    return (
        <div className="perfil-page">
            {/* Hero Header matching Checkout */}
            <header className="profile-hero">
                <div className="hero-content">
                    <div className="hero-top-bar">
                        <div className="brand-wrapper">
                            <img
                                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                                alt="REGMA"
                                className="hero-logo"
                                onClick={() => navigate('/')}
                                style={{ cursor: 'cursor' }}
                            />
                        </div>
                        <button className="btn-hero-text" onClick={() => navigate('/')}>
                            <User size={16} /> Volver al Inicio
                        </button>
                    </div>
                    <h1 className="hero-title">Mi Perfil</h1>
                    <p className="hero-subtitle">Gestiona tu información personal y revisa tu historial de pedidos</p>
                </div>
            </header>

            <div className="perfil-container">
                {/* Sidebar / Tabs */}
                <aside className="perfil-sidebar">
                    <div className="perfil-user-card">
                        <div className="user-avatar-large">
                            {usuario?.avatar ? (<img src={usuario.avatar} alt="Avatar" />) : (<User size={40} />)}
                        </div>
                        <h3>{usuario?.nombre}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <span className="user-role-badge">{usuario?.rol}</span>
                            {usuario?.tipoTrabajador && (
                                <span className="user-role-badge" style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem' }}>
                                    {usuario.tipoTrabajador.toUpperCase()}
                                </span>
                            )}
                            {usuario?.ubicacionAsignada?.referencia && (
                                <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={14} />
                                    {usuario.ubicacionAsignada.referencia.nombre || usuario.ubicacionAsignada.referencia}
                                </span>
                            )}
                        </div>
                    </div>

                    <nav className="perfil-nav">
                        {usuario?.rol === 'trabajador' && (
                            <button
                                className="nav-item"
                                onClick={() => navigate('/trabajador')}
                                style={{ color: '#e67e22', fontWeight: 600 }}
                            >
                                <User size={20} /> Dashboard Trabajo
                            </button>
                        )}

                        <NavLink
                            to="/perfil/datos"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <User size={20} /> Mi Perfil
                        </NavLink>

                        <NavLink
                            to="/perfil/pedidos"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Package size={20} /> Mis Pedidos
                        </NavLink>

                        <div className="nav-divider"></div>
                        <button className="nav-item logout" onClick={logout}>
                            <LogOut size={20} /> Cerrar Sesión
                        </button>
                    </nav>
                </aside>

                {/* Content Area - Render sub-routes here */}
                <main className="perfil-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
