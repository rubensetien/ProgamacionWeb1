# 🍦 Sistema de Gestión de Helados Regma

Sistema completo de gestión de catálogo de helados con autenticación JWT, chat en tiempo real mediante Socket.IO, panel de administración y gestión de productos.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación Local](#instalación-local)
- [Despliegue en Producción](#despliegue-en-producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Funcionalidades](#funcionalidades)
- [Troubleshooting](#troubleshooting)
- [Comandos Útiles](#comandos-útiles)

---

## ✨ Características

- 🔐 **Autenticación JWT** con refresh tokens
- 👥 **Roles de usuario** (Admin/Usuario)
- 🍦 **CRUD completo de productos** con imágenes
- 💬 **Chat en tiempo real** con Socket.IO
- 🔔 **Notificaciones sonoras** automáticas
- 📧 **Envío de emails** de bienvenida
- 🤖 **reCAPTCHA v2** en registro
- 🎨 **Interfaz moderna** con diseño Regma
- 📱 **Responsive design**
- 🌐 **Desplegado en Render** (producción)

---

## 🛠️ Tecnologías

### Backend
- Node.js v18+
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT (jsonwebtoken)
- Bcrypt
- Multer (upload de imágenes)
- Nodemailer

### Frontend
- React 18
- Vite
- Socket.IO Client
- React Router DOM
- Context API
- React Google reCAPTCHA

---

## 🚀 Instalación Local

### Requisitos Previos

- Node.js v18 o superior
- MongoDB instalado y corriendo
- Git

---

### PASO 1: Clonar el Repositorio
```bash
git clone https://github.com/TU-USUARIO/ProgamacionWeb1.git
cd ProgamacionWeb1
```

---

### PASO 2: Configurar MongoDB Local
```bash
# Iniciar MongoDB
sudo systemctl start mongod

# Habilitar arranque automático
sudo systemctl enable mongod

# Verificar que esté corriendo
sudo systemctl status mongod
```

---

### PASO 3: Configurar Backend
```bash
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
nano .env
```

**Contenido del `.env`:**
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/productos
MONGODB_URI=mongodb://localhost:27017/productos
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_REFRESH_SECRET=tu_clave_refresh_muy_segura
NODE_ENV=development
```

**Guardar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

### PASO 4: Poblar Base de Datos
```bash
# Ejecutar seed de usuarios
node scripts/seedUsuarios.js
```

**Usuarios creados:**
- **Admin:** `admin@example.com` / `admin123`
- **Usuario:** `user@example.com` / `user123`

---

### PASO 5: Iniciar Backend
```bash
# Modo desarrollo (con hot reload)
npm run dev
```

Deberías ver:
```
✅ Conectado a MongoDB
🚀 Servidor corriendo en http://localhost:3001
Socket.IO iniciado
```

---

### PASO 6: Configurar Frontend

**En una nueva terminal:**
```bash
# Ir a la carpeta frontend
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env (opcional para local)
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

---

### PASO 7: Iniciar Frontend
```bash
# Modo desarrollo
npm run dev
```

Deberías ver:
```
VITE v5.x.x ready in X ms
➜ Local: http://localhost:5173/
```

---

### PASO 8: Acceder a la Aplicación

Abre tu navegador en: **http://localhost:5173**

**Credenciales de prueba:**
- Admin: `admin@example.com` / `admin123`
- Usuario: `user@example.com` / `user123`

---

## 🌐 Despliegue en Producción (Render)

### Requisitos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Render](https://render.com)
- Cuenta en [MongoDB Atlas](https://mongodb.com/cloud/atlas)

---

### PASO 1: Preparar el Código
```bash
# Añadir "type": "module" al package.json del backend
cd backend
nano package.json
```

Añadir después de `"version"`:
```json
{
  "name": "practica4-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

### PASO 2: Subir a GitHub
```bash
# Desde la raíz del proyecto
cd ~/PrograW1/ProgamacionWeb1

# Inicializar git (si no está)
git init

# Crear .gitignore
echo "node_modules/
.env
.env.local
dist/
build/
backend/uploads/*
!backend/uploads/.gitkeep
.DS_Store" > .gitignore

# Añadir archivos
git add .
git commit -m "Preparar para producción"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

---

### PASO 3: Configurar MongoDB Atlas

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign Up** (gratis)
3. **Create Cluster** → M0 (Free)
4. **Database Access** → **Add New Database User**:
   - Username: `admin`
   - Password: (genera una **sin símbolos especiales**)
5. **Network Access** → **Add IP Address** → **0.0.0.0/0**
6. **Connect** → **Drivers** → Copiar connection string:
```
mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/productos?retryWrites=true&w=majority
```

---

### PASO 4: Migrar Base de Datos Local a Atlas
```bash
# Exportar base de datos local
mongodump --db productos --out ~/backup-mongo

# Importar a Atlas (reemplaza con tu connection string)
mongorestore --uri="mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/productos" ~/backup-mongo/productos
```

---

### PASO 5: Desplegar Backend en Render

1. Ve a [render.com](https://render.com) → **Sign Up**
2. **New +** → **Web Service**
3. **Connect** tu repositorio de GitHub
4. Configurar:
```
Name: helados-backend
Region: Frankfurt
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

5. **Environment Variables** → Add:
```
PORT=10000
MONGO_URI=mongodb+srv://admin:PASSWORD@cluster0.xxxxx.mongodb.net/productos?retryWrites=true&w=majority
JWT_SECRET=clave_secreta_produccion_muy_segura_2024
JWT_REFRESH_SECRET=clave_refresh_produccion_muy_segura_2024
NODE_ENV=production
```

6. **Create Web Service**

**Esperar ~5 minutos** hasta que diga "Live" ✅

**URL del backend:** `https://helados-backend.onrender.com`

---

### PASO 6: Desplegar Frontend en Render

1. **New +** → **Static Site**
2. **Connect** tu repositorio
3. Configurar:
```
Name: helados-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

4. **Environment Variables** → Add:
```
VITE_API_URL=https://helados-backend.onrender.com/api
```

(Reemplaza con la URL real de tu backend)

5. **Create Static Site**

**URL del frontend:** `https://helados-frontend.onrender.com`

---

### PASO 7: Actualizar CORS en Backend
```bash
# Editar server.js
nano backend/server.js
```

Buscar `corsOptions` y actualizar:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://helados-frontend.onrender.com'  // Tu URL de frontend
  ],
  credentials: true
};
```
```bash
# Commit y push
git add .
git commit -m "Actualizar CORS para producción"
git push
```

Render redesplegará automáticamente.

---

### PASO 8: Verificar Despliegue

1. **Backend:** Abre `https://helados-backend.onrender.com` → Deberías ver un mensaje
2. **Frontend:** Abre `https://helados-frontend.onrender.com` → Deberías ver la aplicación
3. **Login:** Prueba con `admin@example.com` / `admin123`

---

## 📁 Estructura del Proyecto
```
ProgamacionWeb1/
├── backend/
│   ├── config/
│   │   └── db.js                 # Configuración MongoDB
│   ├── controllers/
│   │   ├── authController.js     # Autenticación (login/register)
│   │   └── productosController.js # CRUD productos
│   ├── data/
│   │   └── usuarios.json         # Usuarios para seed
│   ├── middlewares/
│   │   ├── auth.js               # Middleware JWT
│   │   └── upload.js             # Middleware Multer
│   ├── models/
│   │   ├── Usuario.js            # Modelo de usuario
│   │   └── Producto.js           # Modelo de producto
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   └── productosRoutes.js    # Rutas de productos
│   ├── scripts/
│   │   └── seedUsuarios.js       # Script para poblar BD
│   ├── uploads/                  # Imágenes de productos
│   ├── socket.js                 # Configuración Socket.IO
│   ├── server.js                 # Servidor principal
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   └── sounds/
    │       └── notification.mp3  # Sonido de notificaciones
    ├── src/
    │   ├── components/
    │   │   ├── LoginForm.jsx     # Formulario de login
    │   │   ├── RegisterForm.jsx  # Formulario de registro
    │   │   ├── ProductosList.jsx # Lista de productos
    │   │   ├── ChatUsuario.jsx   # Chat del usuario
    │   │   ├── ChatAdmin.jsx     # Chat del admin
    │   │   ├── AdminLayout.jsx   # Layout con sidebar
    │   │   ├── RegisterAdmin.jsx # Registro de admins
    │   │   └── Avatar.jsx        # Avatares Gravatar
    │   ├── context/
    │   │   └── AuthContext.jsx   # Estado global auth
    │   ├── styles/
    │   │   ├── App.css           # Estilos globales
    │   │   ├── Chat.css          # Estilos del chat
    │   │   └── AdminLayout.css   # Estilos del admin
    │   ├── utils/
    │   │   └── soundUtils.js     # Utilidades de sonido
    │   ├── App.jsx               # Componente principal
    │   └── main.jsx              # Entry point
    ├── package.json
    └── .env
```

---

## 🔌 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/refresh` | Refrescar token | No |
| POST | `/api/auth/register-admin` | Registrar admin | Sí (Admin) |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Productos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/productos` | Listar todos | Sí |
| GET | `/api/productos/:id` | Obtener uno | Sí |
| POST | `/api/productos` | Crear (con imagen) | Sí (Admin) |
| PUT | `/api/productos/:id` | Actualizar | Sí (Admin) |
| DELETE | `/api/productos/:id` | Eliminar | Sí (Admin) |

---

## 🎯 Funcionalidades

### Usuario
- ✅ Registro con reCAPTCHA
- ✅ Login con JWT
- ✅ Ver catálogo de productos
- ✅ Chat en tiempo real con admin
- ✅ Notificaciones sonoras
- ✅ Avatar personalizado (Gravatar)

### Administrador
- ✅ Crear/editar/eliminar productos
- ✅ Subir imágenes de productos
- ✅ Chat con múltiples usuarios simultáneos
- ✅ Indicador de "está escribiendo..."
- ✅ Contador de mensajes sin leer
- ✅ Registrar nuevos administradores
- ✅ Panel de administración con sidebar

---

## 🐛 Troubleshooting

### Error: `EADDRINUSE: address already in use :::3001`
```bash
sudo kill -9 $(sudo lsof -t -i:3001)
npm run dev
```

### Error: `Cannot connect to MongoDB`
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# Si no está activo
sudo systemctl start mongod
```

### Error: `CORS`

Verifica que el `corsOptions` en `backend/server.js` incluya la URL de tu frontend.

### Render: Backend se duerme

El plan gratuito de Render duerme el backend después de 15 minutos de inactividad. El primer request tardará ~30 segundos en despertar.

---

## 📝 Comandos Útiles

### Desarrollo Local
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Seed
node scripts/seedUsuarios.js

# MongoDB
sudo systemctl start mongod
sudo systemctl stop mongod
mongosh
```

### Producción
```bash
# Ver logs en Render
# Dashboard → Servicio → Logs

# Redeploy manual
# Dashboard → Servicio → Manual Deploy

# Exportar BD local
mongodump --db productos --out ~/backup

# Importar a Atlas
mongorestore --uri="CONNECTION_STRING" ~/backup/productos
```

---

## 👥 Autor

**Rubén Setién**

---

## 📄 Licencia

Este proyecto es parte de la asignatura de Programación Web 1.

---

## 🚀 URLs de Producción

- **Frontend:** https://progamacionweb1-1.onrender.com
- **Backend:** https://progamacionweb1.onrender.com
- **MongoDB:** MongoDB Atlas

---

**¡Proyecto completo y funcional!** 🎉