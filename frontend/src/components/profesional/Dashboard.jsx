import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { Building2, ShoppingBag, FileText, Users, ArrowRight } from 'lucide-react';
import '../../styles/profesional/DashboardProfesional.css';

export default function Dashboard() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="profesional-dashboard">
            <Navbar />

            {/* HEADER */}
            <div className="dashboard-header">
                <div className="header-container">
                    <h1 className="dashboard-title">Panel Profesional</h1>
                    <p className="dashboard-subtitle">
                        Bienvenido de nuevo, <span className="user-highlight">{usuario?.nombre || 'Usuario'}</span>
                    </p>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="dashboard-content">

                {/* LEFT: BUSINESS INFO CARD */}
                <div className="business-card">
                    <div className="business-header">
                        <div className="business-icon-wrapper">
                            <Building2 size={40} strokeWidth={1.5} />
                        </div>
                        <div className="business-info">
                            <h2>Mi Negocio</h2>
                            <p>Gestión integral de cuenta y colaboradores</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ACTIONS GRID */}
                <div className="actions-grid">
                    {/* CARD 1: PEDIDOS */}
                    <div className="action-card" onClick={() => navigate('/productos')}>
                        <div>
                            <div className="action-icon">
                                <ShoppingBag size={24} />
                            </div>
                            <h3 className="action-title">Nuevo Pedido</h3>
                            <p className="action-desc">Accede al catálogo completo para realizar reposiciones de stock.</p>
                        </div>
                        <div className="action-link">
                            Ir al Catálogo <ArrowRight size={16} />
                        </div>
                    </div>

                    {/* CARD 2: FACTURAS */}
                    <div className="action-card disabled">
                        <div>
                            <div className="action-icon">
                                <FileText size={24} />
                            </div>
                            <h3 className="action-title">Facturas</h3>
                            <p className="action-desc">Consulta y descarga tu histórico de facturación mes a mes.</p>
                        </div>
                        <div className="action-link" style={{ color: '#999' }}>
                            Próximamente
                        </div>
                    </div>

                    {/* CARD 3: EQUIPO (Optional) */}
                    {usuario?.esAdminNegocio && (
                        <div className="action-card" onClick={() => navigate('/profesionales/equipo')}>
                            <div>
                                <div className="action-icon">
                                    <Users size={24} />
                                </div>
                                <h3 className="action-title">Mi Equipo</h3>
                                <p className="action-desc">Administra los permisos de acceso para tus empleados.</p>
                            </div>
                            <div className="action-link">
                                Gestionar <ArrowRight size={16} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
