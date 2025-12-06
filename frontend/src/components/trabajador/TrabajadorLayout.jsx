import { useAuth } from '../../context/AuthContext';
import TrabajadorTienda from './TrabajadorTienda';
import TrabajadorObrador from './TrabajadorObrador';
import TrabajadorOficina from './TrabajadorOficina';
import '../../styles/trabajador/TrabajadorLayout.css';

const TrabajadorLayout = () => {
  const { usuario } = useAuth();
  
  // Determinar tipo de trabajador
  const tipoTrabajador = usuario?.tipoTrabajador || usuario?.ubicacionAsignada?.tipo;

  return (
    <div className="trabajador-layout">
      {tipoTrabajador === 'tienda' && <TrabajadorTienda />}
      {tipoTrabajador === 'obrador' && <TrabajadorObrador />}
      {tipoTrabajador === 'oficina' && <TrabajadorOficina />}
      
      {!tipoTrabajador && (
        <div className="sin-asignacion">
          <h2>⚠️ Sin Asignación</h2>
          <p>No tienes una ubicación asignada. Contacta con el administrador.</p>
        </div>
      )}
    </div>
  );
};

export default TrabajadorLayout;
