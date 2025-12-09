import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  // ========== DATOS BÁSICOS ==========
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email no válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 6,
    select: false
  },
  telefono: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },

  // ========== ROL Y TIPO ==========
  rol: {
    type: String,
    enum: ['admin', 'gestor-tienda', 'trabajador', 'cliente'],
    default: 'cliente',
    required: true
  },

  // Solo para rol 'trabajador'
  tipoTrabajador: {
    type: String,
    enum: ['tienda', 'obrador', 'oficina'],
    default: null
  },

  // ========== UBICACIÓN ASIGNADA ==========
  ubicacionAsignada: {
    tipo: {
      type: String,
      enum: ['tienda', 'obrador', 'oficina'],
      default: null
    },
    referencia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ubicacion', // ✅ FIX: Referencia estática al modelo correcto
      default: null
    },
    nombre: String,
    puesto: {
      type: String,
      enum: [
        // Tienda
        'cajero', 'dependiente', 'encargado-tienda',
        // Obrador
        'maestro-heladero', 'ayudante-produccion', 'almacen', 'logistica',
        // Oficina
        'administracion', 'contabilidad', 'marketing', 'rrhh', 'ventas', 'gerencia'
      ],
      default: null
    },
    fechaAsignacion: {
      type: Date,
      default: null
    }
  },

  // Solo para gestor-tienda (compatibilidad)
  tiendaAsignada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ubicacion', // ✅ FIX: Referencia a Ubicacion, 'PuntoVenta' no existe
    default: null
  },

  // ========== PERMISOS GRANULARES ==========
  permisos: {
    // Catálogo
    gestionarCatalogo: {
      type: Boolean,
      default: false
    },

    // Inventario
    verStockObrador: {
      type: Boolean,
      default: false
    },
    verStockTienda: {
      type: Boolean,
      default: false
    },
    gestionarStock: {
      type: Boolean,
      default: false
    },
    solicitarProductos: {
      type: Boolean,
      default: false
    },

    // Pedidos
    verPedidosTodos: {
      type: Boolean,
      default: false
    },
    verPedidosTienda: {
      type: Boolean,
      default: false
    },
    procesarPedidos: {
      type: Boolean,
      default: false
    },

    // Producción
    verProduccion: {
      type: Boolean,
      default: false
    },
    gestionarProduccion: {
      type: Boolean,
      default: false
    },
    crearOrdenesProduccion: {
      type: Boolean,
      default: false
    },

    // Chat
    accederChatEmpresarial: {
      type: Boolean,
      default: false
    },
    crearGrupos: {
      type: Boolean,
      default: false
    },

    // Reportes
    verReportesVentas: {
      type: Boolean,
      default: false
    },
    verReportesProduccion: {
      type: Boolean,
      default: false
    },
    exportarDatos: {
      type: Boolean,
      default: false
    },

    // Usuarios
    gestionarUsuarios: {
      type: Boolean,
      default: false
    },
    gestionarPermisos: {
      type: Boolean,
      default: false
    }
  },

  // ========== HORARIOS Y TURNOS ==========
  horarios: [{
    diaSemana: {
      type: Number,
      min: 0,
      max: 6 // 0=Domingo, 6=Sábado
    },
    horaEntrada: String,
    horaSalida: String,
    tipoTurno: {
      type: String,
      enum: ['mañana', 'tarde', 'noche', 'partido'],
      default: 'mañana'
    }
  }],

  // ========== ESTADO ==========
  activo: {
    type: Boolean,
    default: true
  },
  verificado: {
    type: Boolean,
    default: false
  },
  bloqueado: {
    type: Boolean,
    default: false
  },
  motivoBloqueo: String,

  // ========== METADATA LABORAL ==========
  fechaContratacion: {
    type: Date,
    default: null
  },
  fechaBaja: {
    type: Date,
    default: null
  },
  motivoBaja: String,

  // ========== METADATA TÉCNICA ==========
  fechaUltimoAcceso: {
    type: Date,
    default: null
  },
  tokenRecuperacion: String,
  tokenExpiracion: Date,

  // ========== NOTIFICACIONES ==========
  notificaciones: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    chat: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// ========== ÍNDICES ==========
// usuarioSchema.index({ email: 1 }); // Definido en schema con unique: true
usuarioSchema.index({ rol: 1, activo: 1 });
usuarioSchema.index({ 'ubicacionAsignada.tipo': 1, 'ubicacionAsignada.referencia': 1 });
usuarioSchema.index({ tiendaAsignada: 1 });

// ========== MIDDLEWARE: Encriptar contraseña ==========
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ========== MIDDLEWARE: Asignar permisos por defecto según rol ==========
usuarioSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  // Permisos por defecto según rol
  switch (this.rol) {
    case 'admin':
      // Admin tiene todos los permisos
      Object.keys(this.permisos).forEach(key => {
        this.permisos[key] = true;
      });
      break;

    case 'gestor-tienda':
      this.permisos.verStockTienda = true;
      this.permisos.gestionarStock = true;
      this.permisos.solicitarProductos = true;
      this.permisos.verPedidosTienda = true;
      this.permisos.procesarPedidos = true;
      this.permisos.accederChatEmpresarial = true;
      this.permisos.verReportesVentas = true;
      break;

    case 'trabajador':
      // Permisos básicos para trabajadores
      this.permisos.accederChatEmpresarial = true;

      // Permisos según tipo de trabajador
      if (this.tipoTrabajador === 'tienda') {
        this.permisos.verStockTienda = true;
        this.permisos.verPedidosTienda = true;
        this.permisos.procesarPedidos = true;
      } else if (this.tipoTrabajador === 'obrador') {
        this.permisos.verStockObrador = true;
        this.permisos.verProduccion = true;
        this.permisos.gestionarProduccion = true;
      } else if (this.tipoTrabajador === 'oficina') {
        this.permisos.verReportesVentas = true;
        this.permisos.verReportesProduccion = true;
      }
      break;

    case 'cliente':
      // Cliente no tiene permisos empresariales
      break;
  }

  next();
});

// ========== MÉTODOS ==========

// Comparar contraseña
usuarioSchema.methods.compararPassword = async function (passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

// Verificar si tiene un permiso específico
usuarioSchema.methods.tienePermiso = function (permiso) {
  if (this.rol === 'admin') return true;
  return this.permisos[permiso] === true;
};

// Verificar si puede acceder a una ubicación
usuarioSchema.methods.puedeAccederUbicacion = function (tipo, idUbicacion) {
  if (this.rol === 'admin') return true;

  if (this.rol === 'gestor-tienda' && tipo === 'tienda') {
    return this.tiendaAsignada?.toString() === idUbicacion?.toString();
  }

  if (this.rol === 'trabajador') {
    return this.ubicacionAsignada?.tipo === tipo &&
      this.ubicacionAsignada?.referencia?.toString() === idUbicacion?.toString();
  }

  return false;
};

// Obtener información pública del usuario
usuarioSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    avatar: this.avatar,
    activo: this.activo
  };
};

// ========== VIRTUALS ==========
usuarioSchema.virtual('nombreCompleto').get(function () {
  return this.nombre;
});

usuarioSchema.virtual('esAdmin').get(function () {
  return this.rol === 'admin';
});

usuarioSchema.virtual('esGestorTienda').get(function () {
  return this.rol === 'gestor-tienda';
});

usuarioSchema.virtual('esTrabajador').get(function () {
  return this.rol === 'trabajador';
});

usuarioSchema.virtual('esCliente').get(function () {
  return this.rol === 'cliente';
});

usuarioSchema.set('toJSON', { virtuals: true });
usuarioSchema.set('toObject', { virtuals: true });

export default mongoose.model('Usuario', usuarioSchema);