import mongoose from 'mongoose';

const oficinaSchema = new mongoose.Schema({
  // ========== IDENTIFICACIÓN ==========
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    index: true
  },
  codigo: {
    type: String,
    unique: true,
    uppercase: true,
    required: true
  },
  
  // ========== TIPO ==========
  tipo: {
    type: String,
    enum: ['sede-central', 'delegacion', 'oficina-comercial'],
    default: 'oficina-comercial',
    required: true
  },
  
  descripcion: {
    type: String
  },
  
  // ========== UBICACIÓN ==========
  ubicacion: {
    direccion: {
      type: String,
      required: true
    },
    ciudad: {
      type: String,
      required: true
    },
    provincia: {
      type: String,
      required: true
    },
    codigoPostal: {
      type: String,
      required: true
    },
    pais: {
      type: String,
      default: 'España'
    },
    coordenadas: {
      lat: Number,
      lng: Number
    },
    planta: {
      type: String
    },
    oficina: {
      type: String
    }
  },
  
  // ========== DEPARTAMENTOS ==========
  departamentos: [{
    nombre: {
      type: String,
      enum: [
        'administracion',
        'contabilidad',
        'finanzas',
        'rrhh',
        'marketing',
        'ventas',
        'compras',
        'logistica',
        'it',
        'gerencia',
        'atencion-cliente'
      ],
      required: true
    },
    responsable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    trabajadores: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }],
    descripcion: {
      type: String
    },
    activo: {
      type: Boolean,
      default: true
    }
  }],
  
  // ========== PERSONAL ==========
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  
  trabajadores: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    departamento: {
      type: String,
      enum: [
        'administracion',
        'contabilidad',
        'finanzas',
        'rrhh',
        'marketing',
        'ventas',
        'compras',
        'logistica',
        'it',
        'gerencia',
        'atencion-cliente'
      ]
    },
    puesto: {
      type: String
    },
    fechaAsignacion: {
      type: Date,
      default: Date.now
    },
    activo: {
      type: Boolean,
      default: true
    }
  }],
  
  // ========== HORARIOS ==========
  horarios: {
    apertura: {
      type: String,
      default: '09:00'
    },
    cierre: {
      type: String,
      default: '18:00'
    },
    diasLaborables: [{
      type: String,
      enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    }],
    horaDescanso: {
      inicio: String,
      fin: String
    }
  },
  
  // ========== INSTALACIONES ==========
  instalaciones: {
    capacidadPersonas: {
      type: Number,
      default: 0
    },
    puestosTrabajo: {
      type: Number,
      default: 0
    },
    salasReuniones: {
      type: Number,
      default: 0
    },
    tieneParking: {
      type: Boolean,
      default: false
    },
    tieneCafeteria: {
      type: Boolean,
      default: false
    },
    accesibilidad: {
      type: Boolean,
      default: true
    }
  },
  
  // ========== CONTACTO ==========
  contacto: {
    telefono: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    emailGeneral: {
      type: String
    },
    emailSoporte: {
      type: String
    },
    website: {
      type: String
    },
    redesSociales: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },
  
  // ========== CONFIGURACIÓN ==========
  configuracion: {
    zonaHoraria: {
      type: String,
      default: 'Europe/Madrid'
    },
    idiomaPrincipal: {
      type: String,
      default: 'es'
    },
    moneda: {
      type: String,
      default: 'EUR'
    }
  },
  
  // ========== ESTADÍSTICAS ==========
  estadisticas: {
    totalEmpleados: {
      type: Number,
      default: 0
    },
    totalDepartamentos: {
      type: Number,
      default: 0
    }
  },
  
  // ========== ESTADO ==========
  activo: {
    type: Boolean,
    default: true
  },
  motivoInactivo: {
    type: String
  },
  
  // ========== METADATA ==========
  imagen: {
    type: String
  },
  imagenes: [{
    type: String
  }],
  
  notas: {
    type: String
  }
}, {
  timestamps: true
});

// ========== ÍNDICES ==========
oficinaSchema.index({ slug: 1 });
oficinaSchema.index({ codigo: 1 });
oficinaSchema.index({ tipo: 1, activo: 1 });
oficinaSchema.index({ 'ubicacion.ciudad': 1 });
oficinaSchema.index({ director: 1 });

// ========== MIDDLEWARE: Generar slug ==========
oficinaSchema.pre('validate', function(next) {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

// ========== MIDDLEWARE: Actualizar estadísticas ==========
oficinaSchema.pre('save', function(next) {
  this.estadisticas.totalEmpleados = this.trabajadores.filter(t => t.activo).length;
  this.estadisticas.totalDepartamentos = this.departamentos.filter(d => d.activo).length;
  next();
});

// ========== MÉTODOS DE INSTANCIA ==========

// Obtener empleados de un departamento
oficinaSchema.methods.getEmpleadosDepartamento = function(nombreDepartamento) {
  const dept = this.departamentos.find(d => d.nombre === nombreDepartamento);
  return dept ? dept.trabajadores : [];
};

// Verificar si un usuario pertenece a esta oficina
oficinaSchema.methods.tieneEmpleado = function(usuarioId) {
  return this.trabajadores.some(t => 
    t.usuario.toString() === usuarioId.toString() && t.activo
  );
};

// Obtener departamento de un usuario
oficinaSchema.methods.getDepartamentoUsuario = function(usuarioId) {
  const trabajador = this.trabajadores.find(t => 
    t.usuario.toString() === usuarioId.toString()
  );
  return trabajador ? trabajador.departamento : null;
};

// ========== VIRTUALS ==========
oficinaSchema.virtual('totalEmpleadosActivos').get(function() {
  return this.trabajadores.filter(t => t.activo).length;
});

oficinaSchema.virtual('departamentosActivos').get(function() {
  return this.departamentos.filter(d => d.activo);
});

oficinaSchema.set('toJSON', { virtuals: true });
oficinaSchema.set('toObject', { virtuals: true });

export default mongoose.model('Oficina', oficinaSchema);
