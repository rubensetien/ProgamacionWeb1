import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import LandingPage from './components/public/LandingPage';
import LoginForm from './components/common/LoginForm';
import RegisterForm from './components/common/RegisterForm';
import ProductosList from './components/cliente/ProductosList';
import Carrito from './components/cliente/Carrito';
import FinalizarPedido from './components/cliente/FinalizarPedido';
import MisPedidos from './components/cliente/MisPedidos';
import PerfilCliente from './components/cliente/PerfilCliente';
import MisSolicitudes from './components/trabajador/MisSolicitudes';
import StoreLocator from './components/public/StoreLocator';
import AdminLayout from './components/admin/AdminLayout';
import './App.css';
import TrabajadorLayout from './components/trabajador/TrabajadorLayout';
import GestorLayout from './components/gestor/GestorLayout';

// Componente para proteger rutas que SÍ requieren autenticación
const ProtectedRoute = ({ children, rolesPermitidos }) => {
  const { autenticado, usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: '#7f8c8d'
      }}>
        Cargando...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { autenticado, usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px',
        color: '#7f8c8d'
      }}>
        Cargando...
      </div>
    );
  }

  // Helper para redirección post-login
  const getRedirectPath = () => {
    if (!autenticado) return '/login';
    if (usuario?.rol === 'admin') return '/admin';
    if (usuario?.rol === 'tienda' || usuario?.rol === 'gestor-tienda') return '/tienda';
    if (usuario?.rol === 'trabajador') return '/trabajador';
    return '/productos';
  };

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/tiendas" element={<StoreLocator />} />
        <Route path="/productos" element={<ProductosList />} />

        <Route
          path="/login"
          element={autenticado ? <Navigate to={getRedirectPath()} /> : <LoginForm />}
        />
        <Route
          path="/register"
          element={autenticado ? <Navigate to="/productos" /> : <RegisterForm />}
        />

        {/* Rutas que requieren autenticación */}
        {/* ... carrito, finalizar-pedido, mis-pedidos, perfil ... */}
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <Carrito />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finalizar-pedido"
          element={
            <ProtectedRoute>
              <FinalizarPedido />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <MisPedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilCliente />
            </ProtectedRoute>
          }
        />

        {/* Rutas de trabajador */}
        <Route
          path="/trabajador"
          element={
            <ProtectedRoute rolesPermitidos={['trabajador']}>
              <TrabajadorLayout />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administrador */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute rolesPermitidos={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Tienda (Nueva Cuenta de Tienda) */}
        <Route
          path="/tienda/*"
          element={
            <ProtectedRoute rolesPermitidos={['tienda', 'gestor-tienda']}>
              <GestorLayout />
            </ProtectedRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <AppContent />
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;
