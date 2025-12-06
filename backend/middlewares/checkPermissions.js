// Middleware para verificar permisos granulares

export const checkPermission = (permisoRequerido) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }
      
      // Admin tiene todos los permisos
      if (usuario.rol === 'admin') {
        return next();
      }
      
      // Verificar si tiene el permiso específico
      if (!usuario.permisos || !usuario.permisos[permisoRequerido]) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para realizar esta acción',
          permisoRequerido
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// Verificar múltiples permisos (requiere TODOS)
export const checkPermissions = (permisosRequeridos = []) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }
      
      // Admin tiene todos los permisos
      if (usuario.rol === 'admin') {
        return next();
      }
      
      // Verificar que tiene TODOS los permisos requeridos
      const tienePermisos = permisosRequeridos.every(permiso => 
        usuario.permisos && usuario.permisos[permiso]
      );
      
      if (!tienePermisos) {
        return res.status(403).json({
          success: false,
          message: 'No tienes los permisos necesarios',
          permisosRequeridos
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// Verificar al menos uno de varios permisos (requiere AL MENOS UNO)
export const checkAnyPermission = (permisosRequeridos = []) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }
      
      // Admin tiene todos los permisos
      if (usuario.rol === 'admin') {
        return next();
      }
      
      // Verificar que tiene AL MENOS UNO de los permisos
      const tieneAlgunPermiso = permisosRequeridos.some(permiso => 
        usuario.permisos && usuario.permisos[permiso]
      );
      
      if (!tieneAlgunPermiso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes ninguno de los permisos necesarios',
          permisosRequeridos
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// Verificar rol específico
export const checkRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }
      
      // Normalizar a array
      const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
      
      if (!roles.includes(usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes el rol necesario para esta acción',
          rolActual: usuario.rol,
          rolesPermitidos: roles
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar rol'
      });
    }
  };
};

// Verificar acceso a ubicación específica
export const checkUbicacionAccess = (tipoUbicacion) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;
      const ubicacionId = req.params.id || req.params.ubicacionId || req.body.ubicacionId;
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
      }
      
      // Admin tiene acceso a todo
      if (usuario.rol === 'admin') {
        return next();
      }
      
      // Verificar acceso según rol
      if (usuario.rol === 'gestor-tienda' && tipoUbicacion === 'tienda') {
        if (usuario.tiendaAsignada?.toString() !== ubicacionId?.toString()) {
          return res.status(403).json({
            success: false,
            message: 'No tienes acceso a esta tienda'
          });
        }
        return next();
      }
      
      if (usuario.rol === 'trabajador') {
        if (usuario.ubicacionAsignada?.tipo !== tipoUbicacion ||
            usuario.ubicacionAsignada?.referencia?.toString() !== ubicacionId?.toString()) {
          return res.status(403).json({
            success: false,
            message: `No tienes acceso a este ${tipoUbicacion}`
          });
        }
        return next();
      }
      
      // Si no cumple ninguna condición
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta ubicación'
      });
      
    } catch (error) {
      console.error('Error verificando acceso a ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar acceso'
      });
    }
  };
};

// Solo admin
export const onlyAdmin = checkRole(['admin']);

// Admin o gestor de tienda
export const adminOrGestor = checkRole(['admin', 'gestor-tienda']);

// Personal empresarial (excluye clientes)
export const onlyStaff = checkRole(['admin', 'gestor-tienda', 'trabajador']);

export default {
  checkPermission,
  checkPermissions,
  checkAnyPermission,
  checkRole,
  checkUbicacionAccess,
  onlyAdmin,
  adminOrGestor,
  onlyStaff
};
