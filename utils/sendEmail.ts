import nodemailer from "nodemailer"

const app_name = process.env.APP_NAME!;
const email_user = process.env.EMAIL_USER!;
const email_password = process.env.EMAIL_PASS!;

export const sendEmail = async (email: string, subject: string, message: string) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email_user,
        pass: email_password,
      },
    });
  
    const mailOptions = {
      from: `${app_name} <${email_user}>`,
      to: email,
      subject: subject,
      html: message,
    };
  
    await transporter.sendMail(mailOptions);
};