# Plataforma E-Commerce & ERP Regma

Sistema integral de gestión para heladerías y pastelerías, combinando un e-commerce moderno con un potente ERP para administración de inventario y logística.

## 📁 Estructura del Proyecto

A continuación se detalla la organización del código y la responsabilidad de cada archivo principal:

```
ProgamacionWeb1/
├── backend/
│   ├── config/
│   │   └── redis.js           # Configuración y conexión tolerante a fallos de Redis
│   ├── controllers/
│   │   └── authController.js  # Lógica de login, registro y renovación de tokens
│   ├── middlewares/
│   │   ├── auth.js            # Middleware principal: valida JWT + Caché Redis + BD
│   │   ├── authorizeRole.js   # Control de acceso por roles (RGAC)
│   │   ├── checkPermissions.js # Validación granular de permisos
│   │   ├── errorHandler.js    # Manejo centralizado de errores HTTP
│   │   └── upload.js          # Configuración de Multer para imágenes
│   ├── models/
│   │   ├── Usuario.js         # Usuarios, roles, seguridad y hash de contraseñas
│   │   ├── Producto.js        # Catálogo principal (precios, stock base)
│   │   ├── Inventario.js      # Gestión avanzada de stock y movimientos
│   │   ├── Pedido.js          # Órdenes de compra y snapshots de venta
│   │   ├── Ubicacion.js       # Sedes (Obrador, Tiendas) con geolocalización
│   │   ├── Chat.js            # Historial de chats y salas de soporte
│   │   ├── Categoria.js       # Clasificación jerárquica de productos
│   │   ├── Variante.js        # Sabores y versiones (ej. Nata, Chocolate)
│   │   └── Formato.js         # Presentaciones (Tarrina, Cucurucho)
│   ├── routes/
│   │   ├── auth.js            # Endpoints públicos de sesión
│   │   ├── productos.js       # API de catálogo (con caché)
│   │   ├── pedidos.js         # Gestión de ventas y checkout
│   │   ├── ubicaciones.js     # Geo-validación y listado de tiendas
│   │   ├── chats.js           # API REST para historial de mensajería
│   │   └── inventario.js      # Operaciones de almacén
│   ├── scripts/
│   │   └── seedUbicacionesUser.js # Script de migración y población inicial
│   ├── uploads/               # Almacén local de imágenes de productos
│   ├── server.js              # Entry point: Express + Socket.IO + MongoDB
│   └── socketHandlers.js      # Lógica de eventos en tiempo real (WebSockets)
│
└── frontend/
    ├── public/                # Assets estáticos y PWA
    ├── src/
    │   ├── components/
    │   │   ├── admin/         # Panel de Control (Administrador Global)
    │   │   │   ├── DashboardAdmin.jsx  # Vista principal y métricas generales
    │   │   │   ├── AdminLayout.jsx     # Estructura base del panel
    │   │   │   └── gestion/       # Módulos de gestión detallada
    │   │   │       ├── GestionProductos.jsx # ABM de catálogo con paginación
    │   │   │       ├── GestionTurnos.jsx    # Gestión de horarios y trabajadores
    │   │   │       ├── GestionInventario.jsx # Control de stock
    │   │   │       └── GestionVariantes.jsx  # Sabores y Atributos
    │   │   ├── gestor/        # [BETA] Gestión de Punto de Venta (Gerentes)
    │   │   │   ├── GestorLayout.jsx    # Layout con menú de tienda
    │   │   │   ├── PanelTienda.jsx     # Métricas locales y caja
    │   │   │   ├── PedidosTienda.jsx   # Gestión de pedidos de la sede
    │   │   │   └── SolicitudStock.jsx  # Reposición interna a obrador
    │   │   ├── trabajador/    # [BETA] Interfaz de Operarios/Dependientes
    │   │   │   ├── TrabajadorLayout.jsx # Interfaz simplificada táctil
    │   │   │   ├── TrabajadorTienda.jsx # TPV para dependientes
    │   │   │   ├── TrabajadorObrador.jsx # Pantalla de producción
    │   │   │   └── TrabajadorOficina.jsx # Tareas administrativas
    │   │   ├── cliente/       # Área Pública/Privada (Clientes)
    │   │   │   ├── ProductosList.jsx   # Catálogo visual ("Living Glass") con filtros
    │   │   │   ├── MisPedidos.jsx      # Historial y tracking en tiempo real
    │   │   │   ├── FinalizarPedido.jsx # Checkout y pasarela de pago
    │   │   │   └── Carrito.jsx         # Página de carrito sincronizada
    │   │   ├── public/        # Landing y Catálogo Público
    │   │   │   ├── LandingPage.jsx     # Home, escaparate y estadísticas
    │   │   │   └── StoreLocator.jsx    # Buscador de tiendas
    │   │   └── common/        # Componentes Transversales
    │   │       ├── LoginForm.jsx       # Formulario de acceso universal
    │   │       └── Avatar.jsx          # Componente visual de usuario
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Estado global de sesión y persistencia
    │   │   └── CarritoContext.jsx # Sincronización Carrito (API + Optimistic UI)
    │   ├── services/          # Capa de comunicación con API (Fetch/Axios)
    │   ├── styles/            # CSS Modules y estilos globales
    │   ├── App.jsx            # Enrutamiento principal (React Router)
    │   └── main.jsx           # Punto de montaje React
    ├── vite.config.js         # Configuración de compilación
    └── .env                   # Variables de entorno frontend
```

## 🔄 Registro de Cambios (Recientes)

*   **Sincronización de Carrito**: Unificación de la arquitectura de carrito. `CarritoContext` ahora actúa como fuente única de verdad, sincronizando automáticamente el estado local con la base de datos al autenticarse, resolviendo inconsistencias en el contador de items.
*   **Gestión de Productos**: Implementación de paginación configurable (items por página) y mejoras visuales en el listado de administración (`GestionProductos.jsx`).
*   **Gestión de Turnos**: Corrección de errores de autenticación (401) mediante la exposición adecuada del token JWT en el contexto global y mejoras en el filtrado de trabajadores.
*   **UI/UX**: Rediseño "Living Glass" en el catálogo de clientes, textos promocionales actualizados en Landing Page ("+80 Años") y mejoras de visibilidad en formularios.

---

## 🛠️ Stack Tecnológico

*   **Frontend**: React 18, Vite, CSS Vanilla (Diseño Premium), Socket.IO Client.
*   **Backend**: Node.js, Express, Socket.IO Server.
*   **Datos**: MongoDB Atlas (Persistencia), Redis (Caché de alto rendimiento).
*   **Seguridad**: JWT, BCrypt, Helmet, CORS.

## 🚀 Instalación

1.  **Backend**:
    ```bash
    cd backend
    npm install
    # Configurar .env con MONGODB_URI, JWT_SECRET, REDIS_URL
    npm run dev
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## ⚠️ Notas Importantes
*   **Redis Fallback**: El sistema detecta automáticamente si Redis no está disponible y conmuta a "Modo Seguro" usando MongoDB, garantizando la continuidad del servicio.
*   **Imágenes**: Las imágenes subidas se guardan en `backend/uploads` y **se incluyen** en el repositorio (configurado en `.gitignore`).
*   **Datos Sensibles**: Carpetas como `scripts/` (con lógicas de migración interna) y `data/` están excluidas del repositorio público.