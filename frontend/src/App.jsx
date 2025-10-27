import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import ProductosList from './components/ProductosList.jsx';
import ChatUsuario from './components/ChatUsuario.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import './App.css';

function AppContent() {
  const { autenticado, usuario } = useAuth();
  const [vista, setVista] = useState('login'); // 'login' | 'register'
  
  if (!autenticado) {
    if (vista === 'register') {
      return <RegisterForm onVolver={() => setVista('login')} />;
    }
    return <LoginForm onRegistro={() => setVista('register')} />;
  }

  // Si es admin, mostrar el layout completo con menú
  if (usuario?.rol === 'admin') {
    return <AdminLayout />;
  }

  // Si es usuario normal, mostrar catálogo + chat flotante
  return (
    <>
      <ProductosList />
      <ChatUsuario />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}