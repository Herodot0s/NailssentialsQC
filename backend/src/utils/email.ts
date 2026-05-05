import nodemailer from 'nodemailer';

interface BookingDetails {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  technicianName: string;
}

interface CompletionDetails {
  customerName: string;
  receiptNumber: string;
  totalAmount: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (process.env.NODE_ENV === 'test') {
    return true;
  }
  try {
    const info = await transporter.sendMail({
      from: `"NailssentialsQC" <${process.env.SMTP_FROM || 'noreply@nailssentialsqc.com'}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error: unknown) {
    console.error('Send email error:', error);
    return false;
  }
};

export const sendBookingConfirmation = async (email: string, details: BookingDetails) => {
  const html = `
    <h1>Booking Confirmation</h1>
    <p>Dear ${details.customerName},</p>
    <p>Your appointment for <strong>${details.serviceName}</strong> has been booked successfully.</p>
    <p><strong>Date:</strong> ${details.date}</p>
    <p><strong>Time:</strong> ${details.time}</p>
    <p><strong>Technician:</strong> ${details.technicianName}</p>
    <br/>
    <p>Thank you for choosing NailssentialsQC!</p>
  `;
  return sendEmail(email, 'Booking Confirmation - NailssentialsQC', html);
};

export const sendAppointmentCompletion = async (email: string, details: CompletionDetails) => {
  const html = `
    <h1>Thank You for Visiting!</h1>
    <p>Dear ${details.customerName},</p>
    <p>Your appointment has been completed.</p>
    <p><strong>Receipt #:</strong> ${details.receiptNumber}</p>
    <p><strong>Total Amount:</strong> ₱${details.totalAmount}</p>
    <br/>
    <p>We hope you enjoyed your service. See you again soon!</p>
  `;
  return sendEmail(email, 'Your Receipt - NailssentialsQC', html);
};
