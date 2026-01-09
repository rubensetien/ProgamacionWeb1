import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Send, Archive, ChevronDown, Check } from 'lucide-react';
import '../../styles/gestor/PanelTienda.css'; // Reusing styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SolicitudStock = () => {
  const { usuario, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [itemsSolicitud, setItemsSolicitud] = useState([]);
  // Formulario de item actual
  const [productoSelec, setProductoSelec] = useState('');
  const [categoriaSelec, setCategoriaSelec] = useState('');
  const [saborSelec, setSaborSelec] = useState('');
  const [nombreProductoSelec, setNombreProductoSelec] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [unidad, setUnidad] = useState('unidades');

  const [historial, setHistorial] = useState([]);
  const [activeTab, setActiveTab] = useState('nueva'); // nueva | historial
  const [enviando, setEnviando] = useState(false);

  // Helper to extract Safe ID
  const getUbicacionId = (location) => {
    if (!location) return null;
    return typeof location === 'object' ? location._id : location;
  };

  const ubicacionId = getUbicacionId(usuario?.ubicacionAsignada);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    console.log('🔄 [SolicitudStock] Checking usuario for history load:', usuario);
    if (ubicacionId) {
      console.log('✅ [SolicitudStock] Tienda asignada found, loading history...');
      cargarHistorial();
    } else {
      console.log('⚠️ [SolicitudStock] No tiendaAsignada to load history.');
    }
  }, [ubicacionId, token]);

  const cargarProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/productos`);
      const data = await res.json();
      if (data.success) setProductos(data.data);
    } catch (error) {
      console.error('Error productos:', error);
    }
  };

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API_URL}/api/solicitudes-stock/tienda`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setHistorial(data.data);
    } catch (error) {
      console.error('Error historial:', error);
    }
  };

  const agregarItem = () => {
    if (!productoSelec || cantidad <= 0) return;

    const prod = productos.find(p => p._id === productoSelec);

    // Construct a descriptive name based on the multi-step selection
    let nombreItem = prod.nombre;
    if (prod.variante) nombreItem = `${prod.variante.nombre} (${prod.nombre})`;
    if (prod.formato) nombreItem += ` - ${prod.formato.nombre}`;

    const nuevoItem = {
      producto: productoSelec,
      nombre: nombreItem,
      cantidad: parseInt(cantidad),
      unidad
    };

    setItemsSolicitud([...itemsSolicitud, nuevoItem]);
    // Reset form
    setProductoSelec('');
    setSaborSelec('');
    setNombreProductoSelec('');
    // Dont reset category to allow faster entry of same category items
    setCantidad(1);
  };

  const eliminarItem = (index) => {
    const nuevos = [...itemsSolicitud];
    nuevos.splice(index, 1);
    setItemsSolicitud(nuevos);
  };

  const enviarSolicitud = async () => {
    if (itemsSolicitud.length === 0) return;
    setEnviando(true);

    try {
      const res = await fetch(`${API_URL}/api/solicitudes-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsSolicitud })
      });
      const data = await res.json();

      if (data.success) {
        alert('Solicitud enviada correctamente');
        setItemsSolicitud([]);
        cargarHistorial();
        setActiveTab('historial');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error enviando:', error);
      alert('Error al enviar solicitud');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title" style={{ marginBottom: '24px' }}>Solicitud de Stock</h2>

      {/* Tabs */}
      <div className="tabs-container" style={{ justifyContent: 'flex-start' }}>
        <button
          onClick={() => setActiveTab('nueva')}
          className={`tab-btn ${activeTab === 'nueva' ? 'active' : ''}`}
        >
          Nueva Solicitud
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
        >
          Historial de Solicitudes
        </button>
      </div>

      {activeTab === 'nueva' ? (
        <div className="stock-layout">
          {/* Formulario Agregar Producto */}
          <div className="card">
            <div className="card-header">
              <h3>Agregar Producto</h3>
            </div>
            <div className="card-body">
              {/* Step 1: Category Selection */}
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={categoriaSelec}
                  onChange={(e) => {
                    setCategoriaSelec(e.target.value);
                    setSaborSelec('');
                    setNombreProductoSelec('');
                    setProductoSelec('');
                  }}
                >
                  <option value="">Seleccionar categoría...</option>
                  {[...new Set(productos.map(p => p.categoria?.nombre).filter(Boolean))].map(catName => (
                    <option key={catName} value={catName}>{catName}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Conditional Logic */}
              {categoriaSelec && (
                <>
                  {/* HELADOS Logic */}
                  {categoriaSelec.toLowerCase().includes('helado') ? (
                    <div className="form-group">
                      <label className="form-label">Sabor</label>
                      <select
                        className="form-select"
                        value={saborSelec}
                        onChange={(e) => {
                          setSaborSelec(e.target.value);
                          setProductoSelec('');
                        }}
                      >
                        <option value="">Seleccionar sabor...</option>
                        {[...new Set(productos
                          .filter(p => p.categoria?.nombre === categoriaSelec && p.variante?.nombre)
                          .map(p => p.variante.nombre)
                        )].sort().map(sabor => (
                          <option key={sabor} value={sabor}>{sabor}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    /* DULCES/OTHER Logic */
                    <div className="form-group">
                      <label className="form-label">Producto</label>
                      <select
                        className="form-select"
                        value={nombreProductoSelec}
                        onChange={(e) => {
                          setNombreProductoSelec(e.target.value);
                          setProductoSelec('');
                        }}
                      >
                        <option value="">Seleccionar producto...</option>
                        {[...new Set(productos
                          .filter(p => p.categoria?.nombre === categoriaSelec)
                          .map(p => p.nombre)
                        )].sort().map(nombre => (
                          <option key={nombre} value={nombre}>{nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Step 3: Specific Product/Format Selection */}
                  {/* Show if Sabor is selected (Helados) OR Product Name is selected (Dulces) */}
                  {((categoriaSelec.toLowerCase().includes('helado') && saborSelec) ||
                    (!categoriaSelec.toLowerCase().includes('helado') && nombreProductoSelec)) && (
                      <div className="form-group">
                        <label className="form-label">Formato</label>
                        <select
                          className="form-select"
                          value={productoSelec}
                          onChange={(e) => setProductoSelec(e.target.value)}
                        >
                          <option value="">Seleccionar formato...</option>
                          {productos
                            .filter(p => {
                              if (categoriaSelec.toLowerCase().includes('helado')) {
                                return p.categoria?.nombre === categoriaSelec && p.variante?.nombre === saborSelec;
                              } else {
                                return p.categoria?.nombre === categoriaSelec && p.nombre === nombreProductoSelec;
                              }
                            })
                            .sort((a, b) => {
                              // Sort by format capacity if possible, else name
                              const capA = a.formato?.capacidad || 0;
                              const capB = b.formato?.capacidad || 0;
                              return capA - capB;
                            })
                            .map(p => (
                              <option key={p._id} value={p._id}>
                                {p.formato?.nombre || 'Estándar'}
                                {p.formato?.capacidad ? ` (${p.formato.capacidad} ${p.formato.unidad})` : ''}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}
                </>
              )}

              <div className="row-2-cols mb-4">
                <div className="col">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Unidad</label>
                  <select
                    className="form-select"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                  >
                    <option value="unidades">Uds</option>
                    <option value="cajas">Cajas</option>
                    <option value="kg">Kg</option>
                    <option value="litros">Litros</option>
                  </select>
                </div>
              </div>

              <button
                onClick={agregarItem}
                disabled={!productoSelec}
                className="btn-secondary btn-full"
              >
                <Plus size={16} /> Agregar a la Lista
              </button>
            </div>
          </div>

          {/* Lista Resumen */}
          <div className="card">
            <div className="card-header">
              <h3>Resumen de Solicitud</h3>
              <span className="header-meta">{itemsSolicitud.length} items</span>
            </div>

            <div className="card-body">
              {itemsSolicitud.length === 0 ? (
                <div className="empty-state">
                  <Archive size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>La lista está vacía</p>
                  <p style={{ fontSize: '12px' }}>Agrega productos desde el panel izquierdo</p>
                </div>
              ) : (
                <div className="stock-list-container">
                  {itemsSolicitud.map((item, index) => (
                    <div key={index} className="stock-item-row">
                      <div>
                        <p className="item-name">{item.nombre}</p>
                        <p className="item-qty">{item.cantidad} {item.unidad}</p>
                      </div>
                      <button
                        onClick={() => eliminarItem(index)}
                        className="btn-danger-icon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card-footer">
              <button
                onClick={enviarSolicitud}
                disabled={itemsSolicitud.length === 0 || enviando}
                className="btn-primary btn-full"
              >
                {enviando ? 'Enviando...' : <><Send size={18} /> Confirmar Solicitud</>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3>Historial Enviado</h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Items</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No hay historial
                    </td>
                  </tr>
                ) : (
                  historial.map(sol => (
                    <tr key={sol._id}>
                      <td>
                        {new Date(sol.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <strong>{sol.items.length} productos</strong><br />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {sol.items.map(i => i.nombreProducto).join(', ')}
                        </span>
                      </td>
                      <td>
                        <span className={`store-status-badge ${sol.estado === 'pendiente' ? 'inactive' : 'active'}`}>
                          {sol.estado.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudStock;
