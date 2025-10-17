# Catálogo de Helados Regma - CRUD Full Stack

## Descripción General

Aplicación web full stack para la gestión de un catálogo de productos (helados) de la marca Regma. Implementa un sistema de autenticación por roles (Admin/Usuario) con diferentes permisos de acceso.

**Estado:** Proyecto en desarrollo

---

## Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js** - Servidor REST API
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Hash y encriptación de contraseñas
- **express-validator** - Validación de datos
- **CORS** - Control de acceso entre dominios
- **Morgan** - Logging de peticiones HTTP
- **Dotenv** - Gestión de variables de entorno

### Frontend
- **React 18** - Framework JavaScript
- **Vite** - Build tool y dev server
- **React Context API** - Estado global sin Redux
- **Fetch API** - Peticiones HTTP
- **CSS3** - Estilos y animaciones

---

## Estructura del Proyecto

```
Practica4/
├── backend/
│   ├── controllers/          (no usado actualmente)
│   ├── middlewares/
│   │   ├── authBasic.js      - Autenticación HTTP Basic
│   │   ├── authorizeRole.js  - Control de roles
│   │   └── errorHandler.js   - Manejo de errores
│   ├── models/
│   │   ├── Producto.js       - Esquema de productos
│   │   └── Usuario.js        - Esquema de usuarios
│   ├── routes/
│   │   ├── productos.js      - CRUD de productos
│   │   └── usuarios.js       - Rutas de usuario
│   ├── scripts/
│   │   ├── seedUsuarios.js   - Carga inicial de usuarios
│   │   └── hashPasswords.js  - Hash de contraseñas
│   ├── data/
│   │   └── usuarios.json     - Datos de ejemplo
│   ├── .env                  - Variables de entorno
│   ├── .gitignore
│   ├── server.js             - Servidor principal
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx      - Estado global de autenticación
    │   ├── components/
    │   │   ├── LoginForm.jsx        - Componente de login
    │   │   └── ProductosList.jsx    - Tabla de productos y CRUD
    │   ├── App.jsx                  - Componente raíz
    │   ├── App.css                  - Estilos globales
    │   ├── main.jsx
    │   └── index.css
    ├── .gitignore
    ├── vite.config.js
    ├── package.json
    └── index.html
```

---

## Funcionalidades por Clase

### Backend

#### `models/Usuario.js`
- Esquema de usuario con campos: nombre, email, password (hasheado), rol
- Middleware pre-save para hashear contraseñas con bcryptjs
- Método `compararPassword()` para validar contraseñas

#### `models/Producto.js`
- Esquema de producto con campos: nombre, precio, descripción
- Validaciones automáticas de MongoDB

#### `middlewares/authBasic.js`
- Autenticación mediante HTTP Basic Auth (Base64)
- Decodifica credenciales del header Authorization
- Valida email y contraseña contra la base de datos
- Inyecta datos del usuario en `req.user`

#### `middlewares/authorizeRole.js`
- Verifica el rol del usuario autenticado
- Controla acceso según el rol (admin/user)
- GET: Acceso para todos los roles
- POST/PUT/DELETE: Solo para admin

#### `middlewares/errorHandler.js`
- Maneja errores globales de la aplicación
- Formatea respuestas de error consistentes
- Gestiona errores de MongoDB (CastError, ValidationError)

#### `routes/productos.js`
- **GET** `/productos` - Listar todos (requiere autenticación)
- **GET** `/productos/:id` - Obtener un producto
- **POST** `/productos` - Crear producto (solo admin)
- **PUT** `/productos/:id` - Actualizar producto (solo admin)
- **DELETE** `/productos/:id` - Eliminar producto (solo admin)
- Validación de datos con express-validator

#### `routes/usuarios.js`
- **GET** `/usuarios/perfil` - Obtener datos del usuario autenticado

#### `scripts/seedUsuarios.js`
- Carga usuarios iniciales desde `data/usuarios.json`
- Ejecuta middlewares de Mongoose (hashea contraseñas)

#### `server.js`
- Configuración principal de Express
- Conexión a MongoDB
- Rutas API
- Middlewares globales (CORS, JSON, Morgan, Errores)

---

### Frontend

#### `context/AuthContext.jsx`
- Contexto global para manejo de autenticación
- Estados: usuario, autenticado, loading
- Métodos: login(), logout(), crearHeaderAuth()
- Almacena credenciales en memoria
- Obtiene rol del usuario desde backend

#### `components/LoginForm.jsx`
- Formulario de login
- Validación de campos (email, contraseña)
- Muestra errores de autenticación
- Llamadas al contexto de autenticación

#### `components/ProductosList.jsx`
- Tabla de productos con búsqueda y filtrado
- Ordenamiento por columnas (nombre, precio, descripción)
- Paginación (5 productos por página)
- CRUD de productos:
  - Ver (todos los usuarios)
  - Crear, Editar, Eliminar (solo admin)
- Mostrado/ocultación de botones según rol
- Indica visualmente si es Admin o Usuario

#### `App.jsx`
- Componente raíz
- Renderiza LoginForm o ProductosList según estado de autenticación
- Envuelve la aplicación con AuthProvider

#### `App.css`
- Estilos globales (gradientes, tablas, formularios)
- Tema de color Regma (naranja #ff6600)
- Animaciones y transiciones
- Estilos responsive

---

## Funcionalidades Principales

### Autenticación
- Login con email y contraseña
- Autenticación HTTP Basic
- Roles: Admin y Usuario
- Logout y limpieza de sesión
- Credenciales en memoria (durante la sesión)

### Productos (Admin)
- Crear productos con validación
- Ver lista completa
- Editar productos inline
- Eliminar productos con confirmación
- Búsqueda en tiempo real

### Productos (Usuario)
- Ver catálogo completo
- Búsqueda de productos
- Ordenamiento
- Paginación
- Sin acceso a crear, editar o eliminar

### Diseño
- Interfaz intuitiva con logo Regma
- Tema de color naranja (identidad visual)
- Responsive design
- Animaciones suaves

---

## Pasos para Desplegar la API

### Requisitos Previos
- Node.js (v18 o superior)
- MongoDB (instalado y ejecutándose)
- Git

### 1. Clonar el Repositorio

```bash
git clone <URL-del-repositorio>
cd Practica4
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << 'EOF'
PORT=3001
MONGODB_URI=mongodb://localhost:27017/productos
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=tu_super_secret_key_2024
EOF

# Cargar usuarios iniciales en MongoDB
node scripts/seedUsuarios.js

# Iniciar servidor
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Verificar que Funciona

Abre en el navegador: `http://localhost:5173`

**Credenciales de prueba:**
- Admin: `admin@example.com` / `admin123`
- Usuario: `user@example.com` / `user123`

---

## Comandos Útiles

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Desarrollar (con nodemon)
npm run dev

# Producción
npm start

# Cargar usuarios iniciales
node scripts/seedUsuarios.js

# Hash de contraseñas (si están en texto plano)
node scripts/hashPasswords.js
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollar (con Vite)
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Linter
npm run lint

# Formatear código
npm run format
```

---

## Variables de Entorno

### Backend (.env)

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/productos
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=tu_super_secret_key_2024
```

---

## Roles y Permisos

### Admin
- Ver catálogo completo
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Acceso a todas las rutas API

### Usuario
- Ver catálogo completo
- Buscar y filtrar productos
- Acceso solo a GET de productos
- Sin permisos de CRUD

---

## API Endpoints

### Productos
- `GET /productos` - Listar todos (requiere Auth)
- `GET /productos?busqueda=nombre` - Buscar por nombre
- `GET /productos/:id` - Obtener uno
- `POST /productos` - Crear (solo admin)
- `PUT /productos/:id` - Actualizar (solo admin)
- `DELETE /productos/:id` - Eliminar (solo admin)

### Usuarios
- `GET /usuarios/perfil` - Obtener perfil (requiere Auth)

---

## Problemas Comunes

### MongoDB no se conecta
```bash
# Verificar que MongoDB está corriendo
mongo --version

# En Ubuntu/Linux
sudo systemctl start mongodb

# O iniciar manualmente
mongod
```

### Puerto 3001/5173 ya en uso
```bash
# Cambiar en backend/.env
PORT=3002

# O matar el proceso
killall node
```

### Contraseñas no hasheadas
```bash
cd backend
node scripts/seedUsuarios.js
```

---

## Autor

Rubén Setién

## Licencia

MIT

---

## Notas para Futuro Desarrollo

- Implementar JWT en lugar de HTTP Basic Auth
- Agregar más validaciones en frontend
- Tests unitarios y de integración
- Documentación Swagger/OpenAPI
- Paginación en el backend
- Filtros avanzados
- Historial de cambios de productos
- Sistema de notificaciones