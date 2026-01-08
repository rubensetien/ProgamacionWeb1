import { useNavigate } from 'react-router-dom';
import '../../styles/public/LandingPageAdvanced.css'; // Reusing existing styles for now

export default function Footer() {
    const navigate = useNavigate();

    return (
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
                                <li onClick={() => navigate('/profesionales')}>Regma para profesionales</li>
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
                    <span className="copyright-text">© 2026 Regma - Tradición y Sabor desde 1933.</span>
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
    );
}
