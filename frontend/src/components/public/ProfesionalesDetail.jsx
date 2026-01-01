import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import '../../styles/public/ProfesionalesPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Data Configuration for each section
const SECTIONS_DATA = {
    hosteleria: {
        title: "Helados para Hostelería",
        subtitle: "Calidad artesana en tu carta de postres",
        description: "Eleva el nivel de tu restaurante con nuestros helados artesanos. Ofrecemos formatos de 4L y 2.5L diseñados específicamente para la manipulación profesional, con una textura y cremosidad que se mantiene perfecta en servicio.",
        features: [
            "Más de 30 sabores disponibles.",
            "Formatos optimizados (4L / 2.5L).",
            "Logística de frío garantizada.",
            "Asesoramiento para carta de postres."
        ],
        image: `${API_URL}/uploads/landing/categoria-helados.jpg`,
        icon: "🍦"
    },
    retail: {
        title: "Helados para Supermercados",
        subtitle: "La tradición de Regma en el lineal de congelados",
        description: "Llevamos la experiencia de nuestras heladerías a los hogares. Nuestros formatos retail (500ml y Packs) están diseñados para destacar en el lineal del supermercado, con un packaging premium que transmite la calidad del producto.",
        features: [
            "Formatos de 500ml High Convenience.",
            "Gama Top Ventas (Nata, Fresa, Chocolate...).",
            "Packaging atractivo y resistente.",
            "Campañas de apoyo en punto de venta."
        ],
        image: `${API_URL}/uploads/landing/categoria-dulces.png`,
        icon: "🛒"
    },
    corner: {
        title: "Córner Regma",
        subtitle: "Tu propia heladería llave en mano",
        description: "Transforma un espacio de tu negocio en un punto de venta Regma. Ofrecemos un modelo de córner modular que incluye vitrina, branding y todo lo necesario para empezar a vender nuestros helados desde el primer día.",
        features: [
            "Mobiliario y vitrinas personalizadas.",
            "Formación inicial para el personal.",
            "Suministro regular y automático.",
            "Imagen de marca reconocida."
        ],
        image: `${API_URL}/uploads/landing/historia-obrador2.jpg`,
        icon: "🏪"
    },
    eventos: {
        title: "Helados para Eventos",
        subtitle: "Un toque dulce inolvidable",
        description: "Sorprende a tus invitados con un carrito de helados Regma vintage. Ideal para bodas, comuniones, eventos corporativos o fiestas privadas. Nosotros nos encargamos de todo: transporte, servicio y, por supuesto, el mejor helado.",
        features: [
            "Carrito vintage con personal uniformado.",
            "Selección de sabores a medida.",
            "Opción de tarrinas o cucuruchos.",
            "Servicio integral llave en mano."
        ],
        image: `${API_URL}/uploads/landing/hero-principal.jpg`,
        icon: "🎉"
    }
};

export default function ProfesionalesDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const data = SECTIONS_DATA[slug];

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!data) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <h2>Sección no encontrada</h2>
                <button onClick={() => navigate('/profesionales')} className="btn-contact-white" style={{ color: 'orange', borderColor: 'orange' }}>
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="profesionales-detail-page">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="detail-hero" style={{ backgroundImage: `url(${data.image})` }}>
                <div className="detail-hero-overlay" />
                <div className="detail-hero-content">
                    <div className="detail-icon">{data.icon}</div>
                    <h1 className="detail-title">{data.title}</h1>
                    <p className="detail-subtitle">{data.subtitle}</p>
                </div>
            </section>

            {/* --- CONTENT SECTION --- */}
            <section className="detail-content-section">
                <div className="detail-grid">
                    <div className="text-block">
                        <h2 className="section-heading-fresh">Propuesta de Valor</h2>
                        <p className="detail-description">{data.description}</p>

                        <ul className="features-list">
                            {data.features.map((feature, idx) => (
                                <li key={idx} className="feature-item">
                                    <span className="check-icon">✓</span> {feature}
                                </li>
                            ))}
                        </ul>

                        <button className="btn-premium" onClick={() => navigate('/contacto')}>
                            Solicitar Información
                        </button>
                    </div>

                    {/* Visual Box / Quote */}
                    <div className="visual-block">
                        <div className="quote-box">
                            <p>“{data.subtitle}”</p>
                            <span>— Equipo Regma Profesional</span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
