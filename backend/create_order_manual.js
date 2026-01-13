import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/graphql';

const mutation = `
  mutation CrearPedido($datos: PedidoInput!) {
    crearPedido(datos: $datos) {
      id
      numeroPedido
      total
      estado
      items {
        nombreProducto
        cantidad
      }
    }
  }
`;

const variables = {
    datos: {
        usuarioId: "693155b03956e7d9c27704bd", // Ruben's ID from screenshot
        tipoEntrega: "recogida",
        puntoVenta: "6952c506b6c9c460c5fc673a", // A valid store ID (e.g. from previous logs or random) - I need to ensure this ID exists or is optional if I change logic. 
        // Wait, I should use a valid store ID. I'll rely on the one I used in MEMORIA example or fetch one if this fails.
        // I'll try with a likely existing ID or just "recogida" without accurate store if validation is loose, 
        // BUT the schema expects 'puntoVenta' ID.
        // I will use a dummy one or find one. The MEMORIA example used "6952c506b6c9c460c5fc673a".
        items: [
            { productoId: "695576826bfef2433fe5ea19", cantidad: 1 }, // Jaspeado de moka 8L
            { productoId: "695576816bfef2433fe5ea05", cantidad: 1 }  // Caramelo 4L (assuming from image 2)
        ],
        telefonoContacto: "600123456",
        notasEntrega: "Pedido manual de prueba"
    }
};

async function createOrder() {
    console.log("🚀 Sending GraphQL Mutation...");
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
        });

        const body = await response.json();

        if (body.errors) {
            console.error("❌ GraphQL Errors:", JSON.stringify(body.errors, null, 2));
        } else {
            console.log("✅ Order Created Successfully:");
            console.log(JSON.stringify(body.data, null, 2));
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }
}

createOrder();
