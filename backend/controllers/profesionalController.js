import Negocio from '../models/Negocio.js';
import Usuario from '../models/Usuario.js';

// @desc    Registrar un nuevo negocio y su administrador
// @route   POST /api/profesionales/registro-negocio
// @access  Public
const registrarNegocio = async (req, res) => {
    const {
        nombreNegocio,
        razonSocial,
        cif,
        tipoNegocio,
        direccion,
        nombreContacto,
        emailContacto,
        telefonoContacto,
        password // Password para la cuenta de usuario
    } = req.body;

    try {
        // 1. Validar si el CIF ya existe
        const negocioExiste = await Negocio.findOne({ cif });
        if (negocioExiste) {
            return res.status(400).json({ msg: 'Ya existe un negocio registrado con este CIF' });
        }

        // 2. Validar si el email de usuario ya existe
        const usuarioExiste = await Usuario.findOne({ email: emailContacto });
        if (usuarioExiste) {
            return res.status(400).json({ msg: 'El email de contacto ya está registrado como usuario' });
        }

        // 3. Crear el Negocio
        const nuevoNegocio = new Negocio({
            nombre: nombreNegocio,
            razonSocial,
            cif,
            tipo: tipoNegocio,
            direccion, // Objeto { calle, ciudad, cp, provincia }
            contacto: {
                nombre: nombreContacto,
                email: emailContacto,
                telefono: telefonoContacto
            },
            estado: 'pendiente' // Por defecto pendiente de validación
        });

        const negocioGuardado = await nuevoNegocio.save();

        // 4. Crear el Usuario Administrador del Negocio
        const nuevoUsuario = new Usuario({
            nombre: nombreContacto,
            email: emailContacto,
            password,
            rol: 'profesional',
            negocioId: negocioGuardado._id,
            esAdminNegocio: true,
            telefono: telefonoContacto,
            activo: true // El usuario está activo, aunque el negocio esté pendiente
        });

        await nuevoUsuario.save();

        res.status(201).json({
            msg: 'Solicitud de negocio registrada correctamente. Pendiente de validación.',
            negocioId: negocioGuardado._id,
            usuarioId: nuevoUsuario._id
        });

    } catch (error) {
        console.error('Error en registro negocio:', error);
        res.status(500).json({ msg: 'Error al registrar el negocio', error: error.message });
    }
};

// @desc    Obtener negocios pendientes de validación
// @route   GET /api/profesionales/pendientes
// @access  Private (Admin/Oficina)
const getNegociosPendientes = async (req, res) => {
    try {
        const negocios = await Negocio.find({ estado: 'pendiente' }).sort({ createdAt: 1 });
        res.json(negocios);
    } catch (error) {
        console.error('Error al obtener negocios pendientes:', error);
        res.status(500).json({ msg: 'Error al obtener negocios' });
    }
};

// @desc    Validar un negocio
// @route   PUT /api/profesionales/:id/validar
// @access  Private (Admin/Oficina)
const validarNegocio = async (req, res) => {
    try {
        const negocio = await Negocio.findById(req.params.id);

        if (!negocio) {
            return res.status(404).json({ msg: 'Negocio no encontrado' });
        }

        if (negocio.estado === 'activo') {
            return res.status(400).json({ msg: 'El negocio ya está activo' });
        }

        // 1. Activar Negocio
        negocio.estado = 'activo';
        negocio.fechaValidacion = Date.now();
        negocio.validadoPor = req.usuario._id; // Del middleware auth
        await negocio.save();

        // 2. Notificar al usuario admin del negocio (Simulado/Email)
        // TODO: Enviar email

        res.json({ msg: 'Negocio validado correctamente', negocio });

    } catch (error) {
        console.error('Error al validar negocio:', error);
        res.status(500).json({ msg: 'Error al validar negocio' });
    }
};

// @desc    Rechazar un negocio
// @route   PUT /api/profesionales/:id/rechazar
// @access  Private (Admin/Oficina)
const rechazarNegocio = async (req, res) => {
    try {
        const negocio = await Negocio.findById(req.params.id);

        if (!negocio) {
            return res.status(404).json({ msg: 'Negocio no encontrado' });
        }

        negocio.estado = 'rechazado';
        await negocio.save();

        // Opcional: Desactivar o borrar el usuario asociado si se rechaza
        // Por ahora lo mantenemos pero no podrá operar si validamos estado del negocio en login

        res.json({ msg: 'Negocio rechazado correctamente' });

    } catch (error) {
        console.error('Error al rechazar negocio:', error);
        res.status(500).json({ msg: 'Error al rechazar negocio' });
    }
};

export {
    registrarNegocio,
    getNegociosPendientes,
    validarNegocio,
    rechazarNegocio,
    getAllNegocios,
    addEmpleado
};

// @desc    Obtener todos los negocios (incluyendo activos y rechazados)
// @route   GET /api/profesionales
// @access  Private (Admin/Oficina)
const getAllNegocios = async (req, res) => {
    try {
        const negocios = await Negocio.find({}).sort({ createdAt: -1 });
        res.json(negocios);
    } catch (error) {
        console.error('Error al obtener todos los negocios:', error);
        res.status(500).json({ msg: 'Error al obtener negocios' });
    }
};

// @desc    Añadir un empleado/contacto a un negocio existente
// @route   POST /api/profesionales/:id/empleados
// @access  Private (Admin/Oficina o AdminNegocio)
const addEmpleado = async (req, res) => {
    const { id } = req.params; // ID del Negocio
    const { nombre, email, telefono, password, puesto } = req.body;

    try {
        const negocio = await Negocio.findById(id);
        if (!negocio) {
            return res.status(404).json({ msg: 'Negocio no encontrado' });
        }

        // Validar permisos: Solo Admin/Oficina o el propio Admin del Negocio
        const esAdminGlobal = ['admin', 'gestor'].includes(req.usuario.rol) || req.usuario.permisos.gestionarNegocios;
        const esAdminDelNegocio = req.usuario.negocioId?.toString() === id && req.usuario.esAdminNegocio;

        if (!esAdminGlobal && !esAdminDelNegocio) {
            return res.status(403).json({ msg: 'No tienes permisos para añadir empleados a este negocio' });
        }

        // Verificar si usuario existe
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ msg: 'El email ya está registrado' });
        }

        // Crear Usuario Empleado
        const nuevoEmpleado = new Usuario({
            nombre,
            email,
            password,
            telefono,
            rol: 'profesional',
            negocioId: id,
            esAdminNegocio: false,
            ubicacionAsignada: {
                nombre: negocio.nombre,
                puesto: puesto || 'Empleado'
            },
            activo: true
        });

        await nuevoEmpleado.save();

        res.status(201).json({ msg: 'Empleado añadido correctamente', empleado: nuevoEmpleado });

    } catch (error) {
        console.error('Error al añadir empleado:', error);
        res.status(500).json({ msg: 'Error al añadir empleado' });
    }
};
