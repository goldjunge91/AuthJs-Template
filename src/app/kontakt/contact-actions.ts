'use server';

import { Resend } from 'resend';
import { z } from 'zod';

// Umgebungsvariablen typsicher einbinden
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ihre@m.tozzi91@icloud.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tozzi-test.de';

// Validierung der Konfiguration
if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY fehlt in den Umgebungsvariablen');
}

const formSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  subject: z.string().min(3, 'Betreff muss mindestens 3 Zeichen lang sein'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein'),
});

type ContactInput = z.infer<typeof formSchema>;

const resend = new Resend(RESEND_API_KEY);

const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kontaktformular</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            background-color: #1a365d;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 5px 5px;
        }
        .message-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>
`;

const adminEmailContent = (data: ContactInput) => `
    <div class="header">
        <h1>Neue Kontaktanfrage</h1>
    </div>
    <div class="content">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        <p><strong>Betreff:</strong> ${data.subject}</p>
        <p><strong>Nachricht:</strong></p>
        <div class="message-box">
            ${data.message.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
            <p>Diese E-Mail wurde automatisch über das Kontaktformular gesendet.</p>
        </div>
    </div>
`;

const userEmailContent = (data: ContactInput) => `
    <div class="header">
        <h1>Vielen Dank für Ihre Anfrage</h1>
    </div>
    <div class="content">
        <p>Sehr geehrte(r) ${data.name},</p>
        <p>vielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
        <p><strong>Ihre Nachricht:</strong></p>
        <div class="message-box">
            ${data.message.replace(/\n/g, '<br>')}
        </div>
        <div class="footer">
            <p>Mit freundlichen Grüßen</p>
            <p>Ihr Team</p>
        </div>
    </div>
`;

export async function submitContact(data: ContactInput) {
  try {
    const validatedData = formSchema.parse(data);

    // E-Mail an den Administrator
    await resend.emails.send({
      from: `Kontaktformular <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      reply_to: validatedData.email,
      subject: `Neue Kontaktanfrage: ${validatedData.subject}`,
      html: emailTemplate(adminEmailContent(validatedData)),
      text: `Neue Kontaktanfrage\n\nName: ${validatedData.name}\nE-Mail: ${validatedData.email}\nBetreff: ${validatedData.subject}\n\nNachricht:\n${validatedData.message}`,
    });

    // Bestätigungs-E-Mail an den Absender
    await resend.emails.send({
      from: `Kontaktformular <${FROM_EMAIL}>`,
      to: [validatedData.email],
      subject: 'Ihre Kontaktanfrage wurde empfangen',
      html: emailTemplate(userEmailContent(validatedData)),
      text: `Sehr geehrte(r) ${validatedData.name},\n\nvielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.\n\nIhre Nachricht:\n${validatedData.message}\n\nMit freundlichen Grüßen\nIhr Team`,
    });

    return {
      success: true,
      message: 'Ihre Nachricht wurde erfolgreich gesendet',
    };
  } catch (error) {
    console.error('Fehler beim Senden:', error);
    return {
      success: false,
      message:
        'Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.',
    };
  }
}
