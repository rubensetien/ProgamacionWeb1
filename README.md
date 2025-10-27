# 🍦 Catálogo de Helados Regma - Full Stack

Aplicación web completa para gestión de catálogo de productos con autenticación JWT, roles, chat en tiempo real y subida de imágenes.

---

## ⚡ Inicio Rápido

### Requisitos
- Node.js 18+
- MongoDB 6+
- Gmail (para envío de emails)

### Instalación Completa
```bash
# Clonar repositorio
git clone <URL-del-repositorio>
cd ProgamacionWeb1

# Backend
cd backend
npm install
mkdir uploads
cp .env.example .env  # Editar con tus datos
node scripts/seedUsuarios.js
npm run dev

# Frontend (en otra terminal)
cd ../frontend
npm install
npm run dev
```

### Variables de Entorno (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/productos
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=genera_clave_segura_64_caracteres

# reCAPTCHA (obtener en https://www.google.com/recaptcha/admin/create)
RECAPTCHA_SECRET_KEY=tu_secret_key

# Gmail (generar contraseña de aplicación)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=Regma Helados <tu_email@gmail.com>
```

---

## 🚀 Acceso

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Admin**: `admin@example.com` / `admin123`
- **Usuario**: `user@example.com` / `user123`

---

## ✨ Características

### 🔐 Autenticación
- JWT con Access Token (15 min) y Refresh Token (7 días)
- Logout automático al expirar sesión
- Registro de usuarios con reCAPTCHA
- Registro de administradores (solo admin)
- Email de bienvenida automático

### 📦 Productos
- CRUD completo (Admin)
- Subida de imágenes (JPG, PNG, WEBP, máx 5MB)
- Búsqueda en tiempo real
- Ordenamiento y paginación
- Vista de solo lectura (Usuario)

### 💬 Chat en Tiempo Real
- Socket.IO bidireccional Admin ↔ Usuario
- Notificaciones sonoras
- Historial en MongoDB

### 🎨 Frontend
- React 18 + Vite
- Diseño responsive
- Tema Regma (#ff6600)

---

## 🛠 Tecnologías

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, Multer, Nodemailer, bcryptjs

**Frontend**: React, Vite, Socket.IO Client, reCAPTCHA

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login           - Iniciar sesión
POST   /api/auth/register        - Registro público (con reCAPTCHA)
POST   /api/auth/register-admin  - Registro admin (solo admin)
POST   /api/auth/logout          - Cerrar sesión
POST   /api/auth/refresh         - Renovar token
```

### Productos
```
GET    /api/productos            - Listar productos
GET    /api/productos?busqueda=  - Buscar productos
GET    /api/productos/:id        - Obtener producto
POST   /api/productos            - Crear (solo admin, con imagen)
PUT    /api/productos/:id        - Actualizar (solo admin, con imagen)
DELETE /api/productos/:id        - Eliminar (solo admin)
```

### Imágenes
```
GET    /uploads/:filename        - Ver imagen
```

---

## 🔑 Configurar Gmail

1. Activar verificación en 2 pasos: https://myaccount.google.com/security
2. Generar contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Copiar contraseña en `.env` → `EMAIL_PASS`

---

## 🧪 Probar con Thunder Client/Postman

### Login
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Crear Producto con Imagen
```http
POST http://localhost:3001/api/productos
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Body (form-data):
- nombre: Helado de Vainilla
- precio: 3.50
- descripcion: Cremoso helado de vainilla
- imagen: [archivo .jpg/.png]
```

---

## 🐛 Troubleshooting

### Puerto en uso
```bash
lsof -ti:3001 | xargs kill -9
```

### MongoDB no conecta
```bash
sudo systemctl start mongodb
```

### Contraseñas no funcionan
```bash
cd backend
node scripts/seedUsuarios.js
```

### Error 401
- Token expiró (15 min) → Volver a hacer login
- Verificar que el header incluya: `Authorization: Bearer <token>`

---

## 📁 Estructura
```
backend/
├── controllers/
│   └── authController.js       # JWT, registro, email
├── middlewares/
│   ├── authBasic.js            # Verificación JWT
│   ├── authorizeRole.js        # Control de roles
│   └── upload.js               # Multer (imágenes)
├── models/
│   ├── Usuario.js
│   ├── Producto.js             # Con campo imagen
│   ├── Chat.js
│   └── RefreshToken.js
├── routes/
│   ├── auth.js
│   ├── productos.js            # Con soporte de imágenes
│   ├── usuarios.js
│   └── chats.js
├── uploads/                    # Imágenes de productos
└── server.js                   # + Socket.IO

frontend/
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx    # Con reCAPTCHA
│   │   ├── RegisterAdmin.jsx   # Modal admin
│   │   ├── ProductosList.jsx   # Con upload de imágenes
│   │   ├── AdminLayout.jsx
│   │   ├── ChatAdmin.jsx
│   │   └── ChatUsuario.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   └── App.jsx
```

---

## 👥 Roles y Permisos

| Funcionalidad | Admin | User |
|---------------|-------|------|
| Ver productos | ✅ | ✅ |
| Buscar productos | ✅ | ✅ |
| Crear productos | ✅ | ❌ |
| Editar productos | ✅ | ❌ |
| Eliminar productos | ✅ | ❌ |
| Subir imágenes | ✅ | ❌ |
| Registrar admins | ✅ | ❌ |
| Chat con admin | ✅ | ✅ |
| Registrarse | 🌐 Público | 🌐 Público |

---

## 🚀 Despliegue a Producción
```bash
# Frontend
cd frontend
npm run build
# Subir carpeta dist/ a Vercel/Netlify

# Backend
# Desplegar a Render/Railway/Heroku
# Configurar MongoDB Atlas
# Actualizar variables de entorno
```

**Checklist:**
- [ ] `NODE_ENV=production`
- [ ] JWT_SECRET seguro (64+ caracteres)
- [ ] MongoDB Atlas configurado
- [ ] FRONTEND_URL con dominio real
- [ ] Gmail configurado
- [ ] HTTPS habilitado

---

## 📄 Licencia

MIT

## 👨‍💻 Autor

Rubén Setién

---

**🎉 ¡Proyecto completo y funcional!**

Características implementadas:
✅ JWT con refresh tokens
✅ Registro con reCAPTCHA y email
✅ Chat en tiempo real
✅ Subida de imágenes
✅ CRUD completo
✅ Control de roles