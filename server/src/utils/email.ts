import nodemailer from "nodemailer";
import appConfig from "../config/appConfig.js";

// ✅ Interface for options passed into sendEmail
interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const { EMAIL_HOST, EMAIL_PORT, EMAIL_PASSWORD, EMAIL_USERNAME } = appConfig;

// ✅ Async email sender function
const sendEmail = async (options: EmailOptions): Promise<void> => {
  // ✅ Create transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST as string,
    port: Number(EMAIL_PORT), // convert to number
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USERNAME as string,
      pass: EMAIL_PASSWORD as string,
    },
  });

  // ✅ Mail options
  const mailOptions = {
    from: `"CRM System" <${EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message (optional)
  };

  // ✅ Send email
  await transporter.sendMail(mailOptions);
};

export const sendTaskAssignmentEmail = async ({
  to,
  assigneeName,
  taskTitle,
  taskId,
}: {
  to: string;
  assigneeName: string;
  taskTitle: string;
  taskId: string;
}): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST as string,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USERNAME as string,
      pass: EMAIL_PASSWORD as string,
    },
  });

  const taskUrl = `${appConfig.FRONTEND_URL}/tasks`;

  const htmlBody = `
    <div style="font-family: sans-serif; color: #333;">
      <p>Dear ${assigneeName},</p>
      <p>A new task has been assigned to you: <strong>${taskTitle}</strong></p>
      <p>Please click the link below to view it in the CRM system.</p>
      <p>
        <a href="${taskUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px;">
          View Task
        </a>
      </p>
      <p>Regards,<br/>CRM Team</p>
    </div>
  `;

  const mailOptions = {
    from: `"CRM System" <${EMAIL_USERNAME}>`,
    to,
    subject: `New Task Assigned: ${taskTitle}`,
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
