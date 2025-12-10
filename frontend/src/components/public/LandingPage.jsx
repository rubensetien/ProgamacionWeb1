import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/public/LandingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function LandingPage() {
  const navigate = useNavigate();
  const { autenticado, usuario, logout } = useAuth();
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIniciales = (nombre) => {
    if (!nombre) return 'U';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCerrarSesion = () => {
    logout();
    setMostrarMenuUsuario(false);
  };

  // Obtener nombre para mostrar (Nombre o Email o 'Usuario')
  const nombreMostrar = usuario?.nombre || usuario?.email || 'Usuario';

  return (
    <div className="landing-modern">
      {/* Navbar Glassmorphism */}
      <nav className={`navbar-glass ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <div className="navbar-brand" onClick={() => navigate('/')}>
            <img
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
              alt="REGMA"
            />
          </div>

          <div className="navbar-menu">
            {autenticado ? (
              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
                >
                  <div className="user-avatar">
                    {usuario?.avatar ? (
                      <img src={usuario.avatar} alt={nombreMostrar} />
                    ) : (
                      <span>{getIniciales(usuario?.nombre || usuario?.email)}</span>
                    )}
                  </div>
                  <span className="user-name-display">{nombreMostrar}</span>
                  <svg
                    className={`chevron-icon ${mostrarMenuUsuario ? 'open' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {mostrarMenuUsuario && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setMostrarMenuUsuario(false)} />
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <div className="user-avatar large">
                          {usuario?.avatar ? (
                            <img src={usuario.avatar} alt={nombreMostrar} />
                          ) : (
                            <span>{getIniciales(nombreMostrar)}</span>
                          )}
                        </div>
                        <div className="user-details">
                          <p className="user-fullname">{nombreMostrar}</p>
                          <p className="user-email">{usuario?.email}</p>
                        </div>
                      </div>

                      <div className="dropdown-divider" />

                      <div className="dropdown-items">
                        {usuario?.rol === 'trabajador' && (
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              navigate('/trabajador');
                              setMostrarMenuUsuario(false);
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#e67e22' }}>
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                            <span style={{ color: '#e67e22', fontWeight: 600 }}>Dashboard Trabajo</span>
                          </button>
                        )}

                        <button
                          className="dropdown-item"
                          onClick={() => {
                            navigate('/perfil');
                            setMostrarMenuUsuario(false);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span>Mi Perfil</span>
                        </button>

                        {(usuario?.rol === 'admin' || usuario?.rol === 'gestor') && (
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              navigate('/admin');
                              setMostrarMenuUsuario(false);
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            <span>Panel Admin</span>
                          </button>
                        )}

                        <button
                          className="dropdown-item"
                          onClick={() => {
                            navigate('/productos');
                            setMostrarMenuUsuario(false);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          <span>Catálogo</span>
                        </button>

                        <button
                          className="dropdown-item"
                          onClick={() => {
                            navigate('/tiendas');
                            setMostrarMenuUsuario(false);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>Tiendas</span>
                        </button>

                        <button
                          className="dropdown-item"
                          onClick={() => {
                            navigate('/carrito');
                            setMostrarMenuUsuario(false);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span>Mi Carrito</span>
                        </button>
                      </div>

                      <div className="dropdown-divider" />

                      <button
                        className="dropdown-item logout"
                        onClick={handleCerrarSesion}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-text" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </button>
                <button className="btn-gradient" onClick={() => navigate('/register')}>
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section con imagen real */}
      <section className="hero-ultra">
        <div className="hero-bg">
          <img
            src={`${API_URL}/uploads/landing/hero-principal.jpg`}
            alt="Helado REGMA"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
            <span>Desde 1940 · Tradición Artesanal</span>
          </div>

          <h1 className="hero-title-xl">
            El Sabor de lo
            <span className="gradient-text"> Natural</span>
          </h1>

          <p className="hero-subtitle-xl">
            Helados artesanales elaborados con los mejores ingredientes.
            <br />Descubre más de 80 años de pasión por lo auténtico.
          </p>

          <div className="hero-cta-buttons">
            <button className="btn-hero-primary" onClick={() => navigate('/productos')}>
              Explorar Catálogo
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            {!autenticado && (
              <button className="btn-hero-secondary" onClick={() => navigate('/register')}>
                Crear Cuenta Gratis
              </button>
            )}
          </div>

          <div className="hero-stats-inline">
            <div className="stat-inline">
              <span className="stat-value">+80</span>
              <span className="stat-text">Años</span>
            </div>
            <div className="stat-inline">
              <span className="stat-value">+20</span>
              <span className="stat-text">Sabores</span>
            </div>
            <div className="stat-inline">
              <span className="stat-value">100%</span>
              <span className="stat-text">Natural</span>
            </div>
          </div>
        </div>
      </section>

      {/* 📍 FLOATING ACTION BUTTON - ACCESO DIRECTO A TIENDAS */}
      <button
        onClick={() => navigate('/tiendas')}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#ff6600',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 24px',
          boxShadow: '0 4px 20px rgba(255, 102, 0, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          transform: scrollY > 100 ? 'translateY(0)' : 'translateY(100px)', // Animate in
          opacity: scrollY > 100 ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1.05)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>Ubícanos</span>
      </button>

      {/* Categorías con tus imágenes */}
      <section className="categorias-showcase">
        <div className="container-xl">
          <div className="section-intro">
            <span className="section-tag">Nuestros Productos</span>
            <h2 className="section-heading">Descubre Nuestra Selección</h2>
            <p className="section-desc">Cada categoría es una experiencia única de sabor y calidad</p>
          </div>

          <div className="categorias-grid-modern">
            <div className="categoria-card-modern" onClick={() => navigate('/productos?categoria=helados')}>
              <div className="categoria-image-wrapper">
                <img
                  src={`${API_URL}/uploads/landing/categoria-helados.jpg`}
                  alt="Helados Artesanales"
                />
                <div className="categoria-overlay-gradient"></div>
              </div>
              <div className="categoria-content">
                <h3>Helados Artesanales</h3>
                <p>Más de 20 sabores elaborados con recetas tradicionales</p>
                <button className="btn-categoria">
                  Ver Helados
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="categoria-card-modern" onClick={() => navigate('/productos?categoria=dulces')}>
              <div className="categoria-image-wrapper">
                <img
                  src={`${API_URL}/uploads/landing/categoria-dulces.png`}
                  alt="Dulces Tradicionales"
                />
                <div className="categoria-overlay-gradient"></div>
              </div>
              <div className="categoria-content">
                <h3>Dulces Tradicionales</h3>
                <p>Repostería artesanal con las mejores materias primas</p>
                <button className="btn-categoria">
                  Ver Dulces
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="categoria-card-modern" onClick={() => navigate('/productos?categoria=salados')}>
              <div className="categoria-image-wrapper">
                <img
                  src={`${API_URL}/uploads/landing/categoria-salados.jpg`}
                  alt="Productos Salados"
                />
                <div className="categoria-overlay-gradient"></div>
              </div>
              <div className="categoria-content">
                <h3>Productos Salados</h3>
                <p>Bollería salada fresca elaborada cada día</p>
                <button className="btn-categoria">
                  Ver Salados
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historia con imagen real */}
      <section className="historia-visual">
        <div className="container-xl">
          <div className="historia-grid">
            <div className="historia-image-side">
              <img
                src={`${API_URL}/uploads/landing/historia-obrador.jpg`}
                alt="Historia REGMA"
              />
            </div>

            <div className="historia-text-side">
              <span className="section-tag">Nuestra Historia</span>
              <h2 className="section-heading">Más de 80 Años de Tradición</h2>
              <p className="text-lg">
                Desde 1940, REGMA ha sido sinónimo de calidad y tradición en la elaboración
                de helados artesanales. Nuestra pasión por los ingredientes naturales y las
                recetas tradicionales nos ha convertido en un referente en Cantabria.
              </p>
              <p className="text-lg">
                Cada helado es elaborado con dedicación en nuestro obrador de
                Revilla de Camargo, utilizando únicamente productos de la máxima calidad.
              </p>

              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-number-large">1940</div>
                  <div className="stat-label-large">Año de fundación</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number-large">4<sup>ta</sup></div>
                  <div className="stat-label-large">Generación familiar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-final">
        <div className="cta-content-center">
          <h2 className="cta-title">¿Listo para Disfrutar?</h2>
          <p className="cta-text">Descubre nuestra amplia variedad de sabores y formatos. La tradición te espera.</p>
          <button className="btn-cta-large" onClick={() => navigate('/productos')}>
            Ver Catálogo Completo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-minimal">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <img
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
              alt="REGMA"
              className="footer-logo"
            />
            <p className="footer-tagline">El sabor de lo natural desde 1940</p>
          </div>

          <div className="footer-links-section">
            <h4>Productos</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos'); }}>Catálogo</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos?categoria=helados'); }}>Helados</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/productos?categoria=dulces'); }}>Dulces</a>
          </div>

          <div className="footer-links-section">
            <h4>Cuenta</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Iniciar Sesión</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Registrarse</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/mis-pedidos'); }}>Mis Pedidos</a>
          </div>

          <div className="footer-links-section">
            <h4>Contacto</h4>
            <p>info@regma.es</p>
            <p>Revilla de Camargo, Cantabria</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/tiendas'); }} style={{ color: 'inherit', display: 'block', marginTop: '10px' }}>
              Localizar Tiendas
            </a>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; 2024 REGMA. Todos los derechos reservados.</p>
          <div className="footer-social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
