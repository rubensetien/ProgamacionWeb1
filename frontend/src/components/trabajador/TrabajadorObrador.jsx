import { useAuth } from '../../context/AuthContext';

const TrabajadorObrador = () => {
  const { logout, usuario } = useAuth();
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fff5ee 0%, #ffe8d9 100%)',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <img 
            src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" 
            alt="REGMA" 
            style={{ width: '200px', marginBottom: '30px' }}
          />
          <h1 style={{ color: '#ff6600', marginBottom: '10px' }}>
            👋 Bienvenido, {usuario?.nombre}
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            <strong>Rol:</strong> Trabajador de Obrador<br />
            <strong>Puesto:</strong> {usuario?.ubicacionAsignada?.puesto || 'Sin especificar'}
          </p>
          <p style={{ color: '#999', marginBottom: '30px' }}>
            Panel de obrador - En desarrollo SPRINT 3
          </p>
          <button 
            onClick={logout}
            style={{
              padding: '15px 30px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrabajadorObrador;
