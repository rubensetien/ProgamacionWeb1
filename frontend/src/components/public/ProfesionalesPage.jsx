import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { Phone, Linkedin, Facebook, Instagram, ChevronDown, ArrowRight, UserCheck, IceCream } from 'lucide-react';
import '../../styles/public/ProfesionalesPortal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ProfesionalesPage() {
    const navigate = useNavigate();
    const { autenticado } = useAuth();
    // const [megaMenuOpen, setMegaMenuOpen] = useState(false); // Removed unused state

    // --- SCROLL REVEAL OBSERVER ---
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible

        const animatedElements = document.querySelectorAll('.reveal-up');
        animatedElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="portal-page">
            {/* 1. TOP HEADER */}
            {/* 1. TOP HEADER - REPLACED WITH STANDARD NAVBAR */}
            <Navbar transparent={true} />

            {/* 2. HERO SECTION WITH VIDEO BACKGROUND */}
            <section className="portal-hero" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* VIDEO BACKGROUND */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0,
                        filter: 'brightness(0.9)' // Slightly darken for text readability if needed
                    }}
                >
                    <source src={`${API_URL}/uploads/videoBola.mp4`} type="video/mp4" />
                </video>

                {/* OVERLAY for text readability */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.4) 100%)',
                    zIndex: 1
                }} />

                <div className="portal-hero-text" style={{ flex: 1, paddingRight: '50px', zIndex: 2, position: 'relative' }}>
                    <h1 className="reveal-up" style={{ fontSize: '4.5rem', fontFamily: '"Playfair Display", serif', color: '#ff5722', lineHeight: '1.2' }}>
                        Descubre el sabor<br />
                        de lo natural.
                    </h1>
                    <p style={{ fontSize: '1.5rem', color: '#ff8a65', fontFamily: '"Playfair Display", serif', margin: '20px 0' }}>
                        Desde 1933 elaboramos artesanalmente el<br />
                        "Helado de Cantabria".
                    </p>

                    <img
                        src="/images/LogoFecha.png"
                        alt="Hecho en Cantabria 1933"
                        className="hero-seal-img"
                        style={{ width: 'auto', height: '140px', margin: '30px 0', objectFit: 'contain' }}
                    />

                    <p style={{ color: '#555', maxWidth: '450px', lineHeight: '1.6', marginBottom: '40px', fontWeight: '500' }}>
                        Regma: recetas artesanales elaboradas a partir de ingredientes naturales que aúnan calidad excepcional y tradición familiar.
                    </p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button
                            className="btn-felicidad"
                            style={{ padding: '15px 30px' }}
                            onClick={() => navigate('/productos')}
                        >
                            Trabaja con productos Regma
                        </button>
                        <button
                            onClick={() => autenticado ? navigate('/profesional') : navigate('/profesionales/registro-negocio')}
                            style={{
                                padding: '15px 30px',
                                borderRadius: '50px',
                                border: '2px solid #ff5722',
                                color: '#ff5722',
                                background: 'rgba(255,255,255,0.8)',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <UserCheck size={18} /> Área Clientes
                        </button>
                    </div>
                </div>

                {/* Removed Image block since video covers it, but we use flex:1 spacer so layout stays left-aligned */}
                <div style={{ flex: 1 }}></div>
            </section>

            {/* 3. STATS SECTION (ORANGE) */}
            {/* 3. STATS SECTION (ORANGE) */}
            <section className="portal-stats">
                <div className="stats-container">
                    <div className="stats-content reveal-up">
                        <span className="stats-pill">
                            REGMA EN NÚMEROS
                        </span>
                        <h2 className="stats-title">
                            Siempre cerca de nuestros clientes
                        </h2>
                        <p className="stats-description">Apostamos por la calidad de nuestras materias primas.</p>
                        <button className="stats-btn">
                            Contacto
                        </button>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <p>Tiendas propias</p>
                            <p className="number">40</p>
                        </div>
                        <div className="stat-item">
                            <p>Colaboradores a nivel nacional</p>
                            <p className="number">+200</p>
                        </div>
                        <div className="stat-item">
                            <p>Superficie en obradores</p>
                            <p className="number">4.600<span style={{ fontSize: '0.6em', verticalAlign: 'top' }}>m2</span></p>
                        </div>
                        <div className="stat-item">
                            <p>Nº cadenas de Retail presentes</p>
                            <p className="number">10</p>
                        </div>
                        <div className="stat-item">
                            <p>Profesionales</p>
                            <p className="number">140</p>
                        </div>
                        <div className="stat-item">
                            <p>Años de experiencia</p>
                            <p className="number">90</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: PRODUCT SHOWCASE SECTION */}
            <section className="portal-showcase">
                <div className="showcase-header">
                    <img src="/images/LogoFecha.png" alt="Logo" className="showcase-logo" />
                    <h2 className="showcase-title">
                        Productos para<br />hostelería y restauración
                    </h2>
                    <div style={{ width: '80px', height: '2px', background: '#ff5722', margin: '0 auto', opacity: 0.3 }}></div>
                </div>

                <div className="showcase-card-container reveal-up">
                    <div className="showcase-icon-circle">
                        <IceCream size={40} />
                    </div>
                    <div>
                        <span className="showcase-badge">NUESTROS HELADOS</span>
                    </div>
                    <h3 className="showcase-subtitle">
                        El sabor de lo natural en<br />cada bocado
                    </h3>
                    <p className="showcase-text">
                        Nuestros helados se elaboran de forma artesanal a base de ingredientes naturales en nuestros obradores de Cantabria.
                    </p>
                    <button className="btn-showcase-primary">
                        Nuestros helados <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* 4. SEGMENTS GRID */}
            <section className="portal-segments">
                <div className="segments-header-icon">
                    <Phone size={32} />
                </div>
                <h2 className="segments-title">
                    Regma para<br />profesionales
                </h2>

                <div className="segments-grid">
                    {/* HORECA */}
                    <div className="segment-card reveal-up reveal-delay-100">
                        <span className="segment-badge">HORECA</span>
                        <div>
                            <h3>
                                ¿Tienes restaurantes o cafeterías?
                            </h3>
                            <p>
                                Ofrece a tus clientes el inconfundible sabor de Regma y dale a tu carta un guiño del norte.
                            </p>
                            <a href="#" className="segment-link">
                                Más info <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* SUPERMERCADOS */}
                    <div className="segment-card reveal-up reveal-delay-200">
                        <span className="segment-badge" style={{ background: '#ff5722', color: 'white' }}>SUPERMERCADOS</span>
                        <div>
                            <h3>
                                ¿Compras para una cadena de retail?
                            </h3>
                            <p>
                                Ofrece a tus clientes una marca de calidad contrastada y reconocida a nivel nacional.
                            </p>
                            <a href="#" className="segment-link">
                                Más info <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* CORNER (Highlight) */}
                    <div className="segment-card highlight reveal-up reveal-delay-100">
                        <span className="segment-badge">CÓRNER REGMA</span>
                        <div>
                            <h3>
                                ¿Quieres ampliar tu negocio de hostelería?
                            </h3>
                            <p>
                                Incorpora nuestro Córner Regma a tu negocio y dales a tus clientes su helado favorito.
                            </p>
                            <a href="#" className="segment-link">
                                Solicitar info <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* EVENTOS */}
                    <div className="segment-card reveal-up reveal-delay-300">
                        <span className="segment-badge">EVENTOS CANTABRIA</span>
                        <div>
                            <h3>
                                Dale más sabor a tus eventos
                            </h3>
                            <p>
                                Sorprende a tus invitados con el helado icónico de Cantabria en tu boda o celebración.
                            </p>
                            <a href="#" className="segment-link">
                                Más info <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. COLLABORATORS SECTION */}
            <section className="portal-collaborators">
                <div className="collaborators-header">
                    <span className="collaborators-pill">COLABORADORES</span>
                    <h2 className="collaborators-title">
                        Regma, el sabor de Cantabria en los<br />principales retailers a nivel nacional
                    </h2>
                    <p className="collaborators-subtitle">
                        La presencia nacional de Regma se construye gracias a la colaboración con las marcas de retail más destacadas del país.
                    </p>
                </div>

                <div className="collaborators-carousel-wrapper">
                    <div className="collaborators-track">
                        {/* We duplicate the items to create an infinite loop effect */}
                        {[
                            'lupa.png', 'bm.png', 'agropal.png', 'cafeDeIndias.png',
                            'jamaica.png', 'hipercor.png', 'carrefour.png', 'carrefur-express.png',
                            'lupa.png', 'bm.png', 'agropal.png', 'cafeDeIndias.png',
                            'jamaica.png', 'hipercor.png', 'carrefour.png', 'carrefur-express.png'
                        ].map((logo, index) => (
                            <div key={index} className="collaborator-slide">
                                <img
                                    src={`${API_URL}/uploads/landing/fotosEmpresasColaboradoras/${logo}`}
                                    alt="Colaborador Regma"
                                    className="collaborator-logo"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
