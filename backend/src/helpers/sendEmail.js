import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Dominio verificado: testcenter.online
 * Ahora podemos usar cualquier dirección de este dominio.
 */
const SENDER_EMAIL = 'soporte@testcenter.online';

export const sendEmail = async (to, subject, content) => {
    console.log(`📨 Enviando correo a ${to} con asunto: ${subject} vía Resend`);

    try {
        const { data, error } = await resend.emails.send({
            from: `Numerologia <${SENDER_EMAIL}>`,
            to: [to],
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4A90E2;">Notificación de Numerologia</h2>
                    <p style="font-size: 16px; color: #333;">${content}</p>
                    <br><hr>
                    <footer style="font-size: 12px; color: #888;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </footer>
                </div>`,
        });

        if (error) {
            console.error('✖️ Error de Resend:', error);
            throw new Error('Error al enviar el correo vía Resend');
        }

        console.log('✅ Correo enviado con éxito. ID:', data.id);
        
    } catch (error) {
        console.error('✖️ Error fatal al enviar correo:', error);
        throw new Error('No se pudo enviar el correo de confirmación');
    }
}

export const sendResetCode = async (email, code) => {
    console.log(`📨 Enviando código de recuperación a ${email} vía Resend`);
    try {
        const { data, error } = await resend.emails.send({
            from: `Numerologia Soporte <${SENDER_EMAIL}>`,
            to: [email],
            subject: "Código de recuperación de contraseña",
            html: `
                <div style="text-align: center; font-family: sans-serif;">
                    <h2>Recuperación de contraseña</h2>
                    <p>Tu código de verificación es:</p>
                    <h1 style="letter-spacing: 8px; color: #4F46E5; font-size: 40px;">${code}</h1>
                    <p>Este código expira en <strong>15 minutos</strong>.</p>
                    <p>Si no solicitaste este código, ignora este mensaje.</p>
                </div>
            `,
        });

        if (error) {
            console.error('✖️ Error de Resend (Reset Code):', error);
            throw new Error('Error al enviar el código de recuperación');
        }

        console.log(`✅ Código de recuperación enviado con éxito. ID: ${data.id}`);
    } catch (error) {
        console.error('✖️ Error enviando código de reset:', error);
        throw new Error('Error al enviar el código de recuperación');
    }
};
