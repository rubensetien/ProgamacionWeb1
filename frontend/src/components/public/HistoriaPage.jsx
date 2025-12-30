import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/public/HistoriaPageModern.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Story Data
const storyData = [
    {
        id: 1,
        year: '1933',
        title: 'Nuestros Inicios',
        desc: 'Todo comenzó con una visión clara y un corazón valiente. Nuestro fundador, Marcelino Castanedo Miera, decidió emprender en Santander con poco más que una bicicleta, heladeras de madera y corcho, y una pasión inquebrantable.\n\nFueron años de venta ambulante, de recorrer las playas del Sardinero y las calles de la ciudad, llevando un momento de frescura y alegría a cada vecino. Aquellos primeros veranos sentaron las bases de lo que hoy somos: cercanía, esfuerzo y calidad.',
        img: `${API_URL}/uploads/landing/historia-obrador.jpg`
    },
    {
        id: 2,
        year: 'Familia',
        title: 'Regina y Margarita',
        desc: 'El nombre "Regma" no es casualidad; es el homenaje más puro a nuestra familia. Marcelino unió las primeras sílabas de los nombres de sus hijas: REgina y MArgrita.\n\nAsí nació nuestra marca, sellando desde el primer día nuestro compromiso familiar. No somos solo una empresa; somos una familia que comparte su pasión contigo. Ellas, junto a sus hermanos, impulsaron el negocio con la misma dedicación que su padre.',
        img: `${API_URL}/uploads/landing/historia-obrador2.jpg`
    },
    {
        id: 3,
        year: 'Expansión',
        title: 'Creciendo Juntos',
        desc: 'Con el tiempo, la bicicleta dio paso a nuestros primeros locales. Entendimos que para ser parte de la vida de los cántabros, necesitábamos lugares de encuentro.\n\nAbrimos nuestras heladerías emblemáticas, convirtiéndonos en una parada obligatoria en el Paseo de Pereda y en cada barrio. El "helado de Regma" pasó de ser un producto a ser una tradición local, un ritual compartido entre abuelos y nietos.',
        img: `${API_URL}/uploads/landing/foto-local.jpeg`
    },
    {
        id: 4,
        year: 'Hoy',
        title: 'Modernidad y Tradición',
        desc: 'Hoy, bajo la dirección de la tercera generación, miramos al futuro sin olvidar nuestro pasado. Hemos renovado nuestros espacios para que sean más acogedores y luminosos, pero el alma sigue siendo la misma.\n\nEn nuestro obrador de Revilla de Camargo, seguimos elaborando nuestros productos diariamente, con leche fresca de granjas locales y frutas seleccionadas. La tecnología nos ayuda, pero la mano del artesano es insustituible.',
        img: `${API_URL}/uploads/landing/foto-local2.webp`
    }
];

export default function HistoriaPage() {
    const navigate = useNavigate();
    const { autenticado, usuario, logout } = useAuth(); // [FIX] Added logout
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Helper para iniciales
    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : 'R';
    };

    return (
        <div className="historia-page-editorial">
            {/* --- FULL NAVBAR --- */}
            <nav className="nav-solid">
                <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" alt="REGMA" />
                </div>

                <div className="nav-links">
                    <span className="nav-link" onClick={() => navigate('/')}>Inicio</span>
                    <span className="nav-link" onClick={() => navigate('/productos')}>Catálogo</span>
                    <span className="nav-link" onClick={() => navigate('/tiendas')}>Tiendas</span>

                    {!autenticado ? (
                        <button className="btn-nav-action" onClick={() => navigate('/login')}>
                            Entrar
                        </button>
                    ) : (
                        <div className="user-dropdown-container" style={{ position: 'relative' }}>
                            <div
                                className="user-avatar-nav"
                                onClick={() => setMenuAbierto(!menuAbierto)}
                                title="Mi Cuenta"
                                style={{ cursor: 'pointer' }}
                            >
                                {getInitials(usuario?.nombre)}
                            </div>

                            {menuAbierto && (
                                <div className="user-dropdown-menu active">
                                    <div className="dropdown-item" onClick={() => {
                                        const path = usuario?.rol === 'admin' ? '/admin' : usuario?.rol === 'trabajador' ? '/trabajador' : '/perfil';
                                        navigate(path);
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="14" width="7" height="7"></rect>
                                            <rect x="3" y="14" width="7" height="7"></rect>
                                        </svg>
                                        {usuario?.rol === 'admin' || usuario?.rol === 'trabajador' ? 'Dashboard' : 'Mi Perfil'}
                                    </div>
                                    {(usuario?.rol === 'admin' || usuario?.rol === 'trabajador') && (
                                        <div className="dropdown-item" onClick={() => navigate('/perfil')}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            Mi Cuenta
                                        </div>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <div className="dropdown-item logout" onClick={logout}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
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
            </nav>

            {/* --- HERO BANNER --- */}
            <header className="history-hero">
                <img src={`${API_URL}/uploads/landing/foto-familia.webp`} alt="Familia Regma" className="hero-bg-img" />
                <div className="hero-content">
                    <span className="hero-tag">Nuestra Esencia</span>
                    <h1 className="hero-title">SOMOS REGMA</h1>
                    <p className="hero-desc">
                        Ocho décadas de historia. Una familia. Y una única pasión: hacer las cosas bien, con ingredientes naturales y mucho cariño.
                    </p>
                </div>
            </header>

            {/* --- EDITORIAL CONTENT --- */}
            <div className="editorial-container">
                {storyData.map((story, index) => (
                    <section key={story.id} className={`story-section ${index % 2 !== 0 ? 'reverse' : ''}`}>
                        <div className="story-media">
                            <span className="story-year">{story.year}</span>
                            <div className="story-img-frame">
                                <img src={story.img} alt={story.title} className="story-img" />
                            </div>
                        </div>
                        <div className="story-text">
                            <h2 className="story-title">{story.title}</h2>
                            <p className="story-desc">{story.desc}</p>
                        </div>
                    </section>
                ))}
            </div>

            {/* --- LEGACY BANNER --- */}
            <section className="legacy-banner">
                <div className="legacy-content">
                    <p className="legacy-quote">
                        "No heredamos Regma para cambiarlo, sino para asegurar que nuestros hijos y los tuyos sigan disfrutando del mismo sabor auténtico que creó nuestro abuelo."
                    </p>
                    <span className="legacy-author">— Tercera Generación Castanedo</span>
                </div>
            </section>

            {/* --- FOOTER SIMPLIFICADO --- */}
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', color: '#999', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} REGMA S.A. - Pasión por lo natural.
            </div>
        </div>
    );
}
