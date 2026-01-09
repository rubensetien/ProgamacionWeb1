import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import nodemailer from 'nodemailer';
import Usuario from '../models/Usuario.js';
import RefreshToken from '../models/RefreshToken.js';

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para verificar reCAPTCHA
const verificarRecaptcha = async (token) => {
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    return response.data.success;
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return false;
  }
};

// Función para enviar email de bienvenida
const enviarEmailBienvenida = async (nombre, email) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido a Regma Helados! 🍦',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff6600;">¡Hola ${nombre}! 🍦</h1>
          <p>Gracias por registrarte en <strong>Regma Helados</strong>.</p>
          <p>Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión y explorar nuestro catálogo de productos.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background-color: #ff6600; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Ir a la aplicación
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Este es un correo automático, por favor no responder.
          </p>
        </div>
      `,
    });
    console.log('✅ Email de bienvenida enviado a:', email);
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas' });
    }

    // Access Token (15 min)
    const accessToken = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh Token (7 días)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guardar en BD
    await RefreshToken.create({
      token: refreshToken,
      usuario: usuario._id,
      expiresAt
    });

    // Enviar refresh token en cookie httpOnly
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({
      ok: true,
      accessToken,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ubicacionAsignada: usuario.ubicacionAsignada
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// REGISTER - NUEVO (Usuarios públicos)
export const register = async (req, res) => {
  try {
    const { nombre, email, password, recaptchaToken } = req.body;

    // 1. Verificar reCAPTCHA
    const recaptchaValido = await verificarRecaptcha(recaptchaToken);
    if (!recaptchaValido) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Verificación reCAPTCHA inválida. Por favor, intenta de nuevo.'
      });
    }

    // 2. Verificar que el email no exista
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Este email ya está registrado'
      });
    }

    // 3. Crear nuevo usuario con rol "user"
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password, // Se hasheará automáticamente por el middleware pre-save
      rol: 'user',
    });

    await nuevoUsuario.save();

    // 4. Enviar email de bienvenida (asíncrono, no bloquea respuesta)
    enviarEmailBienvenida(nombre, email);

    // 5. Respuesta exitosa
    res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente. Por favor, inicia sesión.',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// REGISTER ADMIN - NUEVO (Solo para admin autenticado)
export const registerAdmin = async (req, res) => {
  try {
    const { nombre, email, password, adminPassword } = req.body;

    // 1. Verificar que el admin actual existe (viene de authBasic middleware)
    const adminActual = await Usuario.findById(req.user.id);
    if (!adminActual) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Admin no encontrado'
      });
    }

    // 2. Verificar contraseña del admin actual
    const passwordValido = await adminActual.compararPassword(adminPassword);
    if (!passwordValido) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Contraseña de administrador incorrecta'
      });
    }

    // 3. Verificar que el email no exista
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Este email ya está registrado'
      });
    }

    // 4. Crear nuevo administrador
    const nuevoAdmin = new Usuario({
      nombre,
      email,
      password, // Se hasheará automáticamente
      rol: 'admin',
    });

    await nuevoAdmin.save();

    // 5. Enviar email de bienvenida
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido como Administrador - Regma Helados! 👨‍💼',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff6600;">¡Hola ${nombre}! 👨‍💼</h1>
          <p>Has sido registrado como <strong>Administrador</strong> en Regma Helados.</p>
          <p><strong>Tus credenciales:</strong></p>
          <ul>
            <li>Email: <strong>${email}</strong></li>
            <li>Contraseña: <em>(la que se te proporcionó)</em></li>
          </ul>
          <p>Por seguridad, te recomendamos cambiar tu contraseña en el primer inicio de sesión.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background-color: #ff6600; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Iniciar sesión
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            Registrado por: ${adminActual.email}
          </p>
        </div>
      `,
    });

    // 6. Respuesta exitosa
    res.status(201).json({
      ok: true,
      mensaje: 'Administrador registrado exitosamente',
      usuario: {
        id: nuevoAdmin._id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol,
      },
    });
  } catch (error) {
    console.error('Error registrando admin:', error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// REFRESH
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ ok: false, mensaje: 'Refresh token no proporcionado' });
    }

    const tokenData = await RefreshToken.findOne({ token: refreshToken }).populate('usuario');

    if (!tokenData || tokenData.expiresAt < new Date()) {
      return res.status(401).json({ ok: false, mensaje: 'Refresh token inválido' });
    }

    const accessToken = jwt.sign(
      { id: tokenData.usuario._id, rol: tokenData.usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ ok: true, accessToken });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.clearCookie('refreshToken');
    res.json({ ok: true, mensaje: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};