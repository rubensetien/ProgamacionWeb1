import express from 'express';
import Oficina from '../models/Oficina.js';
import { authenticate } from '../middlewares/auth.js';
import { onlyAdmin, onlyStaff } from '../middlewares/checkPermissions.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/oficinas - Listar todas las oficinas
router.get('/', onlyStaff, async (req, res) => {
  try {
    const { activo, tipo } = req.query;
    
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (tipo) filtro.tipo = tipo;
    
    const oficinas = await Oficina.find(filtro)
      .populate('director', 'nombre email telefono')
      .populate('departamentos.responsable', 'nombre email')
      .populate('trabajadores.usuario', 'nombre email')
      .sort({ tipo: 1, nombre: 1 });
    
    res.json({
      success: true,
      data: oficinas,
      total: oficinas.length
    });
  } catch (error) {
    console.error('Error obteniendo oficinas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener oficinas',
      error: error.message
    });
  }
});

// GET /api/oficinas/:id - Obtener oficina por ID
router.get('/:id', onlyStaff, async (req, res) => {
  try {
    const oficina = await Oficina.findById(req.params.id)
      .populate('director', 'nombre email telefono avatar')
      .populate('departamentos.responsable', 'nombre email telefono')
      .populate('departamentos.trabajadores', 'nombre email telefono avatar')
      .populate('trabajadores.usuario', 'nombre email telefono puesto');
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: oficina
    });
  } catch (error) {
    console.error('Error obteniendo oficina:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener oficina',
      error: error.message
    });
  }
});

// GET /api/oficinas/:id/departamento/:nombreDepartamento - Obtener empleados de un departamento
router.get('/:id/departamento/:nombreDepartamento', onlyStaff, async (req, res) => {
  try {
    const { id, nombreDepartamento } = req.params;
    
    const oficina = await Oficina.findById(id)
      .populate('departamentos.responsable', 'nombre email')
      .populate('departamentos.trabajadores', 'nombre email telefono avatar');
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    const departamento = oficina.departamentos.find(d => d.nombre === nombreDepartamento);
    
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: departamento
    });
  } catch (error) {
    console.error('Error obteniendo departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamento',
      error: error.message
    });
  }
});

// POST /api/oficinas - Crear oficina
router.post('/', onlyAdmin, async (req, res) => {
  try {
    const oficina = await Oficina.create(req.body);
    
    await oficina.populate('director', 'nombre email');
    
    res.status(201).json({
      success: true,
      message: 'Oficina creada exitosamente',
      data: oficina
    });
  } catch (error) {
    console.error('Error creando oficina:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear oficina',
      error: error.message
    });
  }
});

// PUT /api/oficinas/:id - Actualizar oficina
router.put('/:id', onlyAdmin, async (req, res) => {
  try {
    const oficina = await Oficina.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('director', 'nombre email')
      .populate('departamentos.responsable', 'nombre email')
      .populate('trabajadores.usuario', 'nombre email');
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Oficina actualizada exitosamente',
      data: oficina
    });
  } catch (error) {
    console.error('Error actualizando oficina:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar oficina',
      error: error.message
    });
  }
});

// POST /api/oficinas/:id/departamento - Añadir departamento
router.post('/:id/departamento', onlyAdmin, async (req, res) => {
  try {
    const { nombre, responsable, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del departamento es requerido'
      });
    }
    
    const oficina = await Oficina.findById(req.params.id);
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    // Verificar que no exista ya el departamento
    const existe = oficina.departamentos.find(d => d.nombre === nombre);
    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'El departamento ya existe'
      });
    }
    
    oficina.departamentos.push({
      nombre,
      responsable,
      descripcion,
      trabajadores: [],
      activo: true
    });
    
    await oficina.save();
    await oficina.populate('departamentos.responsable', 'nombre email');
    
    res.status(201).json({
      success: true,
      message: 'Departamento añadido exitosamente',
      data: oficina
    });
  } catch (error) {
    console.error('Error añadiendo departamento:', error);
    res.status(400).json({
      success: false,
      message: 'Error al añadir departamento',
      error: error.message
    });
  }
});

// PATCH /api/oficinas/:id/departamento/:nombreDepartamento/trabajador - Añadir trabajador a departamento
router.patch('/:id/departamento/:nombreDepartamento/trabajador', onlyAdmin, async (req, res) => {
  try {
    const { id, nombreDepartamento } = req.params;
    const { usuarioId } = req.body;
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario es requerido'
      });
    }
    
    const oficina = await Oficina.findById(id);
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    const departamento = oficina.departamentos.find(d => d.nombre === nombreDepartamento);
    
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    // Verificar que no esté ya en el departamento
    if (departamento.trabajadores.includes(usuarioId)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está en este departamento'
      });
    }
    
    departamento.trabajadores.push(usuarioId);
    
    await oficina.save();
    await oficina.populate('departamentos.trabajadores', 'nombre email');
    
    res.json({
      success: true,
      message: 'Trabajador añadido al departamento exitosamente',
      data: departamento
    });
  } catch (error) {
    console.error('Error añadiendo trabajador:', error);
    res.status(400).json({
      success: false,
      message: 'Error al añadir trabajador',
      error: error.message
    });
  }
});

// DELETE /api/oficinas/:id/departamento/:nombreDepartamento/trabajador/:usuarioId - Quitar trabajador de departamento
router.delete('/:id/departamento/:nombreDepartamento/trabajador/:usuarioId', onlyAdmin, async (req, res) => {
  try {
    const { id, nombreDepartamento, usuarioId } = req.params;
    
    const oficina = await Oficina.findById(id);
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    const departamento = oficina.departamentos.find(d => d.nombre === nombreDepartamento);
    
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    departamento.trabajadores = departamento.trabajadores.filter(
      t => t.toString() !== usuarioId
    );
    
    await oficina.save();
    
    res.json({
      success: true,
      message: 'Trabajador removido del departamento exitosamente'
    });
  } catch (error) {
    console.error('Error removiendo trabajador:', error);
    res.status(400).json({
      success: false,
      message: 'Error al remover trabajador',
      error: error.message
    });
  }
});

// DELETE /api/oficinas/:id - Eliminar oficina
router.delete('/:id', onlyAdmin, async (req, res) => {
  try {
    const oficina = await Oficina.findByIdAndDelete(req.params.id);
    
    if (!oficina) {
      return res.status(404).json({
        success: false,
        message: 'Oficina no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Oficina eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando oficina:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar oficina',
      error: error.message
    });
  }
});

export default router;
