/**
 * Servicio de Email para CEDI
 * 
 * Opciones de implementación:
 * 1. EmailJS (recomendado para frontend) - https://www.emailjs.com/
 * 2. Google Apps Script (ya tenemos uno configurado)
 * 3. Backend propio con Nodemailer
 * 
 * Por ahora usaremos Google Apps Script para enviar emails
 */

import { databaseConfig } from "@/config/database.config"

interface EmailData {
  to: string
  subject: string
  body: string
  html?: string
}

interface AppointmentEmailData {
  appointmentId: string
  proveedorEmail: string
  proveedorNombre: string
  fecha: string
  hora: string
  puerta: string
  centro: string
  token: string
}

// URL base de la aplicación
const APP_BASE_URL = window.location.origin

/**
 * Genera un token único para la cita
 */
export function generateAppointmentToken(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomPart}`
}

/**
 * Genera el enlace para completar datos de transporte
 * Usa el ID de la cita como identificador
 */
export function generateTransportLink(appointmentId: string): string {
  return `${APP_BASE_URL}/cita/transporte/${appointmentId}`
}

/**
 * Genera el HTML del email de creación de cita (Fase 1)
 */
export function generatePhase1EmailHTML(data: AppointmentEmailData): string {
  const transportLink = generateTransportLink(data.token)
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Cita - CEDI</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">CEDI Pharma</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Centro de Distribución Farmacéutica</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">¡Cita Programada!</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Estimado/a <strong>${data.proveedorNombre}</strong>,
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Su cita ha sido programada exitosamente. A continuación encontrará los detalles:
        </p>
        
        <!-- Appointment Details Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 25px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">📅 Fecha:</span>
                    <strong style="color: #1f2937; font-size: 16px; margin-left: 10px;">${data.fecha}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">🕐 Hora:</span>
                    <strong style="color: #1f2937; font-size: 16px; margin-left: 10px;">${data.hora}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">🏢 Centro:</span>
                    <strong style="color: #1f2937; font-size: 16px; margin-left: 10px;">${data.centro}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="color: #6b7280; font-size: 14px;">🚪 Puerta:</span>
                    <strong style="color: #1f2937; font-size: 16px; margin-left: 10px;">${data.puerta}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Action Required Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">
                ⚠️ ACCIÓN REQUERIDA
              </p>
              <p style="color: #78350f; font-size: 14px; line-height: 1.5; margin: 0;">
                Para completar su cita, debe proporcionar los datos del vehículo y conductor que realizará la entrega.
                Haga clic en el botón de abajo para completar esta información.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 10px 0 30px 0;">
              <a href="${transportLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); 
                        color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; 
                        font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                📋 Completar Datos de Transporte
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
          Si el botón no funciona, copie y pegue este enlace en su navegador:<br>
          <a href="${transportLink}" style="color: #7c3aed; word-break: break-all;">${transportLink}</a>
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
          Este es un correo automático del sistema CEDI Pharma.<br>
          Por favor no responda a este mensaje.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Genera el HTML del email de confirmación final (Fase 3)
 */
export function generatePhase3EmailHTML(data: {
  proveedorNombre: string
  fecha: string
  hora: string
  puerta: string
  centro: string
  codigoCita: string
  vehiculo: string
  conductor: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Aprobada - CEDI</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Cita Aprobada</h1>
        <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">CEDI Pharma - Centro de Distribución</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Estimado/a <strong>${data.proveedorNombre}</strong>,
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
          Su cita ha sido <strong style="color: #059669;">APROBADA</strong>. 
          A continuación encontrará su código de confirmación y los detalles de la cita.
        </p>
        
        <!-- Confirmation Code Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="color: #d1fae5; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">
                Código de Confirmación
              </p>
              <p style="color: #ffffff; font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 4px; font-family: monospace;">
                ${data.codigoCita}
              </p>
              <p style="color: #d1fae5; font-size: 12px; margin: 10px 0 0 0;">
                Presente este código al llegar al centro de distribución
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Appointment Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">📋 Detalles de la Cita</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Fecha:</td>
                  <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.fecha}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Hora:</td>
                  <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.hora}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Centro:</td>
                  <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.centro}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Puerta:</td>
                  <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.puerta}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Vehículo:</td>
                  <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.vehiculo}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Conductor:</td>
                  <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.conductor}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Instructions -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">
                📌 Instrucciones Importantes
              </p>
              <ul style="color: #1e3a8a; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Llegue 15 minutos antes de su hora programada</li>
                <li>Presente este código y una identificación válida</li>
                <li>El conductor debe coincidir con los datos registrados</li>
                <li>Tenga lista la documentación de la mercancía</li>
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
          Este es un correo automático del sistema CEDI Pharma.<br>
          Guarde este correo como comprobante de su cita.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Envía un email usando Google Apps Script
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  const appsScriptUrl = databaseConfig.googleSheets.appsScriptUrl
  
  if (!appsScriptUrl) {
    console.warn("⚠️ Apps Script URL no configurada para envío de emails")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "sendEmail",
        payload: emailData,
      }),
      redirect: "follow",
    })

    if (response.ok) {
      const result = await response.json()
      return { success: result.success !== false }
    }

    return { success: false, error: "Failed to send email" }
  } catch (error) {
    console.error("Error enviando email:", error)
    return { success: false, error: String(error) }
  }
}

/**
 * Genera un código de cita único
 */
export function generateAppointmentCode(): string {
  const prefix = "CTA"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

