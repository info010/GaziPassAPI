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
      email,
      subject,
      message,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error(`Email sending failed:`, error);
      throw new Error('Email could not be sent');
    }
};