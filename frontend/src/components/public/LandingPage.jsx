import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import RevealOnScroll from '../common/RevealOnScroll';
import '../../styles/public/LandingPageAdvanced.css';

// Videos de stock de alta calidad (Placeholders)
const HERO_VIDEO_URL = "https://cdn.pixabay.com/video/2023/10/12/184734-874249151_large.mp4"; // Olas/Crema suave
const MASK_VIDEO_URL = "https://cdn.pixabay.com/video/2022/04/24/114979-702334887_large.mp4"; // Ingredientes frescos

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LandingPage() {
  const navigate = useNavigate();
  const { autenticado, usuario, logout } = useAuth();
  // const [menuAbierto, setMenuAbierto] = useState(false); // Removed: Handled in Navbar
  const [scrollY, setScrollY] = useState(0);
  const horizontalScrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto de scroll horizontal con la rueda del ratón
  useEffect(() => {
    const el = horizontalScrollRef.current;
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY === 0) return;
        // Solo prevenir scroll vertical si estamos "dentro" del componente de forma intencional
        // Para simplicidad, dejamos el comportamiento nativo de scroll horizontal si es trackpad
        // O podríamos forzar horizontal scroll:
        // e.preventDefault();
        // el.scrollTo({
        //     left: el.scrollLeft + e.deltaY * 2,
        //     behavior: 'smooth'
        // });
      };
      // el.addEventListener('wheel', onWheel);
      return () => {
        // if(el) el.removeEventListener('wheel', onWheel);
      };
    }
  }, []);

  // Scroll handler
  const scrollToContent = () => {
    const nextSection = document.querySelector('.natural-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper para iniciales moved to Navbar
  // const getInitials = (name) => ...

  return (
    <div className="landing-advanced">



      {/* --- UNITY NAVBAR (Transparent initially) --- */}
      <Navbar transparent={true} />

      {/* --- 1. HERO CINEMATOGRÁFICO --- */}
      <section className="hero-video-container">
        <video
          className="hero-video-bg"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={`${API_URL}/uploads/PreparacionCucurucho.mp4`} type="video/mp4" />
          Tu navegador no soporta video HTML5.
        </video>
        <div className="hero-overlay-gradient" />

        <div
          className="hero-content-advanced"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`, // Parallax simple
            opacity: 1 - scrollY / 700,
            perspective: '1000px' // Enable 3D space
          }}
          onMouseMove={(e) => {
            const { clientX, clientY, currentTarget } = e;
            const { width, height, left, top } = currentTarget.getBoundingClientRect();
            const x = clientX - left;
            const y = clientY - top;
            const xPct = (x / width) - 0.5;
            const yPct = (y / height) - 0.5;

            // Set CSS variables for the tilt effect
            currentTarget.style.setProperty('--mouse-x', xPct);
            currentTarget.style.setProperty('--mouse-y', yPct);
          }}
          onMouseLeave={(e) => {
            // Reset on leave
            e.currentTarget.style.setProperty('--mouse-x', 0);
            e.currentTarget.style.setProperty('--mouse-y', 0);
          }}
        >
          {/* DYNAMIC LOGO IMAGE */}
          <img
            src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
            alt="REGMA"
            className="hero-logo-dynamic"
          />
          <p className="hero-subtitle-advanced">Pasión Helada desde 1940</p>
        </div>

        {/* Scroll Indicator (Mouse) */}
        <div className="scroll-indicator" onClick={scrollToContent}>
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="arrow-scroll">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      {/* --- 2. 100% NATURAL (Clean & Bold) --- */}
      <section className="natural-section">
        <RevealOnScroll animation="fade-up">
          <div className="natural-content">
            <h2 className="natural-title">100% NATURAL</h2>
            <p className="natural-desc">
              Sin aditivos. Sin conservantes.<br />
              Solo leche fresca de Cantabria, fruta de temporada y pasión.
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* --- 3. SCROLL HORIZONTAL DE PRODUCTOS (Vibrant) --- */}
      <section className="horizontal-section">
        <div style={{ padding: '0 5vw 40px 5vw', textAlign: 'center' }}>
          <span className="section-tag">Nuestras Creaciones</span>
          <h2 className="section-heading-fresh">Sabores que Enamoran</h2>
        </div>

        <div className="horizontal-track" ref={horizontalScrollRef}>
          {/* Card 1 */}
          <div className="product-card-3d" onClick={() => navigate('/productos?categoria=helados')}>
            <img className="card-img-bg" src={`${API_URL}/uploads/landing/categoria-helados.jpg`} alt="Helados" />
            <div className="card-content-bottom">
              <h3 className="card-title-lg">Helados</h3>
              <p className="card-desc">Cremosos y auténticos</p>
              <button className="btn-card-action">Ver Catálogo</button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="product-card-3d" onClick={() => navigate('/productos?categoria=dulces')}>
            <img className="card-img-bg" src={`${API_URL}/uploads/landing/categoria-dulces.png`} alt="Dulces" />
            <div className="card-content-bottom">
              <h3 className="card-title-lg">Repostería</h3>
              <p className="card-desc">Dulces momentos</p>
              <button className="btn-card-action">Ver Catálogo</button>
            </div>
          </div>

          {/* Card 3 (Placeholder for Salted/Others if needed) */}
          <div className="product-card-3d" onClick={() => navigate('/productos?categoria=salados')}>
            <img className="card-img-bg" src={`${API_URL}/uploads/landing/categoria-salados.jpg`} alt="Salados" />
            <div className="card-content-bottom">
              <h3 className="card-title-lg">Salados</h3>
              <p className="card-desc">Nuestros clásicos</p>
              <button className="btn-card-action">Ver Catálogo</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. HISTORIA TEASER (New) --- */}
      <section className="map-teaser-section" style={{ height: '60vh' }}>
        <img
          src={`${API_URL}/uploads/landing/historia-obrador2.jpg`}
          alt="Nuestra Historia"
          className="map-bg-image"
          style={{ objectPosition: 'center' }}
        />
        <div className="map-content-center">
          <RevealOnScroll animation="zoom-in">
            <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Nuestra Historia</h2>
            <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#333' }}>
              Más de 80 años de tradición, calidad y pasión por lo auténtico.
            </p>
            <button className="btn-premium" onClick={() => navigate('/historia')}>
              Conocer Más
            </button>
          </RevealOnScroll>
        </div>
      </section>

      {/* --- 5. MAPA INTERACTIVO TEASER --- */}
      <section className="map-teaser-section">
        {/* Usamos una imagen de fondo (puedes cambiarla por la que quieras) */}
        <img
          src={`${API_URL}/uploads/landing/hero-principal.jpg`}
          alt="Mapa Fondo"
          className="map-bg-image"
        />
        <div className="map-content-center">
          <RevealOnScroll animation="zoom-in" delay={0.2}>
            <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Estamos Cerca de Ti</h2>
            <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#333' }}>
              Descubre nuestras más de 25 ubicaciones en el norte de España.
            </p>
            <button className="btn-premium" onClick={() => navigate('/tiendas')}>
              Ver Mapa
            </button>
          </RevealOnScroll>
        </div>
      </section>

      {/* --- 6. REGMA PARA PROFESIONALES (Alternative Organic Design) --- */}
      <section className="profesional-section-alt">
        <div className="profesional-content-alt">
          <RevealOnScroll animation="fade-left">
            <span className="profesional-tag-alt">Regma Profesionales</span>
            <h2 className="profesional-title-alt">Tu Portal de<br />Gestión</h2>
            <p className="profesional-desc-alt">
              Accede a nuestra plataforma exclusiva para hostelería y retail.
              Gestiona tus pedidos, consulta el catálogo completo y descubre las novedades de temporada en un solo clic.
              <br /><br />
              <strong>Eficiencia, rapidez y el sabor de siempre.</strong>
            </p>
            <button className="btn-profesional" onClick={() => navigate('/profesionales')}>
              Entrar al Portal
            </button>
          </RevealOnScroll>
        </div>

        <div className="profesional-video-wrapper">
          <div className="video-portal-frame">
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={`${API_URL}/uploads/helados_para_supermercados.mp4`} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* --- 5. FOOTER MASTERPIECE --- */}
      <Footer />

    </div>
  );
}
