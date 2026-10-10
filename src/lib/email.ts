import { Resend } from "resend";

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  // Gracefully skip if email isn't configured.
  // This prevents the build from failing when the key isn't set,
  // and lets the contact form still store messages in the database.
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY is not set — skipping email notification. " +
        "The message was saved to the database."
    );
    return;
  }

  const contactEmail = process.env.CONTACT_EMAIL;
  if (!contactEmail) {
    console.warn(
      "CONTACT_EMAIL is not set — skipping email notification. " +
        "The message was saved to the database."
    );
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <noreply@yourdomain.com>",
    to: contactEmail,
    subject: `Contact Form: ${data.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <hr />
      <p>${data.message.replace(/\n/g, "<br />")}</p>
    `,
  });

  if (error) {
    console.error("Failed to send contact notification:", error);
    // Don't throw — the message was already stored in the database.
    // The email is a nice-to-have, not a requirement.
  }
}