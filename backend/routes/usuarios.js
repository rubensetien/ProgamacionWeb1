import express from 'express';
import Usuario from '../models/Usuario.js';
import { auth, isAdmin } from '../middlewares/auth.js';
import { onlyAdmin, checkPermission } from '../middlewares/checkPermissions.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @route   GET /api/usuarios/trabajadores
 * @desc    Obtener lista de trabajadores (excluyendo clientes)
 * @access  Private
 */
router.get('/trabajadores', async (req, res) => {
  try {
    const trabajadores = await Usuario.find({
      rol: { $in: ['admin', 'gestor', 'trabajador', 'gestor-tienda'] },
      activo: true
    })
      .populate('ubicacionAsignada.referencia') // ✅ Fix: Poblar ubicacion
      .populate('tiendaAsignada')
      .select('nombre email rol ubicacionAsignada tiendaAsignada telefono activo') // ✅ Fix: Campos correctos
      .sort({ nombre: 1 })
      .lean();

    res.json({
      success: true,
      data: trabajadores,
      count: trabajadores.length
    });
  } catch (error) {
    console.error('Error obteniendo trabajadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de trabajadores'
    });
  }
});

// GET /api/usuarios - Listar todos los usuarios
router.get('/', onlyAdmin, async (req, res) => {
  try {
    const { rol, activo, tipoTrabajador, ubicacionTipo, search } = req.query;

    const filtro = {};

    if (rol) filtro.rol = rol;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (tipoTrabajador) filtro.tipoTrabajador = tipoTrabajador;
    if (ubicacionTipo) filtro['ubicacionAsignada.tipo'] = ubicacionTipo;

    // Búsqueda por nombre o email
    if (search) {
      filtro.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const usuarios = await Usuario.find(filtro)
      .populate('ubicacionAsignada.referencia')
      .populate('tiendaAsignada')
      .select('-password')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// GET /api/usuarios/staff - Obtener solo personal (no clientes)
router.get('/staff', onlyAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find({
      rol: { $in: ['admin', 'gestor-tienda', 'trabajador'] }
    })
      .populate('ubicacionAsignada.referencia')
      .populate('tiendaAsignada')
      .select('-password')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error obteniendo staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener personal',
      error: error.message
    });
  }
});

// GET /api/usuarios/trabajadores/:ubicacionTipo/:ubicacionId - Trabajadores de una ubicación
router.get('/trabajadores/:ubicacionTipo/:ubicacionId', onlyAdmin, async (req, res) => {
  try {
    const { ubicacionTipo, ubicacionId } = req.params;

    const usuarios = await Usuario.find({
      'ubicacionAsignada.tipo': ubicacionTipo,
      'ubicacionAsignada.referencia': ubicacionId,
      activo: true
    })
      .select('-password')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error obteniendo trabajadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener trabajadores',
      error: error.message
    });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', onlyAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .populate('ubicacionAsignada.referencia')
      .populate('tiendaAsignada')
      .select('-password');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
});

// POST /api/usuarios - Crear usuario (solo admin)
router.post('/', onlyAdmin, async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      telefono,
      rol,
      tipoTrabajador,
      ubicacionAsignada,
      tiendaAsignada,
      permisos
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, password y rol son requeridos'
      });
    }

    // Verificar si el email ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear datos del usuario
    const datosUsuario = {
      nombre,
      email,
      password,
      telefono,
      rol,
      activo: true
    };

    // Añadir campos específicos según rol
    if (rol === 'trabajador' && tipoTrabajador) {
      datosUsuario.tipoTrabajador = tipoTrabajador;
    }

    if (ubicacionAsignada) {
      datosUsuario.ubicacionAsignada = ubicacionAsignada;
    }

    if (rol === 'gestor-tienda' && tiendaAsignada) {
      datosUsuario.tiendaAsignada = tiendaAsignada;
    }

    // Permisos personalizados (si se proporcionan)
    if (permisos) {
      datosUsuario.permisos = permisos;
    }

    // Crear usuario
    const usuario = await Usuario.create(datosUsuario);

    // Poblar referencias
    await usuario.populate('ubicacionAsignada.referencia');
    await usuario.populate('tiendaAsignada');

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', onlyAdmin, async (req, res) => {
  try {
    const { password, ...datosActualizacion } = req.body;

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    Object.keys(datosActualizacion).forEach(key => {
      if (datosActualizacion[key] !== undefined) {
        usuario[key] = datosActualizacion[key];
      }
    });

    // Si se proporciona password, actualizarlo
    if (password) {
      usuario.password = password;
    }

    await usuario.save();

    await usuario.populate('ubicacionAsignada.referencia');
    await usuario.populate('tiendaAsignada');

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
});

// PATCH /api/usuarios/:id/permisos - Actualizar permisos específicos
router.patch('/:id/permisos', onlyAdmin, async (req, res) => {
  try {
    const { permisos } = req.body;

    if (!permisos) {
      return res.status(400).json({
        success: false,
        message: 'Los permisos son requeridos'
      });
    }

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar permisos
    Object.keys(permisos).forEach(permiso => {
      if (usuario.permisos.hasOwnProperty(permiso)) {
        usuario.permisos[permiso] = permisos[permiso];
      }
    });

    await usuario.save();

    res.json({
      success: true,
      message: 'Permisos actualizados exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error actualizando permisos:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar permisos',
      error: error.message
    });
  }
});

// PATCH /api/usuarios/:id/toggle-active - Activar/Desactivar usuario
router.patch('/:id/toggle-active', onlyAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    usuario.activo = !usuario.activo;
    await usuario.save();

    res.json({
      success: true,
      message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente`,
      data: usuario
    });
  } catch (error) {
    console.error('Error cambiando estado:', error);
    res.status(400).json({
      success: false,
      message: 'Error al cambiar estado del usuario',
      error: error.message
    });
  }
});

// PATCH /api/usuarios/:id/bloquear - Bloquear/Desbloquear usuario
router.patch('/:id/bloquear', onlyAdmin, async (req, res) => {
  try {
    const { motivo } = req.body;

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    usuario.bloqueado = !usuario.bloqueado;

    if (usuario.bloqueado && motivo) {
      usuario.motivoBloqueo = motivo;
    } else {
      usuario.motivoBloqueo = null;
    }

    await usuario.save();

    res.json({
      success: true,
      message: `Usuario ${usuario.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
      data: usuario
    });
  } catch (error) {
    console.error('Error bloqueando usuario:', error);
    res.status(400).json({
      success: false,
      message: 'Error al bloquear usuario',
      error: error.message
    });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', onlyAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar al propio admin
    if (usuario._id.toString() === req.usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminarte a ti mismo'
      });
    }

    await usuario.deleteOne();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

export default router;
