import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/LoginForm.jsx';
import ProductosList from './components/ProductosList.jsx';
import './App.css';

function AppContent() {
  const { autenticado } = useAuth();
  return autenticado ? <ProductosList /> : <LoginForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
