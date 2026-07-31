import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailParams) {
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`Error al enviar email a ${to}:`, err);
  }
}

function wrapEmail(title: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f4; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eee;">
      <div style="background-color: #0a0a0a; padding: 24px 32px;">
        <span style="color: #ffffff; font-size: 20px; font-weight: bold;">Geora</span>
      </div>
      <div style="padding: 32px;">
        <h1 style="font-size: 20px; color: #0a0a0a; margin: 0 0 16px;">${title}</h1>
        <div style="font-size: 14px; line-height: 1.6; color: #333;">${bodyHtml}</div>
        ${
          ctaUrl && ctaLabel
            ? `<div style="margin-top: 24px;">
                <a href="${ctaUrl}" style="display: inline-block; background-color: #0a0a0a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px; font-weight: bold;">${ctaLabel}</a>
              </div>`
            : ""
        }
      </div>
      <div style="padding: 16px 32px; background-color: #fafaf9; font-size: 11px; color: #999;">
        Geora · Este es un correo automático, por favor no lo respondas.
      </div>
    </div>
  </div>`;
}

const BASE_URL = "https://geora.com.ar";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@geora.com.ar";

export async function sendAgencyApprovedEmail(to: string, agencyName: string) {
  await sendMail({
    to,
    subject: "Tu inmobiliaria fue aprobada en Geora",
    html: wrapEmail(
      "¡Tu cuenta fue aprobada!",
      `Hola,<br/><br/>Te contamos que <strong>${agencyName}</strong> ya fue revisada y aprobada por nuestro equipo. Ya podés publicar propiedades, usar la Bolsa de Conexiones y tu perfil es visible públicamente en Geora.`,
      `${BASE_URL}/dashboard`,
      "Ir al panel"
    ),
  });
}

export async function sendAgencyRejectedEmail(to: string, agencyName: string) {
  await sendMail({
    to,
    subject: "Tu solicitud en Geora fue rechazada",
    html: wrapEmail(
      "Tu solicitud no fue aprobada",
      `Hola,<br/><br/>Luego de revisar la solicitud de <strong>${agencyName}</strong>, no pudimos aprobar tu cuenta en Geora. Si creés que se trata de un error o querés más información, podés escribirnos a ${ADMIN_EMAIL}.`
    ),
  });
}

export async function sendAdminNewAgencyPendingEmail(agencyName: string, agencyEmail: string) {
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `Nueva inmobiliaria pendiente de aprobación: ${agencyName}`,
    html: wrapEmail(
      "Nueva inmobiliaria esperando aprobación",
      `<strong>${agencyName}</strong> (${agencyEmail}) se registró en Geora y está esperando revisión.`,
      `${BASE_URL}/administrate`,
      "Revisar en el panel"
    ),
  });
}

export async function sendAdminNewReportEmail(params: {
  targetType: string;
  targetLabel: string;
  reason: string;
  reporterEmail?: string | null;
}) {
  const { targetType, targetLabel, reason, reporterEmail } = params;
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `Nuevo reporte: ${targetType}`,
    html: wrapEmail(
      "Se recibió un nuevo reporte",
      `Se reportó <strong>${targetLabel}</strong> (${targetType}).<br/>Motivo: <strong>${reason}</strong>.${
        reporterEmail ? `<br/>Reportado por: ${reporterEmail}.` : ""
      }`,
      `${BASE_URL}/administrate`,
      "Revisar en el panel"
    ),
  });
}
