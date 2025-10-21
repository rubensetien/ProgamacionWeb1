import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/LoginForm.jsx';
import ProductosList from './components/ProductosList.jsx';
import ChatUsuario from './components/ChatUsuario.jsx';
import ChatAdmin from './components/ChatAdmin.jsx';
import './App.css';

function AppContent() {
  const { autenticado, usuario } = useAuth();
  
  if (!autenticado) {
    return <LoginForm />;
  }

  return (
    <>
      <ProductosList />
      
      {/* Mostrar chat según el rol del usuario */}
      {usuario?.rol === 'admin' ? <ChatAdmin /> : <ChatUsuario />}
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