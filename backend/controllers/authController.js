import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Usuario from '../models/Usuario.js';
import RefreshToken from '../models/RefreshToken.js';

// LOGIN - Reemplazar
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
        rol: usuario.rol 
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

// REFRESH - Añadir
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

// LOGOUT - Añadir
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