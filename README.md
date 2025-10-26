# 🍦 Catálogo de Helados Regma - Full Stack Application

Aplicación web completa para la gestión de un catálogo de productos (helados) con autenticación JWT, control de roles y chat en tiempo real.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4+-black.svg)](https://socket.io/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Autenticación JWT](#-autenticación-jwt)
- [Socket.IO](#-socketio---chat-en-tiempo-real)
- [Roles y Permisos](#-roles-y-permisos)
- [Modelos de Datos](#-modelos-de-datos)
- [Troubleshooting](#-troubleshooting)
- [Despliegue a Producción](#-despliegue-a-producción)

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- ✅ Autenticación JWT con Access y Refresh Tokens
- ✅ Access Token de corta duración (15 minutos)
- ✅ Refresh Token de larga duración (7 días) en cookie httpOnly
- ✅ Logout automático al expirar la sesión
- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS configurado con credentials
- ✅ Tokens revocables almacenados en MongoDB

### 📦 Gestión de Productos
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Búsqueda en tiempo real por nombre
- ✅ Ordenamiento por columnas (nombre, precio, descripción)
- ✅ Paginación (5 productos por página)
- ✅ Validación de datos con express-validator
- ✅ Control de acceso por roles

### 💬 Chat en Tiempo Real
- ✅ Comunicación bidireccional Admin ↔ Usuario
- ✅ Mensajes instantáneos con Socket.IO
- ✅ Notificaciones sonoras
- ✅ Avatares generados automáticamente
- ✅ Historial de mensajes en MongoDB

### 🎨 Diseño e Interfaz
- ✅ Diseño responsive
- ✅ Tema corporativo Regma (naranja #ff6600)
- ✅ Animaciones y transiciones suaves
- ✅ Feedback visual en todas las acciones
- ✅ Interfaz intuitiva y moderna

---

## 🛠 Tecnologías

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | 18+ | Runtime de JavaScript |
| Express.js | 4.x | Framework web |
| MongoDB | 6+ | Base de datos NoSQL |
| Mongoose | 8.x | ODM para MongoDB |
| JWT | 9.x | Autenticación con tokens |
| bcryptjs | 2.x | Hash de contraseñas |
| Socket.IO | 4.x | WebSockets en tiempo real |
| cookie-parser | 1.x | Manejo de cookies |
| express-validator | 7.x | Validación de datos |
| CORS | 2.x | Control de acceso |
| Morgan | 1.x | Logging HTTP |
| Dotenv | 16.x | Variables de entorno |

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| React | 18.x | Framework JavaScript |
| Vite | 5.x | Build tool y dev server |
| Socket.IO Client | 4.x | Cliente WebSocket |
| Fetch API | Nativo | Peticiones HTTP |
| Context API | Nativo | Estado global |

---

## 📁 Estructura del Proyecto
```
ProgamacionWeb1/
│
├── backend/
│   ├── controllers/
│   │   └── authController.js         # Login, refresh, logout
│   │
│   ├── middlewares/
│   │   ├── authBasic.js              # Verificación JWT Bearer
│   │   ├── authorizeRole.js          # Control de roles
│   │   └── errorHandler.js           # Manejo global de errores
│   │
│   ├── models/
│   │   ├── Usuario.js                # Esquema de usuarios
│   │   ├── Producto.js               # Esquema de productos
│   │   ├── Chat.js                   # Esquema de mensajes
│   │   └── RefreshToken.js           # Tokens de refresco
│   │
│   ├── routes/
│   │   ├── auth.js                   # Rutas de autenticación
│   │   ├── productos.js              # CRUD de productos
│   │   ├── usuarios.js               # Rutas de usuarios
│   │   └── chats.js                  # Rutas de chat
│   │
│   ├── scripts/
│   │   ├── seedUsuarios.js           # Carga inicial de usuarios
│   │   └── hashPasswords.js          # Hash de contraseñas
│   │
│   ├── data/
│   │   └── usuarios.json             # Usuarios de ejemplo
│   │
│   ├── .env                          # Variables de entorno
│   ├── .gitignore
│   ├── server.js                     # Servidor principal + Socket.IO
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx       # Estado global de autenticación
    │   │
    │   ├── components/
    │   │   ├── LoginForm.jsx         # Formulario de login
    │   │   ├── ProductosList.jsx     # Tabla de productos y CRUD
    │   │   ├── ChatAdmin.jsx         # Chat para administradores
    │   │   ├── ChatUsuario.jsx       # Chat para usuarios
    │   │   └── AdminLayout.jsx       # Layout principal
    │   │
    │   ├── utils/
    │   │   ├── avatarUtils.js        # Generación de avatares
    │   │   └── soundUtils.js         # Sonidos de notificación
    │   │
    │   ├── styles/
    │   │   ├── AdminLayout.css
    │   │   ├── Avatar.css
    │   │   └── Chat.css
    │   │
    │   ├── App.jsx                   # Componente raíz
    │   ├── App.css                   # Estilos globales
    │   ├── main.jsx
    │   └── index.css
    │
    ├── .gitignore
    ├── vite.config.js
    ├── package.json
    └── index.html
```

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js** v18 o superior → [Descargar](https://nodejs.org/)
- **MongoDB** v6 o superior → [Descargar](https://www.mongodb.com/try/download/community)
- **Git** → [Descargar](https://git-scm.com/)

### 1. Clonar el Repositorio
```bash
git clone <URL-del-repositorio>
cd ProgamacionWeb1
```

### 2. Instalar Dependencias del Backend
```bash
cd backend
npm install
```

**Dependencias instaladas:**
```
express, mongoose, jsonwebtoken, bcryptjs, cookie-parser, 
socket.io, express-validator, cors, morgan, dotenv
```

### 3. Instalar Dependencias del Frontend
```bash
cd ../frontend
npm install
```

**Dependencias instaladas:**
```
react, react-dom, socket.io-client
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:
```env
# Puerto del servidor
PORT=3001

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/productos

# Entorno
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# Clave secreta para JWT (IMPORTANTE: cambiar en producción)
JWT_SECRET=tu_clave_secreta_muy_segura_minimo_64_caracteres
```

### Generar JWT_SECRET Seguro
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Cargar Usuarios Iniciales
```bash
cd backend
node scripts/seedUsuarios.js
```

**Usuarios creados:**
- Admin: `admin@example.com` / `admin123`
- Usuario: `user@example.com` / `user123`

---

## 🎯 Uso

### Iniciar el Backend
```bash
cd backend
npm run dev
```

✅ Servidor corriendo en: `http://localhost:3001`

### Iniciar el Frontend
```bash
cd frontend
npm run dev
```

✅ Aplicación disponible en: `http://localhost:5173`

### Acceder a la Aplicación

1. Abre tu navegador en `http://localhost:5173`
2. Inicia sesión con:
   - **Admin**: `admin@example.com` / `admin123`
   - **Usuario**: `user@example.com` / `user123`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### 🔐 Autenticación

#### POST `/api/auth/login`
Inicia sesión y genera tokens.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Admin",
    "email": "admin@example.com",
    "rol": "admin"
  }
}
```

**Set-Cookie:**
```
refreshToken=<token_aleatorio>; HttpOnly; SameSite=Strict; Max-Age=604800
```

#### POST `/api/auth/refresh`
Renueva el Access Token usando el Refresh Token.

**Request Headers:**
```
Cookie: refreshToken=<valor>
```

**Response (200):**
```json
{
  "ok": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/logout`
Cierra sesión e invalida el Refresh Token.

**Request Headers:**
```
Cookie: refreshToken=<valor>
```

**Response (200):**
```json
{
  "ok": true,
  "mensaje": "Sesión cerrada"
}
```

---

### 📦 Productos

Todos los endpoints requieren autenticación: `Authorization: Bearer <accessToken>`

#### GET `/api/productos`
Lista todos los productos.

**Query Parameters:**
- `busqueda` (opcional): Busca por nombre

**Ejemplos:**
```bash
# Todos los productos
GET /api/productos

# Buscar por nombre
GET /api/productos?busqueda=vainilla
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Helado de Vainilla",
    "precio": 3.50,
    "descripcion": "Helado cremoso de vainilla natural"
  }
]
```

#### GET `/api/productos/:id`
Obtiene un producto específico.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Helado de Vainilla",
  "precio": 3.50,
  "descripcion": "Helado cremoso de vainilla natural"
}
```

#### POST `/api/productos` (Solo Admin)
Crea un nuevo producto.

**Request:**
```json
{
  "nombre": "Helado de Chocolate",
  "precio": 4.00,
  "descripcion": "Helado intenso de chocolate belga"
}
```

**Validaciones:**
- `nombre`: mínimo 3 caracteres
- `precio`: número mayor que 0
- `descripcion`: mínimo 5 caracteres

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "nombre": "Helado de Chocolate",
  "precio": 4.00,
  "descripcion": "Helado intenso de chocolate belga"
}
```

#### PUT `/api/productos/:id` (Solo Admin)
Actualiza un producto existente.

**Request:**
```json
{
  "nombre": "Helado de Chocolate Premium",
  "precio": 4.50,
  "descripcion": "Helado de chocolate belga premium"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "nombre": "Helado de Chocolate Premium",
  "precio": 4.50,
  "descripcion": "Helado de chocolate belga premium"
}
```

#### DELETE `/api/productos/:id` (Solo Admin)
Elimina un producto.

**Response (200):**
```json
{
  "ok": true,
  "mensaje": "Producto eliminado correctamente"
}
```

---

### 👥 Usuarios

#### GET `/api/usuarios/perfil`
Obtiene el perfil del usuario autenticado.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Admin",
  "email": "admin@example.com",
  "rol": "admin"
}
```

---

### 💬 Chat

#### GET `/api/chats`
Obtiene los chats del usuario autenticado.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "mensaje": "Hola, ¿tienes el helado de fresa?",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
]
```

#### POST `/api/chats`
Crea un nuevo mensaje de chat.

**Request:**
```json
{
  "receiverId": "507f1f77bcf86cd799439012",
  "mensaje": "Sí, tenemos disponible"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "mensaje": "Sí, tenemos disponible",
  "timestamp": "2024-01-15T10:31:00.000Z"
}
```

---

## 🔐 Autenticación JWT

### Arquitectura de Tokens Dual

#### Access Token (JWT)
- **Duración**: 15 minutos
- **Almacenamiento**: localStorage (frontend)
- **Formato**: JSON Web Token firmado
- **Uso**: Header `Authorization: Bearer <token>`
- **Contenido**:
```json
  {
    "id": "507f1f77bcf86cd799439011",
    "rol": "admin",
    "iat": 1705315800,
    "exp": 1705316700
  }
```

#### Refresh Token
- **Duración**: 7 días
- **Almacenamiento**: Cookie httpOnly (navegador)
- **Formato**: String aleatorio (64 bytes hex)
- **Uso**: Cookie automática en peticiones
- **Almacenado en**: MongoDB (para revocación)

### Flujo de Autenticación Completo
```
1. LOGIN
   Usuario → POST /api/auth/login
   ↓
   Backend valida credenciales
   ↓
   Genera Access Token (JWT) + Refresh Token
   ↓
   Access Token → JSON Response
   Refresh Token → Cookie httpOnly
   ↓
   Frontend guarda Access Token en localStorage

2. PETICIONES AUTENTICADAS
   Frontend → GET /api/productos
   Header: Authorization: Bearer <accessToken>
   Cookie: refreshToken=<valor>
   ↓
   Backend verifica JWT
   ↓
   Si válido → Respuesta
   Si expirado (15 min) → 401

3. TOKEN EXPIRADO
   Frontend recibe 401
   ↓
   Ejecuta logout automático
   ↓
   Usuario debe iniciar sesión nuevamente

4. LOGOUT
   Frontend → POST /api/auth/logout
   ↓
   Backend elimina Refresh Token de BD
   ↓
   Limpia cookie httpOnly
   ↓
   Frontend limpia localStorage
```

### Seguridad Implementada

| Característica | Implementación | Beneficio |
|----------------|----------------|-----------|
| **Contraseñas** | bcrypt (10 rounds) | Protección contra rainbow tables |
| **Access Token** | JWT firmado | Stateless, verificable sin BD |
| **Refresh Token** | Cookie httpOnly | Protección XSS (no accesible por JS) |
| **Expiración corta** | 15 minutos | Minimiza ventana de ataque |
| **Revocación** | BD MongoDB | Logout inmediato |
| **CORS** | `credentials: true` | Solo dominios autorizados |
| **SameSite** | Strict | Protección CSRF |

### Ejemplo de Uso en Frontend
```javascript
// Login
const login = async (email, password) => {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Importante para cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  
  // Guardar Access Token
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
};

// Petición autenticada
const getProductos = async () => {
  const token = localStorage.getItem('accessToken');
  
  const res = await fetch('http://localhost:3001/api/productos', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  
  if (res.status === 401) {
    // Token expirado - logout automático
    await logout();
    alert('Tu sesión ha expirado. Inicia sesión nuevamente.');
    return;
  }
  
  return await res.json();
};

// Logout
const logout = async () => {
  await fetch('http://localhost:3001/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('usuario');
};
```

---

## 🔌 Socket.IO - Chat en Tiempo Real

### Configuración del Servidor
```javascript
// server.js
import { Server } from 'socket.io';
import http from 'http';

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('identificar', (userData) => {
    socket.userId = userData.userId;
    socket.userEmail = userData.email;
    socket.userRole = userData.role;
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send_message', (data) => {
    io.to(data.chatId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.userEmail);
  });
});
```

### Uso en el Cliente
```javascript
import io from 'socket.io-client';

// Conectar
const socket = io('http://localhost:3001', {
  withCredentials: true
});

// Identificar usuario
socket.emit('identificar', {
  userId: usuario.id,
  email: usuario.email,
  role: usuario.rol
});

// Unirse a un chat
socket.emit('join_chat', chatId);

// Enviar mensaje
const enviarMensaje = (mensaje) => {
  socket.emit('send_message', {
    chatId,
    mensaje,
    sender: usuario.email,
    timestamp: new Date().toISOString()
  });
};

// Recibir mensajes
socket.on('receive_message', (data) => {
  setMensajes(prev => [...prev, data]);
});

// Desconectar
useEffect(() => {
  return () => socket.disconnect();
}, []);
```

### Eventos Disponibles

| Evento | Dirección | Descripción | Datos |
|--------|-----------|-------------|-------|
| `connection` | Server | Cliente conectado | `socket.id` |
| `identificar` | Client → Server | Identifica usuario | `{ userId, email, role }` |
| `join_chat` | Client → Server | Unirse a sala | `chatId` |
| `send_message` | Client → Server | Enviar mensaje | `{ chatId, mensaje, sender }` |
| `receive_message` | Server → Client | Recibir mensaje | `{ chatId, mensaje, sender, timestamp }` |
| `disconnect` | Server | Cliente desconectado | `socket.id` |

---

## 👥 Roles y Permisos

### Matriz de Permisos

| Funcionalidad | Admin | User |
|---------------|-------|------|
| **Autenticación** |
| Login | ✅ | ✅ |
| Logout | ✅ | ✅ |
| Ver perfil | ✅ | ✅ |
| **Productos** |
| Listar productos | ✅ | ✅ |
| Buscar productos | ✅ | ✅ |
| Ver detalle | ✅ | ✅ |
| Crear producto | ✅ | ❌ |
| Editar producto | ✅ | ❌ |
| Eliminar producto | ✅ | ❌ |
| **Chat** |
| Ver chats | ✅ | ✅ |
| Enviar mensajes | ✅ | ✅ |
| Chat con usuarios | ✅ | ❌ |
| Chat con admin | ❌ | ✅ |

### Usuarios de Prueba

#### Administrador
```
Email: admin@example.com
Password: admin123
Permisos: CRUD completo + Chat con todos
```

#### Usuario Regular
```
Email: user@example.com
Password: user123
Permisos: Solo lectura + Chat con admin
```

---

## 📊 Modelos de Datos

### Usuario
```javascript
{
  _id: ObjectId,
  nombre: String,           // Nombre completo
  email: String,            // Email único
  password: String,         // Hash bcrypt
  rol: String,              // 'admin' | 'user'
  createdAt: Date,          // Auto-generado
  updatedAt: Date           // Auto-generado
}
```

**Ejemplo:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Administrador",
  "email": "admin@example.com",
  "password": "$2a$10$...",
  "rol": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Producto
```javascript
{
  _id: ObjectId,
  nombre: String,           // Min: 3 caracteres
  precio: Number,           // > 0
  descripcion: String,      // Min: 5 caracteres
  createdAt: Date,
  updatedAt: Date
}
```

**Ejemplo:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "nombre": "Helado de Vainilla",
  "precio": 3.50,
  "descripcion": "Helado cremoso de vainilla natural de Madagascar",
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T10:00:00.000Z"
}
```

### RefreshToken
```javascript
{
  _id: ObjectId,
  token: String,            // Token aleatorio único
  usuario: ObjectId,        // Referencia a Usuario
  expiresAt: Date,          // Fecha de expiración (7 días)
  createdAt: Date           // Fecha de creación
}
```

**Ejemplo:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "token": "a1b2c3d4e5f6...",
  "usuario": "507f1f77bcf86cd799439011",
  "expiresAt": "2024-01-17T10:00:00.000Z",
  "createdAt": "2024-01-10T10:00:00.000Z"
}
```

### Chat
```javascript
{
  _id: ObjectId,
  senderId: ObjectId,       // Usuario que envía
  receiverId: ObjectId,     // Usuario que recibe
  mensaje: String,          // Contenido del mensaje
  timestamp: Date,          // Fecha y hora del mensaje
  leido: Boolean            // Estado de lectura
}
```

**Ejemplo:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "senderId": "507f1f77bcf86cd799439011",
  "receiverId": "507f1f77bcf86cd799439012",
  "mensaje": "Hola, ¿tienes disponible el helado de fresa?",
  "timestamp": "2024-01-10T10:15:00.000Z",
  "leido": false
}
```

---

## 🔧 Troubleshooting

### Problemas Comunes y Soluciones

#### ❌ MongoDB no se conecta

**Error:**
```
Error al conectar a MongoDB: MongoNetworkError
```

**Soluciones:**

1. Verifica que MongoDB esté corriendo:
```bash
# Ver versión (debe mostrar la versión si está instalado)
mongod --version

# En Ubuntu/Linux
sudo systemctl status mongodb
sudo systemctl start mongodb

# En macOS (Homebrew)
brew services start mongodb-community

# En Windows (como servicio)
net start MongoDB
```

2. Verifica la URI en `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/productos
```

3. Prueba la conexión:
```bash
mongosh mongodb://localhost:27017/productos
```

---

#### ❌ Error: Cannot find package 'cookie-parser'

**Solución:**
```bash
cd backend
npm install cookie-parser
```

---

#### ❌ Error: 401 Unauthorized

**Causas posibles:**

1. **Token expirado** (después de 15 minutos)
   - **Solución**: Vuelve a iniciar sesión

2. **Token no enviado**
   - **Solución**: Verifica que el header esté presente:
```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
```

3. **Token inválido o malformado**
   - **Solución**: Elimina el token y vuelve a iniciar sesión:
```javascript
   localStorage.removeItem('accessToken');
   localStorage.removeItem('usuario');
```

---

#### ❌ Error: JWT malformed / invalid signature

**Causas:**

1. `JWT_SECRET` diferente entre sesiones
2. Token corrupto en localStorage

**Solución:**
```bash
# 1. Verifica JWT_SECRET en .env
cat backend/.env | grep JWT_SECRET

# 2. Genera uno nuevo si es necesario
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. En el frontend, limpia localStorage
localStorage.clear();

# 4. Reinicia el servidor backend
cd backend
npm run dev
```

---

#### ❌ Error: CORS

**Error en consola:**
```
Access to fetch at 'http://localhost:3001/api/productos' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solución:**

1. Verifica `FRONTEND_URL` en `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

2. Asegúrate de usar `credentials: true`:
```javascript
// En el frontend
fetch('http://localhost:3001/api/productos', {
  credentials: 'include'  // IMPORTANTE
});
```

3. Reinicia el servidor backend.

---

#### ❌ Puerto ya en uso

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solución:**

**Opción 1 - Cambiar puerto:**
```env
# En backend/.env
PORT=3002
```

**Opción 2 - Matar proceso:**
```bash
# En Linux/macOS
lsof -ti:3001 | xargs kill -9

# En Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process

# Alternativa rápida
killall node
```

---

#### ❌ Contraseñas no hasheadas

**Síntoma**: No puedes iniciar sesión con las credenciales de prueba.

**Solución:**
```bash
cd backend
node scripts/seedUsuarios.js
```

---

#### ❌ Socket.IO no conecta

**Verificaciones:**

1. Servidor backend corriendo en puerto 3001
2. Frontend usa la URL correcta:
```javascript
const socket = io('http://localhost:3001', {
  withCredentials: true  // IMPORTANTE
});
```

3. Verifica en la consola del navegador:
```javascript
socket.on('connect', () => {
  console.log('✅ Socket conectado:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión:', error);
});
```

---

#### ❌ Búsqueda no funciona

**Verificaciones:**

1. Backend tiene el query param implementado:
```javascript
// routes/productos.js
router.get('/', async (req, res) => {
  const { busqueda } = req.query;
  let filtro = {};
  if (busqueda) {
    filtro = { nombre: { $regex: busqueda, $options: 'i' } };
  }
  const productos = await Producto.find(filtro);
  res.json(productos);
});
```

2. Frontend envía el parámetro correctamente:
```javascript
fetch(`http://localhost:3001/api/productos?busqueda=${encodeURIComponent(valor)}`)
```

---

### Logs y Debugging

#### Ver logs del backend
```bash
cd backend
npm run dev

# Los logs aparecerán en la terminal:
# ✅ Conectado a MongoDB
# 🚀 Servidor corriendo en http://localhost:3001
# POST /api/auth/login 200 103.098 ms - 320
# GET /api/productos 200 12.922 ms - 991
```

#### Ver logs del frontend
```
F12 → Consola del navegador
```

#### Debugging de tokens
```javascript
// En la consola del navegador
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Usuario:', JSON.parse(localStorage.getItem('usuario')));

// Decodificar JWT (solo para debugging, usa jwt.io)
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Payload:', payload);
console.log('Expira en:', new Date(payload.exp * 1000));
```

---

## 🚀 Despliegue a Producción

### Checklist Pre-Despliegue

- [ ] Cambiar `NODE_ENV=production` en `.env`
- [ ] Generar `JWT_SECRET` seguro (64+ caracteres)
- [ ] Configurar MongoDB Atlas o base de datos en la nube
- [ ] Actualizar `FRONTEND_URL` con dominio de producción
- [ ] Configurar HTTPS/SSL
- [ ] Compilar frontend: `npm run build`
- [ ] Configurar variables de entorno en el hosting
- [ ] Probar todas las funcionalidades
- [ ] Configurar logs y monitoreo
- [ ] Implementar backups de BD

### Variables de Entorno en Producción
```env
NODE_ENV=production
PORT=443
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/productos
FRONTEND_URL=https://tudominio.com
JWT_SECRET=<generar_uno_nuevo_y_seguro>
```

### Build del Frontend
```bash
cd frontend
npm run build

# Esto genera la carpeta dist/
# Subir contenido de dist/ al hosting (Vercel, Netlify, etc.)
```

### Despliegue del Backend

**Opciones recomendadas:**
- [Render](https://render.com/) - Gratis, fácil
- [Railway](https://railway.app/) - Gratis, moderno
- [Heroku](https://www.heroku.com/) - Popular
- [DigitalOcean](https://www.digitalocean.com/) - VPS

**Ejemplo con Render:**

1. Crear cuenta en render.com
2. New → Web Service
3. Conectar repositorio de GitHub
4. Configuración:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Agregar las del `.env`
5. Deploy

### MongoDB Atlas (Base de Datos en la Nube)

1. Crear cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear cluster gratuito
3. Database Access → Add User
4. Network Access → Add IP Address (0.0.0.0/0 para permitir todo)
5. Copiar connection string:
```
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/productos?retryWrites=true&w=majority
```
6. Actualizar `MONGODB_URI` en variables de entorno

### Configurar HTTPS

**Con Nginx (en VPS):**
```nginx
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Obtener certificado SSL gratis:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Socket.IO](https://socket.io/docs/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

### Herramientas de Testing
- [Thunder Client](https://www.thunderclient.com/) - VS Code extension
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)

### Tutoriales Relacionados
- [JWT Authentication](https://jwt.io/introduction)
- [Socket.IO Chat Tutorial](https://socket.io/get-started/chat)
- [MongoDB CRUD Operations](https://www.mongodb.com/docs/manual/crud/)

---

## 👨‍💻 Autor

**Rubén Setién**

---

## 📄 Licencia

MIT License

Copyright (c) 2024 Rubén Setién

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia de este software y archivos de documentación asociados (el "Software"), para usar el Software sin restricciones, incluyendo sin limitación los derechos de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software.

---

## 📝 Changelog

### [1.0.0] - 2024-01-15

#### Añadido
- ✅ Autenticación JWT completa con Access y Refresh Tokens
- ✅ Refresh Token en cookie httpOnly para seguridad
- ✅ Logout automático al expirar sesión (15 minutos)
- ✅ Chat en tiempo real con Socket.IO
- ✅ CRUD completo de productos
- ✅ Búsqueda de productos con query params
- ✅ Control de roles (Admin/Usuario)
- ✅ Diseño responsive con tema Regma
- ✅ Validaciones con express-validator
- ✅ Documentación completa

#### Mejorado
- ✅ Middleware authBasic actualizado a JWT Bearer
- ✅ AuthContext con manejo de errores 401
- ✅ Seguridad con cookies httpOnly y CORS
- ✅ Estructura de proyecto organizada

---

## 🆘 Soporte

**¿Problemas o preguntas?**

1. Revisa la sección [Troubleshooting](#-troubleshooting)
2. Verifica los logs del servidor: `npm run dev`
3. Inspecciona la consola del navegador (F12)
4. Consulta la documentación de las tecnologías usadas

---

## 🎯 Roadmap Futuro

### Por Implementar
- [ ] Renovación automática de Access Token
- [ ] Tests unitarios y de integración (Jest, React Testing Library)
- [ ] Documentación Swagger/OpenAPI
- [ ] Paginación en el backend
- [ ] Filtros avanzados de productos (por precio, categoría)
- [ ] Historial de cambios de productos (audit log)
- [ ] Sistema de notificaciones push
- [ ] Recuperación de contraseña por email
- [ ] Registro de nuevos usuarios
- [ ] Gestión de usuarios (CRUD) para admin
- [ ] Categorías de productos
- [ ] Imágenes de productos
- [ ] Dashboard con estadísticas
- [ ] Exportación de datos (CSV, PDF)
- [ ] Rate limiting para prevenir ataques
- [ ] Logs centralizados
- [ ] Monitoreo y métricas

---

**⭐ Si te ha sido útil este proyecto, considera darle una estrella en GitHub!**