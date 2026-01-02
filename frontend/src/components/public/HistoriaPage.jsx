import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
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
        img: `${API_URL}/uploads/landing/foto-local.jpg`
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

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.15 });

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="historia-page-editorial">
            {/* --- FULL NAVBAR --- */}
            <Navbar transparent={false} />

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
                    <section key={story.id} className={`story-section reveal-on-scroll ${index % 2 !== 0 ? 'reverse' : ''}`}>
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
            <section className="legacy-banner reveal-on-scroll">
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
