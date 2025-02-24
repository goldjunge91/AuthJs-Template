// 'use server';
// import Resend from 'resend';
//
// // import { contactSchema } from '@/db/schema';
//
// if (!env.RESEND_API_KEY) {
//   throw new Error('Missing RESEND_API_KEY environment variable');
// }
//
// const resend = new Resend(process.env.RESEND_API_KEY);
//
// export async function submitContactForm() {
//   if (env.NODE_ENV === 'development') {
//     console.log('Email would be sent:', {
//       to: 'kontakt@jetwash.de',
//       subject: `Neue Kontaktanfrage: ${data.subject}`,
//       data,
//     });
//     return { success: true };
//   }
//
//   // export async function submitContactForm(data: ContactFormData) {
//   try {
//     const result = await resend.emails.send({
//       from: 'Jetwash <noreply@jetwash.de>',
//       to: env.ADMIN_EMAIL,
//       subject: `Neue Kontaktanfrage: ${data.subject}`,
//       text: `
//         Name: ${data.name}
//         Email: ${data.email}
//         Betreff: ${data.subject}
//         Nachricht: ${data.message}
//       `,
//     });
//
//     return { success: true, data: result };
//   } catch (error) {
//     console.error('Error sending contact form email:', error);
//     return { success: false, error };
//   }
// }
