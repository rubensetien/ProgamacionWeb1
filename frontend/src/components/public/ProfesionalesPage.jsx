import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { Phone, Linkedin, Facebook, Instagram, ChevronDown, ArrowRight, UserCheck } from 'lucide-react';
import '../../styles/public/ProfesionalesPortal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ProfesionalesPage() {
    const navigate = useNavigate();
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);

    return (
        <div className="portal-page">
            {/* 1. TOP HEADER */}
            <nav className="portal-header">
                {/* Official Logo */}
                <div className="portal-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img
                        src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                        alt="Regma"
                        style={{ height: '45px' }}
                    />
                </div>

                <div className="portal-nav-links desktop-only" style={{ height: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {/* MEGA MENU TRIGGER */}
                    <div
                        className="nav-item-wrapper"
                        style={{ height: '100%', display: 'flex', alignItems: 'center' }}
                        onMouseEnter={() => setMegaMenuOpen(true)}
                        onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                        <span className="nav-item" style={{ cursor: 'pointer', padding: '20px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Regma para profesionales <ChevronDown size={14} />
                        </span>

                        {/* MEGA MENU CONTENT */}
                        <div className={`mega-menu-overlay ${megaMenuOpen ? 'active' : ''}`}>
                            <div className="mega-menu-grid">
                                {/* COL 1: HOSTELERÍA */}
                                <div className="mega-menu-col" onClick={() => console.log('Link to Horeca')}>
                                    <video autoPlay loop muted playsInline>
                                        <source src={`${API_URL}/uploads/preparacionHelado.mp4`} type="video/mp4" />
                                    </video>
                                    <div className="mega-menu-content">
                                        <h3>Helados artesanales para<br />hostelería y restauración</h3>
                                        <p>El mejor postre para tus clientes.</p>
                                    </div>
                                </div>

                                {/* COL 2: SUPERMERCADOS */}
                                <div className="mega-menu-col" onClick={() => console.log('Link to Retail')}>
                                    <video autoPlay loop muted playsInline>
                                        <source src={`${API_URL}/uploads/helados_para_supermercados.mp4`} type="video/mp4" />
                                    </video>
                                    <div className="mega-menu-content">
                                        <h3>Helados para<br />supermercados</h3>
                                        <p>Los 14 sabores de helados ya disponibles.</p>
                                    </div>
                                </div>

                                {/* COL 3: CORNER */}
                                <div className="mega-menu-col" onClick={() => console.log('Link to Corner')}>
                                    <video autoPlay loop muted playsInline>
                                        <source src={`${API_URL}/uploads/PreparacionCucurucho.mp4`} type="video/mp4" />
                                    </video>
                                    <div className="mega-menu-content">
                                        <h3>Córner Regma</h3>
                                        <p>Un córner refrigerado para tu negocio.</p>
                                    </div>
                                </div>

                                {/* COL 4: EVENTOS */}
                                <div className="mega-menu-col" onClick={() => console.log('Link to Events')}>
                                    <video autoPlay loop muted playsInline>
                                        <source src={`${API_URL}/uploads/videoParejaDandoseHelado.mp4`} type="video/mp4" />
                                    </video>
                                    <div className="mega-menu-content">
                                        <h3>Helados para eventos</h3>
                                        <p>Catering y helados para tus invitados.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <span className="nav-item" style={{ marginLeft: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>Productos <ChevronDown size={14} /></span>
                    <span className="nav-item" style={{ marginLeft: '20px', cursor: 'pointer' }}>Sobre Regma</span>
                </div>

                <div className="portal-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button className="btn-felicidad">
                        Felicidad para tu negocio
                    </button>
                    <div className="social-icons" style={{ display: 'flex', gap: '15px', color: '#666' }}>
                        <Facebook size={18} />
                        <Linkedin size={18} />
                        <Instagram size={18} />
                        <Phone size={18} />
                    </div>
                </div>
            </nav>

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
                    <h1 style={{ fontSize: '4.5rem', fontFamily: '"Playfair Display", serif', color: '#ff5722', lineHeight: '1.2' }}>
                        Descubre el sabor<br />
                        de lo natural.
                    </h1>
                    <p style={{ fontSize: '1.5rem', color: '#ff8a65', fontFamily: '"Playfair Display", serif', margin: '20px 0' }}>
                        Desde 1933 elaboramos artesanalmente el<br />
                        "Helado de Cantabria".
                    </p>

                    <div className="hero-seal" style={{
                        border: '2px solid #ff5722', borderRadius: '50%', width: '120px', height: '120px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: '#ff5722', fontSize: '0.9rem', fontWeight: 'bold', margin: '30px 0'
                    }}>
                        <span>HECHO</span>
                        <span style={{ fontSize: '0.7rem' }}>EN</span>
                        <span style={{ fontSize: '1.5rem', lineHeight: '1' }}>1933</span>
                        <span style={{ fontSize: '0.6rem' }}>CANTABRIA</span>
                    </div>

                    <p style={{ color: '#555', maxWidth: '450px', lineHeight: '1.6', marginBottom: '40px', fontWeight: '500' }}>
                        Regma: recetas artesanales elaboradas a partir de ingredientes naturales que aúnan calidad excepcional y tradición familiar.
                    </p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button className="btn-felicidad" style={{ padding: '15px 30px' }} onClick={() => window.location.href = 'mailto:comercial@regma.es'}>
                            Trabaja con productos Regma
                        </button>
                        <button
                            onClick={() => navigate('/login')}
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
            <section className="portal-stats" style={{ background: '#ff5722', color: 'white', padding: '80px 10%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
                    <div style={{ maxWidth: '40%' }}>
                        <span style={{ background: 'white', color: '#ff5722', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            Regma en números
                        </span>
                        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', margin: '20px 0 10px' }}>
                            Siempre cerca de nuestros clientes
                        </h2>
                        <p style={{ opacity: 0.9 }}>Apostamos por la calidad de nuestras materias primas.</p>
                        <button style={{ marginTop: '30px', border: '1px solid white', background: 'transparent', color: 'white', padding: '10px 30px', borderRadius: '30px' }}>
                            Contacto
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px 80px' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tiendas propias</p>
                            <p style={{ fontSize: '3.5rem', fontWeight: '300' }}>40</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Colaboradores a nivel nacional</p>
                            <p style={{ fontSize: '3.5rem', fontWeight: '300' }}>+200</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Superficie en obradores</p>
                            <p style={{ fontSize: '3.5rem', fontWeight: '300' }}>4.600<span style={{ fontSize: '2rem' }}>m2</span></p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Nº cadenas de Retail presentes</p>
                            <p style={{ fontSize: '3.5rem', fontWeight: '300' }}>10</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Profesionales</p>
                            <p style={{ fontSize: '3.5rem', fontWeight: '300' }}>140</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Años de experiencia</p>
                            <p style={{ fontSize: '3.5rem', fontWeight: '300' }}>90</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SEGMENTS GRID */}
            <section style={{ padding: '80px 10%', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: '#ffe0d1', borderRadius: '50%', color: '#ff5722', marginBottom: '20px' }}>
                    <Phone size={30} />
                </div>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '3rem', color: '#ff5722', marginBottom: '60px' }}>
                    Regma para<br />profesionales
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                    {/* HORECA */}
                    <div className="segment-card" style={{ border: '1px solid #ffccbc', borderRadius: '20px', padding: '40px 20px', textAlign: 'left' }}>
                        <span style={{ background: '#ffede6', color: '#ff5722', padding: '5px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>HORECA</span>
                        <h3 style={{ color: '#ff5722', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', margin: '20px 0' }}>
                            ¿Tienes restaurantes o cafeterías?
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            Ofrece a tus clientes el inconfundible sabor de Regma y dale a tu carta un guiño del norte.
                        </p>
                        <a href="#" style={{ color: '#ff5722', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Más info <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* SUPERMERCADOS */}
                    <div className="segment-card" style={{ border: '1px solid #ffccbc', borderRadius: '20px', padding: '40px 20px', textAlign: 'left' }}>
                        <span style={{ background: '#ff5722', color: 'white', padding: '5px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>SUPERMERCADOS</span>
                        <h3 style={{ color: '#ff5722', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', margin: '20px 0' }}>
                            ¿Compras para una cadena de retail?
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            Ofrece a tus clientes una marca de calidad contrastada y reconocida a nivel nacional.
                        </p>
                        <a href="#" style={{ color: '#ff5722', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Más info <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* CORNER */}
                    <div className="segment-card" style={{ background: '#ff5722', borderRadius: '20px', padding: '40px 20px', textAlign: 'left', color: 'white' }}>
                        <span style={{ background: 'white', color: '#ff5722', padding: '5px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>CÓRNER REGMA</span>
                        <h3 style={{ color: 'white', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', margin: '20px 0' }}>
                            ¿Quieres ampliar tu negocio de hostelería?
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            Incorpora nuestro Córner Regma a tu negocio y dales a tus clientes su helado favorito.
                        </p>
                        <a href="#" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Solicitar info <ArrowRight size={16} />
                        </a>
                    </div>

                    {/* EVENTOS */}
                    <div className="segment-card" style={{ border: '1px solid #ffccbc', borderRadius: '20px', padding: '40px 20px', textAlign: 'left' }}>
                        <span style={{ background: '#ffede6', color: '#ff5722', padding: '5px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>EVENTOS CANTABRIA</span>
                        <h3 style={{ color: '#ff5722', fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', margin: '20px 0' }}>
                            Dale más sabor a tus eventos
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            Sorprende a tus invitados con el helado icónico de Cantabria en tu boda o celebración.
                        </p>
                        <a href="#" style={{ color: '#ff5722', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Más info <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
