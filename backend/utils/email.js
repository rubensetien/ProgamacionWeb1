import nodemailer from 'nodemailer';

// Configuración del transporte
// Se intentará usar variables de entorno, si no existen, se advertirá en consola
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Credenciales de email no encontradas en .env. El envío de correos está deshabilitado.');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Útil para desarrollo si hay problemas con certificados
        }
    });
};

const sendEmail = async ({ to, subject, html }) => {
    const transporter = createTransporter();

    if (!transporter) {
        console.log(`[SIMULACIÓN EMAIL] Para: ${to} | Asunto: ${subject}`);
        return false;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Regma Profesionales" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log('✅ Email enviado:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return false;
    }
};

export default sendEmail;
