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
│   │   ├── auth.js            # Middleware principal: valida JWT
│   │   ├── checkPermissions.js # Validación granular de permisos
│   │   ├── rateLimit.js       # Limitación de peticiones (Seguridad)
│   │   └── upload.js          # Configuración de Multer para imágenes
│   ├── models/
│   │   ├── Usuario.js         # Usuarios y roles
│   │   ├── Producto.js        # Catálogo (precios, stock base)
│   │   ├── Inventario.js      # Stock avanzado y movimientos
│   │   ├── Pedido.js          # Órdenes y ventas
│   │   ├── Ubicacion.js       # Sedes (Obrador, Tiendas)
│   │   ├── Obrador.js         # Gestión específica de obradores
│   │   ├── PuntoVenta.js      # Gestión específica de tiendas
│   │   ├── Categoria.js       # Clasificación jerárquica
│   │   ├── Variante.js        # Sabores y versiones
│   │   └── Formato.js         # Presentaciones
│   ├── routes/
│   │   ├── auth.js            # Endpoints de sesión
│   │   ├── productos.js       # API de catálogo
│   │   ├── pedidos.js         # API de ventas
│   │   ├── inventario.js      # API de stock
│   │   └── ubicaciones.js     # API de sedes
│   └── server.js              # Entry point: Express + Socket.IO + MongoDB
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/         # Panel de Administración Global
    │   │   ├── gestor/        # Panel de Gestor de Tienda
    │   │   ├── trabajador/    # Interfaz para empleados (TPV/Obrador)
    │   │   ├── cliente/       # E-commerce para usuario final
    │   │   └── common/        # Componentes reutilizables (LoginForm, Avatar)
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Estado de sesión
    │   │   └── CarritoContext.jsx # Lógica de carrito de compras
    │   ├── services/          # Comunicación con API (Axios)
    │   ├── styles/            # Estilos globales y módulos
    │   ├── App.jsx            # Enrutamiento
    │   └── main.jsx           # Punto de montaje
    └── vite.config.js         # Configuración Vite
```

## 🔄 Registro de Cambios (Recientes)

*   **Sincronización de Carrito**: Unificación de la arquitectura de carrito. `CarritoContext` ahora actúa como fuente única de verdad, sincronizando automáticamente el estado local con la base de datos al autenticarse, resolviendo inconsistencias en el contador de items.
*   **Gestión de Productos**: Implementación de paginación configurable (items por página) y mejoras visuales en el listado de administración (`GestionProductos.jsx`).
*   **Gestión de Turnos**: Corrección de errores de autenticación (401) mediante la exposición adecuada del token JWT en el contexto global y mejoras en el filtrado de trabajadores.
*   **Frontend & UX (Major Update)**:
    *   **Navegación Unificada**: Implementación de una `Navbar` única y responsiva para todo el sitio público (Landing, Historia, Catálogo, Buscador de Tiendas).
    *   **Localizador de Tiendas Avanzado**: Nueva funcionalidad "Cerca de mí" con geolocalización, visualización de radio de búsqueda en mapa y cálculo de distancia en tiempo real.
    *   **Catálogo Premium**: Fondos de video dinámicos, efecto *Glassmorphism* y chips de formato inteligentes (ej. mostrando "Barra de Corte" en lugar de "1 unidad").
*   **Datos y Contenido**:
    *   **Descripciones Enriquecidas**: El sistema ahora genera descripciones detalladas y apetitosas específicas para cada formato (tarrina, familiar, etc.) y tipo de dulce.
69: *   **Portal de Profesionales (B2B)**:
70:     *   **Registro Premium**: Rediseño completo del formulario de alta de negocios (`/profesionales/registro-negocio`) con estética animada y *Glassmorphism*, alineada con el login.
71:     *   **Notificaciones Automáticas**: Implementación de sistema de email (`nodemailer`) para enviar bienvenidas automáticas cuando un administrador valida una cuenta de negocio.
72:     *   **Navegación Inteligente**: Botones de acción en la landing de profesionales con lógica condicional según el estado de autenticación.
73: *   **Correcciones y Mejoras UX**:
74:     *   **Landing Page**: Solución a problema de visibilidad en tarjetas de productos (eliminación de conflicto con *Scroll Reveal*).
75:     *   **Carrito**: Validación de sesión antes de añadir productos, redirigiendo a login si es invitado.
    *   **Carrito**: Validación de sesión antes de añadir productos, redirigiendo a login si es invitado.
*   **Auditoría de Seguridad y Privacidad**:
    *   **Eliminación de PII en LocalStorage**: Refactorización crítica de `AlbaranPrint` y `PedidosB2B` para proteger datos personales. Los albaranes ahora obtienen datos seguros desde la API mediante ID, eliminando la exposición en el navegador.
    *   **Hardening de Sesión**: Limpieza de `AuthContext` para almacenar únicamente el token JWT, evitando la persistencia innecesaria de objetos de usuario completos.
*   **Optimización de Rendimiento (LCP)**:
    *   **Core Web Vitals**: Optimización de carga de fuentes (eliminación de `@import` bloqueante, uso de `preconnect`) y priorización de imágenes críticas (`fetchpriority="high"`), mejorando significativamente la velocidad de carga inicial.
---

## 🛠️ Stack Tecnológico

*   **Frontend**: React 18, Vite, CSS Vanilla (Diseño Premium), Socket.IO Client.
*   **Backend**: Node.js, Express, Socket.IO Server.
*   **Datos**: MongoDB Atlas (Persistencia), Redis (Caché de alto rendimiento).
*   **Seguridad**: JWT, BCrypt, CORS, Rate Limiting (Protección contra fuerza bruta).
*   **Datos**: MongoDB Atlas (Persistencia), Redis (Caché de alto rendimiento y gestión de sesiones).

## 🛡️ Seguridad Implementada

La plataforma implementa una estrategia de "Defensa en Profundidad" para proteger los datos y garantizar la disponibilidad del servicio.

### 1. Protección contra Fuerza Bruta (Rate Limiting)
Para prevenir ataques de fuerza bruta y denegación de servicio (DoS), se ha implementado un sistema de limitación de tasa robusto utilizando `express-rate-limit` con respaldo en **Redis** (o memoria como fallback).

**Configuración Dinámica (Variables de Entorno):**
Los límites son totalmente configurables sin tocar el código, permitiendo ajustes rápidos en producción:
*   `RATE_LIMIT_LOGIN_WINDOW_MS` / `RATE_LIMIT_LOGIN_MAX`: Control estricto para login/registro (Default: 5 intentos/15min).
*   `RATE_LIMIT_API_WINDOW_MS` / `RATE_LIMIT_API_MAX`: Control general para la API (Default: 100 req/15min).

*   **Login Estricto**: Bloquea IPs tras exceder los intentos fallidos permitidos, protegiendo las cuentas de usuario.
*   **API General**: Previene el abuso de recursos y el scraping agresivo, garantizando la disponibilidad del servicio para todos los usuarios.

### 2. Protección de Carga (Pagination Cap)
Para asegurar el rendimiento con grandes volúmenes de datos (ej. millones de registros), la API impone límites estrictos en la paginación de **todas las entidades principales**:
*   **Alcance**: Aplicado en Productos, Usuarios, Inventario, Ubicaciones y Pedidos.
*   **Límite Máximo**: El parámetro `limit` está capado a un **máximo de 100 items** por página.
*   **Comportamiento**: Cualquier petición que solicite más de 100 items (ej. `?limit=5000`) será forzada automáticamente a devolver solo 100, evitando bloqueos de memoria en el servidor.
*   **Metadata**: Todas las respuestas paginadas incluyen `total`, `page`, `pages` y el `limit` real aplicado.

### 2. Autenticación y Autorización
*   **JWT (JSON Web Tokens)**: Autenticación sin estado. Los tokens tienen fecha de expiración y se validan en cada petición protegida.
*   **BCrypt**: Las contraseñas nunca se almacenan en texto plano. Se utiliza `bcryptjs` con salt generado automáticamente para hasheadas antes de guardarlas en la base de datos.
*   **RBAC (Role-Based Access Control)**: Sistema de control de acceso basado en roles (`admin`, `gestor-tienda`, `trabajador`, `cliente`) reforzado con middleware de permisos granulares (`checkPermissions.js`).

### 3. Protección contra Fingerprinting
El sistema oculta detalles técnicos del servidor para dificultar la identificación de vulnerabilidades específicas:
*   **Helmet**: Middleware de seguridad que configura cabeceras HTTP adecuadas (ej. `Strict-Transport-Security`, `X-Content-Type-Options`).
*   **Ocultación de Headers**: Se elimina la cabecera `X-Powered-By: Express` y otras señales que revelan la tecnología subyacente.

### 4. Seguridad de Datos
*   **Sanitización**: Validación de entrada estricta en el backend para prevenir inyección NoSQL.
*   **CORS Configurado**: Lista blanca estricta de orígenes permitidos (frontend local y producción) para prevenir peticiones no autorizadas desde otros dominios.

### 5. Observabilidad y Logging (Winston)
Para garantizar la operación profesional en producción, se ha reemplazado `console.log` por un sistema robusto basado en **Winston**:
*   **Por qué**: `console.log` es bloqueante (síncrono), no persistente y difícil de filtrar. Winston soluciona esto con streams asíncronos y niveles de severidad.
*   **Rotación de Logs**: Implementación de `winston-daily-rotate-file` para generar archivos diarios (`error-YYYY-MM-DD.log` y `combined-YYYY-MM-DD.log`), evitando que un solo archivo crezca indefinidamente y sature el disco.
*   **Logging Estructurado**: Los logs en archivo se guardan en formato **JSON**, facilitando su ingesta futura por herramientas de monitoreo como ELK Stack o Datadog.
*   **Middleware HTTP**: Integración con `morgan` para registrar automáticamente cada petición HTTP (Método, URL, Status, Tiempo de respuesta) directamente en el sistema de logs.

---

## 👥 Roles y Funcionalidades

El sistema gestiona 4 niveles principales de acceso, cada uno con un conjunto específico de capacidades:

### 👑 Administrador (`admin`)
Acceso total al sistema.
*   **Gestión Global**: Centros de trabajo, usuarios, roles y permisos.
*   **Catálogo Maestro**: Creación y edición de productos, categorías, variantes y precios base.
*   **Visión de Negocio**: Dashboard completo con métricas de todas las tiendas y producción.

### 🏪 Gestor de Tienda (`gestor-tienda`)
Responsable de una sede específica (ej. "Regma Sardinero").
*   **Gestión Local**: Control de stock e inventario de su tienda.
*   **Pedidos**: Visualización y gestión de pedidos asignados a su sucursal.
*   **Personal**: Gestión de turnos simples de su equipo.
*   **Solicitudes**: Petición de reposición de stock al obrador central.

### 👷 Trabajador (`trabajador`)
Personal operativo. Sus funciones varían según su asignación (`tipoTrabajador`):
*   **Tienda (Dependientes/Cajeros)**: TPV, venta directa, cierre de caja y visualización de stock local.
*   **Obrador (Producción)**: Gestión de órdenes de producción, recetas y stock de materias primas.
*   **Oficina**: Acceso a reportes básicos y herramientas administrativas.

### 👤 Cliente (`cliente`)
Usuario final de la plataforma e-commerce.
*   **Compras**: Navegación por el catálogo, añadir al carrito y realizar pedidos.
*   **Perfil**: Gestión de datos personales y direcciones de envío.
*   **Historial**: Seguimiento en tiempo real del estado de sus pedidos.

---

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
---

## 📈 Integra GraphQL

La plataforma ahora soporta **GraphQL** como alternativa o complemento a la API REST, permitiendo consultas más eficientes y flexibles, especialmente para la obtención de productos y gestión de pedidos.

### 🌐 Acceso
*   **Endpoint:** `/graphql` (ej: `http://localhost:3001/graphql`)
*   **Herramienta de Pruebas:** Apollo Sandbox (habilitado en entorno de desarrollo).

### 🧪 Verificación y Ejemplos de Uso
A continuación se muestran ejemplos reales de uso para validar la integración.

#### 1. Crear un Pedido (Mutation)
Ejemplo de creación de pedido para el usuario **Ruben** incluyendo los productos **"Chocolate 0.5L"** y **"Jaspeado de moka 8L"**.

**Query:**
```graphql
mutation CrearPedidoDePrueba {
  crearPedido(
    usuarioId: "693155b03956e7d9c27704bd", 
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

**Resultado Esperado:**
> [!NOTE]
> ![Apollo Sandbox - Creación Pedido](src/Images/GraphQl/query1.png)

#### 2. Consultar Productos (Query)
Obtención optimizada de datos de productos específicos.

**Query:**
```graphql
query VerificarProductos {
  producto1: producto(id: "695576806bfef2433fe5e9e6") {
    nombre
    sku
    precioBase
  }
  producto2: producto(id: "695576826bfef2433fe5ea19") {
    nombre
    sku
    precioBase
  }
}
```

> [!NOTE]
> ![Apollo Sandbox - Consulta Productos](src/Images/GraphQl/query2.png)
