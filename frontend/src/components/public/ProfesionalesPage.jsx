import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import '../../styles/public/ProfesionalesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ProfesionalesPage() {
    const navigate = useNavigate();

    return (
        <div className="profesionales-page">
            {/* 1. NAVBAR (Solid mode or overlay) */}
            <Navbar />

            {/* 2. HERO SPLIT (4 COLUMNS) */}
            <section className="prof-hero-container">

                {/* Panel 1: Hostelería */}
                <div className="split-hero-panel" onClick={() => navigate('/profesionales/hosteleria')}>
                    <img className="panel-bg" src={`${API_URL}/uploads/landing/categoria-helados.jpg`} alt="Hostelería" />
                    <div className="panel-content">
                        <div className="panel-icon">🍦</div>
                        <h2 className="panel-title">Helados para Hostelería</h2>
                        <p className="panel-desc">A base de ingredientes naturales. El mejor postre para tus clientes.</p>
                    </div>
                </div>

                {/* Panel 2: Supermercados/Retail */}
                <div className="split-hero-panel" onClick={() => navigate('/profesionales/retail')}>
                    <img className="panel-bg" src={`${API_URL}/uploads/landing/categoria-dulces.png`} alt="Supermercados" />
                    <div className="panel-content">
                        <div className="panel-icon">🛒</div>
                        <h2 className="panel-title">Helados para Supermercados</h2>
                        <p className="panel-desc">Los 14 sabores de helados ya disponibles en formato retail.</p>
                    </div>
                </div>

                {/* Panel 3: Córner Regma */}
                <div className="split-hero-panel" onClick={() => navigate('/profesionales/corner')}>
                    <img className="panel-bg" src={`${API_URL}/uploads/landing/historia-obrador2.jpg`} alt="Córner" />
                    <div className="panel-content">
                        <div className="panel-icon">🏪</div>
                        <h2 className="panel-title">Córner Regma</h2>
                        <p className="panel-desc">Un córner refrigerado para tu negocio. Calidad artesana al instante.</p>
                    </div>
                </div>

                {/* Panel 4: Eventos */}
                <div className="split-hero-panel" onClick={() => navigate('/profesionales/eventos')}>
                    <img className="panel-bg" src={`${API_URL}/uploads/landing/hero-principal.jpg`} alt="Eventos" />
                    <div className="panel-content">
                        <div className="panel-icon">🎉</div>
                        <h2 className="panel-title">Helados para Eventos</h2>
                        <p className="panel-desc">Catering y helados para tus invitados. Un toque dulce inolvidable.</p>
                    </div>
                </div>

            </section>

            {/* 3. ORANGE STATS SECTION ("Regma en Números") */}
            <section className="stats-section-orange">
                <div className="stats-grid">

                    {/* Left Text */}
                    <div className="stats-header-content">
                        <h3>REGMA EN NÚMEROS</h3>
                        <h2 className="stats-main-title">
                            Siempre cerca de nuestros clientes
                        </h2>
                        <p style={{ opacity: 0.9, marginBottom: '30px', fontWeight: 300 }}>
                            Apostamos por la calidad de nuestras materias primas y el servicio de cercanía.
                        </p>
                        <button className="btn-contact-white" onClick={() => navigate('/profesionales/registro-negocio')}>
                            Alta Profesional
                        </button>
                    </div>

                    {/* Right Numbers */}
                    <div className="stats-numbers-grid">
                        <div className="stat-item">
                            <h4>Tiendas propias</h4>
                            <p className="stat-number">40</p>
                        </div>

                        <div className="stat-item">
                            <h4>Colaboradores a nivel nacional</h4>
                            <p className="stat-number">+200</p>
                        </div>

                        <div className="stat-item">
                            <h4>Superficie en obradores</h4>
                            <p className="stat-number">4.600<span className="stat-unit">m2</span></p>
                        </div>

                        <div className="stat-item">
                            <h4>Años de experiencia</h4>
                            <p className="stat-number">90+</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* 4. FOOTER */}
            <Footer />
        </div>
    );
}
