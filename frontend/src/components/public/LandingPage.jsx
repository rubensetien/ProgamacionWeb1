import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
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
        <div className="natural-content">
          <h2 className="natural-title">100% NATURAL</h2>
          <p className="natural-desc">
            Sin aditivos. Sin conservantes.<br />
            Solo leche fresca de Cantabria, fruta de temporada y pasión.
          </p>
        </div>
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
          <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Nuestra Historia</h2>
          <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#333' }}>
            Más de 80 años de tradición, calidad y pasión por lo auténtico.
          </p>
          <button className="btn-premium" onClick={() => navigate('/historia')}>
            Conocer Más
          </button>
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
          <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Estamos Cerca de Ti</h2>
          <p style={{ marginBottom: '40px', fontSize: '1.2rem', color: '#333' }}>
            Descubre nuestras más de 25 ubicaciones en el norte de España.
          </p>
          <button className="btn-premium" onClick={() => navigate('/tiendas')}>
            Ver Mapa
          </button>
        </div>
      </section>

      {/* --- 5. FOOTER MASTERPIECE --- */}
      <div className="footer-wrapper">
        {/* Wave Separator */}
        <div className="custom-shape-divider-top">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>

        <footer className="footer-masterpiece">
          <div className="footer-content-grid">

            {/* Brand Section */}
            <div className="footer-brand-section">
              <img
                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                alt="Regma"
                className="footer-logo-official"
              />
              <p className="footer-mission">
                El sabor de lo natural. Ingredientes seleccionados, recetas únicas, calidad y tradición desde 1933.
              </p>
            </div>

            {/* Menu Sections */}
            <div className="footer-menus">
              <div className="menu-col">
                <h6 className="menu-title">MENÚ</h6>
                <ul className="menu-list">
                  <li onClick={() => navigate('/productos?categoria=Helados')}>Helados y Dulces</li>
                  <li onClick={() => navigate('/tiendas')}>Trabaja con nosotros</li>
                  <li onClick={() => navigate('/tiendas')}>Regma para profesionales</li>
                  <li onClick={() => navigate('/tiendas')}>Localizador de tiendas</li>
                  <li onClick={() => navigate('/contacto')}>Contacto</li>
                </ul>
              </div>

              <div className="menu-col">
                <h6 className="menu-title">PRODUCTO</h6>
                <ul className="menu-list">
                  <li onClick={() => navigate('/productos?categoria=Helados')}>Helados Regma</li>
                  <li onClick={() => navigate('/productos?categoria=Salados')}>Nuestros Salados</li>
                  <li onClick={() => navigate('/productos?categoria=Dulces')}>Dulces Regma</li>
                </ul>
              </div>

              <div className="menu-col">
                <h6 className="menu-title">LEGAL</h6>
                <ul className="menu-list">
                  <li>Política de privacidad</li>
                  <li>Política de Cookies</li>
                  <li>Aviso legal</li>
                  <li>Canal interno</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>

        {/* Orange Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="bottom-bar-content">
            <span className="copyright-text">© 2025 Regma - Tradición y Sabor desde 1933.</span>
            <div className="bottom-socials">
              <a href="#" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
