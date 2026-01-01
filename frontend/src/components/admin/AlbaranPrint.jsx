import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AlbaranPrint = () => {
    const { id } = useParams();
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Intentar leer de localStorage primero para rapidez
        const stored = localStorage.getItem('print_pedido');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed._id === id) {
                setPedido(parsed);
                setLoading(false);
                // Clean up
                // localStorage.removeItem('print_pedido');
                return;
            }
        }

        // Si no está o es otro, fetch
        // TODO: Implementar fetch si es necesario, pero asumiendo que Admin pasa datos.
        // Si se accede directo por URL, necesitaríamos fetch y auth token.
        // Simplificación: mostrar error si no hay datos.
        setLoading(false);
    }, [id]);

    useEffect(() => {
        if (pedido) {
            document.title = `Albaran_${pedido.numeroPedido}`;
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [pedido]);

    if (loading) return <div>Cargando albarán...</div>;
    if (!pedido) return <div>No se encontraron datos del pedido. Por favor, abre el albarán desde el panel de administración.</div>;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', color: '#000' }}>

            {/* HEADER EMPRESA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <div>
                    <img
                        src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                        alt="REGMA"
                        style={{ height: '60px', marginBottom: '10px' }}
                    />
                    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                        REGMA S.A.<br />
                        C/ Ejemplo, 123<br />
                        39000 Santander, Cantabria<br />
                        CIF: A-12345678<br />
                        Tlf: 942 00 00 00
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>ALBARÁN DE ENTREGA</h1>
                    <div style={{ fontSize: '14px' }}>
                        <strong>Nº Pedido:</strong> {pedido.numeroPedido}<br />
                        <strong>Fecha:</strong> {new Date().toLocaleDateString()}<br />
                        <strong>Ref. Cliente:</strong> {pedido.usuario?.nombre}
                    </div>
                </div>
            </div>

            {/* DATOS CLIENTE Y ENTREGA */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Datos Cliente</h3>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Nombre:</strong> {pedido.usuario?.nombre}<br />
                        <strong>Email:</strong> {pedido.usuario?.email}<br />
                        <strong>Teléfono:</strong> {pedido.usuario?.telefono}
                    </p>
                </div>
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
                    <h3 style={{ marginTop: 0, fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Dirección de Entrega</h3>
                    {pedido.tipoEntrega === 'recogida' ? (
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>RECOGIDA EN TIENDA</strong><br />
                            {pedido.puntoVenta?.nombre || "Tienda seleccionada"}<br />
                            Fecha Recogida: {new Date(pedido.fechaRecogida).toLocaleString()}
                        </p>
                    ) : (
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>ENTREGA A DOMICILIO</strong><br />
                            {pedido.direccionEnvio?.calle}<br />
                            {pedido.direccionEnvio?.ciudad}, {pedido.direccionEnvio?.cp}
                        </p>
                    )}
                </div>
            </div>

            {/* TABLA PRODUCTOS */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Descripción</th>
                        <th style={{ textAlign: 'center', padding: '10px', width: '100px' }}>Formato</th>
                        <th style={{ textAlign: 'right', padding: '10px', width: '80px' }}>Cant.</th>
                    </tr>
                </thead>
                <tbody>
                    {pedido.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                                <strong>{item.producto?.nombre}</strong>
                                {item.variante && <div style={{ fontSize: '12px', color: '#666' }}>{item.variante.nombre}</div>}
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                                {item.formato?.nombre}
                            </td>
                            <td style={{ textAlign: 'right', padding: '10px', fontSize: '16px', fontWeight: 'bold' }}>
                                {item.cantidad}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* FOOTER / FIRMA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                <div style={{ width: '40%', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                    Firma y Sello REGMA
                </div>
                <div style={{ width: '40%', borderTop: '1px solid #000', paddingTop: '10px', textAlign: 'center', fontSize: '12px' }}>
                    Recibí Conforme (Firma Cliente)
                </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#999' }}>
                Este documento es un albarán de entrega y no sustituye a la factura.
            </div>

            {/* Print styles specifically to hide browser UI artifacts if possible or enforce layout */}
            <style>{`
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; }
          /* Hide everything else if this component was part of a larger layout, 
             but we are mounting it in a dedicated route effectively */
        }
      `}</style>
        </div>
    );
};

export default AlbaranPrint;
