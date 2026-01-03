import { gql } from 'apollo-server-express';

const typeDefs = gql`
  scalar Date

  type Categoria {
    id: ID!
    nombre: String
  }

  type Variante {
    id: ID!
    nombre: String
  }

  type Formato {
    id: ID!
    nombre: String
  }

  type Producto {
    id: ID!
    nombre: String!
    slug: String
    sku: String
    precioBase: Float!
    stock: Int
    gestionaStock: Boolean
    descripcionCorta: String
    imagenPrincipal: String
    categoria: Categoria
    variante: Variante
    formato: Formato
    activo: Boolean
  }

  type PedidoItem {
    producto: Producto
    cantidad: Int!
    precioUnitario: Float!
    subtotal: Float
    nombreProducto: String
  }

  type Pedido {
    id: ID!
    numeroPedido: String!
    estado: String!
    tipo: String
    total: Float!
    fechaPedido: Date
    items: [PedidoItem]
    metodoPago: String
    estadoPago: String
  }

  # Inputs
  input PedidoItemInput {
    productoId: ID!
    cantidad: Int!
  }

  # Queries
  type Query {
    productos(limit: Int, offset: Int): [Producto]
    producto(id: ID!): Producto
    pedidos(usuarioId: ID, estado: String, limit: Int): [Pedido]
    pedido(id: ID!): Pedido
  }

  # Mutations
  type Mutation {
    crearPedido(usuarioId: ID!, items: [PedidoItemInput]!): Pedido
    actualizarEstadoPedido(id: ID!, estado: String!): Pedido
  }
`;

export default typeDefs;
