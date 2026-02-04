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
    auth: {
      user: EMAIL_USERNAME as string,
      pass: EMAIL_PASSWORD as string,
    },
  });

  // ✅ Mail options
  const mailOptions = {
    from: "Rahul Vishwakarma <rk83029014@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.message (optional)
  };

  // ✅ Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
