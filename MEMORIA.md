# Memoria del Proyecto: Plataforma E-Commerce & ERP Regma

## 1. Introducción y Objetivos
Esta memoria documenta el desarrollo de una solución integral para la gestión de heladerías y pastelerías. El sistema combina un **E-Commerce moderno (B2C)** con un potente **ERP** para la gestión interna de inventario, logística y personal.

El objetivo principal ha sido crear un sistema robusto, escalable y seguro que cumpla con los siguientes requisitos funcionales críticos:

1.  **Gestión de Identidad**: Registro y autenticación segura de usuarios.
2.  **E-Commerce Avanzado**: Carrito de compras persistente y gestión de pedidos vía **GraphQL**.
3.  **Administración Centralizada**: Panel de control para gestión de usuarios, pedidos y stock.
4.  **Interoperabilidad**: API híbrida (REST + GraphQL) documentada.

---

## 2. Arquitectura del Sistema

### 2.1 Estructura del Código
El proyecto sigue una arquitectura monolítica modular, separando claramente el frontend (cliente) del backend (servidora), organizada de la siguiente manera:

```
ProgamacionWeb1/
├── backend/                  # Servidor Node.js + Express
│   ├── config/               # Configuraciones (Redis, DB)
│   ├── controllers/          # Lógica de negocio
│   ├── graphql/              # Esquemas y Resolvers (NUEVO)
│   ├── models/               # Modelos Mongoose (MongoDB)
│   ├── routes/               # API REST Endpoints
│   │   ├── turnos.js         # API Turnos y Personal
│   │   ├── solicitudesStock.js # API Reposición Tiendas
│   │   └── ...
│   └── server.js             # Punto de entrada
│
└── frontend/                 # Cliente React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── admin/        # Panel de Administrador
    │   │   ├── gestor/       # Dashboard de Tienda
    │   │   ├── cliente/      # E-commerce & IceCreamBot
    │   │   └── common/       # UI Kit reutilizable
    │   ├── context/          # Estado Global (Auth, Carrito)
    │   └── ...
```

### 2.2 Stack Tecnológico
*   **Frontend**: React 18, Vite, CSS Modules (Diseño Responsive).
*   **Backend**: Node.js, Express, Apollo Server (GraphQL).
*   **Base de Datos**: MongoDB Atlas (NoSQL).
*   **Caché**: Redis (Sesiones y Rate Limiting).
*   **Tiempo Real**: Socket.IO (Notificaciones de pedidos).

---

## 3. Funcionalidades Clave Implementadas

### 3.1 Gestión de Usuarios (Auth)
El sistema implementa un flujo de autenticación seguro basado en **JWT (JSON Web Tokens)**.

*   **Registro**: Los usuarios pueden crear una cuenta proporcionando nombre, email y contraseña. Las contraseñas se hashean con `bcrypt` antes de almacenarse.
*   **Login**: Validación de credenciales que retorna un token de acceso y un refresk token (gestión de sesión segura).
*   **Roles**: Sistema RBAC con roles: `admin`, `gestor-tienda`, `trabajador`, `cliente`.

> **Implementación Técnica**: Ver `backend/controllers/authController.js`.

### 3.2 E-Commerce y Pedidos vía GraphQL
Uno de los núcleos del proyecto es la capacidad de gestionar compras complejas.

*   **Carrito de Compras**:
    *   Sincronizado entre pestañas y sesiones (Redis/Database).
    *   Validación de stock en tiempo real.
*   **Generación de Pedidos (GraphQL)**:
    *   La finalización de compra utiliza una **Mutación GraphQL** (`crearPedido`).
    *   Esto permite enviar estructuras de datos complejas (usuario, items, dirección) en una sola petición eficiente, reduciendo la latencia frente a múltiples llamadas REST.

### 3.3 Panel de Administración
Interfaz dedicada para el control total del negocio.

*   **Gestión de Usuarios**: Tabla paginada y filtrable para ver, editar o bloquear usuarios.
*   **Visor de Pedidos**: Listado de todas las transacciones con estado (Pendiente, En Preparación, Entregado).
*   **Gestión de Tiendas**: Alta y baja de sedes físicas (`Ubicaciones`).

---

## 4. Documentación Técnica GraphQL

El sistema expone un endpoint `/graphql` que permite interactuar con los datos de forma flexible. A continuación se detallan las operaciones principales para la gestión de pedidos y productos.

**Endpoint**: `http://localhost:3001/graphql`

### 4.1 Creación de Pedido (Mutation)
Esta operación es utilizada por el frontend al finalizar el checkout.

**Operación Completa (Playground):**
```graphql
mutation CrearPedidoDePrueba {
  crearPedido(
    datos: {
      usuarioId: "693155b03956e7d9c27704bd",
      tipoEntrega: "recogida",
      puntoVenta: "6952c506b6c9c460c5fc673a",
      telefonoContacto: "600123456",
      items: [
        {
          productoId: "695576806bfef2433fe5e9e6",
          cantidad: 2
        },
        {
          productoId: "695576826bfef2433fe5ea19",
          cantidad: 1
        }
      ]
    }
  ) {
    id
    numeroPedido
    estado
    total
    items {
      nombreProducto
      cantidad
      subtotal
    }
  }
}
```

### 4.2 Consulta de Productos (Query)
Permite obtener detalles específicos de productos sin sobrecargar la red con datos innecesarios.

**Query:**
```graphql
query ObtenerProductos {
  productos {
    id
    nombre
    precioBase
    stock
    categoria {
      nombre
    }
  }
}
```

---

## 5. Anexo: Herramientas Auxiliares

*   **IceCreamBot**: Asistente virtual en el frontend para recomendación de sabores.
*   **Scripts de Mantenimiento**: Scripts en `backend/scripts/` para corrección de datos corruptos (ej. `fix_locations.js`).

---
*Documento generado para entrega de proyecto - Enero 2026*
