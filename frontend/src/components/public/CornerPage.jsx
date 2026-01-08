import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import RevealOnScroll from '../common/RevealOnScroll';
import { Plus, Minus } from 'lucide-react';
import '../../styles/public/CornerPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CornerPage() {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "¿Cuánto espacio necesito en mi negocio para el córner Regma?",
            answer: "El córner Regma tiene una altura de 1,98 m, una anchura de 1,65 m y una profundidad de 80 cm, además del espacio que deberás dejar de más para que una persona pueda servir desde detrás del mismo."
        },
        {
            question: "¿Quién se encarga del mantenimiento y limpieza del córner?",
            answer: "La limpieza diaria y superficial del córner corre a cargo del negocio. Mientras, para el mantenimiento relacionado con averías, puedes ponerte en contacto con nuestro comercial o con nuestro servicio técnico."
        },
        {
            question: "¿Cuál es la duración mínima del acuerdo temporal? ¿Y la máxima?",
            answer: (
                <>
                    <p>La duración mínima del alquiler de esta espacio es de 12 meses.</p>
                    <p style={{ marginTop: '10px' }}>Respecto a la duración máxima, no existe un límite.</p>
                </>
            )
        },
        {
            question: "¿Se incluye material promocional o decorativo para el córner?",
            answer: (
                <>
                    <p>El córner viene serigrafiado con la nueva imagen de marca Regma. Además, si el negocio lo necesita, podemos ampliar el material promocional con folletos, display para mesas o barra, etc.</p>
                    <p style={{ marginTop: '10px' }}>Consulta a nuestro comercial para ello.</p>
                </>
            )
        },
        {
            question: "¿Cómo se gestiona el abastecimiento de helados?",
            answer: "Los tiempos de reabastecimiento dependen de la zona geográfica. Contacta con nuestros Asesores HORECA o con tu delegado comercial para establecer el mejor sistema de aprovisionamiento."
        }
    ];

    return (
        <div className="corner-page">
            <Navbar transparent={true} />

            {/* HERO / BRANDING SECTION (Video Background) */}
            <RevealOnScroll className="corner-branding-wrapper">
                <section className="corner-branding">
                    <div className="corner-branding-video-container">
                        <video autoPlay loop muted playsInline className="corner-branding-video">
                            <source src={`${API_URL}/uploads/preparacionHelado.mp4`} type="video/mp4" />
                        </video>
                        <div className="corner-branding-overlay"></div>
                    </div>

                    <div className="corner-branding-content">
                        <h2>Helado natural de Cantabria y una marca icónica en tu negocio.</h2>
                        <p>
                            Amplía tu oferta gastronómica incorporando helados elaborados de manera artesanal a partir de ingredientes naturales. Nuestro equipo de asesores HORECA te acompaña durante todo el proceso.
                        </p>
                        <div className="corner-actions">
                            <button className="btn-corner-primary">Felicidad para tu negocio</button>
                            <button className="btn-corner-secondary">Llámanos</button>
                        </div>
                    </div>
                </section>
            </RevealOnScroll>

            {/* INFO SECTION (Broken Grid) */}
            <RevealOnScroll delay={0.2}>
                <section className="corner-info">
                    <div className="corner-info-content">
                        <h1>Córner para negocios de hostelería</h1>
                        <p>
                            ¿Tienes un negocio de hostelería y quieres ofrecer los míticos helados Regma?
                        </p>
                        <p>
                            Con nuestro <strong>córner Regma</strong>, podrás sorprender a tus clientes durante toda la temporada con un espacio con identidad de marca propio, refrigerado y funcional, preparado para albergar <strong>más de 15 sabores</strong>.
                        </p>
                        <p>
                            Nuestro equipo comercial se encarga de todo lo necesario para garantizar el reabastecimiento y asegurarte de que <strong>los helados Regma nunca falten</strong> en tu restaurante, cafetería, hotel o establecimiento de hostelería.
                        </p>
                        <p>
                            Súmate a quienes ya marcan la diferencia con un producto auténtico, natural y con historia.
                        </p>
                    </div>
                    <div className="corner-info-image">
                        <video autoPlay loop muted playsInline>
                            <source src={`${API_URL}/uploads/preparacionHelado.mp4`} type="video/mp4" />
                        </video>
                    </div>
                </section>
            </RevealOnScroll>

            {/* GALLERY SECTION (Interactive Slider) */}
            <RevealOnScroll delay={0.3}>
                <section
                    className="corner-gallery"
                    onMouseDown={(e) => {
                        const slider = e.currentTarget;
                        slider.isDown = true;
                        slider.startX = e.pageX - slider.offsetLeft;
                        slider.scrollLeftState = slider.scrollLeft;
                        slider.style.cursor = 'grabbing';
                    }}
                    onMouseLeave={(e) => {
                        const slider = e.currentTarget;
                        slider.isDown = false;
                        slider.style.cursor = 'grab';
                    }}
                    onMouseUp={(e) => {
                        const slider = e.currentTarget;
                        slider.isDown = false;
                        slider.style.cursor = 'grab';
                    }}
                    onMouseMove={(e) => {
                        const slider = e.currentTarget;
                        if (!slider.isDown) return;
                        e.preventDefault();
                        const x = e.pageX - slider.offsetLeft;
                        const walk = (x - slider.startX) * 2; // Scroll-fast
                        slider.scrollLeft = slider.scrollLeftState - walk;
                    }}
                    // Add touch support for mobile
                    onTouchStart={(e) => {
                        // Native touch scroll works by default with overflow-x: auto
                        // We just ensure the style is correct
                    }}
                >
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/FotoTarrina.jpg`} alt="Tarrina Regma" draggable="false" />
                    </div>
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/fotoCucuruchoChoco.jpg`} alt="Cucurucho Chocolate" draggable="false" />
                    </div>
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/fotocorner2.jpg`} alt="Corner Regma" draggable="false" />
                    </div>
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/fotocorner3.jpg`} alt="Corner Regma Detalle" draggable="false" />
                    </div>
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/fotocorner4.jpg`} alt="Corner Regma Ambiente" draggable="false" />
                    </div>
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/fotocorner5.jpg`} alt="Corner Regma Servicio" draggable="false" />
                    </div>
                    <div className="corner-gallery-item">
                        <img src={`${API_URL}/uploads/landing/fotocorner6.jpg`} alt="Corner Regma Producto" draggable="false" />
                    </div>
                </section>
            </RevealOnScroll>

            {/* FAQ SECTION (Refined) */}
            <RevealOnScroll delay={0.4}>
                <section className="corner-faq">
                    <div className="corner-faq-grid">
                        {/* Left: Intro */}
                        <div className="corner-faq-intro">
                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="faq-badge">FAQS</span>
                            </div>
                            <h3>Resolvemos tus dudas acerca del proceso</h3>
                            <div className="faq-divider-line"></div>
                            <p className="faq-intro-text">
                                Si quieres saber más acerca del proceso de alquiler de Córners Refrigerados, ponte en contacto con nuestro equipo de Asesores HORECA.
                            </p>
                        </div>

                        {/* Right: List */}
                        <div className="faq-list">
                            {faqs.map((faq, index) => (
                                <div key={index} className={`faq-item ${openFaq === index ? 'active' : ''}`} onClick={() => toggleFaq(index)}>
                                    <div className="faq-question">
                                        <span>{faq.question}</span>
                                        {openFaq === index ? <Minus size={20} className="faq-icon" /> : <Plus size={20} className="faq-icon" />}
                                    </div>
                                    <div className="faq-answer">
                                        {faq.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </RevealOnScroll>

            <Footer />
        </div>
    );
}
