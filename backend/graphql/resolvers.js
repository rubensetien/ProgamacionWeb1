import Producto from '../models/Producto.js';
import Pedido from '../models/Pedido.js';
import Usuario from '../models/Usuario.js';

const resolvers = {
    Query: {
        productos: async (_, { limit = 20, offset = 0 }) => {
            try {
                return await Producto.find()
                    .populate('categoria')
                    .populate('variante')
                    .populate('formato')
                    .limit(limit)
                    .skip(offset);
            } catch (error) {
                throw new Error('Error al obtener productos');
            }
        },
        producto: async (_, { id }) => {
            try {
                return await Producto.findById(id)
                    .populate('categoria')
                    .populate('variante')
                    .populate('formato');
            } catch (error) {
                throw new Error('Producto no encontrado');
            }
        },
        pedidos: async (_, { usuarioId, estado, limit = 20 }) => {
            try {
                const filter = {};
                if (usuarioId) filter.usuario = usuarioId;
                if (estado) filter.estado = estado;

                return await Pedido.find(filter)
                    .populate({
                        path: 'items.producto',
                        populate: [
                            { path: 'categoria' },
                            { path: 'variante' },
                            { path: 'formato' }
                        ]
                    })
                    .limit(limit)
                    .sort({ createdAt: -1 });
            } catch (error) {
                throw new Error('Error al obtener pedidos');
            }
        },
        pedido: async (_, { id }) => {
            try {
                return await Pedido.findById(id)
                    .populate({
                        path: 'items.producto',
                        populate: [
                            { path: 'categoria' },
                            { path: 'variante' },
                            { path: 'formato' }
                        ]
                    });
            } catch (error) {
                throw new Error('Pedido no encontrado');
            }
        },
    },
    Mutation: {
        crearPedido: async (_, { datos }) => {
            try {
                const {
                    usuarioId, items, tipoEntrega, telefonoContacto, notasEntrega,
                    puntoVenta, fechaRecogida, horaRecogida, direccionEnvio, distanciaKm
                } = datos;

                const usuario = await Usuario.findById(usuarioId);
                if (!usuario) throw new Error('Usuario no encontrado');

                let total = 0;
                const pedidoItems = [];

                for (const item of items) {
                    const producto = await Producto.findById(item.productoId);
                    if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`);

                    const precio = producto.precioFinal || producto.precioBase;
                    const subtotal = precio * item.cantidad;
                    total += subtotal;

                    pedidoItems.push({
                        producto: producto._id,
                        cantidad: item.cantidad,
                        precioUnitario: precio,
                        subtotal,
                        nombreProducto: producto.nombre,
                        // Snapshot básico, idealmente se copiarían más datos
                        nombreVariante: producto.variante?.nombre,
                        nombreFormato: producto.formato?.nombre
                    });
                }

                const nuevoPedido = new Pedido({
                    usuario: usuarioId,
                    items: pedidoItems,
                    total,
                    subtotal: total,
                    estado: 'pendiente',
                    tipo: 'compra-online',
                    tipoEntrega,
                    telefonoContacto,
                    notasEntrega,
                    // Campos condicionales
                    puntoVenta: tipoEntrega === 'recogida' ? puntoVenta : undefined,
                    fechaRecogida: tipoEntrega === 'recogida' ? fechaRecogida : undefined,
                    horaRecogida: tipoEntrega === 'recogida' ? horaRecogida : undefined,
                    direccionEnvio: tipoEntrega === 'domicilio' ? direccionEnvio : undefined,
                    distanciaKm: tipoEntrega === 'domicilio' ? distanciaKm : undefined
                });

                await nuevoPedido.save();

                // Emitir evento socket (opcional, replicando lógica de REST)
                // const io = require('../server').io; // No accesible fácilmente aquí sin inyección de dependencia en contexto
                // Si el contexto tiene io, usarlo:
                // if (context.io) context.io.emit('nuevo-pedido', nuevoPedido);

                return await Pedido.findById(nuevoPedido._id)
                    .populate('items.producto')
                    .populate('usuario');

            } catch (error) {
                console.error(error);
                throw new Error('Error al crear pedido: ' + error.message);
            }
        },
        actualizarEstadoPedido: async (_, { id, estado }) => {
            try {
                const pedido = await Pedido.findById(id);
                if (!pedido) throw new Error('Pedido no encontrado');

                await pedido.cambiarEstado(estado, null, 'Actualizado vía GraphQL');
                return pedido;
            } catch (error) {
                throw new Error('Error actualizando pedido');
            }
        }
    },
    // Field resolvers si son necesarios, por ejemplo para fechas
    Date: {
        // Implementación simple de escalar Date si fuera necesario, 
        // o usar graphql-iso-date
    }
};

export default resolvers;
